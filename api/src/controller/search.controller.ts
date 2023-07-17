import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Scheda } from '../interface/scheda';
import { buildDynamicQuery } from '../query/search.query';

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];

export const advancedSearch = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const searchCriteria: { title: string; author: string; } = {
      title: req.query.title as string,
      author: req.query.author as string,
    };

    const dynamicQuery = buildDynamicQuery(searchCriteria);
    const pool = await connection();
    const result: ResultSet = await pool.query(dynamicQuery.query, dynamicQuery.params);
    pool.end();
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Schede retrieved', result[0]));
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};
