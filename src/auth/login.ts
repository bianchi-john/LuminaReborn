import { Request, Response } from 'express';
import { config } from '../config';
import { audit } from '../http/audit';
import { cookieOptions, forgetToken } from './session';
import * as userManager from './userManager';

/**
 * Login with username and password, used both by the API (JavaScript enabled)
 * and by the HTML form submitted via POST (JavaScript disabled).
 * Returns false on wrong credentials, without revealing whether the user exists.
 */
export async function eseguiLogin(req: Request, res: Response, username: string, password: string): Promise<boolean> {
  const token = await userManager.login(username, password);
  if (!token) {
    audit('login.fallito', req, { utente: username.slice(0, 100) });
    return false;
  }
  // Any session already in the browser is replaced (no session fixation)
  if (req.sessionToken) forgetToken(req.sessionToken);
  res.cookie(config.session.cookieName, token, cookieOptions());
  audit('login.ok', req, { utente: username });
  return true;
}
