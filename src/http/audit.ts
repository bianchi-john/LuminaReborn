import { Request } from 'express';
import { logger } from '../logger';

/**
 * Security event log (OWASP ASVS 7, AgID ABSC 6 minimum measures):
 * successful and failed logins, logouts, password changes, administrator
 * operations, denied access. Written to stdout (collected by Docker) as one
 * JSON line per event. For data minimisation it contains no IP addresses,
 * passwords, tokens or record contents.
 */
export type EventoAudit =
  | 'login.ok'
  | 'login.fallito'
  | 'logout'
  | 'password.cambiata'
  | 'accesso.negato'
  | 'utente.creato'
  | 'utente.modificato'
  | 'utente.password'
  | 'utente.disconnesso'
  | 'utente.eliminato'
  | 'scheda.eliminata'
  | 'scheda.stato'
  | 'esportazione.foto'
  | 'voce.modificata'
  | 'voce.unita'
  | 'voce.eliminata'
  | 'esportazione';

export function audit(evento: EventoAudit, req: Request | undefined, dettagli: Record<string, unknown> = {}): void {
  logger.info(
    `AUDIT ${JSON.stringify({ evento, utente: req?.user?.username ?? dettagli.utente ?? null, metodo: req?.method, percorso: req?.originalUrl?.split('?')[0], ...dettagli })}`,
  );
}
