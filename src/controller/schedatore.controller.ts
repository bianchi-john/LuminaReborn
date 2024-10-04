import { QUERY } from '../query/schedatore.query';
import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Scheda } from '../interface/scheda';
import { getUserData } from '../helpers/authHelpers'; // Importa le funzioni dal modulo

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

export const deleteSchedaForSchedatore = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const schedaId = req.query.schedaId;
    const result: ResultSet = await pool.query(QUERY.DELETE_SCHEDE_PER_SCHEDATORE, [schedaId]);
    pool.end();
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Eliminata la scheda' + schedaId , result[0]));
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


