import { NextFunction, Request, Response } from 'express';
import { config } from '../config';
import en from './en.json';

/**
 * Lingue dell'interfaccia. L'italiano è la lingua principale e i testi del codice
 * sono in italiano: fungono da chiave e da testo predefinito (`t('Catalogo')`).
 * `en.json` contiene le traduzioni inglesi; una chiave mancante mostra l'italiano.
 * I contenuti delle schede (database) restano sempre in italiano.
 *
 * Scelta della lingua: parametro `?lang=` (salvato in un cookie) > cookie > lingua del browser.
 */

export const LANGS = ['it', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DIZIONARI: Record<Lang, Record<string, string>> = { it: {}, en };

const COOKIE = 'lumina_lang';

export type TFunction = (text: string, vars?: Record<string, string | number>) => string;

export function translate(lang: Lang, text: string, vars?: Record<string, string | number>): string {
  const s = DIZIONARI[lang][text] ?? text;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')) : s;
}

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

export function detectLang(req: Request): Lang {
  if (isLang(req.query.lang)) return req.query.lang;
  const cookie = req.cookies?.[COOKIE];
  if (isLang(cookie)) return cookie;
  // Accept-Language: la prima lingua supportata in ordine di preferenza
  const accepted = (req.get('accept-language') ?? '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return accepted.map((a) => a.lang).find(isLang) ?? 'it';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      lang: Lang;
      t: TFunction;
    }
  }
}

export function i18nMiddleware(req: Request, res: Response, next: NextFunction): void {
  const lang = detectLang(req);
  if (isLang(req.query.lang)) {
    res.cookie(COOKIE, lang, { maxAge: 365 * 24 * 3600 * 1000, sameSite: 'lax', secure: config.session.secureCookie, path: '/' });
  }
  req.lang = lang;
  req.t = (text, vars) => translate(lang, text, vars);
  res.locals.lang = lang;
  res.locals.t = req.t;
  res.setHeader('Content-Language', lang);
  next();
}
