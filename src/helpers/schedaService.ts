// schedaService.ts
//
// Salvataggio di una scheda e dei suoi collegamenti (tabelle TDS).
//
// Autori, materiali, tecniche, ubicazioni, provenienze, mostre e bibliografie
// sono voci condivise: se ne esiste già una identica la si collega invece di
// crearne una copia, così la stessa voce raccoglie tutte le opere collegate.
// Tutte le funzioni ricevono la stessa connessione, così il salvataggio
// avviene in un'unica transazione (vedi createScheda nel controller).
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Scheda } from '../interface/scheda';
import { UserData } from '../interface/user';
import { QUERY } from '../query/scheda.query';

/** Connessione o pool: basta che sappia eseguire query. */
type Db = { query: (sql: string, values?: unknown[]) => Promise<any> };

/** Numero massimo di gruppi ripetuti letti dal modulo (autori, materiali...). */
const MAX_GRUPPI = 50;

/** Testo pulito; i valori scelti da un elenco possono arrivare come JSON della riga. */
function testo(valore: unknown, campoJson?: string): string {
  if (valore === undefined || valore === null) return '';
  let s = String(valore).trim();
  if (campoJson && s.startsWith('{')) {
    try {
      const obj = JSON.parse(s);
      s = String(obj?.[campoJson] ?? '').trim();
    } catch {
      // non è JSON: si usa il testo così com'è
    }
  }
  return s;
}

/** Numero con la virgola o con il punto (es. "100,5"); vuoto se non è un numero. */
export function numero(valore: unknown): string {
  const s = testo(valore).replace(',', '.');
  return s !== '' && !isNaN(Number(s)) ? s : '';
}

/**
 * Cerca una voce con gli stessi valori (il confronto di MySQL ignora maiuscole
 * e accenti) e ne restituisce l'id; se non c'è, la crea.
 */
