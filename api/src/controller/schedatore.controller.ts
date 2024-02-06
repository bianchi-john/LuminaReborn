import { QUERY } from '../query/schedatore.query';
import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Scheda } from '../interface/scheda';
import { getUseData } from '../helpers/authHelpers'; // Importa le funzioni dal modulo

const validator = require('validator');

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];



export const getSchedeForSchedatore = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
            try {
              const userData = await getUseData(req, res);
              if (userData !== false) {
        const pool = await connection();
        const result: ResultSet = await pool.query(QUERY.SELECT_SCHEDE_PER_SCHEDATORE, [userData.username]);
        pool.end();
        return res.status(Code.OK)
          .send(new HttpResponse(Code.OK, Status.OK, 'Schede for schedatore ' + userData.username + ' retrieved', result[0]));
      }
    } catch (error: unknown) {
      console.error(error);
      return res.status(Code.INTERNAL_SERVER_ERROR)
        .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Problema identificazione utente. Il problema riguarda il token jwt'));
};


export const deleteSchedaForSchedatore = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const schedaIdString = req.query.id as string; // Ottieni il valore dalla query string
    const schedaId = parseInt(schedaIdString, 10); // Converti in numero intero
    console.log(req.originalUrl)
    if (schedaId){
      console.log(req.params.id)
        const result: ResultSet = await pool.query(QUERY.DELETE_SCHEDE_PER_SCHEDATORE, [schedaId]);
        pool.end();
        return res.status(200).json({
          code: 200,
          status: 'OK',
          message: `Scheda ${schedaId} eliminata con successo `,
          data: result[0]
        }); 
    }
    return res.status(500).json({
      code: 500,
      status: 'INTERNAL_SERVER_ERROR',
      message: 'Id non arrivato al server'
    });

  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      status: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred'
    });
  }

};

export const schedaToAdmin = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const userData = await getUseData(req, res);
    if (userData !== false) {
      const pool = await connection();
      const result: ResultSet = await pool.query(QUERY.SELECT_SCHEDE_PER_SCHEDATORE, [userData.username]);
      pool.end();
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Schede for schedatore ' + userData.username + ' retrieved', result[0]));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
  return res.status(Code.INTERNAL_SERVER_ERROR)
    .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'Problema identificazione utente. Il problema riguarda il token jwt'));
};