import { QUERY } from '../query/amministratore.query';
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
export const getSchedeForAmministratore = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
    console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
    try {
        const pool = await connection();
        const result: ResultSet = await pool.query(QUERY.SELECT_SCHEDE_PER_SCHEDATORE);
        pool.end();
        return res.status(Code.OK)
          .send(new HttpResponse(Code.OK, Status.OK, 'Schede for schedatore retrieved', result[0]));
    } catch (error: unknown) {
      console.error(error);
      return res.status(Code.INTERNAL_SERVER_ERROR)
        .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
};