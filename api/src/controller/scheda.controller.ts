import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Scheda } from '../interface/scheda';
import { QUERY } from '../query/scheda.query';
import { YourValidationResult, validateSchedaData } from '../validator/bozzaValidator';
import { insertScheda, insertAutori, insertCronologie, insertUbicazioni } from '../services/schedaService';


type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];

export const getSchede = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_SCHEDE);
    pool.end();
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Schede retrieved', result[0]));
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const getScheda = async (req: Request, res: Response): Promise<Response<Scheda>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const schedaId = req.params.schedaId;

    const querySelectScheda = QUERY.SELECT_SCHEDA;
    const querySelectAutori = QUERY.SELECT_AUTORI;
    const querySelectCronologie = QUERY.SELECT_CRONOLOGIE;
    const querySelectMateriali = QUERY.SELECT_MATERIALI;
    const querySelectTecniche = QUERY.SELECT_TECNICHE;
    const querySelectUbicazioni = QUERY.SELECT_UBICAZIONI;
    const querySelectInventari = QUERY.SELECT_INVENTARI;
    const querySelectProvenienze = QUERY.SELECT_PROVENIENZE;
    const querySelectMostre = QUERY.SELECT_MOSTRE;
    const querySelectBibliografie = QUERY.SELECT_BIBLIOGRAFIE;
    const querySelectAltreBibliografie = QUERY.SELECT_ALTREBIBLIOGRAFIE;
    const querySelectSchedatori = QUERY.SELECT_SCHEDATORI;

    const querySelectImmagini = QUERY.SELECT_IMMAGINI;
    const querySelectDocumentazioniFotografiche = QUERY.SELECT_DOCUMENTAZIONIFOTOGRAFICHE;
    const querySelectMisure = QUERY.SELECT_MISURE;

    const resultScheda: ResultSet = await pool.query(querySelectScheda, [schedaId]);
    const resultAutori: ResultSet = await pool.query(querySelectAutori, [schedaId]);
    const resultCronologie: ResultSet = await pool.query(querySelectCronologie, [schedaId]);
    const resultMateriali: ResultSet = await pool.query(querySelectMateriali, [schedaId]);
    const resultTecniche: ResultSet = await pool.query(querySelectTecniche, [schedaId]);
    const resultUbicazioni: ResultSet = await pool.query(querySelectUbicazioni, [schedaId]);
    const resultInventari: ResultSet = await pool.query(querySelectInventari, [schedaId]);
    const resultProvenienze: ResultSet = await pool.query(querySelectProvenienze, [schedaId]);
    const resultMostre: ResultSet = await pool.query(querySelectMostre, [schedaId]);
    const resultBibliografie: ResultSet = await pool.query(querySelectBibliografie, [schedaId]);
    const resultAltreBibliografie: ResultSet = await pool.query(querySelectAltreBibliografie, [schedaId]);
    const resultSchedatori: ResultSet = await pool.query(querySelectSchedatori, [schedaId]);
    const resultImmagini: ResultSet = await pool.query(querySelectImmagini, [schedaId]);
    const resultDocumentazioniFotografiche: ResultSet = await pool.query(querySelectDocumentazioniFotografiche, [schedaId]);
    const resultMisure: ResultSet = await pool.query(querySelectMisure, [schedaId]);

    if (resultScheda.length > 0) {
      pool.end();
      return res.status(Code.OK).send(new HttpResponse(Code.OK, Status.OK, 'Scheda retrieved', {
        scheda: resultScheda[0],
        autori: resultAutori[0],
        cronologie: resultCronologie[0],
        materiali: resultMateriali[0],
        tecniche: resultTecniche[0],
        ubicazioni: resultUbicazioni[0],
        inventari: resultInventari[0],
        provenienze: resultProvenienze[0],
        mostre: resultMostre[0],
        bibliografie: resultBibliografie[0],
        altreBibliografie: resultAltreBibliografie[0],
        immagini: resultImmagini[0],
        documentazioniFotografiche: resultDocumentazioniFotografiche[0],
        misure: resultMisure[0],
        schedatori: resultSchedatori[0],

      }));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Scheda not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};





// ####################### CREATE BOZZA ##############################


export const createScheda = async (req: Request, res: Response): Promise<Response<Scheda>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  
  let scheda: Scheda = { ...req.body };

  try {
    // Esegui i controlli di validazione
    const validationResult: YourValidationResult = await validateSchedaData(scheda);

    if (!validationResult.isValid) {
      return res.status(Code.BAD_REQUEST)
        .send(new HttpResponse(
          Code.BAD_REQUEST,
          Status.BAD_REQUEST,
          validationResult.errorMessage || 'Errore di validazione non specificato'
        ));
    }

    // Inserisci la scheda e ottieni l'ID della scheda appena inserita
    const schedaId = await insertScheda(scheda);
    const pool = await connection();
    // Autori
    await insertAutori(pool, schedaId, scheda);
    // Ubicazioni
    await insertCronologie(pool, schedaId, scheda);
    await insertUbicazioni(pool, schedaId, scheda);


    return res.status(Code.CREATED)
      .send(new HttpResponse(Code.CREATED, Status.CREATED, 'Creata la bozza con id ' + schedaId));
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};


// ###########################################################################################
















export const updateScheda = async (req: Request, res: Response): Promise<Response<Scheda>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  let scheda: Scheda = { ...req.body };
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_SCHEDA, [req.params.schedaId]);
    if (((result[0]) as Array<any>).length > 0) {
      const result: ResultSet = await pool.query(QUERY.UPDATE_SCHEDA, [...Object.values(scheda), req.params.schedaId]);
      pool.end();
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Scheda updated', { ...scheda, id: req.params.schedaId }));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Scheda not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};

export const deleteScheda = async (req: Request, res: Response): Promise<Response<Scheda>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const pool = await connection();
    const result: ResultSet = await pool.query(QUERY.SELECT_SCHEDA, [req.params.schedaId]);
    if (((result[0]) as Array<any>).length > 0) {
      const result: ResultSet = await pool.query(QUERY.DELETE_SCHEDA, [req.params.schedaId]);
      pool.end();
      return res.status(Code.OK)
        .send(new HttpResponse(Code.OK, Status.OK, 'Scheda deleted'));
    } else {
      return res.status(Code.NOT_FOUND)
        .send(new HttpResponse(Code.NOT_FOUND, Status.NOT_FOUND, 'Scheda not found'));
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};
