import { createHash } from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import { config } from '../config';
import { execute, pool, selectOne } from '../db/pool';
import { forbidden, unauthorized } from '../http/errors';
import { logger } from '../logger';
import { getSelf, RemoteUser } from './userManager';

export type Role = 'admin' | 'schedatore';

export interface SessionUser {
  /** id nella tabella locale `users` (usato per proprietà e storico delle schede) */
  id: number;
  remoteId: string;
  username: string;
  displayName: string;
  role: Role;
  isAdmin: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
      sessionToken?: string;
    }
  }
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { user: SessionUser; expires: number }>();
/** Ultima attività per sessione (hash del token), per la scadenza per inattività. */
const lastSeen = new Map<string, number>();

const tokenKey = (token: string) => createHash('sha256').update(token).digest('hex');

export function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.session.secureCookie,
    // Strict: il cookie non viaggia mai con richieste avviate da altri siti
    sameSite: 'strict',
    path: '/',
    maxAge: config.session.maxAgeHours * 3600 * 1000,
  };
}

export function clearSessionCookie(res: Response): void {
  const { maxAge: _maxAge, ...options } = cookieOptions();
  res.clearCookie(config.session.cookieName, options);
}

export function forgetToken(token: string): void {
  cache.delete(tokenKey(token));
  lastSeen.delete(tokenKey(token));
}

/**
 * Scadenza per inattività (OWASP ASVS 3.3). Lo stato è in memoria: dopo un
 * riavvio dell'app le sessioni restano valide fino alla durata massima.
 */
function idleExpired(token: string): boolean {
  const key = tokenKey(token);
  const now = Date.now();
  const previous = lastSeen.get(key);
  if (previous !== undefined && now - previous > config.session.idleMinutes * 60_000) {
    lastSeen.delete(key);
    return true;
  }
  lastSeen.set(key, now);
  if (lastSeen.size > 10_000) {
    for (const [k, t] of lastSeen) if (now - t > config.session.idleMinutes * 60_000) lastSeen.delete(k);
  }
  return false;
}

/**
 * Lo user-manager emette JWT senza scadenza: la durata massima della sessione
 * viene imposta qui leggendo `iat` (la firma è verificata dallo user-manager).
 */
function tokenTooOld(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { iat?: number };
    if (typeof payload.iat !== 'number') return false;
    return Date.now() / 1000 - payload.iat > config.session.maxAgeHours * 3600;
  } catch {
    return true;
  }
}

/**
 * Allinea la copia locale dell'utente. Il nome visualizzato dello user-manager
 * vale lo username finché non viene personalizzato: in quel caso si mantiene
 * quello locale (es. "Pasquale Folcarile" delle schede importate).
 */
async function syncLocalUser(remote: RemoteUser): Promise<{ id: number; displayName: string }> {
  const custom = remote.display_name && remote.display_name !== remote.username ? remote.display_name : null;
  await execute(
    pool,
    `INSERT INTO users (username, display_name, isAdmin, external_id) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE display_name = COALESCE(?, display_name), isAdmin = VALUES(isAdmin), external_id = VALUES(external_id)`,
    [remote.username, custom ?? remote.username, remote.isAdmin ? 1 : 0, remote._id, custom],
  );
  const row = await selectOne<{ id: number; display_name: string | null }>(pool, 'SELECT id, display_name FROM users WHERE username = ?', [
    remote.username,
  ]);
  if (!row) throw new Error('Utente locale non trovato dopo la sincronizzazione');
  return { id: row.id, displayName: row.display_name || remote.username };
}

async function resolveUser(token: string): Promise<SessionUser | null> {
  const key = tokenKey(token);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.user;

  const remote = await getSelf(token);
  if (!remote || remote.locked || (!remote.activated && !remote.isAdmin)) {
    cache.delete(key);
    return null;
  }
  const local = await syncLocalUser(remote);
  const user: SessionUser = {
    id: local.id,
    remoteId: remote._id,
    username: remote.username,
    displayName: local.displayName,
    role: remote.isAdmin ? 'admin' : 'schedatore',
    isAdmin: !!remote.isAdmin,
  };
  cache.set(key, { user, expires: Date.now() + CACHE_TTL_MS });
  if (cache.size > 5000) {
    for (const [k, v] of cache) if (v.expires <= Date.now()) cache.delete(k);
  }
  return user;
}

/** Popola `req.user` (e `res.locals.user` per i template) se la sessione è valida. */
export async function loadSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token: string | undefined = req.cookies?.[config.session.cookieName];
  res.locals.user = null;
  if (!token) return next();

  if (token.length > 4096 || tokenTooOld(token) || idleExpired(token)) {
    forgetToken(token);
    clearSessionCookie(res);
    return next();
  }
  try {
    const user = await resolveUser(token);
    if (!user) {
      clearSessionCookie(res);
      return next();
    }
    req.user = user;
    req.sessionToken = token;
    res.locals.user = user;
    next();
  } catch (error) {
    // User-manager irraggiungibile: le pagine pubbliche restano consultabili
    logger.warn('Impossibile verificare la sessione', error instanceof Error ? error.message : error);
    next();
  }
}

export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(unauthorized());
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(unauthorized());
  if (!req.user.isAdmin) return next(forbidden('Riservato agli amministratori'));
  next();
}

/** Per le pagine: senza sessione si va al login (con ritorno alla pagina richiesta). */
export function requireUserPage(req: Request, res: Response, next: NextFunction): void {
  if (req.user) return next();
  res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
}

export function requireAdminPage(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  if (!req.user.isAdmin) return next(forbidden('Pagina riservata agli amministratori'));
  next();
}
