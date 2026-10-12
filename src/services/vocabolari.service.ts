import { badRequest, conflict, notFound } from '../http/errors';
import { Db, execute, pool, select, selectOne, withTransaction } from '../db/pool';
import { VocabDef, VocabKey, VOCABOLARI } from '../domain/vocabolari';
import { VocabRef } from '../domain/scheda.schema';
import { htmlToText } from '../util/html';
import { findDuplicatePairs, findSimilar } from '../util/similarity';
import { escapeLike } from '../util/sql';

// I nomi di tabelle e colonne provengono solo dalla configurazione statica in
// domain/vocabolari.ts, mai dall'input dell'utente.
const q = (name: string) => `\`${name}\``;

export type VocabItem = { id: number } & Record<string, string | number | null>;

const entityColumns = (v: VocabDef, alias = 'e') => [`${alias}.id`, ...v.fields.map((f) => `${alias}.${q(f.name)}`)].join(', ');
const orderExpr = (v: VocabDef, alias = 'e') =>
  v.fields[0].type === 'inline' ? `REGEXP_REPLACE(${alias}.${q(v.display)}, '<[^>]*>', '')` : `${alias}.${q(v.display)}`;

/**
 * Restituisce l'id della voce: quello indicato se esiste, altrimenti crea la voce
 * oppure riusa quella identica già presente (vincolo UNIQUE + LAST_INSERT_ID).
 * Le voci esistenti non vengono modificate dal form della scheda.
 */
