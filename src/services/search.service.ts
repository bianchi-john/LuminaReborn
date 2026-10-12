import { z } from 'zod';
import { pool, select, selectOne } from '../db/pool';
import { CLASSIFICAZIONI } from '../domain/classificazioni';
import { optInt, optText } from '../domain/scheda.schema';
import { VOCAB_KEYS, VOCABOLARI, VocabKey } from '../domain/vocabolari';
import { percorsoOpera } from '../util/codici';
import { findSimilar, normalize } from '../util/similarity';
import { escapeLike } from '../util/sql';
import { listVoci } from './vocabolari.service';

/**
 * Ricerca nel catalogo pubblico (solo schede pubblicate).
 *
 * Ricerca semplice (`q`), per requisito, nei campi: titolo, autore, classificazione,
 * commento storico-critico, descrizione sintetica, ubicazione, provenienza,
 * vicende collezionistiche. Ogni parola deve comparire in almeno uno di questi
 * campi; i risultati sono ordinati per rilevanza (titolo e autore pesano di più).
 * Maiuscole e accenti non contano (collation del database) e singolare/plurale
 * sono equivalenti ("dipinto" trova "dipinti").
 *
 * Ricerca avanzata: un criterio per campo, tutti in AND.
 * Tutti i valori sono passati come parametri: niente SQL costruito con l'input.
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
  ordina: z.enum(['rilevanza', 'titolo', 'data', 'recenti']).optional().catch(undefined),
  pagina: z.coerce.number().int().min(1).max(10_000).catch(1),
  // Limite basso: scaricare tutto il catalogo richiede molte richieste (vedi protezione anti-scraping)
  per_pagina: z.coerce.number().int().min(1).max(48).catch(24),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export interface SearchItem {
  id: number;
  url: string;
  titolo_opera: string;
  titolo_testo: string;
  classificazione: string | null;
  autori: string | null;
  datazione: string | null;
  ubicazione: string | null;
  inventario: string | null;
  copertina: string | null;
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
    this.add(existsVoce(key, cond), ...params);
  }

  toSql() {
    return this.conds.join(' AND ');
  }
}

function existsVoce(key: VocabKey, cond: string): string {
  const v = VOCABOLARI[key];
  return `EXISTS (SELECT 1 FROM \`${v.link}\` l JOIN \`${v.table}\` e ON e.id = l.\`${v.fk}\` WHERE l.id_scheda = s.id AND ${cond})`;
}

const like = (value: string) => `%${escapeLike(value)}%`;

/**
 * Parole della ricerca semplice. Per le parole lunghe che finiscono in vocale si
 * toglie la vocale finale: singolare e plurale italiani coincidono ("croce" → "croc"
 * trova "croce" e "croci"; "dipinto" → "dipint").
 */
export function searchTerms(q: string): string[] {
  return q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 8)
    .map((t) => (t.length >= 5 && /[aeiouàèéìòù]$/i.test(t) ? t.slice(0, -1) : t));
}

/** Classificazioni la cui etichetta o valore contiene la parola (es. "dipint" → "Dipinti"). */
function classificazioniPer(term: string): string[] {
  const n = normalize(term);
  return CLASSIFICAZIONI.filter((c) => normalize(c.label).includes(n) || normalize(c.value).includes(n)).map((c) => c.value);
}

/** Condizione e peso per ciascun campo della ricerca semplice. */
const CAMPI_GENERICI: { peso: number; cond: string }[] = [
  { peso: 10, cond: 's.titolo_testo LIKE ?' },
  { peso: 8, cond: existsVoce('autori', 'e.nome LIKE ?') },
  { peso: 3, cond: 's.descrizione_sintetica LIKE ?' },
  { peso: 3, cond: existsVoce('ubicazioni', '(e.ubicazione LIKE ? OR l.collocazione LIKE ?)') },
  { peso: 2, cond: existsVoce('provenienze', '(e.provenienza LIKE ? OR e.descrizione LIKE ? OR l.note LIKE ?)') },
  { peso: 1, cond: 's.storia_espositiva LIKE ?' },
  { peso: 1, cond: 's.corpo_scheda LIKE ?' },
];
const placeholders = (sql: string) => (sql.match(/\?/g) ?? []).length;

function genericTerm(term: string): { cond: string; params: unknown[]; score: string; scoreParams: unknown[] } {
  const p = like(term);
  const classi = classificazioniPer(term);
  const parts = CAMPI_GENERICI.map((c) => c.cond);
  const params: unknown[] = CAMPI_GENERICI.flatMap((c) => Array(placeholders(c.cond)).fill(p));
  const scoreParts = CAMPI_GENERICI.map((c) => `(${c.cond}) * ${c.peso}`);
  const scoreParams = [...params];
  if (classi.length) {
    const cond = `s.classificazione IN (${classi.map(() => '?').join(', ')})`;
    parts.push(cond);
    params.push(...classi);
    scoreParts.push(`(${cond}) * 4`);
    scoreParams.push(...classi);
  }
  return { cond: `(${parts.join(' OR ')})`, params, score: scoreParts.join(' + '), scoreParams };
}

