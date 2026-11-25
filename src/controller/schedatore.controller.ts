import { QUERY } from '../query/schedatore.query';
import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Scheda } from '../interface/scheda';
import { getUserData } from '../helpers/authHelpers'; // Importa le funzioni dal modulo
import { eliminaScheda } from '../helpers/eliminaScheda';

const validator = require('validator');

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];


export const getSchedeForSchedatore = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
      const inApprovazione = req.query.inApprovazione;

      const userData = await getUserData(req, res);
      if (userData !== false) {
          const pool = await connection();
          let query;
          let params;
          
          if (inApprovazione === 'ok') {
              query = QUERY.SELECT_SCHEDE_PER_SCHEDATORE_IN_APPROVAZIONE;
              params = [userData.username];
          } else {
              query = QUERY.SELECT_SCHEDE_PER_SCHEDATORE;
              params = [userData.username];
          }
          
          const result: ResultSet = await pool.query(query, params);
          pool.end();
          return res.status(Code.OK)
              .send(new HttpResponse(Code.OK, Status.OK, 'Ottenute le schede ' + userData.username + ' retrieved', result[0]));
      }
  } catch (error: unknown) {
      console.error(error);
      return res.status(Code.INTERNAL_SERVER_ERROR)
          .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
  return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Problema identificazione utente. Il problema riguarda il token jwt'));
};

/**
 * Lo schedatore può agire solo sulle proprie schede e solo nello stato giusto.
 * Restituisce lo stato attuale (0 bozza, 1 in approvazione) oppure invia la
 * risposta di errore e restituisce null.
 */
async function statoSePropria(req: Request, res: Response, statiAmmessi: number[]): Promise<number | null> {
  const schedaId = Number(req.query.schedaId);
  if (!Number.isInteger(schedaId) || schedaId <= 0) {
    res.status(Code.BAD_REQUEST).send(new HttpResponse(Code.BAD_REQUEST, Status.BAD_REQUEST, 'Scheda non indicata'));
    return null;
  }
  const userData = await getUserData(req, res);
  if (userData === false) {
    if (!res.headersSent) res.status(Code.UNAUTHORIZED).send(new HttpResponse(Code.UNAUTHORIZED, Status.UNAUTHORIZED, 'Sessione scaduta: esci e rientra'));
    return null;
  }
  const pool = await connection();
  const [righe] = await pool.query(QUERY.STATO_SE_PROPRIA, [schedaId, userData.username]);
  const riga = (righe as RowDataPacket[])[0];
  if (!riga) {
    res.status(Code.NOT_FOUND).send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Scheda non trovata tra le tue'));
    return null;
  }
  if (!statiAmmessi.includes(Number(riga.stato))) {
    res.status(Code.CONFLICT).send(new HttpResponse(Code.CONFLICT, Status.CONFLICT, 'Operazione non possibile nello stato attuale della scheda'));
    return null;
  }
  return Number(riga.stato);
}

export const deleteSchedaForSchedatore = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    // Solo le proprie bozze (non quelle in approvazione o pubblicate)
    if ((await statoSePropria(req, res, [0])) === null) return res;
    const schedaId = Number(req.query.schedaId);
    await eliminaScheda(schedaId);
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Eliminata la scheda ' + schedaId));
    }
     catch (error: unknown) {
      console.error(error);
      return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};


export const schedaToAdmin = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    // Si invia in approvazione solo una propria bozza
    if ((await statoSePropria(req, res, [0])) === null) return res;
    const pool = await connection();
    const schedaId = req.query.schedaId;
    const result: ResultSet = await pool.query(QUERY.SEND_SCHEDE_TO_SCHEDATORE, [schedaId]);
    pool.end();
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Inviata in approvazione la scheda' + schedaId , result[0]));
    }
     catch (error: unknown) {
      console.error(error);
      return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const withdrawScheda = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    // Si ritira solo una propria scheda ancora in approvazione
    if ((await statoSePropria(req, res, [1])) === null) return res;
    const pool = await connection();
    const schedaId = req.query.schedaId;
    const result: ResultSet = await pool.query(QUERY.WITHDRAW_SCHEDA, [schedaId]);
    pool.end();
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Ritirata la scheda:' + schedaId , result[0]));
    }
     catch (error: unknown) {
      console.error(error);
      return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};


