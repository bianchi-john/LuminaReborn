import { Request } from 'express';
import { logger } from '../logger';

/**
 * Registro degli eventi di sicurezza (OWASP ASVS 7, misure minime AgID ABSC 6):
 * accessi riusciti e falliti, logout, cambi di password, operazioni degli
 * amministratori, accessi negati. Scritto su stdout (raccolto da Docker) in una
 * riga JSON per evento. Per scelta di minimizzazione non contiene indirizzi IP,
 * password, token o contenuti delle schede.
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
  | 'voce.modificata'
  | 'voce.unita'
  | 'voce.eliminata'
  | 'esportazione';

export function audit(evento: EventoAudit, req: Request | undefined, dettagli: Record<string, unknown> = {}): void {
  logger.info(
    `AUDIT ${JSON.stringify({ evento, utente: req?.user?.username ?? dettagli.utente ?? null, metodo: req?.method, percorso: req?.originalUrl?.split('?')[0], ...dettagli })}`,
  );
}
