import { z } from 'zod';
import { pool, select, selectOne } from '../db/pool';
import { optInt, optText } from '../domain/scheda.schema';
import { VOCAB_KEYS, VOCABOLARI, VocabKey } from '../domain/vocabolari';
import { escapeLike } from '../util/sql';

/**
 * Ricerca nel catalogo pubblico (solo schede pubblicate). Ogni criterio è in AND;
 * la ricerca libera `q` richiede che ogni parola compaia in almeno uno dei campi
 * principali. Tutti i valori sono passati come parametri: niente SQL dinamico
 * costruito con l'input dell'utente.
 */

const text = optText(200);
const year = optInt(-99999, 9999);
const id = z.preprocess((v) => (v === '' || v === undefined ? null : v), z.coerce.number().int().positive().nullable());

const vocabIdShape = Object.fromEntries(VOCAB_KEYS.map((k) => [k, id])) as Record<VocabKey, typeof id>;

export const searchQuerySchema = z.object({
  q: text,
  titolo: text,
  autore: text,
  categoria: text,
  classificazione: text,
  ambito: text,
  anno_da: year,
  era_da: z.enum(['dc', 'ac']).catch('dc'),
  anno_a: year,
  era_a: z.enum(['dc', 'ac']).catch('dc'),
  materiale: text,
  tecnica: text,
  ubicazione: text,
  provenienza: text,
  inventario: text,
  proprieta: text,
  iscrizioni: text,
  descrizione: text,
  storia: text,
  commento: text,
  mostra: text,
  curatore: text,
  luogo_mostra: text,
  mostra_anno_da: year,
  mostra_anno_a: year,
  bibliografia: text,
  documentazione: text,
  ...vocabIdShape,
  ordina: z.enum(['titolo', 'data', 'recenti']).catch('titolo'),
  pagina: z.coerce.number().int().min(1).max(10_000).catch(1),
  per_pagina: z.coerce.number().int().min(1).max(100).catch(24),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export interface SearchItem {
  id: number;
  titolo_opera: string;
  titolo_testo: string;
  classificazione: string | null;
  autori: string | null;
  datazione: string | null;
  ubicazione: string | null;
  inventario: string | null;
  copertina: number | null;
}

class Where {
  readonly conds: string[] = ['s.stato = 2'];
  readonly params: unknown[] = [];

  add(cond: string, ...params: unknown[]) {
    this.conds.push(cond);
    this.params.push(...params);
  }

  /** EXISTS su una voce collegata (tabelle dalla configurazione statica). */
  voce(key: VocabKey, cond: string, ...params: unknown[]) {
    const v = VOCABOLARI[key];
    this.add(`EXISTS (SELECT 1 FROM \`${v.link}\` l JOIN \`${v.table}\` e ON e.id = l.\`${v.fk}\` WHERE l.id_scheda = s.id AND ${cond})`, ...params);
  }

  toSql() {
    return this.conds.join(' AND ');
  }
}

const like = (value: string) => `%${escapeLike(value)}%`;

function buildWhere(f: SearchQuery): Where {
  const w = new Where();

  if (f.q) {
    const terms = f.q.split(/\s+/).filter(Boolean).slice(0, 8);
    for (const term of terms) {
      const p = like(term);
      w.add(
        `(s.titolo_testo LIKE ? OR s.descrizione_sintetica LIKE ? OR s.corpo_scheda LIKE ? OR s.storia_espositiva LIKE ?
          OR s.iscrizioni LIKE ? OR s.classificazione LIKE ?
          OR EXISTS (SELECT 1 FROM tds_schede_autori l JOIN autori e ON e.id = l.id_autore WHERE l.id_scheda = s.id AND e.nome LIKE ?)
          OR EXISTS (SELECT 1 FROM tds_schede_ubicazioni l JOIN ubicazioni e ON e.id = l.id_ubicazione
                      WHERE l.id_scheda = s.id AND (e.ubicazione LIKE ? OR l.collocazione LIKE ?))
          OR EXISTS (SELECT 1 FROM tds_schede_provenienze l JOIN provenienze e ON e.id = l.id_provenienza
                      WHERE l.id_scheda = s.id AND (e.provenienza LIKE ? OR e.descrizione LIKE ?))
          OR EXISTS (SELECT 1 FROM tds_schede_materiali l JOIN materiali e ON e.id = l.id_materiale WHERE l.id_scheda = s.id AND e.nome_materiale LIKE ?)
          OR EXISTS (SELECT 1 FROM tds_schede_tecniche l JOIN tecniche e ON e.id = l.id_tecnica WHERE l.id_scheda = s.id AND e.nome_tecnica LIKE ?)
          OR EXISTS (SELECT 1 FROM inventari i WHERE i.id_scheda = s.id AND i.numero_inventario LIKE ?)
          OR EXISTS (SELECT 1 FROM cronologie c WHERE c.id_scheda = s.id AND (c.ambito_storico LIKE ? OR c.etichetta_data LIKE ?)))`,
        ...Array(16).fill(p),
      );
    }
  }

  if (f.titolo) w.add('s.titolo_testo LIKE ?', like(f.titolo));
  if (f.classificazione) w.add('s.classificazione = ?', f.classificazione);
  if (f.iscrizioni) w.add('s.iscrizioni LIKE ?', like(f.iscrizioni));
  if (f.descrizione) w.add('s.descrizione_sintetica LIKE ?', like(f.descrizione));
  if (f.storia) w.add('s.storia_espositiva LIKE ?', like(f.storia));
  if (f.commento) w.add('s.corpo_scheda LIKE ?', like(f.commento));

  if (f.autore) w.voce('autori', 'e.nome LIKE ?', like(f.autore));
  if (f.categoria) w.voce('autori', 'l.categoria = ?', f.categoria);
  if (f.materiale) w.voce('materiali', '(e.nome_materiale LIKE ? OR e.descrizione LIKE ?)', like(f.materiale), like(f.materiale));
  if (f.tecnica) w.voce('tecniche', '(e.nome_tecnica LIKE ? OR e.descrizione LIKE ?)', like(f.tecnica), like(f.tecnica));
  if (f.ubicazione) w.voce('ubicazioni', '(e.ubicazione LIKE ? OR l.collocazione LIKE ?)', like(f.ubicazione), like(f.ubicazione));
  if (f.provenienza) {
    w.voce('provenienze', '(e.provenienza LIKE ? OR e.descrizione LIKE ? OR l.note LIKE ?)', ...Array(3).fill(like(f.provenienza)));
  }
  if (f.mostra) w.voce('mostre', 'e.titolo_mostra LIKE ?', like(f.mostra));
  if (f.curatore) w.voce('mostre', 'e.curatore LIKE ?', like(f.curatore));
  if (f.luogo_mostra) w.voce('mostre', '(e.luogo_mostra LIKE ? OR e.descrizione LIKE ?)', like(f.luogo_mostra), like(f.luogo_mostra));
  if (f.mostra_anno_da !== null) w.voce('mostre', 'COALESCE(e.anno_data_a, e.anno_data_da) >= ?', f.mostra_anno_da);
  if (f.mostra_anno_a !== null) w.voce('mostre', 'COALESCE(e.anno_data_da, e.anno_data_a) <= ?', f.mostra_anno_a);
  if (f.bibliografia) {
    w.add(
      `(EXISTS (SELECT 1 FROM tds_schede_bibliografie l JOIN bibliografie e ON e.id = l.id_bibliografia
                 WHERE l.id_scheda = s.id AND e.riferimento_bibliografico LIKE ?)
        OR EXISTS (SELECT 1 FROM tds_schede_altreBibliografie l JOIN altreBibliografie e ON e.id = l.id_altreBibliografie
                    WHERE l.id_scheda = s.id AND e.riferimento_bibliografico LIKE ?))`,
      like(f.bibliografia),
      like(f.bibliografia),
    );
  }

  if (f.ambito) w.add('EXISTS (SELECT 1 FROM cronologie c WHERE c.id_scheda = s.id AND c.ambito_storico LIKE ?)', like(f.ambito));
  // Nel form l'anno è positivo e l'era (a.C./d.C.) è un campo a parte
  const annoDa = f.anno_da !== null && f.era_da === 'ac' ? -Math.abs(f.anno_da) : f.anno_da;
  const annoA = f.anno_a !== null && f.era_a === 'ac' ? -Math.abs(f.anno_a) : f.anno_a;
  if (annoDa !== null || annoA !== null) {
    // Sovrapposizione tra l'intervallo cercato e la datazione dell'opera
    const conds = ['(c.anno_data_da IS NOT NULL OR c.anno_data_a IS NOT NULL)'];
    const params: unknown[] = [];
    if (annoDa !== null) {
      conds.push('COALESCE(c.anno_data_a, c.anno_data_da) >= ?');
      params.push(annoDa);
    }
    if (annoA !== null) {
      conds.push('COALESCE(c.anno_data_da, c.anno_data_a) <= ?');
      params.push(annoA);
    }
    w.add(`EXISTS (SELECT 1 FROM cronologie c WHERE c.id_scheda = s.id AND ${conds.join(' AND ')})`, ...params);
  }
  if (f.inventario) w.add('EXISTS (SELECT 1 FROM inventari i WHERE i.id_scheda = s.id AND i.numero_inventario LIKE ?)', like(f.inventario));
  if (f.proprieta) w.add('EXISTS (SELECT 1 FROM inventari i WHERE i.id_scheda = s.id AND i.descrizione LIKE ?)', like(f.proprieta));
  if (f.documentazione) {
    w.add(
      'EXISTS (SELECT 1 FROM documentazioniFotografiche d WHERE d.id_scheda = s.id AND d.riferimento_bibliografico LIKE ?)',
      like(f.documentazione),
    );
  }

  for (const key of VOCAB_KEYS) {
    const voceId = f[key];
    if (voceId) w.voce(key, 'e.id = ?', voceId);
  }
  return w;
}

const ORDER: Record<SearchQuery['ordina'], string> = {
  titolo: 's.titolo_testo, s.id',
  data: 'anno IS NULL, anno, s.titolo_testo',
  recenti: 's.published_at DESC, s.id DESC',
};

export async function search(f: SearchQuery) {
  const where = buildWhere(f);
  const offset = (f.pagina - 1) * f.per_pagina;

  const [countRow, items, classi] = await Promise.all([
    selectOne<{ n: number }>(pool, `SELECT COUNT(*) AS n FROM schede s WHERE ${where.toSql()}`, where.params),
    select<SearchItem & { anno: number | null }>(
      pool,
      `SELECT s.id, s.titolo_opera, s.titolo_testo, s.classificazione,
              (SELECT GROUP_CONCAT(CONCAT_WS(' ', l.formula_precedente, a.nome, l.formula_successiva) ORDER BY l.ordine SEPARATOR '; ')
                 FROM tds_schede_autori l JOIN autori a ON a.id = l.id_autore WHERE l.id_scheda = s.id) AS autori,
              (SELECT c.etichetta_data FROM cronologie c WHERE c.id_scheda = s.id ORDER BY c.ordine LIMIT 1) AS datazione,
              (SELECT MIN(c.anno_data_da) FROM cronologie c WHERE c.id_scheda = s.id) AS anno,
              (SELECT u.ubicazione FROM tds_schede_ubicazioni l JOIN ubicazioni u ON u.id = l.id_ubicazione
                WHERE l.id_scheda = s.id ORDER BY l.ordine LIMIT 1) AS ubicazione,
              (SELECT i.numero_inventario FROM inventari i WHERE i.id_scheda = s.id ORDER BY i.ordine LIMIT 1) AS inventario,
              (SELECT im.id FROM immagini im WHERE im.id_scheda = s.id ORDER BY im.ordine, im.id LIMIT 1) AS copertina
         FROM schede s
        WHERE ${where.toSql()}
        ORDER BY ${ORDER[f.ordina]}
        LIMIT ? OFFSET ?`,
      [...where.params, f.per_pagina, offset],
    ),
    select<{ classificazione: string | null; n: number }>(
      pool,
      `SELECT s.classificazione, COUNT(*) AS n FROM schede s WHERE ${where.toSql()} GROUP BY s.classificazione ORDER BY n DESC`,
      where.params,
    ),
  ]);

  const total = Number(countRow?.n ?? 0);
  return {
    items: items.map(({ anno: _anno, ...item }) => item),
    total,
    pagina: f.pagina,
    per_pagina: f.per_pagina,
    pagine: Math.max(1, Math.ceil(total / f.per_pagina)),
    classificazioni: classi.filter((c) => c.classificazione).map((c) => ({ value: c.classificazione as string, n: Number(c.n) })),
  };
}

export type SearchResult = Awaited<ReturnType<typeof search>>;
