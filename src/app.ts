import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import fs from 'fs';
import path from 'path';
import { loadSession } from './auth/session';
import { config, ROOT_DIR } from './config';
import { CLASSIFICAZIONI, STATO_LABEL } from './domain/classificazioni';
import { VOCABOLARI } from './domain/vocabolari';
import { ah, errorHandler, notFound } from './http/errors';
import { apiLimiter, sameOriginOnly, securityHeaders } from './http/security';
import { DIZIONARI, i18nMiddleware, Lang, TFunction } from './i18n';
import api from './routes/api';
import media from './routes/media';
import pages from './routes/pages';
import { cleanHtml, htmlToText } from './util/html';

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')) as { version: string };

const TZ = 'Europe/Rome';
const classLabel = new Map(CLASSIFICAZIONI.map((c) => [c.value, c.label]));

/** Funzioni disponibili in tutti i template EJS come `h.*` (dipendono dalla lingua). */
function viewHelpers(lang: Lang, t: TFunction) {
  const locale = lang === 'en' ? 'en-GB' : 'it-IT';
  const dateFmt = new Intl.DateTimeFormat(locale, { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateTimeFmt = new Intl.DateTimeFormat(locale, { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' });
  const anno = (y: number | null | undefined) => (y === null || y === undefined ? '' : y < 0 ? t('{n} a.C.', { n: -y }) : String(y));
  return {
    date: (d: Date | string | null | undefined) => (d ? dateFmt.format(new Date(d)) : ''),
    dateTime: (d: Date | string | null | undefined) => (d ? dateTimeFmt.format(new Date(d)) : ''),
    anno,
    data: (g?: number | null, m?: number | null, a?: number | null) => {
      const y = anno(a);
      return [g, m].every((x) => x !== null && x !== undefined) ? `${g}/${m}/${y}` : m ? `${m}/${y}` : y;
    },
    text: htmlToText,
    /** HTML ripulito anche in uscita: i dati importati non sono mai passati dal sanitizer. */
    block: (html: string | null | undefined) => cleanHtml(html, 'block') ?? '',
    inline: (html: string | null | undefined) => cleanHtml(html, 'inline') ?? '',
    /** Etichetta della classificazione nella lingua dell'interfaccia (nel database resta in italiano). */
    classLabel: (v: string | null) => (v ? t(classLabel.get(v) ?? v) : ''),
    statoLabel: (s: number) => t(STATO_LABEL[s] ?? ''),
    /** Querystring corrente con alcuni parametri sostituiti (paginazione, filtri, lingua). */
    qs: (query: Record<string, unknown>, overrides: Record<string, unknown>) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries({ ...query, ...overrides })) {
        if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') params.set(k, String(v));
      }
      const s = params.toString();
      return s ? `?${s}` : '?';
    },
    num: (n: number | null | undefined) => (n === null || n === undefined ? '' : n.toLocaleString(locale, { maximumFractionDigits: 3 })),
    /** "1 opera" / "3 opere" */
    plural: (n: number, one: string, many: string) => t(n === 1 ? one : many, { n }),
  };
}

export function createApp(): Application {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.set('views', path.join(ROOT_DIR, 'views'));
  app.set('view engine', 'ejs');
  if (config.isProduction) app.set('view cache', true);

  // Valori predefiniti: EJS solleva ReferenceError sulle variabili non definite
  app.locals.user = null;
  app.locals.nav = '';
  app.locals.title = '';
  app.locals.vocabolari = VOCABOLARI;
  app.locals.classificazioni = CLASSIFICAZIONI;
  app.locals.assetVersion = config.isProduction ? version : String(Date.now());
  app.locals.lang = 'it';
  app.locals.t = (s: string) => s;
  app.locals.h = viewHelpers('it', (s) => s);
  app.locals.query = {};
  app.locals.path = '';
  app.locals.dizionarioClient = '{}';

  app.use(securityHeaders);

  const staticOptions = { maxAge: config.isProduction ? '7d' : 0, index: false as const };
  app.use('/static', express.static(path.join(ROOT_DIR, 'public'), staticOptions));
  app.use('/vendor/bootstrap', express.static(path.join(ROOT_DIR, 'node_modules', 'bootstrap', 'dist'), staticOptions));
  app.get('/favicon.ico', (_req, res) => res.redirect(301, '/static/img/favicon.png'));
  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  app.get('/robots.txt', (_req, res) => res.type('text/plain').send('User-agent: *\nDisallow: /area\nDisallow: /api\nDisallow: /login\n'));

  app.use(cookieParser());
  app.use(i18nMiddleware);
  app.use(ah(loadSession));
  app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.query = req.query;
    res.locals.user = req.user ?? null;
    res.locals.h = viewHelpers(req.lang, req.t);
    // Dizionario per gli script del browser (vuoto in italiano)
    res.locals.dizionarioClient = JSON.stringify(DIZIONARI[req.lang]).replace(/</g, '\\u003c');
    next();
  });

  app.use('/media', media);
  app.use('/api', apiLimiter, sameOriginOnly, api);
  app.use(pages);

  app.use((_req, _res, next) => next(notFound('Pagina non trovata')));
  app.use(errorHandler);
  return app;
}
