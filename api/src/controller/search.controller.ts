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
      titoloOpera: String;
      corpoScheda: String;
      iscrizioni: String;
      descrizioneSintetica: String;
      storiaEspositiva: String;
      classificazione: String;
      formulaPrecedente: String;
      formulaSuccessiva: String;
      categoria: String;
      nomeAutore: String;
      ambitoStorico: String;
      dataDadataA: String;
      nomeMateriale: String;
      descrizioneMateriale: String;
      nomeTecnica: String;
      descrizioneTecnica: String;
      ubicazione: String;
      descrizioneUbicazione: String;
      nomeInventario: String;
      nomeProvenienza: String;
      descrizioneProvenienza: String;
      curatore: String;
      titoloMostra: String;
      dataInizioMostradataFineMostra: String;
      luogoMostra: String;
      descrizioneMostra: String;
      riferimentoBibliografico: String;
      altroRiferimentoBibliografico: String;
      documentazioniFotografiche: String;
    } = {
      titoloOpera: req.query.titoloOpera as String,
      corpoScheda: req.query.corpoScheda as String,
      iscrizioni: req.query.iscrizioni as String,
      descrizioneSintetica: req.query.descrizioneSintetica as String,
      storiaEspositiva: req.query.storiaEspositiva as String,
      classificazione: req.query.classificazione as String,
      formulaPrecedente: req.query.formulaPrecedente as String,
      formulaSuccessiva: req.query.formulaSuccessiva as String,
      categoria: req.query.categoria as String,
      nomeAutore: req.query.nomeAutore as String,
      ambitoStorico: req.query.ambitoStorico as String,
      dataDadataA: req.query.dataDadataA as String,
      nomeMateriale: req.query.nomeMateriale as String,
      descrizioneMateriale: req.query.descrizioneMateriale as String,
      nomeTecnica: req.query.nomeTecnica as String,
      descrizioneTecnica: req.query.descrizioneTecnica as String,
      ubicazione: req.query.ubicazione as String,
      descrizioneUbicazione: req.query.descrizioneUbicazione as String,
      nomeInventario: req.query.nomeInventario as String,
      nomeProvenienza: req.query.nomeProvenienza as String,
      descrizioneProvenienza: req.query.descrizioneProvenienza as String,
      curatore: req.query.curatore as String,
      titoloMostra: req.query.titoloMostra as String,
      dataInizioMostradataFineMostra: req.query.dataInizioMostradataFineMostra as String,
      luogoMostra: req.query.luogoMostra as String,
      descrizioneMostra: req.query.descrizioneMostra as String,
      riferimentoBibliografico: req.query.riferimentoBibliografico as String,
      altroRiferimentoBibliografico: req.query.altroRiferimentoBibliografico as String,
      documentazioniFotografiche: req.query.documentazioniFotografiche as String,
    };

    let responses: any[] = [];
    
    for (const key in searchCriteria) {
      if (searchCriteria.hasOwnProperty(key)) {
        const value = searchCriteria[key as keyof typeof searchCriteria];
        if (value !== undefined && value !== '' && value !== ' ') {
          const dynamicQuery = buildDynamicQuery(key, String(value));
          if (dynamicQuery === undefined) {
            continue
          }
          const pool = await connection();
          const result: ResultSet = await pool.query(dynamicQuery);
          responses.push(result[0]);
          pool.end();
        } 
        }
      }
  
      return res.status(Code.OK)
    
      .send(new HttpResponse(Code.OK, Status.OK, 'Schede retrieved', responses));
    }
    
    catch (error: unknown) {
      console.error(error);
      return res.status(Code.INTERNAL_SERVER_ERROR)
        .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
    }
};