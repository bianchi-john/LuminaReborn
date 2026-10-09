import { config } from '../config';
import { HttpError } from '../http/errors';
import { logger } from '../logger';

/**
 * Client dello user-manager (moreillon/user-manager-mongoose).
 * Il JWT viaggia sempre nell'header Authorization, mai in query string
 * (finirebbe nei log). Le risposte vengono ripulite dai campi sensibili:
 * `/users/self` restituisce anche l'hash della password.
 */

export interface RemoteUser {
  _id: string;
  username: string;
  display_name?: string;
  email_address?: string | null;
  isAdmin?: boolean;
  activated?: boolean;
  locked?: boolean;
  last_login?: string;
  creation_date?: string;
}

const TIMEOUT_MS = 5000;

function pickUser(raw: Record<string, unknown>): RemoteUser {
  return {
    _id: String(raw._id),
    username: String(raw.username ?? ''),
    display_name: raw.display_name ? String(raw.display_name) : undefined,
    email_address: (raw.email_address as string | null | undefined) ?? null,
    isAdmin: raw.isAdmin === true,
    activated: raw.activated !== false,
    locked: raw.locked === true,
    last_login: raw.last_login as string | undefined,
    creation_date: raw.creation_date as string | undefined,
  };
}

async function call(path: string, init: RequestInit & { token?: string } = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.token) headers.set('Authorization', `Bearer ${init.token}`);
  if (init.body) headers.set('Content-Type', 'application/json');
  try {
    return await fetch(`${config.userManagerUrl}${path}`, { ...init, headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    logger.error(`User-manager non raggiungibile (${path})`, error);
    throw new HttpError(503, 'Servizio di autenticazione non disponibile');
  }
}

async function failure(res: Response, fallback: string): Promise<HttpError> {
  const text = (await res.text().catch(() => '')).slice(0, 300);
  const status = res.status === 401 || res.status === 403 ? 403 : res.status >= 500 ? 502 : 400;
  return new HttpError(status, text && status === 400 ? `${fallback}: ${text}` : fallback);
}

/** Restituisce il JWT oppure null se le credenziali non sono valide. */
export async function login(username: string, password: string): Promise<string | null> {
  const res = await call('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (res.status === 400 || res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw await failure(res, 'Login non riuscito');
  const data = (await res.json()) as { jwt?: string };
  return data.jwt ?? null;
}

/** Utente associato al token, oppure null se il token non è (più) valido. */
export async function getSelf(token: string): Promise<RemoteUser | null> {
  const res = await call('/users/self', { token });
  if (res.status === 401 || res.status === 403 || res.status === 404) return null;
  if (!res.ok) throw await failure(res, 'Verifica della sessione non riuscita');
  return pickUser((await res.json()) as Record<string, unknown>);
}

/** Invalida tutti i token dell'utente (logout lato server). */
export async function revokeTokens(token: string): Promise<void> {
  const res = await call('/users/self/token', { method: 'DELETE', token });
  if (!res.ok) logger.warn(`Revoca del token non riuscita (HTTP ${res.status})`);
}

// --- Gestione utenti (solo amministratori, con il loro token) -------------------

export async function listUsers(token: string): Promise<RemoteUser[]> {
  const res = await call('/users?limit=500&sort=username', { token });
  if (!res.ok) throw await failure(res, 'Impossibile leggere gli utenti');
  const data = (await res.json()) as { users: Record<string, unknown>[] };
  return data.users.map(pickUser);
}

export async function createUser(token: string, input: { username: string; password: string; email_address?: string | null }): Promise<RemoteUser> {
  const body = { username: input.username, password: input.password, password_confirm: input.password, email_address: input.email_address || undefined };
  const res = await call('/users', { method: 'POST', token, body: JSON.stringify(body) });
  if (!res.ok) throw await failure(res, 'Creazione utente non riuscita');
  return pickUser((await res.json()) as Record<string, unknown>);
}

export async function updateUser(
  token: string,
  id: string,
  input: Partial<Pick<RemoteUser, 'display_name' | 'isAdmin' | 'locked' | 'activated'>>,
): Promise<void> {
  const res = await call(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', token, body: JSON.stringify(input) });
  if (!res.ok) throw await failure(res, 'Aggiornamento utente non riuscito');
}

export async function setPassword(token: string, id: string, password: string): Promise<void> {
  const body = { new_password: password, new_password_confirm: password };
  const res = await call(`/users/${encodeURIComponent(id)}/password`, { method: 'PUT', token, body: JSON.stringify(body) });
  if (!res.ok) throw await failure(res, 'Cambio password non riuscito');
}

export async function revokeUserTokens(token: string, id: string): Promise<void> {
  const res = await call(`/users/${encodeURIComponent(id)}/token`, { method: 'DELETE', token });
  if (!res.ok) throw await failure(res, 'Revoca delle sessioni non riuscita');
}

export async function deleteUser(token: string, id: string): Promise<void> {
  const res = await call(`/users/${encodeURIComponent(id)}`, { method: 'DELETE', token });
  if (!res.ok) throw await failure(res, 'Eliminazione utente non riuscita');
}