async function trovaOCrea(db: Db, tabella: string, valori: Record<string, string>): Promise<number> {
  const colonne = Object.keys(valori);
  const [righe] = await db.query(
    `SELECT id FROM \`${tabella}\` WHERE ${colonne.map((c) => `\`${c}\` = ?`).join(' AND ')} ORDER BY id LIMIT 1`,
    colonne.map((c) => valori[c]),
  );
  if ((righe as RowDataPacket[]).length) return (righe as RowDataPacket[])[0].id;
  const [res] = await db.query(
    `INSERT INTO \`${tabella}\` (${colonne.map((c) => `\`${c}\``).join(', ')}) VALUES (${colonne.map(() => '?').join(', ')})`,
    colonne.map((c) => valori[c]),
  );
  return (res as ResultSetHeader).insertId;
}

/** Collega una voce alla scheda una sola volta, anche se compare due volte nel modulo. */
async function collega(db: Db, sql: string, schedaId: number, idVoce: number, giaCollegati: Set<number>): Promise<void> {
  if (giaCollegati.has(idVoce)) return;
  giaCollegati.add(idVoce);
  await db.query(sql, [schedaId, idVoce]);
}

/** Per ogni gruppo numerato 1..N del modulo chiama `fn`; i gruppi vuoti vengono saltati. */
async function perGruppo(fn: (i: number) => Promise<void>): Promise<void> {
  for (let i = 1; i <= MAX_GRUPPI; i++) await fn(i);
}

export async function insertScheda(db: Db, scheda: Scheda): Promise<number> {
  const [res] = await db.query(QUERY.INSERT_SCHEDA, [
    testo(scheda.titolo_opera),
    scheda.corpo_scheda || '',
    scheda.iscrizioni || '',
    scheda.descrizione_sintetica || '',
    scheda.storia_espositiva || '',
    testo(scheda.classificazione),
  ]);
  return (res as ResultSetHeader).insertId;
}

export async function insertAutori(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const collegati = new Set<number>();
  await perGruppo(async (i) => {
    const voce = {
      nome: testo(scheda[`NomeAutore${i}`]),
      formula_precedente: testo(scheda[`Formula_precedente${i}`]),
      formula_successiva: testo(scheda[`Formula_successiva${i}`]),
      categoria: testo(scheda[`Categoria${i}`]),
    };
    if (!voce.nome) return;
    await collega(db, QUERY.INSERT_TDS_SCHEDA_AUTORI, schedaId, await trovaOCrea(db, 'autori', voce), collegati);
  });
}

export async function insertCronologie(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const valori = [
    testo(scheda.ambito_storico),
    testo(scheda.etichetta_data),
    testo(scheda.giorno_data_da),
    testo(scheda.mese_data_da),
    testo(scheda.anno_data_da),
    testo(scheda.giorno_data_a),
    testo(scheda.mese_data_a),
    testo(scheda.anno_data_a),
  ];
  if (!valori.some(Boolean)) return;
  const [res] = await db.query(QUERY.INSERT_CONOLOGIA, valori);
  await db.query(QUERY.INSERT_TDS_SCHEDA_CONOLOGIA, [schedaId, (res as ResultSetHeader).insertId]);
}

export async function insertUbicazioni(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const voce = { ubicazione: testo(scheda.ubicazione), descrizione: testo(scheda.descrizione) };
  if (!voce.ubicazione && !voce.descrizione) return;
  await db.query(QUERY.INSERT_TDS_SCHEDA_UBICAZIONE, [schedaId, await trovaOCrea(db, 'ubicazioni', voce)]);
}

// L'inventario è proprio di ogni opera: non si condivide
export async function insertInventario(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const valori = [testo(scheda.inventario), testo(scheda.giuridica)];
  if (!valori.some(Boolean)) return;
  const [res] = await db.query(QUERY.INSERT_INVENTARIO, valori);
  await db.query(QUERY.INSERT_TDS_SCHEDA_INVENTARIO, [schedaId, (res as ResultSetHeader).insertId]);
}

export async function insertMateriali(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const collegati = new Set<number>();
  await perGruppo(async (i) => {
    const nome = testo(scheda[`Materiale${i}`], 'nome_materiale') || testo(scheda[`MaterialePreesistente${i}`], 'nome_materiale');
    if (!nome) return;
    await collega(db, QUERY.INSERT_TDS_SCHEDA_MATERIALE, schedaId, await trovaOCrea(db, 'materiali', { nome_materiale: nome }), collegati);
  });
}

export async function insertTecniche(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const collegati = new Set<number>();
  await perGruppo(async (i) => {
    const nome = testo(scheda[`Tecnica${i}`], 'nome_tecnica') || testo(scheda[`TencicaPreesistente${i}`], 'nome_tecnica');
    if (!nome) return;
    await collega(db, QUERY.INSERT_TDS_SCHEDA_TECNICA, schedaId, await trovaOCrea(db, 'tecniche', { nome_tecnica: nome }), collegati);
  });
}

export async function insertProvenienze(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const collegati = new Set<number>();
  await perGruppo(async (i) => {
    const voce = {
      provenienza: testo(scheda[`Provenienza${i}`]),
      descrizione: testo(scheda[`DescrizioneProvenienza${i}`]),
      note: testo(scheda[`NoteProvenienza${i}`]),
    };
    if (!voce.provenienza && !voce.descrizione && !voce.note) return;
    await collega(db, QUERY.INSERT_TDS_SCHEDA_PROVENIENZA, schedaId, await trovaOCrea(db, 'provenienze', voce), collegati);
  });
}

export async function insertMostre(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const collegati = new Set<number>();
  await perGruppo(async (i) => {
    const voce = {
      curatore: testo(scheda[`Curatore${i}`]),
      titolo_mostra: testo(scheda[`TitoloMostra${i}`]),
      giorno_data_da: testo(scheda[`GiornoInizioMostra${i}`]),
      mese_data_da: testo(scheda[`MeseInizioMostra${i}`]),
      anno_data_da: testo(scheda[`AnnoInizioMostra${i}`]),
      giorno_data_a: testo(scheda[`GiornoFineMostra${i}`]),
      mese_data_a: testo(scheda[`MeseFineMostra${i}`]),
      anno_data_a: testo(scheda[`AnnoFineMostra${i}`]),
      luogo_mostra: testo(scheda[`LuogoMostra${i}`]),
      descrizione: testo(scheda[`DescrizioneMostra${i}`]),
    };
    if (!Object.values(voce).some(Boolean)) return;
    await collega(db, QUERY.INSERT_TDS_SCHEDA_MOSTRA, schedaId, await trovaOCrea(db, 'mostre', voce), collegati);
  });
}

export async function insertBibliografia(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const riferimento = testo(scheda.bibliografia);
  if (!riferimento) return;
  const id = await trovaOCrea(db, 'bibliografie', { riferimento_bibliografico: riferimento });
  await db.query(QUERY.INSERT_TDS_SCHEDA_BIBILIOGRAFIA, [schedaId, id]);
}

export async function insertAltraBibliografia(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const riferimento = testo(scheda.altraBibliografia);
  if (!riferimento) return;
  const id = await trovaOCrea(db, 'altreBibliografie', { riferimento_bibliografico: riferimento });
  await db.query(QUERY.INSERT_TDS_SCHEDA_ALTRABIBILIOGRAFIA, [schedaId, id]);
}

// La documentazione fotografica è propria di ogni opera: non si condivide
export async function insertDocFotografica(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  const riferimento = testo(scheda.documentazioneFotografica);
  if (!riferimento) return;
  const [res] = await db.query(QUERY.INSERT_FOTOGRAFICA, [riferimento]);
  await db.query(QUERY.INSERT_TDS_SCHEDA_FOTOGRAFICA, [schedaId, (res as ResultSetHeader).insertId]);
}

export async function insertMisure(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  for (let i = 1; i <= MAX_GRUPPI; i++) {
    const titolo = testo(scheda[`TitoloMisure${i}`]);
    const interoParziale = testo(scheda[`InteroParziale${i}`]);
    const misure: string[][] = [];
    for (let j = 1; j <= MAX_GRUPPI; j++) {
      const m = [testo(scheda[`Direzione${i}${j}`]), testo(scheda[`Tipo${i}${j}`]), numero(scheda[`Valore${i}${j}`]), testo(scheda[`Unita${i}${j}`])];
      // Una misura senza valore non dice nulla: si salta (l'unità di misura ha sempre un valore predefinito)
      if (m[2] !== '') misure.push(m);
    }
    if (!titolo && !interoParziale && !misure.length) continue;
    const [res] = await db.query(QUERY.INSERT_GRUPPO_MISURE, [interoParziale, titolo]);
    const gruppoId = (res as ResultSetHeader).insertId;
    await db.query(QUERY.INSERT_TDS_SCHEDA_MISURE, [schedaId, gruppoId]);
    for (const m of misure) await db.query(QUERY.INSERT_MISURE, [...m, gruppoId]);
  }
}

export async function insertUser(db: Db, schedaId: number, scheda: Scheda, userData: UserData): Promise<void> {
  const [esistenti] = await db.query('SELECT id FROM users WHERE username = ?', [userData.username]);
  let userId: number;
  if ((esistenti as RowDataPacket[]).length) {
    userId = (esistenti as RowDataPacket[])[0].id;
  } else {
    const [res] = await db.query(QUERY.INSERT_USER, [userData.isAdmin, userData.username, userData.display_name]);
    userId = (res as ResultSetHeader).insertId;
  }
  const [stato] = await db.query(QUERY.INSERT_STATOSCHEDA, [0, scheda.commento || '']);
  const statoId = (stato as ResultSetHeader).insertId;
  await db.query(QUERY.INSERT_TDS_SCHEDE_STATOSCHEDA, [schedaId, statoId]);
  await db.query(QUERY.INSERT_TDS_STATO_SCHEDAUSER, [statoId, userId]);
  await db.query(QUERY.INSERT_TDS_USER_SCHEDA, [userId, schedaId, new Date()]);
}

// Le immagini partono da 0 nel modulo
export async function insertImmagini(db: Db, schedaId: number, scheda: Scheda): Promise<void> {
  for (let i = 0; i <= MAX_GRUPPI; i++) {
    const immagine = scheda[`immagine${i}`];
    const didascalia = testo(scheda[`didascalia_immagine${i}`]);
    if (!immagine && !didascalia) continue;
    const [res] = await db.query(QUERY.INSERT_IMMAGINI, [immagine || '', didascalia]);
    await db.query(QUERY.INSERT_TDS_SCHEDA_IMMAGINI, [schedaId, (res as ResultSetHeader).insertId]);
  }
}
