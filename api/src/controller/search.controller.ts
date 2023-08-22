import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Scheda } from '../interface/scheda';
import { buildDynamicQuery } from '../query/search.query';
const validator = require('validator');
const sqlstring = require('sqlstring');

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];


export const advancedSearch = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
  console.info(`[${new Date().toLocaleString()}] Incoming ${req.method}${req.originalUrl} Request from ${req.rawHeaders[0]} ${req.rawHeaders[1]}`);
  try {
    const searchCriteria: {
      queryGenerica: String;
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
      queryGenerica: validator.escape(req.query.queryGenerica) as String,
      titoloOpera: validator.escape(req.query.titoloOpera) as String,
      corpoScheda: validator.escape(req.query.corpoScheda) as String,
      iscrizioni: validator.escape(req.query.iscrizioni) as String,
      descrizioneSintetica: validator.escape(req.query.descrizioneSintetica) as String,
      storiaEspositiva: validator.escape(req.query.storiaEspositiva) as String,
      classificazione: validator.escape(req.query.classificazione) as String,
      formulaPrecedente: validator.escape(req.query.formulaPrecedente) as String,
      formulaSuccessiva: validator.escape(req.query.formulaSuccessiva) as String,
      categoria: validator.escape(req.query.categoria) as String,
      nomeAutore: validator.escape(req.query.nomeAutore) as String,
      ambitoStorico: validator.escape(req.query.ambitoStorico) as String,
      dataDadataA: validator.escape(req.query.dataDadataA) as String,
      nomeMateriale: validator.escape(req.query.nomeMateriale) as String,
      descrizioneMateriale: validator.escape(req.query.descrizioneMateriale) as String,
      nomeTecnica: validator.escape(req.query.nomeTecnica) as String,
      descrizioneTecnica: validator.escape(req.query.descrizioneTecnica) as String,
      ubicazione: validator.escape(req.query.ubicazione) as String,
      descrizioneUbicazione: validator.escape(req.query.descrizioneUbicazione) as String,
      nomeInventario: validator.escape(req.query.nomeInventario) as String,
      nomeProvenienza: validator.escape(req.query.nomeProvenienza) as String,
      descrizioneProvenienza: validator.escape(req.query.descrizioneProvenienza) as String,
      curatore: validator.escape(req.query.curatore) as String,
      titoloMostra: validator.escape(req.query.titoloMostra) as String,
      dataInizioMostradataFineMostra: validator.escape(req.query.dataInizioMostradataFineMostra) as String,
      luogoMostra: validator.escape(req.query.luogoMostra) as String,
      descrizioneMostra: validator.escape(req.query.descrizioneMostra) as String,
      riferimentoBibliografico: validator.escape(req.query.riferimentoBibliografico) as String,
      altroRiferimentoBibliografico: validator.escape(req.query.altroRiferimentoBibliografico) as String,
      documentazioniFotografiche: validator.escape(req.query.documentazioniFotografiche) as String,
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