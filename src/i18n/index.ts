import { NextFunction, Request, Response } from 'express';
import en from './en.json';

/**
 * Interface languages. Italian is the primary language and the texts in the code
 * are in Italian: they act as both key and default text (`t('Catalogo')`).
 * `en.json` holds the English translations; a missing key shows the Italian.
 * Record contents (database) always stay in Italian.
 *
 * Language selection: `?lang=` parameter (kept in the page links by
 * public/js/common.js) > browser language. No cookies: nothing is stored on
 * visitors' devices.
 */

export const LANGS = ['it', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DIZIONARI: Record<Lang, Record<string, string>> = { it: {}, en };

export type TFunction = (text: string, vars?: Record<string, string | number>) => string;

export function translate(lang: Lang, text: string, vars?: Record<string, string | number>): string {
  const s = DIZIONARI[lang][text] ?? text;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '')) : s;
}

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

export function detectLang(req: Request): Lang {
  if (isLang(req.query.lang)) return req.query.lang;
  // Accept-Language: the first supported language in order of preference
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
  req.lang = lang;
  req.t = (text, vars) => translate(lang, text, vars);
  res.locals.lang = lang;
  res.locals.t = req.t;
  res.setHeader('Content-Language', lang);
  res.vary('Accept-Language');
  next();
}
