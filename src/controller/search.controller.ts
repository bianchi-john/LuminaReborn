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
    await pool.end();
  return result;
}

async function buildAndExecuteQuery(key: string, value: string): Promise<ResultSet | undefined> {
  const dynamicQuery = buildDynamicQuery(key, value);
  if (dynamicQuery === undefined || dynamicQuery === '') {
    return undefined;
  }
  return await executeQuery(dynamicQuery);
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

    const uniqueIds = [...new Set(filteredResponses.map((item: { id: number }) => Number(item.id)))];
    const uniqueResponsesWithInformation: RowDataPacket[] = [];
    const pool = await connection();

    const resultQuery = `
      SELECT
        s.*,
        (SELECT a.nome
          FROM autori a
          JOIN tds_schede_autori tsa ON tsa.id_autore = a.id
          WHERE tsa.id_scheda = s.id
          ORDER BY a.id LIMIT 1) AS nome,
        (SELECT a.categoria
          FROM autori a
          JOIN tds_schede_autori tsa ON tsa.id_autore = a.id
          WHERE tsa.id_scheda = s.id
          ORDER BY a.id LIMIT 1) AS categoria,
        (SELECT c.ambito_storico
          FROM cronologie c
          JOIN tds_schede_cronologie tsc ON tsc.id_cronologia = c.id
          WHERE tsc.id_scheda = s.id
          ORDER BY c.id LIMIT 1) AS ambito_storico,
        (SELECT t.nome_tecnica
          FROM tecniche t
          JOIN tds_schede_tecniche tst ON tst.id_tecnica = t.id
          WHERE tst.id_scheda = s.id
          ORDER BY t.id LIMIT 1) AS nome_tecnica,
        (SELECT m.nome_materiale
          FROM materiali m
          JOIN tds_schede_materiali tsm ON tsm.id_materiale = m.id
          WHERE tsm.id_scheda = s.id
          ORDER BY m.id LIMIT 1) AS nome_materiale,
        (SELECT u.ubicazione
          FROM ubicazioni u
          JOIN tds_schede_ubicazioni tsu ON tsu.id_ubicazione = u.id
          WHERE tsu.id_scheda = s.id
          ORDER BY u.id LIMIT 1) AS ubicazione,
        (SELECT i.nome_inventario
          FROM inventari i
          JOIN tds_schede_inventari tsi ON tsi.id_inventario = i.id
          WHERE tsi.id_scheda = s.id
          ORDER BY i.id LIMIT 1) AS nome_inventario,
        (SELECT i.numero_inventario
          FROM inventari i
          JOIN tds_schede_inventari tsi ON tsi.id_inventario = i.id
          WHERE tsi.id_scheda = s.id
          ORDER BY i.id LIMIT 1) AS numero_inventario,
        (SELECT imm.data
          FROM immagini imm
          JOIN tds_schede_immagini tsim ON tsim.id_immagine = imm.id
          WHERE tsim.id_scheda = s.id
            AND imm.data LIKE 'data:image/%'
          ORDER BY imm.id LIMIT 1) AS data
      FROM schede s
      JOIN tds_schede_statoScheda tss ON tss.id_scheda = s.id
      JOIN statoScheda ss ON ss.id = tss.id_stato
      WHERE s.id = ? AND ss.stato = 2
      LIMIT 1;
    `;

    try {
      for (const id of uniqueIds) {
        const [rows] = await pool.query<RowDataPacket[]>(resultQuery, [id]);
        if (rows.length > 0) {
          uniqueResponsesWithInformation.push(rows[0]);
        }
      }
    } finally {
      pool.end();
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
