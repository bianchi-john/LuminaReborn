import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Tds_schede_altreBibliografia } from '../interface/tds_schede_altreBibliografia';
import { QUERY } from '../query/tds_schede_altreBibliografia.query';

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];

export const getTds_schede_altreBibliografie = async (req: Request, res: Response): Promise<Response<Tds_schede_altreBibliografia[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIE);
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Tds_schede_altreBibliografie retrieved', result[0]));
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const getTds_schede_altreBibliografia = async (req: Request, res: Response): Promise<Response<Tds_schede_altreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
    if (((result[0]) as Array<any>).length > 0) {
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Tds_schede_altreBibliografia retrieved', result[0]));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Tds_schede_altreBibliografia not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const createTds_schede_altreBibliografia = async (req: Request, res: Response): Promise<Response<Tds_schede_altreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  let tds_schede_altreBibliografia: Tds_schede_altreBibliografia = { ...req.body };
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.CREATE_TDS_SCHEDE_ALTREBIBLIOGRAFIA, Object.values(tds_schede_altreBibliografia));
    tds_schede_altreBibliografia = { id: (result[0] as ResultSetHeader).insertId, ...req.body };
    return res.status(Code.CREATED)
      .send(new HttpResponse(Code.CREATED, Status.CREATED, 'Tds_schede_altreBibliografia created', tds_schede_altreBibliografia));
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const updateTds_schede_altreBibliografia = async (req: Request, res: Response): Promise<Response<Tds_schede_altreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  let tds_schede_altreBibliografia: Tds_schede_altreBibliografia = { ...req.body };
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
    if (((result[0]) as Array<any>).length > 0) {
      const result: ResultSet = await pool.query(QUERY.UPDATE_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [...Object.values(tds_schede_altreBibliografia), req.params.tds_schede_altreBibliografiaId]);
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Tds_schede_altreBibliografia updated', { ...tds_schede_altreBibliografia, id: req.params.tds_schede_altreBibliografiaId }));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Tds_schede_altreBibliografia not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const deleteTds_schede_altreBibliografia = async (req: Request, res: Response): Promise<Response<Tds_schede_altreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
    if (((result[0]) as Array<any>).length > 0) {
      const result: ResultSet = await pool.query(QUERY.DELETE_TDS_SCHEDE_ALTREBIBLIOGRAFIA, [req.params.tds_schede_altreBibliografiaId]);
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Tds_schede_altreBibliografia deleted'));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Tds_schede_altreBibliografia not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};
