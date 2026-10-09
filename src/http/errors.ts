import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details);
export const unauthorized = (message = 'Autenticazione richiesta') => new HttpError(401, message);
export const forbidden = (message = 'Operazione non consentita') => new HttpError(403, message);
export const notFound = (message = 'Risorsa non trovata') => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);

/** Express 4 non gestisce le promise rifiutate: inoltra l'errore al gestore centrale. */
export const ah =
  <Req extends Request = Request>(fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };

function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;
  if (error instanceof ZodError) {
    const details = error.issues.map((i) => ({ campo: i.path.join('.'), messaggio: i.message }));
    return new HttpError(400, 'Dati non validi', details);
  }
  const anyError = error as { type?: string; status?: number; code?: string };
  if (anyError?.type === 'entity.too.large') return new HttpError(413, 'Contenuto troppo grande');
  if (anyError?.type === 'entity.parse.failed') return new HttpError(400, 'JSON non valido');
  if (anyError?.code === 'ER_ROW_IS_REFERENCED_2') return new HttpError(409, 'Elemento ancora collegato ad altre schede');
  return new HttpError(500, 'Errore interno del server');
}

/** Risposta JSON per le API, pagina di errore per il resto. Lo stack non esce mai dal server. */
export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  const httpError = toHttpError(error);
  if (httpError.status >= 500) logger.error(`${req.method} ${req.originalUrl}`, error);

  if (res.headersSent) return;
  if (req.originalUrl.startsWith('/api/')) {
    res.status(httpError.status).json({ error: httpError.message, details: httpError.details });
    return;
  }
  res.status(httpError.status).render('errore', { title: 'Errore', status: httpError.status, message: httpError.message });
}
