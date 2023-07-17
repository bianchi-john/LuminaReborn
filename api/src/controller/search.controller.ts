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
    const searchCriteria: {
      titoloOpera: string;
      corpoScheda: string;
      iscrizioni: string;
      descrizioneSintetica: string;
      storiaEspositiva: string;
      classificazione: string;
      formulaPrecedente: string;
      formulaSuccessiva: string;
      categoria: string;
      nomeAutore: string;
      ambitoStorico: string;
      dataDa: Date;
      dataA: Date;
      nomeMateriale: string;
      descrizioneMateriale: string;
      nomeTecnica: string;
      descrizioneTecnica: string;
      ubicazione: string;
      descrizioneUbicazione: string;
      nomeInventario: string;
      nomeProvenienza: string;
      descrizioneProvenienza: string;
      curatore: string;
      titoloMostra: string;
      dataInizioMostra: Date;
      dataFineMostra: Date;
      luogoMostra: string;
      descrizioneMostra: string;
      riferimentoBibliografico: string;
      altroRiferimentoBibliografico: string;
      documentazioniFotografiche: string;
    } = {
      titoloOpera: req.query.titoloOpera as string,
      corpoScheda: req.query.corpoScheda as string,
      iscrizioni: req.query.iscrizioni as string,
      descrizioneSintetica: req.query.descrizioneSintetica as string,
      storiaEspositiva: req.query.storiaEspositiva as string,
      classificazione: req.query.classificazione as string,
      formulaPrecedente: req.query.formulaPrecedente as string,
      formulaSuccessiva: req.query.formulaSuccessiva as string,
      categoria: req.query.categoria as string,
      nomeAutore: req.query.nomeAutore as string,
      ambitoStorico: req.query.ambitoStorico as string,
      dataDa: req.query.dataDa as unknown as Date,
      dataA: req.query.dataA as unknown as Date,
      nomeMateriale: req.query.nomeMateriale as string,
      descrizioneMateriale: req.query.descrizioneMateriale as string,
      nomeTecnica: req.query.nomeTecnica as string,
      descrizioneTecnica: req.query.descrizioneTecnica as string,
      ubicazione: req.query.ubicazione as string,
      descrizioneUbicazione: req.query.descrizioneUbicazione as string,
      nomeInventario: req.query.nomeInventario as string,
      nomeProvenienza: req.query.nomeProvenienza as string,
      descrizioneProvenienza: req.query.descrizioneProvenienza as string,
      curatore: req.query.curatore as string,
      titoloMostra: req.query.titoloMostra as string,
      dataInizioMostra: req.query.dataInizioMostra as unknown as Date,
      dataFineMostra: req.query.dataFineMostra as unknown as Date,
      luogoMostra: req.query.luogoMostra as string,
      descrizioneMostra: req.query.descrizioneMostra as string,
      riferimentoBibliografico: req.query.riferimentoBibliografico as string,
      altroRiferimentoBibliografico: req.query.altroRiferimentoBibliografico as string,
      documentazioniFotografiche: req.query.documentazioniFotografiche as string,
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
