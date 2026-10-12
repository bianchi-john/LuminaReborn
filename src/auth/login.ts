import { Request, Response } from 'express';
import { config } from '../config';
import { audit } from '../http/audit';
import { cookieOptions, forgetToken } from './session';
import * as userManager from './userManager';

/**
 * Accesso con nome utente e password, usato sia dall'API (JavaScript attivo)
 * sia dal modulo HTML inviato in POST (JavaScript disattivato).
 * Restituisce false con credenziali errate, senza dire se l'utente esiste.
 */
export async function eseguiLogin(req: Request, res: Response, username: string, password: string): Promise<boolean> {
  const token = await userManager.login(username, password);
  if (!token) {
    audit('login.fallito', req, { utente: username.slice(0, 100) });
    return false;
  }
  // Una sessione già presente nel browser viene sostituita (niente session fixation)
  if (req.sessionToken) forgetToken(req.sessionToken);
  res.cookie(config.session.cookieName, token, cookieOptions());
  audit('login.ok', req, { utente: username });
  return true;
}
