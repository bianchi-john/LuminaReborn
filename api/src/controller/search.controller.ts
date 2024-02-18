import { Request, Response } from 'express';
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';
import { HttpResponse } from '../domain/response';
import { Code } from '../enum/code.enum';
import { Status } from '../enum/status.enum';
import { Scheda } from '../interface/scheda';
import { buildDynamicQuery } from '../query/search.query';
const validator = require('validator');

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];


async function executeQuery(query: string): Promise<ResultSet> {
  const pool = await connection();
  const result: ResultSet = await pool.query(query);
  pool.end();
  return result;
}

async function buildAndExecuteQuery(key: string, value: string): Promise<ResultSet | undefined> {
  const dynamicQuery = buildDynamicQuery(key, value);
  if (dynamicQuery === undefined || dynamicQuery === '') {
    return undefined;
  }
  return await executeQuery(dynamicQuery);
}

function processUniqueResponses(uniqueResponses: any[]): any[] {
  const responseCount: { [key: string]: number } = {};
  const seenItems: { [key: string]: boolean } = {};
  const processedResponses: any[] = [];

  for (const response of uniqueResponses) {
    const responseString = JSON.stringify(response);
    if (!seenItems[responseString]) {
      if (responseCount[responseString] > 1) {
        processedResponses.unshift(response);
      } else {
        processedResponses.push(response);
      }
      seenItems[responseString] = true;
    }
  }

  return processedResponses;
}

export const search = async (req: Request, res: Response): Promise<Response<Scheda[]>> => {
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
      categoria: String;
      nomeAutore: String;
      ambitoStorico: String;
      dataDadataA: String;
      nomeMateriale: String;
      nomeTecnica: String;
      ubicazione: String;
      nomeInventario: String;
      numeroInventario: String;
      nomeProvenienza: String;
      curatore: String;
      titoloMostra: String;
      dataInizioMostradataFineMostra: String;
      luogoMostra: String;
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
      classificazione: req.query.classificazione ? validator.escape(req.query.classificazione) : '',
      categoria: req.query.categoria ? validator.escape(req.query.categoria) : '',
      nomeAutore: req.query.nomeAutore ? validator.escape(req.query.nomeAutore) : '',
      ambitoStorico: req.query.ambitoStorico ? validator.escape(req.query.ambitoStorico) : '',
      dataDadataA: req.query.dataDadataA ? validator.escape(req.query.dataDadataA) : '',
      nomeMateriale: req.query.nomeMateriale ? validator.escape(req.query.nomeMateriale) : '',
      nomeTecnica: req.query.nomeTecnica ? validator.escape(req.query.nomeTecnica) : '',
      ubicazione: req.query.ubicazione ? validator.escape(req.query.ubicazione) : '',
      nomeInventario: req.query.nomeInventario ? validator.escape(req.query.nomeInventario) : '',
      numeroInventario: req.query.numeroInventario ? validator.escape(req.query.numeroInventario) : '',
      nomeProvenienza: req.query.nomeProvenienza ? validator.escape(req.query.nomeProvenienza) : '',
      curatore: req.query.curatore ? validator.escape(req.query.curatore) : '',
      titoloMostra: req.query.titoloMostra ? validator.escape(req.query.titoloMostra) : '',
      dataInizioMostradataFineMostra: req.query.dataInizioMostradataFineMostra ? validator.escape(req.query.dataInizioMostradataFineMostra) : '',
      luogoMostra: req.query.luogoMostra ? validator.escape(req.query.luogoMostra) : '',
      riferimentoBibliografico: req.query.riferimentoBibliografico ? validator.escape(req.query.riferimentoBibliografico) : '',
      altroRiferimentoBibliografico: req.query.altroRiferimentoBibliografico ? validator.escape(req.query.altroRiferimentoBibliografico) : '',
      documentazioniFotografiche: req.query.documentazioniFotografiche ? validator.escape(req.query.documentazioniFotografiche) : '',
    };
    let ok = false
    let responses: any[] = [];
    for (const key in searchCriteria) {
      if (searchCriteria.hasOwnProperty(key)) {
        const value = searchCriteria[key as keyof typeof searchCriteria];
        if (value !== undefined && value !== '' && value !== ' ') {
          ok = true
          const result = await buildAndExecuteQuery(key, String(value));
          if (result === undefined) {
            res.status(400).send('I dati ricevuti dal client non sono in formato corretto');
          } else {
            responses.push(result[0]);
          }
        }
      }
    }
    if (!ok) {
      return res.status(Code.OK)
    }

    const filteredResponses = responses[0].filter((item: { id: number }) => {
      return responses.every((subItem: any[]) => subItem.some((subSubItem: { id: number }) => subSubItem.id === item.id));
    });

    const uniqueResponses = processUniqueResponses(filteredResponses);


    let uniqueResponsesWithInformation: any[] = [];

    for (let i = 0; i < uniqueResponses.length; i++) {
      let pool = await connection();
      let finalResult = await pool.query(`SELECT s.*, a.*, u.*, p.*, c.*, t.*, m.*, i.*, imm.*
        FROM schede s
        LEFT JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda
        LEFT JOIN autori a ON tsa.id_autore = a.id
        LEFT JOIN tds_schede_ubicazioni tsu ON s.id = tsu.id_scheda
        LEFT JOIN ubicazioni u ON tsu.id_ubicazione = u.id
        LEFT JOIN tds_schede_provenienze tsp ON s.id = tsp.id_scheda
        LEFT JOIN provenienze p ON tsp.id_provenienza = p.id
        LEFT JOIN tds_schede_cronologie tsc ON s.id = tsc.id_scheda
        LEFT JOIN cronologie c ON tsc.id_cronologia = c.id
        LEFT JOIN tds_schede_tecniche tst ON s.id = tst.id_scheda
        LEFT JOIN tecniche t ON tst.id_tecnica = t.id
        LEFT JOIN tds_schede_materiali tsn ON s.id = tsn.id_scheda
        LEFT JOIN materiali m ON tsn.id_materiale = m.id
        LEFT JOIN tds_schede_inventari tsi ON s.id = tsi.id_scheda
        LEFT JOIN inventari i ON tsi.id_inventario = i.id
        LEFT JOIN tds_schede_immagini tsim ON s.id = tsim.id_scheda
        LEFT JOIN immagini imm ON tsim.id_immagine = imm.id
        LEFT JOIN tds_schede_statoScheda tss ON s.id = tss.id_scheda
        LEFT JOIN statoScheda ss ON tss.id_stato = ss.id
        WHERE s.id = ` + uniqueResponses[i].id + ` AND ss.stato = 2;`)
      uniqueResponsesWithInformation.push(finalResult[0], uniqueResponses[i].id)
    }
    return res.status(Code.OK)
      .send(new HttpResponse(Code.OK, Status.OK, 'Schede retrieved', uniqueResponsesWithInformation));
  }

  catch (error: unknown) {
    console.error(error);
    return res.status(Code.INTERNAL_SERVER_ERROR)
      .send(new HttpResponse(Code.INTERNAL_SERVER_ERROR, Status.INTERNAL_SERVER_ERROR, 'An error occurred'));
  }
};