export async function resolveRef(db: Db, v: VocabDef, ref: VocabRef): Promise<number> {
  if (ref.id) {
    const row = await selectOne<{ id: number }>(db, `SELECT id FROM ${q(v.table)} WHERE id = ?`, [ref.id]);
    if (!row) throw badRequest(`${v.singolare}: la voce ${ref.id} non esiste (forse è stata unita a un'altra)`);
    return row.id;
  }
  const cols = v.fields.map((f) => f.name);
  const result = await execute(
    db,
    `INSERT INTO ${q(v.table)} (${cols.map(q).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    cols.map((c) => ref[c] ?? null),
  );
  return result.insertId;
}

/** Sostituisce i collegamenti di una scheda verso un tipo di voce, mantenendo l'ordine. */
export async function linkScheda(db: Db, schedaId: number, v: VocabDef, refs: VocabRef[]): Promise<void> {
  await execute(db, `DELETE FROM ${q(v.link)} WHERE id_scheda = ?`, [schedaId]);
  const linkCols = v.linkFields.map((f) => f.name);
  const seen = new Set<number>();
  let ordine = 0;
  for (const ref of refs) {
    const id = await resolveRef(db, v, ref);
    if (seen.has(id)) continue;
    seen.add(id);
    await execute(
      db,
      `INSERT INTO ${q(v.link)} (id_scheda, ${q(v.fk)}${linkCols.map((c) => `, ${q(c)}`).join('')}, ordine)
       VALUES (?, ?${linkCols.map(() => ', ?').join('')}, ?)`,
      [schedaId, id, ...linkCols.map((c) => ref[c] ?? null), ordine++],
    );
  }
}

/** Voci collegate a una scheda, con i campi del collegamento. */
export async function linkedTo(db: Db, schedaId: number, v: VocabDef): Promise<VocabItem[]> {
  const linkCols = v.linkFields.map((f) => `, l.${q(f.name)}`).join('');
  return select<VocabItem>(
    db,
    `SELECT ${entityColumns(v)}${linkCols}
       FROM ${q(v.link)} l JOIN ${q(v.table)} e ON e.id = l.${q(v.fk)}
      WHERE l.id_scheda = ?
      ORDER BY l.ordine, e.id`,
    [schedaId],
  );
}

export interface ListOptions {
  q?: string;
  limit?: number;
  offset?: number;
  /** Solo voci collegate ad almeno una scheda pubblicata (indici pubblici). */
  soloPubblicate?: boolean;
}

export async function listVoci(v: VocabDef, opts: ListOptions = {}) {
  const params: unknown[] = [];
  let where = '';
  if (opts.q) {
    where = `WHERE e.${q(v.display)} LIKE ?`;
    params.push(`%${escapeLike(opts.q)}%`);
  }
  const having = opts.soloPubblicate ? 'HAVING schede_pubblicate > 0' : '';
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 500);
  const offset = Math.max(opts.offset ?? 0, 0);
  // Prima le voci che iniziano con il testo cercato, poi le altre
  const startsWith = opts.q ? `(e.${q(v.display)} LIKE ?) DESC, ` : '';
  const orderParams = opts.q ? [`${escapeLike(opts.q)}%`] : [];

  const items = await select<VocabItem & { schede_pubblicate: number; schede_totali: number }>(
    pool,
    `SELECT ${entityColumns(v)},
            COUNT(DISTINCT CASE WHEN s.stato = 2 THEN s.id END) AS schede_pubblicate,
            COUNT(DISTINCT s.id) AS schede_totali
       FROM ${q(v.table)} e
       LEFT JOIN ${q(v.link)} l ON l.${q(v.fk)} = e.id
       LEFT JOIN schede s ON s.id = l.id_scheda
       ${where}
      GROUP BY e.id
      ${having}
      ORDER BY ${startsWith}${orderExpr(v)}
      LIMIT ? OFFSET ?`,
    [...params, ...orderParams, limit, offset],
  );
  if (opts.soloPubblicate) for (const item of items) delete (item as Partial<typeof item>).schede_totali;
  return items;
}

export async function countVoci(v: VocabDef, soloPubblicate: boolean): Promise<number> {
  const row = await selectOne<{ n: number }>(
    pool,
    soloPubblicate
      ? `SELECT COUNT(DISTINCT l.${q(v.fk)}) AS n FROM ${q(v.link)} l JOIN schede s ON s.id = l.id_scheda WHERE s.stato = 2`
      : `SELECT COUNT(*) AS n FROM ${q(v.table)}`,
  );
  return Number(row?.n ?? 0);
}

export async function getVoce(v: VocabDef, id: number): Promise<VocabItem> {
  const item = await selectOne<VocabItem>(pool, `SELECT ${entityColumns(v)} FROM ${q(v.table)} e WHERE e.id = ?`, [id]);
  if (!item) throw notFound(`${v.singolare} non trovato`);
  return item;
}

export async function updateVoce(v: VocabDef, id: number, fields: Record<string, unknown>): Promise<VocabItem> {
  await getVoce(v, id);
  const cols = v.fields.map((f) => f.name);
  try {
    await execute(pool, `UPDATE ${q(v.table)} SET ${cols.map((c) => `${q(c)} = ?`).join(', ')} WHERE id = ?`, [
      ...cols.map((c) => fields[c] ?? null),
      id,
    ]);
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw conflict(`Esiste già una voce identica: usa "Unisci" per fondere i duplicati`);
    }
    throw error;
  }
  return getVoce(v, id);
}

/** Fonde la voce `fromId` in `intoId`: i collegamenti passano alla seconda e la prima viene eliminata. */
export async function mergeVoci(v: VocabDef, fromId: number, intoId: number): Promise<void> {
  if (fromId === intoId) throw badRequest('Selezionare due voci diverse');
  await getVoce(v, fromId);
  await getVoce(v, intoId);
  const linkCols = v.linkFields.map((f) => `, ${q(f.name)}`).join('');
  await withTransaction(async (conn) => {
    await execute(
      conn,
      `INSERT IGNORE INTO ${q(v.link)} (id_scheda, ${q(v.fk)}${linkCols}, ordine)
       SELECT id_scheda, ?${linkCols}, ordine FROM ${q(v.link)} WHERE ${q(v.fk)} = ?`,
      [intoId, fromId],
    );
    await execute(conn, `DELETE FROM ${q(v.link)} WHERE ${q(v.fk)} = ?`, [fromId]);
    await execute(conn, `DELETE FROM ${q(v.table)} WHERE id = ?`, [fromId]);
  });
}

export async function deleteVoce(v: VocabDef, id: number): Promise<void> {
  await getVoce(v, id);
  const used = await selectOne<{ n: number }>(pool, `SELECT COUNT(*) AS n FROM ${q(v.link)} WHERE ${q(v.fk)} = ?`, [id]);
  if (Number(used?.n) > 0) throw conflict('La voce è collegata a una o più schede: unirla a un\'altra invece di eliminarla');
  await execute(pool, `DELETE FROM ${q(v.table)} WHERE id = ?`, [id]);
}

export function vocab(key: VocabKey): VocabDef {
  return VOCABOLARI[key];
}

/** Voci simili al testo indicato (probabili doppioni da proporre prima di crearne una nuova). */
export async function vociSimili(v: VocabDef, testo: string) {
  const tutte = await listVoci(v, { limit: 5000 });
  const candidati = tutte.map((item) => ({ ...item, id: item.id, label: htmlToText(String(item[v.display])) }));
  return findSimilar(testo, candidati, 0.72, 6).map(({ label: _label, ...item }) => item);
}

/** Coppie di voci con nomi molto simili, da verificare ed eventualmente unire. */
export async function possibiliDuplicati(v: VocabDef) {
  const tutte = await listVoci(v, { limit: 5000 });
  const candidati = tutte.map((item) => ({ id: item.id, label: htmlToText(String(item[v.display])), schede: item.schede_totali }));
  return findDuplicatePairs(candidati, 0.85, 30);
}

/** La voce compare in almeno una scheda pubblicata? */
export async function usataInPubblicate(v: VocabDef, id: number): Promise<boolean> {
  const row = await selectOne(
    pool,
    `SELECT 1 AS ok FROM ${q(v.link)} l JOIN schede s ON s.id = l.id_scheda WHERE l.${q(v.fk)} = ? AND s.stato = 2 LIMIT 1`,
    [id],
  );
  return !!row;
}
