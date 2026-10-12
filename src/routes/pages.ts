import { randomBytes, timingSafeEqual } from 'crypto';
import express, { Request, Response, Router } from 'express';
import { config } from '../config';
import { eseguiLogin } from '../auth/login';
import { loginLimiter, loginUserLimiter, verificaOrigine } from '../http/security';
import { loginSchema } from './api';
import { requireAdminPage, requireUserPage } from '../auth/session';
import { STATI } from '../domain/classificazioni';
import { confrontoDimensionale } from '../domain/dimensioni';
import { isVocabKey, VOCAB_KEYS, VOCABOLARI } from '../domain/vocabolari';
import { ah, forbidden, notFound } from '../http/errors';
import * as schede from '../services/schede.service';
import { copertineCasuali } from '../services/immagini.service';
import { opzioniRicerca, search, searchQuerySchema } from '../services/search.service';
import * as voci from '../services/vocabolari.service';

const pages = Router();

const idParam = (req: Request): number => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw notFound();
  return id;
};

/** Solo percorsi interni: evita open redirect verso altri siti. */
export function safeNext(value: unknown): string {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : '/area';
}

/** JSON da incorporare in <script type="application/json"> senza poter chiudere il tag. */
const embedJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');

// ---------------------------------------------------------------------------
// Catalogo pubblico
// ---------------------------------------------------------------------------

const ADVANCED_FIELDS = [
  'titolo', 'autore', 'categoria', 'classificazione', 'ambito', 'anno_da', 'anno_a', 'materiale', 'tecnica', 'ubicazione',
  'provenienza', 'inventario', 'proprieta', 'iscrizioni', 'descrizione', 'storia', 'commento', 'mostra', 'curatore',
  'luogo_mostra', 'mostra_anno_da', 'mostra_anno_a', 'bibliografia', 'documentazione',
];

/** Parametri che non sono criteri di ricerca (ordinamento, paginazione, lingua). */
const NON_CRITERI = new Set(['ordina', 'pagina', 'per_pagina', 'era_da', 'era_a', 'lang']);

/** La home mostra le opere solo dopo una ricerca: senza criteri c'è solo l'intestazione. */
export function haCriteri(query: Record<string, unknown>): boolean {
  return Object.entries(query).some(([k, v]) => !NON_CRITERI.has(k) && typeof v === 'string' && v.trim() !== '');
}

pages.get(
  '/',
  ah(async (req, res) => {
    const filtri = searchQuerySchema.parse(req.query);
    const cercato = haCriteri(req.query);
    const [risultati, opzioni, sfondi] = await Promise.all([
      cercato ? search(filtri) : Promise.resolve(null),
      opzioniRicerca(),
      copertineCasuali(8),
    ]);
    const avanzata = ADVANCED_FIELDS.some((f) => {
      const v = (filtri as Record<string, unknown>)[f];
      return v !== null && v !== undefined && f !== 'classificazione';
    });
    const avanzataId = ['ubicazioni', 'materiali', 'tecniche'].some((k) => (filtri as Record<string, unknown>)[k]);
    res.render('home', { title: '', nav: 'catalogo', filtri, risultati, opzioni, sfondi, avanzata: avanzata || avanzataId });
  }),
);

pages.get('/scheda', (req, res) => {
  const id = Number(req.query.id);
  if (Number.isInteger(id) && id > 0) return res.redirect(301, `/scheda/${id}`);
  res.redirect('/');
});

pages.get(
  '/scheda/:id',
  ah(async (req, res) => {
    const s = await schede.getScheda(idParam(req), req.user);
    if (s.stato !== STATI.PUBBLICATA) return res.redirect(`/area/schede/${s.id}`);
    res.render('scheda', { title: s.titolo_testo, nav: 'catalogo', s, area: false, confronto: confrontoDimensionale(s.misure) });
  }),
);

