import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../config';
import { forbidden, HttpError } from './errors';

/** Header di sicurezza. Nessuno script/stile esterno o inline: tutto è servito da 'self'. */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      ...(config.session.secureCookie ? { upgradeInsecureRequests: [] } : {}),
    },
  },
  strictTransportSecurity: config.session.secureCookie ? { maxAge: 15552000, includeSubDomains: true } : false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'same-origin' },
});

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Protezione CSRF per le API autenticate da cookie: le richieste che modificano
 * dati devono provenire dallo stesso sito (header Origin/Referer). Si aggiunge al
 * cookie SameSite=Lax e all'obbligo di Content-Type JSON/immagine.
 */
export function sameOriginOnly(req: Request, _res: Response, next: NextFunction): void {
  if (!UNSAFE_METHODS.has(req.method)) return next();

  const source = req.get('origin') ?? req.get('referer');
  if (source) {
    let origin: URL;
    try {
      origin = new URL(source);
    } catch {
      return next(forbidden('Origine della richiesta non valida'));
    }
    const allowed = config.allowedOrigins.length
      ? config.allowedOrigins.includes(origin.origin)
      : origin.host === (req.get('x-forwarded-host') && config.trustProxy ? req.get('x-forwarded-host') : req.get('host'));
    if (!allowed) return next(forbidden('Richiesta da un sito non autorizzato'));
  }

  const type = req.get('content-type') ?? '';
  const hasBody = Number(req.get('content-length') ?? 0) > 0 || req.get('transfer-encoding');
  if (hasBody && !/^application\/json\b/i.test(type) && !/^image\//i.test(type)) {
    return next(new HttpError(415, 'Formato della richiesta non supportato'));
  }
  next();
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Troppi tentativi di accesso. Riprova tra qualche minuto.' },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Troppe richieste. Riprova tra poco.' },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `u:${req.user.id}` : `ip:${req.ip}`),
  message: { error: 'Troppi caricamenti. Riprova più tardi.' },
});
