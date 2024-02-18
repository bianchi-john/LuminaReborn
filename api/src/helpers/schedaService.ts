// schedaService.ts
import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { Scheda } from '../interface/scheda';
import { UserData } from '../interface/user';
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

        // Collega  la scheda con la funzione tds
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

      // Collega  la scheda con la funzione tds
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

      // Collega  la scheda con la funzione tds
      promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_UBICAZIONE, [schedaId, thisId]));
    }


    await Promise.all(promises);
  } catch (error) {
    console.error('Errore durante l\'inserimento di ubicazioni:', error);
    throw new Error('Errore durante l\'inserimento di ubicazioni');
  }

}

// Inventario
export async function insertInventario(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];

    if (
      scheda.inventario ||
      scheda.giuridica
    ) {
      const result: ResultSet = await pool.query(QUERY.INSERT_INVENTARIO, [
        scheda.inventario || '',
        scheda.giuridica || ''
      ]);

      const thisId = (result[0] as ResultSetHeader).insertId;

      // Collega  la scheda con la funzione tds
      promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_INVENTARIO, [schedaId, thisId]));
    }


    await Promise.all(promises);
  } catch (error) {
    console.error('Errore durante l\'inserimento di Inventario:', error);
    throw new Error('Errore durante l\'inserimento di Inventario');
  }

}


