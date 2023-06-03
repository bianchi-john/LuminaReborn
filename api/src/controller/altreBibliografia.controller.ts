import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { AltreBibliografia } from '../interface/altreBibliografia';
import { QUERY } from '../query/altreBibliografia.query';

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];

export const getAltreBibliografie = async (req: Request, res: Response): Promise<Response<AltreBibliografia[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_ALTREBIBLIOGRAFIE);
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Altre bibliografie retrieved', result[0]));
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const getAltreBibliografia = async (req: Request, res: Response): Promise<Response<AltreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_ALTREBIBLIOGRAFIA, [req.params.altreBibliografiaId]);
    if (((result[0]) as Array<any>).length > 0) {
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Altre bibliografia retrieved', result[0]));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Altre bibliografia not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const createAltreBibliografia = async (req: Request, res: Response): Promise<Response<AltreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  let altreBibliografia: AltreBibliografia = { ...req.body };
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.CREATE_ALTREBIBLIOGRAFIA, Object.values(altreBibliografia));
    altreBibliografia = { id: (result[0] as ResultSetHeader).insertId, ...req.body };
    return res.status(Code.CREATED)
      .send(new HttpResponse(Code.CREATED, Status.CREATED, 'Altre bibliografia created', altreBibliografia));
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const updateAltreBibliografia = async (req: Request, res: Response): Promise<Response<AltreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  let altreBibliografia: AltreBibliografia = { ...req.body };
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_ALTREBIBLIOGRAFIA, [req.params.altreBibliografiaId]);
    if (((result[0]) as Array<any>).length > 0) {
      const result: ResultSet = await pool.query(QUERY.UPDATE_ALTREBIBLIOGRAFIA, [...Object.values(altreBibliografia), req.params.altreBibliografiaId]);
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Altre bibliografia updated', { ...altreBibliografia, id: req.params.altreBibliografiaId }));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Altre bibliografia not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const deleteAltreBibliografia = async (req: Request, res: Response): Promise<Response<AltreBibliografia>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_ALTREBIBLIOGRAFIA, [req.params.altreBibliografiaId]);
    if (((result[0]) as Array<any>).length > 0) {
      const result: ResultSet = await pool.query(QUERY.DELETE_ALTREBIBLIOGRAFIA, [req.params.altreBibliografiaId]);
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Altre bibliografia deleted'));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Altre bibliografia not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};