pages.get(
  '/voci',
  ah(async (req, res) => {
    const indici = await Promise.all(
      VOCAB_KEYS.filter((k) => VOCABOLARI[k].indice).map(async (k) => ({ v: VOCABOLARI[k], n: await voci.countVoci(VOCABOLARI[k], true) })),
    );
    res.render('voci', { title: req.t('Indici'), nav: 'indici', indici });
  }),
);

pages.get(
  '/voci/:tipo',
  ah(async (req, res) => {
    const tipo = String(req.params.tipo);
    if (!isVocabKey(tipo)) throw notFound();
    const v = VOCABOLARI[tipo];
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const elenco = await voci.listVoci(v, { q: q || undefined, limit: 500, soloPubblicate: true });
    res.render('indice', { title: req.t(v.plurale), nav: 'indici', v, elenco, q });
  }),
);

pages.get(
  '/voci/:tipo/:id',
  ah(async (req, res) => {
    const tipo = String(req.params.tipo);
    if (!isVocabKey(tipo)) throw notFound();
    const v = VOCABOLARI[tipo];
    const voce = await voci.getVoce(v, idParam(req));
    const filtri = searchQuerySchema.parse({ ...req.query, [tipo]: voce.id, per_pagina: 48 });
    const risultati = await search(filtri);
    // Una voce usata solo in bozze non è pubblica
    if (risultati.total === 0 && !req.user) throw notFound();
    res.render('voce', { title: `${req.t(v.singolare)}: ${voce[v.display]}`, nav: 'indici', v, voce, risultati });
  }),
);

// ---------------------------------------------------------------------------
// Pagine informative (testi in views/pagine, in italiano e inglese)
// ---------------------------------------------------------------------------

export const PAGINE_INFORMATIVE = {
  informazioni: 'Informazioni',
  privacy: 'Privacy',
  termini: 'Termini e condizioni',
  accessibilita: 'Accessibilità',
} as const;

for (const [slug, titolo] of Object.entries(PAGINE_INFORMATIVE)) {
  pages.get(`/${slug}`, (req, res) => {
    res.render(`pagine/${slug}`, { title: req.t(titolo), nav: slug });
  });
}
pages.get('/about', (_req, res) => res.redirect(301, '/informazioni'));

// ---------------------------------------------------------------------------
// Accesso
// ---------------------------------------------------------------------------

/**
 * Token anti-CSRF del modulo di accesso (double submit): lo stesso valore casuale
 * sta in un campo nascosto e in un cookie tecnico limitato al percorso /login,
 * valido un'ora e cancellato dopo l'accesso. Non riguarda il catalogo pubblico.
 */
const CSRF_COOKIE = 'lumina_csrf';
const csrfCookieOptions = () => ({ httpOnly: true, secure: config.session.secureCookie, sameSite: 'strict' as const, path: '/login' });

function nuovoTokenCsrf(res: Response): string {
  const token = randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, { ...csrfCookieOptions(), maxAge: 3600 * 1000 });
  return token;
}

function tokenCsrfValido(req: Request): boolean {
  const cookie = String(req.cookies?.[CSRF_COOKIE] ?? '');
  const campo = String(req.body?.csrf_token ?? '');
  return cookie.length === 64 && campo.length === 64 && timingSafeEqual(Buffer.from(cookie), Buffer.from(campo));
}

pages.get('/login', (req, res) => {
  const next = safeNext(req.query.next);
  if (req.user) return res.redirect(next);
  res.render('login', { title: req.t('Accesso'), nav: 'login', next, errore: null, csrf: nuovoTokenCsrf(res) });
});

