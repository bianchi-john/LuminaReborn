import { randomBytes, timingSafeEqual } from 'crypto';
import express, { Request, Response, Router } from 'express';
import { config } from '../config';
import { eseguiLogin } from '../auth/login';
import { loginLimiter, loginUserLimiter, verificaOrigine } from '../http/security';
import { loginSchema } from './api';
import { requireAdminPage, requireSchedatorePage, requireUserPage } from '../auth/session';
import { STATI } from '../domain/classificazioni';
import { confrontoDimensionale } from '../domain/dimensioni';
import { isVocabKey, VOCAB_KEYS, VOCABOLARI } from '../domain/vocabolari';
import { ah, forbidden, notFound } from '../http/errors';
import * as foto from '../services/foto.service';
import { getPanoramica } from '../services/panoramica.service';
import * as schede from '../services/schede.service';
import { codiceDaPercorso } from '../util/codici';
import { copertineCasuali } from '../services/immagini.service';
import { opzioniRicerca, search, searchQuerySchema } from '../services/search.service';
import * as voci from '../services/vocabolari.service';

const pages = Router();

const idParam = (req: Request): number => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw notFound();
  return id;
};

/** Internal paths only: prevents open redirects to other sites. */
export function safeNext(value: unknown): string {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : '/area';
}

/** JSON to embed in <script type="application/json"> without being able to close the tag. */
/** Page <title>: long titles (some exceed 400 characters) are cut at a word boundary. */
export const titoloBreve = (titolo: string, max = 70): string =>
  titolo.length <= max ? titolo : `${titolo.slice(0, max).replace(/[\s,;:.]+\S*$/, '')}…`;

const embedJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');

// ---------------------------------------------------------------------------
// Public catalogue
// ---------------------------------------------------------------------------

const ADVANCED_FIELDS = [
  'titolo', 'autore', 'categoria', 'classificazione', 'ambito', 'anno_da', 'anno_a', 'materiale', 'tecnica', 'ubicazione',
  'provenienza', 'inventario', 'proprieta', 'iscrizioni', 'descrizione', 'storia', 'commento', 'mostra', 'curatore',
  'luogo_mostra', 'mostra_anno_da', 'mostra_anno_a', 'bibliografia', 'documentazione',
];

/** Parameters that are not search criteria (sorting, pagination, language). */
const NON_CRITERI = new Set(['ordina', 'pagina', 'per_pagina', 'era_da', 'era_a', 'lang']);

/** The home page shows works only after a search: without criteria there is only the header. */
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

/**
 * Public page of a work: /opere/<first-words-of-the-title>-<random code>.
 * If the title has changed, the visitor is redirected to the updated address.
 */
pages.get(
  '/opere/:percorso',
  ah(async (req, res) => {
    const codice = codiceDaPercorso(String(req.params.percorso));
    const id = codice ? await schede.idDaCodice(codice) : null;
    if (!id) throw notFound();
    const s = await schede.getScheda(id, req.user);
    if (s.stato !== STATI.PUBBLICATA) return res.redirect(`/area/schede/${s.id}`);
    if (req.path !== s.percorso) return res.redirect(301, s.percorso + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
    const indirizzo = `${req.protocol}://${req.get('host')}${s.percorso}`;
    res.render('scheda', { title: titoloBreve(s.titolo_testo), nav: 'catalogo', s, area: false, indirizzo, confronto: confrontoDimensionale(s.misure) });
  }),
);

/**
 * Numeric addresses from the previous version: authenticated staff only
 * (they redirect to the public address). For everyone else they do not exist,
 * so works cannot be enumerated by number.
 */
const vecchioIndirizzo = ah(async (req, res) => {
  const id = Number(req.params.id ?? req.query.id);
  if (!req.user || !Number.isInteger(id) || id <= 0) throw notFound();
  const s = await schede.getScheda(id, req.user);
  res.redirect(s.stato === STATI.PUBBLICATA ? s.percorso : `/area/schede/${s.id}`);
});
pages.get('/scheda', vecchioIndirizzo);
pages.get('/scheda/:id', vecchioIndirizzo);

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
    // An authority entry used only in drafts is not public
    if (risultati.total === 0 && !req.user) throw notFound();
    res.render('voce', { title: `${req.t(v.singolare)}: ${voce[v.display]}`, nav: 'indici', v, voce, risultati });
  }),
);

// ---------------------------------------------------------------------------
// Information pages (texts in views/pagine, in Italian and English)
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
// Login
// ---------------------------------------------------------------------------

/**
 * Anti-CSRF token for the login form (double submit): the same random value
 * is in a hidden field and in a technical cookie restricted to the /login path,
 * valid for one hour and deleted after login. It does not affect the public catalogue.
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

/** Login without JavaScript: the form is submitted via POST (never credentials in the URL). */
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
// Staff area
// ---------------------------------------------------------------------------

pages.get(
  '/area',
  requireUserPage,
  ah(async (req, res) => {
    // Administrators have no records of their own: their home is the review queue
    if (req.user!.isAdmin) return res.redirect('/area/revisione');
    res.render('area/dashboard', { title: req.t('Le mie schede'), nav: 'area', mie: await schede.listMie(req.user!) });
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

pages.get('/area/schede/nuova', requireSchedatorePage, (req, res) => {
  res.render('area/editor', { title: req.t('Nuova scheda'), nav: 'nuova', scheda: null, schedaJson: 'null' });
});

pages.get(
  '/area/schede/:id/modifica',
  requireSchedatorePage,
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
    res.render('scheda', { title: titoloBreve(s.titolo_testo), nav: 'area', s, area: true, indirizzo: '', confronto: confrontoDimensionale(s.misure) });
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

pages.get(
  '/area/panoramica',
  requireAdminPage,
  ah(async (req, res) => {
    res.render('area/panoramica', { title: req.t('Panoramica del database'), nav: 'panoramica', panoramica: await getPanoramica() });
  }),
);

pages.get(
  '/area/esportazioni/foto',
  requireAdminPage,
  ah(async (req, res) => {
    const combinazioni = (['pubblicate', 'tutte'] as const).flatMap((ambito) => (['originale', 'anteprima'] as const).map((variante) => ({ ambito, variante })));
    const stime = await Promise.all(combinazioni.map(async (c) => ({ ...c, ...(await foto.stimaFoto(c)) })));
    res.render('area/foto', { title: req.t('Esporta foto'), nav: 'foto', stime });
  }),
);

pages.get('/area/utenti', requireAdminPage, (req, res) => {
  res.render('area/utenti', { title: req.t('Utenti'), nav: 'utenti' });
});

// Addresses from the previous version
pages.get(['/bozze', '/schedeInApprovazione'], (_req, res) => res.redirect(301, '/area'));
pages.get('/amministratore', (_req, res) => res.redirect(301, '/area/revisione'));
pages.get('/bozzaEditor', (_req, res) => res.redirect(301, '/area/schede/nuova'));
pages.get('/valutaBozza', (req, res) => {
  const id = Number(req.query.id);
  res.redirect(301, Number.isInteger(id) && id > 0 ? `/area/schede/${id}` : '/area/revisione');
});

export default pages;
