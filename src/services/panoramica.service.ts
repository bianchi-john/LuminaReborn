import { config } from '../config';
import { pool, select, selectOne } from '../db/pool';
import { CLASSIFICAZIONI, STATI } from '../domain/classificazioni';
import { VOCAB_KEYS, VOCABOLARI, VocabKey } from '../domain/vocabolari';

/**
 * Database overview for administrators: how every record field is filled in
 * (a records × fields map), the size of each table and how the shared
 * authority entries are used. Read-only, computed with a few grouped queries
 * (one per table, never one per record).
 */

type Misura =
  | { tipo: 'presenza'; colonna: string }
  | { tipo: 'testo'; colonna: string }
  | { tipo: 'conteggio'; tabella: string; condizione?: string; via?: 'gruppi_misure' }
  | { tipo: 'voce'; voce: VocabKey };

export interface CampoDef {
  key: string;
  etichetta: string;
  gruppo: string;
  misura: Misura;
  /** Level 1 below the first threshold, 2 below the second, 3 from the second on. */
  soglie: [number, number];
  unita: 'caratteri' | 'voci' | 'si';
}

const presenza = { soglie: [1, 1] as [number, number], unita: 'si' as const };

/** Record fields in editor order, grouped as in the editor tabs. */
export const CAMPI: CampoDef[] = [
  { key: 'titolo', etichetta: 'Titolo', gruppo: 'Opera', misura: { tipo: 'presenza', colonna: 'titolo_testo' }, ...presenza },
  { key: 'classificazione', etichetta: 'Classificazione', gruppo: 'Opera', misura: { tipo: 'presenza', colonna: 'classificazione' }, ...presenza },
  { key: 'autori', etichetta: 'Autori', gruppo: 'Autori e datazione', misura: { tipo: 'voce', voce: 'autori' }, soglie: [1, 1], unita: 'voci' },
  { key: 'datazione', etichetta: 'Datazione', gruppo: 'Autori e datazione', misura: { tipo: 'conteggio', tabella: 'cronologie' }, soglie: [1, 1], unita: 'voci' },
  {
    key: 'ambito',
    etichetta: 'Ambito storico-culturale',
    gruppo: 'Autori e datazione',
    misura: { tipo: 'conteggio', tabella: 'cronologie', condizione: "ambito_storico IS NOT NULL AND ambito_storico <> ''" },
    ...presenza,
    unita: 'voci',
  },
  { key: 'materiali', etichetta: 'Materiali', gruppo: 'Materia e misure', misura: { tipo: 'voce', voce: 'materiali' }, soglie: [1, 1], unita: 'voci' },
  { key: 'tecniche', etichetta: 'Tecniche', gruppo: 'Materia e misure', misura: { tipo: 'voce', voce: 'tecniche' }, soglie: [1, 1], unita: 'voci' },
  { key: 'misure', etichetta: 'Misure', gruppo: 'Materia e misure', misura: { tipo: 'conteggio', tabella: 'misure', via: 'gruppi_misure' }, soglie: [2, 2], unita: 'voci' },
  { key: 'ubicazioni', etichetta: 'Ubicazione', gruppo: 'Collocazione', misura: { tipo: 'voce', voce: 'ubicazioni' }, soglie: [1, 1], unita: 'voci' },
  { key: 'inventario', etichetta: 'Inventario', gruppo: 'Collocazione', misura: { tipo: 'conteggio', tabella: 'inventari' }, soglie: [1, 1], unita: 'voci' },
  {
    key: 'proprieta',
    etichetta: 'Proprietà giuridica',
    gruppo: 'Collocazione',
    misura: { tipo: 'conteggio', tabella: 'inventari', condizione: "descrizione IS NOT NULL AND descrizione <> ''" },
    ...presenza,
    unita: 'voci',
  },
  { key: 'provenienze', etichetta: 'Provenienza', gruppo: 'Collocazione', misura: { tipo: 'voce', voce: 'provenienze' }, soglie: [1, 1], unita: 'voci' },
  { key: 'descrizione', etichetta: 'Descrizione', gruppo: 'Testi', misura: { tipo: 'testo', colonna: 'descrizione_sintetica' }, soglie: [200, 800], unita: 'caratteri' },
  { key: 'commento', etichetta: 'Commento storico-critico', gruppo: 'Testi', misura: { tipo: 'testo', colonna: 'corpo_scheda' }, soglie: [1500, 6000], unita: 'caratteri' },
  { key: 'iscrizioni', etichetta: 'Iscrizioni', gruppo: 'Testi', misura: { tipo: 'testo', colonna: 'iscrizioni' }, soglie: [1, 1], unita: 'caratteri' },
  { key: 'storia', etichetta: 'Vicende collezionistiche', gruppo: 'Testi', misura: { tipo: 'testo', colonna: 'storia_espositiva' }, soglie: [200, 800], unita: 'caratteri' },
  { key: 'mostre', etichetta: 'Mostre', gruppo: 'Fonti', misura: { tipo: 'voce', voce: 'mostre' }, soglie: [2, 4], unita: 'voci' },
  { key: 'bibliografie', etichetta: 'Bibliografia', gruppo: 'Fonti', misura: { tipo: 'voce', voce: 'bibliografie' }, soglie: [5, 15], unita: 'voci' },
  { key: 'altre_bibliografie', etichetta: 'Altra bibliografia', gruppo: 'Fonti', misura: { tipo: 'voce', voce: 'altre_bibliografie' }, soglie: [2, 5], unita: 'voci' },
  { key: 'documentazione', etichetta: 'Documentazione fotografica', gruppo: 'Fonti', misura: { tipo: 'conteggio', tabella: 'documentazioniFotografiche' }, soglie: [1, 1], unita: 'voci' },
  { key: 'immagini', etichetta: 'Immagini', gruppo: 'Immagini', misura: { tipo: 'conteggio', tabella: 'immagini' }, soglie: [2, 4], unita: 'voci' },
];