/** Accesso senza JavaScript: il modulo viene inviato in POST (mai credenziali nell'URL). */
pages.post(
  '/login',
  express.urlencoded({ extended: false, limit: '10kb' }),
  loginLimiter,
  loginUserLimiter,
  ah(async (req, res) => {
    const origine = verificaOrigine(req);
    if (origine) throw origine;
    if (!tokenCsrfValido(req)) throw forbidden('Modulo scaduto o non valido: ricarica la pagina e riprova');
    const next = safeNext(req.body?.next);
    const dati = loginSchema.safeParse(req.body);
    if (dati.success && (await eseguiLogin(req, res, dati.data.username, dati.data.password))) {
      res.clearCookie(CSRF_COOKIE, csrfCookieOptions());
      return res.redirect(303, next);
    }
    res.status(401).render('login', {
      title: req.t('Accesso'),
      nav: 'login',
      next,
      errore: req.t('Nome utente o password non corretti'),
      csrf: nuovoTokenCsrf(res),
    });
  }),
);

// ---------------------------------------------------------------------------
// Area riservata
// ---------------------------------------------------------------------------

pages.get(
  '/area',
  requireUserPage,
  ah(async (req, res) => {
    const [mie, conteggi] = await Promise.all([schede.listMie(req.user!), req.user!.isAdmin ? schede.contaPerStato() : undefined]);
    res.render('area/dashboard', { title: req.t('Le mie schede'), nav: 'area', mie, conteggi });
  }),
);

pages.get(
  '/area/revisione',
  requireAdminPage,
  ah(async (req, res) => {
    const viste: Record<string, number> = { revisione: STATI.IN_REVISIONE, pubblicate: STATI.PUBBLICATA, bozze: STATI.BOZZA };
    const vista = typeof req.query.vista === 'string' && req.query.vista in viste ? req.query.vista : 'revisione';
    const [elenco, conteggi] = await Promise.all([schede.listPerStato(viste[vista]), schede.contaPerStato()]);
    res.render('area/revisione', { title: req.t('Revisione schede'), nav: 'revisione', elenco, vista, conteggi });
  }),
);

pages.get('/area/schede/nuova', requireUserPage, (req, res) => {
  res.render('area/editor', { title: req.t('Nuova scheda'), nav: 'nuova', scheda: null, schedaJson: 'null' });
});

pages.get(
  '/area/schede/:id/modifica',
  requireUserPage,
  ah(async (req, res) => {
    const s = await schede.getScheda(idParam(req), req.user);
    if (!s.permessi.modifica) throw forbidden('Questa scheda non è modificabile nel suo stato attuale');
    res.render('area/editor', { title: `${req.t('Modifica')}: ${s.titolo_testo}`, nav: 'area', scheda: s, schedaJson: embedJson(s) });
  }),
);

pages.get(
  '/area/schede/:id',
  requireUserPage,
  ah(async (req, res) => {
    const s = await schede.getScheda(idParam(req), req.user);
    res.render('scheda', { title: s.titolo_testo, nav: 'area', s, area: true, confronto: confrontoDimensionale(s.misure) });
  }),
);

pages.get(
  '/area/vocabolari',
  requireAdminPage,
  ah(async (req, res) => {
    const tipo = typeof req.query.tipo === 'string' && isVocabKey(req.query.tipo) ? req.query.tipo : 'autori';
    const v = VOCABOLARI[tipo];
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const elenco = await voci.listVoci(v, { q: q || undefined, limit: 500 });
    res.render('area/vocabolari', { title: req.t('Vocabolari'), nav: 'vocabolari', v, elenco, q, vocabolari: VOCAB_KEYS.map((k) => VOCABOLARI[k]) });
  }),
);

pages.get('/area/utenti', requireAdminPage, (req, res) => {
  res.render('area/utenti', { title: req.t('Utenti'), nav: 'utenti' });
});

// Indirizzi della versione precedente
pages.get(['/bozze', '/schedeInApprovazione'], (_req, res) => res.redirect(301, '/area'));
pages.get('/amministratore', (_req, res) => res.redirect(301, '/area/revisione'));
pages.get('/bozzaEditor', (_req, res) => res.redirect(301, '/area/schede/nuova'));
pages.get('/valutaBozza', (req, res) => {
  const id = Number(req.query.id);
  res.redirect(301, Number.isInteger(id) && id > 0 ? `/area/schede/${id}` : '/area/revisione');
});

export default pages;
