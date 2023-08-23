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
      queryGenerica: req.query.queryGenerica ? validator.escape(req.query.queryGenerica) : '',
      titoloOpera: req.query.titoloOpera ? validator.escape(req.query.titoloOpera) : '',
      corpoScheda: req.query.corpoScheda ? validator.escape(req.query.corpoScheda) : '',
      iscrizioni: req.query.iscrizioni ? validator.escape(req.query.iscrizioni) : '',
      descrizioneSintetica: req.query.descrizioneSintetica ? validator.escape(req.query.descrizioneSintetica) : '',
      storiaEspositiva: req.query.storiaEspositiva ? validator.escape(req.query.storiaEspositiva) : '',
      classificazione: req.query.classificazione ?  validator.escape(req.query.classificazione) : '',
      formulaPrecedente: req.query.formulaPrecedente ? validator.escape(req.query.formulaPrecedente) : '',
      formulaSuccessiva: req.query.formulaSuccessiva ? validator.escape(req.query.formulaSuccessiva) : '',
      categoria: req.query.categoria ? validator.escape(req.query.categoria) : '',
      nomeAutore: req.query.nomeAutore ? validator.escape(req.query.nomeAutore) : '',
      ambitoStorico: req.query.ambitoStorico ? validator.escape(req.query.ambitoStorico) : '',
      dataDadataA: req.query.dataDadataA ? validator.escape(req.query.dataDadataA) : '',
      nomeMateriale: req.query.nomeMateriale ? validator.escape(req.query.nomeMateriale) : '',
      descrizioneMateriale: req.query.descrizioneMateriale ? validator.escape(req.query.descrizioneMateriale) : '',
      nomeTecnica: req.query.nomeTecnica ? validator.escape(req.query.nomeTecnica) : '',
      descrizioneTecnica: req.query.descrizioneTecnica ? validator.escape(req.query.descrizioneTecnica) : '',
      ubicazione: req.query.ubicazione? validator.escape(req.query.ubicazione) : '',
      descrizioneUbicazione: req.query.descrizioneUbicazione ? validator.escape(req.query.descrizioneUbicazione) : '',
      nomeInventario: req.query.nomeInventario?  validator.escape(req.query.nomeInventario) : '',
      nomeProvenienza: req.query.nomeProvenienza ? validator.escape(req.query.nomeProvenienza) : '',
      descrizioneProvenienza: req.query.descrizioneProvenienza ? validator.escape(req.query.descrizioneProvenienza) : '',
      curatore: req.query.curatore ? validator.escape(req.query.curatore) : '',
      titoloMostra: req.query.titoloMostra ? validator.escape(req.query.titoloMostra) : '',
      dataInizioMostradataFineMostra: req.query.dataInizioMostradataFineMostra ?  validator.escape(req.query.dataInizioMostradataFineMostra) : '',
      luogoMostra: req.query.luogoMostra ?  validator.escape(req.query.luogoMostra) : '',
      descrizioneMostra: req.query.descrizioneMostra ?  validator.escape(req.query.descrizioneMostra) : '',
      riferimentoBibliografico: req.query.riferimentoBibliografico ? validator.escape(req.query.riferimentoBibliografico) : '',
      altroRiferimentoBibliografico: req.query.altroRiferimentoBibliografico ? validator.escape(req.query.altroRiferimentoBibliografico) : '',
      documentazioniFotografiche: req.query.documentazioniFotografiche ? validator.escape(req.query.documentazioniFotografiche) : '',
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