/** 0 empty · 1 started · 2 good · 3 rich. */
export function livello(valore: number, [a, b]: [number, number]): 0 | 1 | 2 | 3 {
  if (valore <= 0) return 0;
  if (valore < a) return 1;
  if (valore < b) return 2;
  return 3;
}

export interface RigaMappa {
  id: number;
  titolo: string;
  stato: number;
  classificazione: string | null;
  valori: number[];
  livelli: number[];
  /** Share of fields filled in, 0-100. */
  completezza: number;
}

export interface Panoramica {
  campi: (CampoDef & { compilati: number; percentuale: number })[];
  righe: RigaMappa[];
  totali: { schede: number; perStato: Record<number, number>; immagini: number; byteOriginali: number; byteTotali: number; voci: number; utenti: number };
  completezzaMedia: number;
  tabelle: { nome: string; righe: number; gruppo: 'scheda' | 'dati' | 'voci' | 'sistema'; collegamenti?: number }[];
  vocabolari: { key: VocabKey; plurale: string; totale: number; usate: number; inPubblicate: number; maiUsate: number; collegamenti: number }[];
  classificazioni: { etichetta: string; n: number }[];
  secoli: { secolo: number; n: number }[];
  senzaData: number;
}

const conteggioPerScheda = async (sql: string): Promise<Map<number, number>> =>
  new Map((await select<{ id: number; n: number }>(pool, sql)).map((r) => [r.id, Number(r.n)]));

const contaRighe = async (tabella: string): Promise<number> => Number((await selectOne<{ n: number }>(pool, `SELECT COUNT(*) AS n FROM ${tabella}`))?.n ?? 0);

