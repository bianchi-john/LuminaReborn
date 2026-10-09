import express, { Request, Router } from 'express';
import { z } from 'zod';
import { clearSessionCookie, cookieOptions, forgetToken, requireAdmin, requireUser } from '../auth/session';
import * as userManager from '../auth/userManager';
import { config } from '../config';
import { pool, select } from '../db/pool';
import { CLASSIFICAZIONI, DIREZIONI_MISURA, TIPI_MISURA, UNITA_MISURA } from '../domain/classificazioni';
import { optText, parseSchedaInput, vocabFieldsSchema } from '../domain/scheda.schema';
import { isVocabKey, VOCABOLARI, vocabolariPublicSchema, VocabDef } from '../domain/vocabolari';
import { ah, badRequest, forbidden, notFound, unauthorized } from '../http/errors';
import { loginLimiter, uploadLimiter } from '../http/security';
import { escapeLike } from '../util/sql';
import * as immagini from '../services/immagini.service';
import * as schede from '../services/schede.service';
import { search, searchQuerySchema } from '../services/search.service';
import * as voci from '../services/vocabolari.service';

const api = Router();

const idParam = (req: Request, name = 'id'): number => {
  const id = Number(req.params[name]);
  if (!Number.isInteger(id) || id <= 0) throw notFound();
  return id;
};

const vocabParam = (req: Request): VocabDef => {
  const tipo = String(req.params.tipo);
  if (!isVocabKey(tipo)) throw notFound('Tipo di voce sconosciuto');
  return VOCABOLARI[tipo];
};

api.use(express.json({ limit: '2mb' }));

// ---------------------------------------------------------------------------
// Sessione
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

api.post(
  '/auth/login',
  loginLimiter,
  ah(async (req, res) => {
    const { username, password } = loginSchema.parse(req.body);
    const token = await userManager.login(username, password);
    // Messaggio volutamente generico: non rivela se l'utente esiste
    if (!token) throw unauthorized('Nome utente o password non corretti');
    res.cookie(config.session.cookieName, token, cookieOptions());
    res.json({ ok: true });
  }),
);

api.post(
  '/auth/logout',
  ah(async (req, res) => {
    if (req.sessionToken) {
      forgetToken(req.sessionToken);
      await userManager.revokeTokens(req.sessionToken).catch(() => undefined);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  }),
);

api.get('/me', (req, res) => {
  const u = req.user;
  res.json(u ? { username: u.username, displayName: u.displayName, role: u.role } : null);
});

// ---------------------------------------------------------------------------
// Catalogo pubblico
// ---------------------------------------------------------------------------

api.get(
  '/search',
  ah(async (req, res) => {
    res.json(await search(searchQuerySchema.parse(req.query)));
  }),
);

api.get('/config', (_req, res) => {
  res.json({
    vocabolari: vocabolariPublicSchema(),
    classificazioni: CLASSIFICAZIONI,
    misure: { direzioni: DIREZIONI_MISURA, tipi: TIPI_MISURA, unita: UNITA_MISURA },
    maxImageBytes: config.upload.maxImageBytes,
  });
});

api.get(
  '/immagini/:id',
  ah(async (req, res) => {
    const img = await immagini.getImmagine(idParam(req), req.user);
    res.setHeader('Content-Type', img.mime);
    res.setHeader('Content-Length', img.dati.length);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', img.pubblica ? 'public, max-age=86400' : 'private, no-store');
    res.end(img.dati);
  }),
);

// ---------------------------------------------------------------------------
// Schede
// ---------------------------------------------------------------------------

api.get(
  '/schede/:id',
  ah(async (req, res) => {
    res.json(await schede.getScheda(idParam(req), req.user));
  }),
);

api.get(
  '/schede',
  requireUser,
  ah(async (req, res) => {
    const vista = String(req.query.vista ?? 'mie');
    if (vista === 'mie') return void res.json(await schede.listMie(req.user!));
    if (!req.user!.isAdmin) throw forbidden('Riservato agli amministratori');
    const stato = vista === 'revisione' ? 1 : vista === 'pubblicate' ? 2 : vista === 'bozze' ? 0 : NaN;
    if (Number.isNaN(stato)) throw badRequest('Vista non valida');
    res.json(await schede.listPerStato(stato));
  }),
);

api.post(
  '/schede',
  requireUser,
  ah(async (req, res) => {
    const id = await schede.createScheda(parseSchedaInput(req.body), req.user!);
    res.status(201).json({ id });
  }),
);

api.put(
  '/schede/:id',
  requireUser,
  ah(async (req, res) => {
    const id = idParam(req);
    await schede.updateScheda(id, parseSchedaInput(req.body), req.user!);
    res.json({ id });
  }),
);

api.delete(
  '/schede/:id',
  requireUser,
  ah(async (req, res) => {
    await schede.deleteScheda(idParam(req), req.user!);
    res.status(204).end();
  }),
);

const azioneSchema = z.object({ commento: optText(5000).optional().default(null) });

api.post(
  '/schede/:id/:azione(invia|ritira|approva|respingi|depubblica)',
  requireUser,
  ah(async (req, res) => {
    const { commento } = azioneSchema.parse(req.body ?? {});
    const stato = await schede.cambiaStato(idParam(req), req.params.azione as schede.Azione, req.user!, commento ?? null);
    res.json({ stato });
  }),
);

// ---------------------------------------------------------------------------
// Immagini (caricamento separato: la scheda ne riceve solo gli id)
// ---------------------------------------------------------------------------

api.post(
  '/immagini',
  requireUser,
  uploadLimiter,
  express.raw({ type: 'image/*', limit: config.upload.maxImageBytes }),
  ah(async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw badRequest('Nessun file ricevuto');
    res.status(201).json(await immagini.uploadImmagine(req.body, req.user!));
  }),
);

