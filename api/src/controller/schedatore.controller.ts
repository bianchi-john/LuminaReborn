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



// Modifica la funzione getSchedeForSchedatore
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