import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import fs from 'fs';
import path from 'path';
import { loadSession } from './auth/session';
import { config, ROOT_DIR } from './config';
import { CLASSIFICAZIONI, STATO_LABEL } from './domain/classificazioni';
import { VOCABOLARI } from './domain/vocabolari';
import { ah, errorHandler, notFound } from './http/errors';
import { protezioneScraping, robotsTxt } from './http/antiscraping';
import { apiLimiter, noStoreForPrivate, permissionsPolicy, sameOriginOnly, securityHeaders } from './http/security';
import { DIZIONARI, i18nMiddleware, Lang, LANGS, TFunction } from './i18n';
import { chiaviClient } from './i18n/chiavi';
import api from './routes/api';
import media from './routes/media';
import pages from './routes/pages';
import { cleanHtml, htmlToText } from './util/html';

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')) as { version: string };

const TZ = 'Europe/Rome';
const classLabel = new Map(CLASSIFICAZIONI.map((c) => [c.value, c.label]));

/** Helpers available in every EJS template as `h.*` (they depend on the language). */
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
    /** HTML is sanitized on output too: imported data never went through the sanitizer. */
    block: (html: string | null | undefined) => cleanHtml(html, 'block') ?? '',
    inline: (html: string | null | undefined) => cleanHtml(html, 'inline') ?? '',
    /** Classification label in the interface language (it stays in Italian in the database). */
    classLabel: (v: string | null) => (v ? t(classLabel.get(v) ?? v) : ''),
    statoLabel: (s: number) => t(STATO_LABEL[s] ?? ''),
    /** Current query string with some parameters replaced (pagination, filters, language). */
    qs: (query: Record<string, unknown>, overrides: Record<string, unknown>) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries({ ...query, ...overrides })) {
        if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') params.set(k, String(v));
      }
      const s = params.toString();
      return s ? `?${s}` : '?';
    },
    num: (n: number | null | undefined) => (n === null || n === undefined ? '' : n.toLocaleString(locale, { maximumFractionDigits: 3 })),
    /** "1 work" / "3 works" */
    plural: (n: number, one: string, many: string) => t(n === 1 ? one : many, { n }),
  };
}

/** Dictionaries for browser scripts: only the keys they actually use. */
function dizionariClient(): Record<Lang, string> {
  const chiavi = chiaviClient(ROOT_DIR);
  return Object.fromEntries(
    LANGS.map((lang) => {
      const voci = Object.entries(DIZIONARI[lang]).filter(([k]) => chiavi.has(k));
      return [lang, JSON.stringify(Object.fromEntries(voci)).replace(/</g, '\\u003c')];
    }),
  ) as Record<Lang, string>;
}

export function createApp(): Application {
  const dizionari = dizionariClient();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.set('views', path.join(ROOT_DIR, 'views'));
  app.set('view engine', 'ejs');
  if (config.isProduction) app.set('view cache', true);

  // Defaults: EJS throws ReferenceError on undefined variables
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
  app.use(permissionsPolicy);

  const staticOptions = { maxAge: config.isProduction ? '7d' : 0, index: false as const };
  app.use('/static', express.static(path.join(ROOT_DIR, 'public'), staticOptions));
  app.use('/vendor/bootstrap', express.static(path.join(ROOT_DIR, 'node_modules', 'bootstrap', 'dist'), staticOptions));
  app.get('/favicon.ico', (_req, res) => res.redirect(301, '/static/img/favicon.png'));
  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  // Channel for responsible vulnerability disclosure (RFC 9116)
  app.get('/.well-known/security.txt', (_req, res) => {
    if (!config.securityContact) return void res.status(404).type('text/plain').send('Not found');
    const scadenza = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString();
    res.type('text/plain').send(`Contact: ${config.securityContact}\nExpires: ${scadenza}\nPreferred-Languages: it, en\n`);
  });
  app.get('/robots.txt', (_req, res) => res.type('text/plain').send(robotsTxt()));

  app.use(cookieParser());
  app.use(i18nMiddleware);
  app.use(ah(loadSession));
  app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.query = req.query;
    res.locals.user = req.user ?? null;
    res.locals.h = viewHelpers(req.lang, req.t);
    // Dictionary for browser scripts (empty in Italian)
    res.locals.dizionarioClient = dizionari[req.lang];
    next();
  });
  app.use(noStoreForPrivate);
  app.use(protezioneScraping);

  app.use('/media', media);
  app.use('/api', apiLimiter, sameOriginOnly, api);
  app.use(pages);

  app.use((_req, _res, next) => next(notFound('Pagina non trovata')));
  app.use(errorHandler);
  return app;
}
