import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../config';
import { forbidden, HttpError } from './errors';

/**
 * Header di sicurezza (OWASP Secure Headers). Nessuno script o stile esterno o
 * inline: tutto è servito da 'self', quindi la CSP può essere restrittiva.
 */
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
      mediaSrc: ["'none'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      workerSrc: ["'none'"],
      manifestSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      ...(config.session.secureCookie ? { upgradeInsecureRequests: [] } : {}),
    },
  },
  strictTransportSecurity: config.session.secureCookie ? { maxAge: 31536000, includeSubDomains: true } : false,
  // Tutte le risorse sono dello stesso sito: l'isolamento cross-origin non rompe nulla
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'same-origin' },
  xFrameOptions: { action: 'deny' },
});

/** Funzionalità del browser non usate dal sito: disattivate esplicitamente. */
export function permissionsPolicy(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), ' +
      'gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), ' +
      'screen-wake-lock=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), interest-cohort=(), browsing-topics=()',
  );
  next();
}

/**
 * Le pagine dell'area riservata e le risposte a utenti autenticati non devono
 * restare nella cache del browser o di proxy intermedi (OWASP ASVS 8.2.1).
 */
export function noStoreForPrivate(req: Request, res: Response, next: NextFunction): void {
  if (req.user || /^\/(area|login)(\/|$)/.test(req.path)) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
}

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function expectedHost(req: Request): string | undefined {
  return config.trustProxy && req.get('x-forwarded-host') ? req.get('x-forwarded-host') : req.get('host');
}

/**
 * Protezione CSRF a più livelli per le API autenticate da cookie:
 * 1. cookie di sessione SameSite=Strict;
 * 2. Fetch Metadata: il browser dichiara se la richiesta è cross-site e la si rifiuta;
 * 3. Origin/Referer devono indicare questo sito (obbligatori se c'è una sessione);
 * 4. corpo solo JSON o immagine: un form di un altro sito non può produrli.
 */
/** Verifica che una richiesta che modifica dati provenga da questo sito (null = ok). */
export function verificaOrigine(req: Request): HttpError | null {
  const fetchSite = req.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return forbidden('Richiesta da un sito non autorizzato');

  const source = req.get('origin') ?? req.get('referer');
  if (source) {
    let origin: URL;
    try {
      origin = new URL(source);
    } catch {
      return forbidden('Origine della richiesta non valida');
    }
    const allowed = config.allowedOrigins.length ? config.allowedOrigins.includes(origin.origin) : origin.host === expectedHost(req);
    if (!allowed) return forbidden('Richiesta da un sito non autorizzato');
  } else if (req.cookies?.[config.session.cookieName]) {
    // Un browser invia sempre Origin con le richieste che modificano dati
    return forbidden('Origine della richiesta mancante');
  }
  return null;
}

export function sameOriginOnly(req: Request, _res: Response, next: NextFunction): void {
  if (!UNSAFE_METHODS.has(req.method)) return next();
  const errore = verificaOrigine(req);
  if (errore) return next(errore);

  const type = req.get('content-type') ?? '';
  const hasBody = Number(req.get('content-length') ?? 0) > 0 || req.get('transfer-encoding');
  if (hasBody && !/^application\/json\b/i.test(type) && !/^image\//i.test(type)) {
    return next(new HttpError(415, 'Formato della richiesta non supportato'));
  }
  next();
}

const limiterBase = { standardHeaders: 'draft-7' as const, legacyHeaders: false };

/** Tentativi di accesso falliti per indirizzo IP (contro la forza bruta). */
export const loginLimiter = rateLimit({
  ...limiterBase,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Troppi tentativi di accesso. Riprova tra qualche minuto.' },
});

/** Tentativi falliti per nome utente (contro attacchi distribuiti su più IP). */
export const loginUserLimiter = rateLimit({
  ...limiterBase,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `user:${String(req.body?.username ?? '').trim().toLowerCase().slice(0, 100)}`,
  message: { error: 'Troppi tentativi di accesso. Riprova tra qualche minuto.' },
});

export const apiLimiter = rateLimit({
  ...limiterBase,
  windowMs: 60 * 1000,
  limit: 300,
  message: { error: 'Troppe richieste. Riprova tra poco.' },
});

export const uploadLimiter = rateLimit({
  ...limiterBase,
  windowMs: 60 * 60 * 1000,
  limit: 200,
  keyGenerator: (req) => (req.user ? `u:${req.user.id}` : `ip:${req.ip}`),
  message: { error: 'Troppi caricamenti. Riprova più tardi.' },
});
