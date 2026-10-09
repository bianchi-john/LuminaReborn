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
import api from './routes/api';
import pages from './routes/pages';
import { cleanHtml, htmlToText } from './util/html';

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')) as { version: string };

const TZ = 'Europe/Rome';
const dateFmt = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('it-IT', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' });
const classLabel = new Map(CLASSIFICAZIONI.map((c) => [c.value, c.label]));

/** Funzioni disponibili in tutti i template EJS. */
const viewHelpers = {
  date: (d: Date | string | null | undefined) => (d ? dateFmt.format(new Date(d)) : ''),
  dateTime: (d: Date | string | null | undefined) => (d ? dateTimeFmt.format(new Date(d)) : ''),
  anno: (y: number | null | undefined) => (y === null || y === undefined ? '' : y < 0 ? `${-y} a.C.` : String(y)),
  data: (g?: number | null, m?: number | null, a?: number | null) => {
    const anno = a === null || a === undefined ? '' : a < 0 ? `${-a} a.C.` : String(a);
    return [g, m].every((x) => x !== null && x !== undefined) ? `${g}/${m}/${anno}` : m ? `${m}/${anno}` : anno;
  },
  text: htmlToText,
  /** HTML ripulito anche in uscita: i dati importati non sono mai passati dal sanitizer. */
  block: (html: string | null | undefined) => cleanHtml(html, 'block') ?? '',
  inline: (html: string | null | undefined) => cleanHtml(html, 'inline') ?? '',
  /** Querystring corrente con alcuni parametri sostituiti (paginazione, filtri). */
  qs: (query: Record<string, unknown>, overrides: Record<string, unknown>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...query, ...overrides })) {
      if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') params.set(k, String(v));
    }
    const s = params.toString();
    return s ? `?${s}` : '?';
  },
  num: (n: number | null | undefined) => (n === null || n === undefined ? '' : n.toLocaleString('it-IT', { maximumFractionDigits: 3 })),
  classLabel: (v: string | null) => (v ? (classLabel.get(v) ?? v) : ''),
  statoLabel: (s: number) => STATO_LABEL[s] ?? '',
};

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
  app.locals.h = viewHelpers;
  app.locals.vocabolari = VOCABOLARI;
  app.locals.classificazioni = CLASSIFICAZIONI;
  app.locals.assetVersion = config.isProduction ? version : String(Date.now());

  app.use(securityHeaders);

  const staticOptions = { maxAge: config.isProduction ? '7d' : 0, index: false as const };
  app.use('/static', express.static(path.join(ROOT_DIR, 'public'), staticOptions));
  app.use('/vendor/bootstrap', express.static(path.join(ROOT_DIR, 'node_modules', 'bootstrap', 'dist'), staticOptions));
  app.get('/favicon.ico', (_req, res) => res.redirect(301, '/static/img/favicon.png'));
  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use(cookieParser());
  app.use(ah(loadSession));
  app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.user = req.user ?? null;
    next();
  });

  app.use('/api', apiLimiter, sameOriginOnly, api);
  app.use(pages);

  app.use((_req, _res, next) => next(notFound('Pagina non trovata')));
  app.use(errorHandler);
  return app;
}