export async function getPanoramica(): Promise<Panoramica> {
  const colonneTesto = CAMPI.flatMap((c) => (c.misura.tipo === 'testo' || c.misura.tipo === 'presenza' ? [c.misura.colonna] : []));
  const schede = await select<Record<string, unknown> & { id: number; titolo_testo: string; stato: number; classificazione: string | null }>(
    pool,
    `SELECT id, titolo_testo, stato, classificazione, ${colonneTesto.map((c) => `CHAR_LENGTH(COALESCE(${c}, '')) AS \`len_${c}\``).join(', ')}
       FROM schede ORDER BY titolo_testo, id`,
  );

  // One grouped query per counted table (static names from CAMPI and VOCABOLARI: no user input)
  const conteggi = new Map<string, Map<number, number>>();
  await Promise.all(
    CAMPI.map(async (c) => {
      const m = c.misura;
      if (m.tipo === 'voce') {
        conteggi.set(c.key, await conteggioPerScheda(`SELECT id_scheda AS id, COUNT(*) AS n FROM ${VOCABOLARI[m.voce].link} GROUP BY id_scheda`));
      } else if (m.tipo === 'conteggio' && m.via) {
        conteggi.set(c.key, await conteggioPerScheda(`SELECT g.id_scheda AS id, COUNT(*) AS n FROM ${m.tabella} x JOIN ${m.via} g ON g.id = x.id_gruppo_misure GROUP BY g.id_scheda`));
      } else if (m.tipo === 'conteggio') {
        conteggi.set(c.key, await conteggioPerScheda(`SELECT id_scheda AS id, COUNT(*) AS n FROM ${m.tabella} ${m.condizione ? `WHERE ${m.condizione}` : ''} GROUP BY id_scheda`));
      }
    }),
  );

  const righe: RigaMappa[] = schede.map((s) => {
    const valori = CAMPI.map((c) => (c.misura.tipo === 'testo' || c.misura.tipo === 'presenza' ? Number(s[`len_${c.misura.colonna}`] ?? 0) : (conteggi.get(c.key)?.get(s.id) ?? 0)));
    const livelli = valori.map((v, i) => livello(v, CAMPI[i].soglie));
    return {
      id: s.id,
      titolo: s.titolo_testo,
      stato: s.stato,
      classificazione: s.classificazione,
      valori,
      livelli,
      completezza: Math.round((livelli.filter((l) => l > 0).length / CAMPI.length) * 100),
    };
  });

  const n = righe.length || 1;
  const campi = CAMPI.map((c, i) => {
    const compilati = righe.filter((r) => r.livelli[i] > 0).length;
    return { ...c, compilati, percentuale: Math.round((compilati / n) * 100) };
  });

  const media = `\`${config.db.mediaDatabase}\`.immagini_file`;
  const [perStatoRows, immaginiRow, utenti, vocabolari, classRows, secoliRows, senzaDataRow, tabelleDati] = await Promise.all([
    select<{ stato: number; n: number }>(pool, 'SELECT stato, COUNT(*) AS n FROM schede GROUP BY stato'),
    selectOne<{ n: number; originali: number | null; totali: number | null }>(
      pool,
      // Only images attached to a record (an upload never saved is cleaned up later)
      `SELECT COUNT(DISTINCT f.id_immagine) AS n, SUM(IF(f.variante = 'originale', f.dimensione, 0)) AS originali, SUM(f.dimensione) AS totali
         FROM ${media} f JOIN immagini i ON i.id = f.id_immagine WHERE i.id_scheda IS NOT NULL`,
    ),
    contaRighe('users'),
    Promise.all(
      VOCAB_KEYS.map(async (key) => {
        const v = VOCABOLARI[key];
        const r = await selectOne<{ totale: number; usate: number; pubblicate: number; collegamenti: number }>(
          pool,
          `SELECT (SELECT COUNT(*) FROM ${v.table}) AS totale,
                  (SELECT COUNT(DISTINCT ${v.fk}) FROM ${v.link}) AS usate,
                  (SELECT COUNT(DISTINCT l.${v.fk}) FROM ${v.link} l JOIN schede s ON s.id = l.id_scheda WHERE s.stato = ${STATI.PUBBLICATA}) AS pubblicate,
                  (SELECT COUNT(*) FROM ${v.link}) AS collegamenti`,
        );
        const totale = Number(r?.totale ?? 0);
        const usate = Number(r?.usate ?? 0);
        return { key, plurale: v.plurale, totale, usate, inPubblicate: Number(r?.pubblicate ?? 0), maiUsate: totale - usate, collegamenti: Number(r?.collegamenti ?? 0) };
      }),
    ),
    select<{ classificazione: string | null; n: number }>(pool, 'SELECT classificazione, COUNT(*) AS n FROM schede GROUP BY classificazione ORDER BY n DESC'),
    // Century of the earliest date of each record (negative = BC)
    select<{ secolo: number; n: number }>(
      pool,
      `SELECT secolo, COUNT(*) AS n FROM (
         SELECT id_scheda, IF(MIN(anno_data_da) > 0, FLOOR((MIN(anno_data_da) - 1) / 100) + 1, -FLOOR((-MIN(anno_data_da) - 1) / 100) - 1) AS secolo
           FROM cronologie WHERE anno_data_da IS NOT NULL AND anno_data_da <> 0 GROUP BY id_scheda) t
        GROUP BY secolo ORDER BY secolo`,
    ),
    selectOne<{ n: number }>(pool, 'SELECT COUNT(*) AS n FROM schede s WHERE NOT EXISTS (SELECT 1 FROM cronologie c WHERE c.id_scheda = s.id AND c.anno_data_da IS NOT NULL AND c.anno_data_da <> 0)'),
    Promise.all(
      (['cronologie', 'inventari', 'gruppi_misure', 'misure', 'immagini', 'documentazioniFotografiche', 'schede_revisioni', 'tds_users_schede'] as const).map(async (nome) => ({
        nome,
        righe: await contaRighe(nome),
      })),
    ),
  ]);

  const perStato: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
  for (const r of perStatoRows) perStato[r.stato] = Number(r.n);
  const classLabel = new Map(CLASSIFICAZIONI.map((c) => [c.value, c.label]));

  return {
    campi,
    righe,
    totali: {
      schede: righe.length,
      perStato,
      immagini: Number(immaginiRow?.n ?? 0),
      byteOriginali: Number(immaginiRow?.originali ?? 0),
      byteTotali: Number(immaginiRow?.totali ?? 0),
      voci: vocabolari.reduce((a, v) => a + v.totale, 0),
      utenti,
    },
    completezzaMedia: Math.round(righe.reduce((a, r) => a + r.completezza, 0) / n),
    tabelle: [
      { nome: 'schede', righe: righe.length, gruppo: 'scheda' },
      ...tabelleDati.map((t) => ({ ...t, gruppo: (t.nome === 'schede_revisioni' || t.nome === 'tds_users_schede' ? 'sistema' : 'dati') as 'dati' | 'sistema' })),
      ...vocabolari.map((v) => ({ nome: VOCABOLARI[v.key].table, righe: v.totale, gruppo: 'voci' as const, collegamenti: v.collegamenti })),
      { nome: 'users', righe: utenti, gruppo: 'sistema' },
    ],
    vocabolari,
    classificazioni: classRows.map((r) => ({ etichetta: r.classificazione ? (classLabel.get(r.classificazione) ?? r.classificazione) : '', n: Number(r.n) })),
    secoli: secoliRows.map((r) => ({ secolo: Number(r.secolo), n: Number(r.n) })),
    senzaData: Number(senzaDataRow?.n ?? 0),
  };
}