// ---------------------------------------------------------------------------
// Voci condivise (autori, materiali, ...)
// ---------------------------------------------------------------------------

api.get(
  '/vocabolari/:tipo',
  ah(async (req, res) => {
    const v = vocabParam(req);
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 200) : undefined;
    const limit = Number(req.query.limit) || 20;
    // Gli utenti anonimi vedono solo le voci usate in schede pubblicate
    res.json(await voci.listVoci(v, { q, limit, soloPubblicate: !req.user }));
  }),
);

api.get(
  '/vocabolari/:tipo/:id',
  ah(async (req, res) => {
    res.json(await voci.getVoce(vocabParam(req), idParam(req)));
  }),
);

api.put(
  '/vocabolari/:tipo/:id',
  requireAdmin,
  ah(async (req, res) => {
    const v = vocabParam(req);
    res.json(await voci.updateVoce(v, idParam(req), vocabFieldsSchema(v).parse(req.body)));
  }),
);

api.post(
  '/vocabolari/:tipo/:id/unisci',
  requireAdmin,
  ah(async (req, res) => {
    const { in: intoId } = z.object({ in: z.coerce.number().int().positive() }).parse(req.body);
    await voci.mergeVoci(vocabParam(req), idParam(req), intoId);
    res.json({ id: intoId });
  }),
);

api.delete(
  '/vocabolari/:tipo/:id',
  requireAdmin,
  ah(async (req, res) => {
    await voci.deleteVoce(vocabParam(req), idParam(req));
    res.status(204).end();
  }),
);

/** Valori già usati per l'ambito storico-culturale (suggerimenti nell'editor). */
api.get(
  '/suggerimenti/ambiti',
  requireUser,
  ah(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const rows = await select<{ v: string }>(
      pool,
      `SELECT DISTINCT ambito_storico AS v FROM cronologie WHERE ambito_storico IS NOT NULL AND ambito_storico LIKE ? ORDER BY v LIMIT 20`,
      [`%${escapeLike(q)}%`],
    );
    res.json(rows.map((r) => r.v));
  }),
);

// ---------------------------------------------------------------------------
// Utenti (proxy verso lo user-manager, solo amministratori)
// ---------------------------------------------------------------------------

const PASSWORD_RULE = z
  .string()
  .regex(/^[a-zA-Z0-9]{8,30}$/, 'La password deve avere 8-30 caratteri, solo lettere e numeri (vincolo dello user-manager)');

api.get(
  '/utenti',
  requireAdmin,
  ah(async (req, res) => {
    res.json(await userManager.listUsers(req.sessionToken!));
  }),
);

api.post(
  '/utenti',
  requireAdmin,
  ah(async (req, res) => {
    const input = z
      .object({
        username: z.string().trim().regex(/^[a-zA-Z0-9._-]{3,30}$/, 'Username: 3-30 caratteri tra lettere, numeri, . _ -'),
        password: PASSWORD_RULE,
        display_name: z.string().trim().min(2).max(100).optional(),
        email_address: z.string().trim().email().optional().or(z.literal('')),
        isAdmin: z.boolean().optional(),
      })
      .parse(req.body);
    const created = await userManager.createUser(req.sessionToken!, input);
    const updates = { ...(input.display_name ? { display_name: input.display_name } : {}), ...(input.isAdmin ? { isAdmin: true } : {}) };
    if (Object.keys(updates).length) await userManager.updateUser(req.sessionToken!, created._id, updates);
    res.status(201).json({ id: created._id });
  }),
);

api.patch(
  '/utenti/:id',
  requireAdmin,
  ah(async (req, res) => {
    const input = z
      .object({
        display_name: z.string().trim().min(2).max(100).optional(),
        isAdmin: z.boolean().optional(),
        locked: z.boolean().optional(),
      })
      .parse(req.body);
    if (req.params.id === req.user!.remoteId && (input.isAdmin === false || input.locked === true)) {
      throw badRequest('Non puoi rimuovere i privilegi o bloccare il tuo stesso account');
    }
    await userManager.updateUser(req.sessionToken!, req.params.id, input);
    res.json({ ok: true });
  }),
);

api.put(
  '/utenti/:id/password',
  requireAdmin,
  ah(async (req, res) => {
    const { password } = z.object({ password: PASSWORD_RULE }).parse(req.body);
    await userManager.setPassword(req.sessionToken!, req.params.id, password);
    res.json({ ok: true });
  }),
);

api.post(
  '/utenti/:id/disconnetti',
  requireAdmin,
  ah(async (req, res) => {
    await userManager.revokeUserTokens(req.sessionToken!, req.params.id);
    res.json({ ok: true });
  }),
);

api.delete(
  '/utenti/:id',
  requireAdmin,
  ah(async (req, res) => {
    if (req.params.id === req.user!.remoteId) throw badRequest('Non puoi eliminare il tuo stesso account');
    await userManager.deleteUser(req.sessionToken!, req.params.id);
    res.status(204).end();
  }),
);

api.use((_req, _res, next) => next(notFound('Endpoint inesistente')));

export default api;