export function buildWhere(f: SearchQuery): { where: Where; score: { sql: string; params: unknown[] } | null } {
  const w = new Where();
  let score: { sql: string; params: unknown[] } | null = null;

  if (f.q) {
    const scores: string[] = [];
    const scoreParams: unknown[] = [];
    for (const term of searchTerms(f.q)) {
      const g = genericTerm(term);
      w.add(g.cond, ...g.params);
      scores.push(g.score);
      scoreParams.push(...g.scoreParams);
    }
    if (scores.length) score = { sql: scores.join(' + '), params: scoreParams };
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
      `(${existsVoce('bibliografie', 'e.riferimento_bibliografico LIKE ?')} OR ${existsVoce('altre_bibliografie', 'e.riferimento_bibliografico LIKE ?')})`,
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
  if (f.proprieta) w.add('EXISTS (SELECT 1 FROM inventari i WHERE i.id_scheda = s.id AND i.descrizione = ?)', f.proprieta);
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
  return { where: w, score };
}

const ORDER: Record<'titolo' | 'data' | 'recenti', string> = {
  titolo: 's.titolo_testo, s.id',
  data: 'anno IS NULL, anno, s.titolo_testo',
  recenti: 's.published_at DESC, s.id DESC',
};

export async function search(f: SearchQuery) {
  const { where, score } = buildWhere(f);
  const offset = (f.pagina - 1) * f.per_pagina;
  const ordina = f.ordina ?? (score ? 'rilevanza' : 'titolo');
  const useScore = ordina === 'rilevanza' && score;

  const [countRow, items, classi] = await Promise.all([
    selectOne<{ n: number }>(pool, `SELECT COUNT(*) AS n FROM schede s WHERE ${where.toSql()}`, where.params),
    select<Omit<SearchItem, 'url'> & { codice: string; anno: number | null }>(
      pool,
      `SELECT s.id, s.codice, s.titolo_opera, s.titolo_testo, s.classificazione,
              (SELECT GROUP_CONCAT(CONCAT_WS(' ', l.formula_precedente, a.nome, l.formula_successiva) ORDER BY l.ordine SEPARATOR '; ')
                 FROM tds_schede_autori l JOIN autori a ON a.id = l.id_autore WHERE l.id_scheda = s.id) AS autori,
              (SELECT c.etichetta_data FROM cronologie c WHERE c.id_scheda = s.id ORDER BY c.ordine LIMIT 1) AS datazione,
              (SELECT MIN(c.anno_data_da) FROM cronologie c WHERE c.id_scheda = s.id) AS anno,
              (SELECT u.ubicazione FROM tds_schede_ubicazioni l JOIN ubicazioni u ON u.id = l.id_ubicazione
                WHERE l.id_scheda = s.id ORDER BY l.ordine LIMIT 1) AS ubicazione,
              (SELECT i.numero_inventario FROM inventari i WHERE i.id_scheda = s.id ORDER BY i.ordine LIMIT 1) AS inventario,
              (SELECT im.codice FROM immagini im WHERE im.id_scheda = s.id ORDER BY im.ordine, im.id LIMIT 1) AS copertina
              ${useScore ? `, (${score.sql}) AS punteggio` : ''}
         FROM schede s
        WHERE ${where.toSql()}
        ORDER BY ${useScore ? 'punteggio DESC, s.titolo_testo' : ORDER[ordina as keyof typeof ORDER]}
        LIMIT ? OFFSET ?`,
      [...(useScore ? score.params : []), ...where.params, f.per_pagina, offset],
    ),
    select<{ classificazione: string | null; n: number }>(
      pool,
      `SELECT s.classificazione, COUNT(*) AS n FROM schede s WHERE ${where.toSql()} GROUP BY s.classificazione ORDER BY n DESC`,
      where.params,
    ),
  ]);

  const total = Number(countRow?.n ?? 0);
  return {
    items: items.map(
      ({ anno: _anno, punteggio: _p, codice, ...item }: Omit<SearchItem, 'url'> & { codice: string; anno: number | null; punteggio?: number }) => ({
        ...item,
        url: percorsoOpera(item.titolo_testo, codice),
      }),
    ),
    total,
    ordina,
    pagina: f.pagina,
    per_pagina: f.per_pagina,
    pagine: Math.max(1, Math.ceil(total / f.per_pagina)),
    classificazioni: classi.filter((c) => c.classificazione).map((c) => ({ value: c.classificazione as string, n: Number(c.n) })),
    forseCercavi: total === 0 && f.q ? await forseCercavi(f.q) : [],
  };
}

export type SearchResult = Awaited<ReturnType<typeof search>>;

// ---------------------------------------------------------------------------
// Suggerimenti
// ---------------------------------------------------------------------------

const SUGGEST_VOCI: VocabKey[] = ['autori', 'ubicazioni', 'materiali', 'tecniche', 'mostre'];

/** Suggerimenti mentre si scrive nella ricerca: opere e voci usate in schede pubblicate. */
export async function suggerimenti(q: string) {
  const term = q.trim().slice(0, 100);
  if (term.length < 2) return { opere: [], voci: [] };
  const [opere, ...voci] = await Promise.all([
    select<{ codice: string; titolo_testo: string }>(
      pool,
      `SELECT codice, titolo_testo FROM schede WHERE stato = 2 AND titolo_testo LIKE ?
        ORDER BY (titolo_testo LIKE ?) DESC, titolo_testo LIMIT 5`,
      [like(term), `${escapeLike(term)}%`],
    ),
    ...SUGGEST_VOCI.map((k) => listVoci(VOCABOLARI[k], { q: term, limit: 4, soloPubblicate: true })),
  ]);
  return {
    opere: opere.map((o) => ({ titolo_testo: o.titolo_testo, url: percorsoOpera(o.titolo_testo, o.codice) })),
    voci: SUGGEST_VOCI.flatMap((k, i) =>
      voci[i].map((item) => ({ tipo: k, id: item.id, label: String(item[VOCABOLARI[k].display]), schede: item.schede_pubblicate })),
    ),
  };
}

/** Per ricerche senza risultati: nomi simili (errori di battitura) tra voci e titoli pubblicati. */
async function forseCercavi(q: string): Promise<string[]> {
  const [titoli, ...voci] = await Promise.all([
    select<{ id: number; titolo_testo: string }>(pool, 'SELECT id, titolo_testo FROM schede WHERE stato = 2'),
    ...SUGGEST_VOCI.map((k) => listVoci(VOCABOLARI[k], { limit: 2000, soloPubblicate: true })),
  ]);
  const candidati = [
    ...voci.flatMap((items, i) => items.map((item) => ({ id: item.id, label: normalize(String(item[VOCABOLARI[SUGGEST_VOCI[i]].display])) }))),
    // anche le singole parole dei titoli
    ...titoli.flatMap((t) => normalize(t.titolo_testo).split(' ').filter((w) => w.length >= 4).map((w) => ({ id: t.id, label: w }))),
  ];
  const unici = [...new Map(candidati.map((c) => [c.label, c])).values()];
  return findSimilar(q, unici, 0.7, 3).map((c) => c.label);
}

// ---------------------------------------------------------------------------
// Opzioni per i menu a tendina della ricerca avanzata
// ---------------------------------------------------------------------------

export async function opzioniRicerca() {
  const [ubicazioni, materiali, tecniche, proprieta, luoghiMostre] = await Promise.all([
    listVoci(VOCABOLARI.ubicazioni, { limit: 500, soloPubblicate: true }),
    listVoci(VOCABOLARI.materiali, { limit: 500, soloPubblicate: true }),
    listVoci(VOCABOLARI.tecniche, { limit: 500, soloPubblicate: true }),
    select<{ v: string }>(
      pool,
      `SELECT DISTINCT i.descrizione AS v FROM inventari i JOIN schede s ON s.id = i.id_scheda
        WHERE s.stato = 2 AND i.descrizione IS NOT NULL ORDER BY v`,
    ),
    select<{ v: string }>(
      pool,
      `SELECT DISTINCT e.luogo_mostra AS v FROM mostre e JOIN tds_schede_mostre l ON l.id_mostra = e.id JOIN schede s ON s.id = l.id_scheda
        WHERE s.stato = 2 AND e.luogo_mostra IS NOT NULL AND e.luogo_mostra <> '' ORDER BY v`,
    ),
  ]);
  const opt = (items: { id: number }[], key: string) => items.map((i) => ({ id: i.id, label: String((i as Record<string, unknown>)[key]) }));
  return {
    ubicazioni: opt(ubicazioni, 'ubicazione'),
    materiali: opt(materiali, 'nome_materiale'),
    tecniche: opt(tecniche, 'nome_tecnica'),
    proprieta: proprieta.map((r) => r.v),
    luoghiMostre: luoghiMostre.map((r) => r.v),
  };
}
