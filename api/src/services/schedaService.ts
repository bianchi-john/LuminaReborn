// schedaService.ts
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { Scheda } from '../interface/scheda';
import { QUERY } from '../query/scheda.query';
import { connection } from '../config/mysql.config';

type ResultSet = [RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]];

// schedaService.ts

export async function insertScheda(scheda: Scheda): Promise<number> {
  try {
    const pool = await connection();

    // Inserisci la scheda
    const resultScheda: ResultSet = await pool.query(QUERY.INSERT_SCHEDA, [
      scheda.titolo_opera,
      scheda.corpo_scheda || '',
      scheda.iscrizioni || '',
      scheda.descrizione_sintetica || '',
      scheda.storia_espositiva || '',
      scheda.classificazione || '',
    ]);

    return (resultScheda[0] as ResultSetHeader).insertId;
  } catch (error) {
    console.error('Errore durante l\'inserimento della scheda:', error);
    throw new Error('Errore durante l\'inserimento della scheda');
  }
}

export async function insertAutori(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (
        scheda[`NomeAutore${i}`] ||
        scheda[`Formula_precedente${i}`] ||
        scheda[`Formula_successiva${i}`] ||
        scheda[`Categoria${i}`] ||
        scheda[`NomeAutore${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_AUTORE, [
          scheda[`Formula_precedente${i}`] || '',
          scheda[`Formula_successiva${i}`] || '',
          scheda[`Categoria${i}`] || '',
          scheda[`NomeAutore${i}`] || '',
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        // Collega l'autore alla scheda nella tabella tds_schede_autori
        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_AUTORI, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento degli autori:', error);
    throw new Error('Errore durante l\'inserimento degli autori');
  }
}

// Cronologie
export async function insertCronologie(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];

    if (
      scheda.ambito_storico ||
      scheda.etichetta_data ||
      scheda.anno_data_a ||
      scheda.anno_data_da ||
      scheda.giorno_data_a ||
      scheda.giorno_data_da ||
      scheda.mese_data_a ||
      scheda.mese_data_da
    ) {
      const result: ResultSet = await pool.query(QUERY.INSERT_CONOLOGIA, [
        scheda.ambito_storico || '',
        scheda.etichetta_data || '',
        scheda.giorno_data_da || '',
        scheda.mese_data_da || '',
        scheda.anno_data_da || '',
        scheda.giorno_data_a || '',
        scheda.mese_data_a || '',
        scheda.anno_data_a || ''
      ]);

      const thisId = (result[0] as ResultSetHeader).insertId;

      // Collega l'autore alla scheda nella tabella tds_schede_autori
      promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_CONOLOGIA, [schedaId, thisId]));
    }


    await Promise.all(promises);
  } catch (error) {
    console.error('Errore durante l\'inserimento delle cronologie:', error);
    throw new Error('Errore durante l\'inserimento degli cronologie');
  }


}

// Ubicazioni
export async function insertUbicazioni(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];

    if (
      scheda.ubicazione ||
      scheda.descrizione
    ) {
      const result: ResultSet = await pool.query(QUERY.INSERT_UBICAZIONE, [
        scheda.ubicazione || '',
        scheda.descrizione || ''
      ]);

      const thisId = (result[0] as ResultSetHeader).insertId;

      // Collega l'autore alla scheda nella tabella tds_schede_autori
      promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_UBICAZIONE, [schedaId, thisId]));
    }


    await Promise.all(promises);
  } catch (error) {
    console.error('Errore durante l\'inserimento di ubicazioni:', error);
    throw new Error('Errore durante l\'inserimento di ubicazioni');
  }


}