// Materiali
export async function insertMateriali(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (
        scheda[`Materiale${i}`] ||
        scheda[`MaterialePreesistente${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_MATERIALE, [
          scheda[`Materiale${i}`] || ''
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_MATERIALE, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento Materiali:', error);
    throw new Error('Errore durante l\'inserimento Materiali');
  }
}


// Tecniche
export async function insertTecniche(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (
        scheda[`Tecnica${i}`] ||
        scheda[`TencicaPreesistente${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_TECNICA, [
          scheda[`Tecnica${i}`] || ''
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_TECNICA, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento di tecniche:', error);
    throw new Error('Errore durante l\'inserimento di tecniche');
  }
}


// Provenienze
export async function insertProvenienze(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (
        scheda[`Provenienza${i}`] ||
        scheda[`DescrizioneProvenienza${i}`] ||
        scheda[`NoteProvenienza${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_PROVENIENZA, [
          scheda[`Provenienza${i}`] || '',
          scheda[`DescrizioneProvenienza${i}`] || '',
          scheda[`NoteProvenienza${i}`] || ''
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_PROVENIENZA, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento di Provenienze:', error);
    throw new Error('Errore durante l\'inserimento di Provenienze');
  }
}


// Mostre
export async function insertMostre(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (

        scheda[`Curatore${i}`] ||
        scheda[`TitoloMostra${i}`] ||
        scheda[`GiornoInizioMostra${i}`] ||
        scheda[`MeseInizioMostra${i}`] ||
        scheda[`AnnoInizioMostra${i}`] ||
        scheda[`GiornoFineMostra${i}`] ||
        scheda[`MeseFineMostra${i}`] ||
        scheda[`AnnoFineMostra${i}`] ||
        scheda[`LuogoMostra${i}`] ||
        scheda[`DescrizioneMostra${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_PROVENIENZA, [
          scheda[`Curatore${i}`] || '',
          scheda[`TitoloMostra${i}`] || '',
          scheda[`GiornoInizioMostra${i}`] || '',
          scheda[`MeseInizioMostra${i}`] || '',
          scheda[`AnnoInizioMostra${i}`] || '',
          scheda[`GiornoFineMostra${i}`] || '',
          scheda[`MeseFineMostra${i}`] || '',
          scheda[`AnnoFineMostra${i}`] || '',
          scheda[`LuogoMostra${i}`] || '',
          scheda[`DescrizioneMostra${i}`] || ''
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_PROVENIENZA, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento di Mostre:', error);
    throw new Error('Errore durante l\'inserimento di Mostre');
  }
}



// Bibliografia
export async function insertBibliografia(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (

        scheda[`riferimento_bibliografico${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_BIBILIOGRAFIA, [
          scheda[`riferimento_bibliografico${i}`] || ''
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_BIBILIOGRAFIA, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento di Bibliografia:', error);
    throw new Error('Errore durante l\'inserimento di Bibliografia');
  }
}


// AltraBibliografia
export async function insertAltraBibliografia(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (

        scheda[`riferimento_bibliografico${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_ALTRABIBILIOGRAFIA, [
          scheda[`riferimento_bibliografico${i}`] || ''
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_ALTRABIBILIOGRAFIA, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento di AltraBibliografia:', error);
    throw new Error('Errore durante l\'inserimento di AltraBibliografia');
  }
}



// DocFotografica
export async function insertDocFotografica(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (

        scheda[`documentazioneFotograficaInput${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_FOTOGRAFICA, [
          scheda[`documentazioneFotograficaInput${i}`] || ''
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_FOTOGRAFICA, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento di DocFotografica:', error);
    throw new Error('Errore durante l\'inserimento di DocFotografica');
  }
}


export async function insertMisure(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  const gruppiMisurePromises = [];

  for (let i = 1; ; i++) {
    const titoloMisureKey = `TitoloMisure${i}`;
    const interoParzialeKey = `InteroParziale${i}`;

    if (scheda[titoloMisureKey] || scheda[interoParzialeKey]) {
      const resultGruppoMisure: ResultSet = await pool.query(QUERY.INSERT_GRUPPO_MISURE, [
        scheda[interoParzialeKey] || '',
        scheda[titoloMisureKey] || '',
      ]);

      const gruppoMisureId = (resultGruppoMisure[0] as ResultSetHeader).insertId;

      // Collega il gruppo di misure alla scheda nella tabella tds_schede_misure
      gruppiMisurePromises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_MISURE, [schedaId, gruppoMisureId]));

      for (let j = 1; ; j++) {
        const direzioneKey = `Direzione${i}${j}`;
        const tipoKey = `Tipo${i}${j}`;
        const valoreKey = `Valore${i}${j}`;
        const unitaKey = `Unita${i}${j}`;

        if (scheda[direzioneKey] || scheda[tipoKey] || scheda[valoreKey] || scheda[unitaKey]) {
          const resultMisure: ResultSet = await pool.query(QUERY.INSERT_MISURE, [
            scheda[direzioneKey] || '',
            scheda[tipoKey] || '',
            scheda[valoreKey] || '',
            scheda[unitaKey] || '',
            gruppoMisureId,
          ]);
        } else {
          // Se nessuna delle chiavi è presente, esce dal ciclo interno
          break;
        }
      }
    } else {
      // Se nessuna delle chiavi è presente, esce dal ciclo esterno
      break;
    }
  }
}




export async function insertUser(pool: any, schedaId: number, scheda: Scheda, userData: UserData): Promise<void> {
  try {
    const promises = [];

    // Verifica se lo user esiste già
    const userExistsQuery = `SELECT username FROM users WHERE username = ?;`;
    const [userExistsResult] = await pool.query(userExistsQuery, [userData.username]);

    let userId;

    if (userExistsResult.length > 0) {
      // Lo user esiste già, prendi l'id
      const userExistsQuery = `SELECT id FROM users WHERE username = ?;`;
      const [userExistsResult] = await pool.query(userExistsQuery, [userData.username]);
  
      userId = userExistsResult[0].id;
      console.log(`Lo user l'id ${userData.username} esiste già. ID: ${userExistsResult[0].id}`);
    } else {
      const firstResult: ResultSet = await pool.query(QUERY.INSERT_USER, [userData.isAdmin, userData.username, userData.display_name]);
      userId = (firstResult[0] as ResultSetHeader).insertId;
    }

    const secondResult: ResultSet = await pool.query(QUERY.INSERT_STATOSCHEDA, [0, scheda.commento || '']);
    const statoSchedaID = (secondResult[0] as ResultSetHeader).insertId;

    // Collega la scheda con la funzione tds
    promises.push(pool.query(QUERY.INSERT_TDS_SCHEDE_STATOSCHEDA, [schedaId, statoSchedaID]));
    promises.push(pool.query(QUERY.INSERT_TDS_STATO_SCHEDAUSER, [statoSchedaID, userId]));
    promises.push(pool.query(QUERY.INSERT_TDS_USER_SCHEDA, [userId, schedaId, new Date()]));

    await Promise.all(promises);
  } catch (error) {
    console.error('Errore durante l\'inserimento di user:', error);
    throw new Error('Errore durante l\'inserimento di user');
  }
}



// Immagini
export async function insertImaagini(pool: any, schedaId: number, scheda: Scheda): Promise<void> {
  try {
    const promises = [];
    let atLeastOneKeyPresent = false;

    for (let i = 1; ; i++) {
      if (
        scheda[`immagine${i}`] ||
        scheda[`didascalia_immagine${i}`]
      ) {
        atLeastOneKeyPresent = true; // almeno una chiave è presente

        const result: ResultSet = await pool.query(QUERY.INSERT_IMMAGINI, [
          scheda[`immagine${i}`] || '', scheda[`didascalia_immagine`] || '',
        ]);

        const thisId = (result[0] as ResultSetHeader).insertId;

        promises.push(pool.query(QUERY.INSERT_TDS_SCHEDA_IMMAGINI, [schedaId, thisId]));
      } else {
        // Se nessuna delle chiavi è presente, esce dal ciclo
        break;
      }
    }

    if (atLeastOneKeyPresent) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento immagini:', error);
    throw new Error('Errore durante l\'inserimento immagini');
  }
}