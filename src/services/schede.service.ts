import { PoolConnection } from 'mysql2/promise';
import { MESSAGGIO_SOLO_SCHEDATORI, SessionUser } from '../auth/session';
import { Db, execute, pool, select, selectOne, withTransaction } from '../db/pool';
import { STATI, STATO_LABEL } from '../domain/classificazioni';
import { SchedaInput } from '../domain/scheda.schema';
import { VOCAB_KEYS, VOCABOLARI, VocabKey } from '../domain/vocabolari';
import { badRequest, conflict, forbidden, notFound } from '../http/errors';
import { generaCodice, LUNGHEZZA_CODICE_OPERA, percorsoOpera } from '../util/codici';
import { cleanHtml, htmlToText, soloImmagini } from '../util/html';
import { linkedTo, linkScheda, VocabItem } from './vocabolari.service';

interface SchedaRow {
  id: number;
  codice: string;
  titolo_opera: string;
  titolo_testo: string;
  classificazione: string | null;
  descrizione_sintetica: string | null;
  iscrizioni: string | null;
  storia_espositiva: string | null;
  corpo_scheda: string | null;
  note_schedatore: string | null;
  stato: number;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export type Azione = 'invia' | 'ritira' | 'approva' | 'respingi' | 'depubblica';

export interface Permessi {
  visualizza: boolean;
  modifica: boolean;
  elimina: boolean;
  invia: boolean;
  ritira: boolean;
  approva: boolean;
  respingi: boolean;
  depubblica: boolean;
}

/**
 * Access rules:
 * - published records (schede) are visible to everyone;
 * - a cataloguer sees and manages their own; they can edit/delete only drafts;
 * - the administrator sees everything, can correct records in any state,
 *   approve them, reject them (with a reason) or withdraw them from publication.
 */
/**
 * Separation of duties: no account can do everything.
 * - Cataloguers write records: they create, edit, submit and delete their own drafts.
 * - Administrators review: they approve or reject submitted records and can send a
 *   published one back to its cataloguer at any time, always with a message.
 *   They never create, edit or delete record content.
 */
export function computePermessi(s: { stato: number; created_by: number | null }, user: SessionUser | undefined, accreditato = false): Permessi {
  const admin = !!user?.isAdmin;
  const owner = !!user && !admin && (s.created_by === user.id || accreditato);
  return {
    visualizza: s.stato === STATI.PUBBLICATA || owner || admin,
    modifica: owner && s.stato === STATI.BOZZA,
    elimina: owner && s.stato === STATI.BOZZA,
    invia: owner && s.stato === STATI.BOZZA,
    ritira: owner && s.stato === STATI.IN_REVISIONE,
    approva: admin && s.stato === STATI.IN_REVISIONE,
    respingi: admin && s.stato === STATI.IN_REVISIONE,
    depubblica: admin && s.stato === STATI.PUBBLICATA,
  };
}

async function isAccreditato(db: Db, schedaId: number, user: SessionUser | undefined): Promise<boolean> {
  if (!user) return false;
  const row = await selectOne(db, 'SELECT 1 AS ok FROM tds_users_schede WHERE id_scheda = ? AND id_user = ?', [schedaId, user.id]);
  return !!row;
}

async function loadRow(db: Db, id: number, forUpdate = false): Promise<SchedaRow> {
  const row = await selectOne<SchedaRow>(db, `SELECT * FROM schede WHERE id = ?${forUpdate ? ' FOR UPDATE' : ''}`, [id]);
  if (!row) throw notFound('Scheda non trovata');
  return row;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

export interface SchedaCompleta extends Omit<SchedaRow, 'note_schedatore'> {
  note_schedatore?: string | null;
  stato_label: string;
  /** Public address (/opere/...), valid only if the record is published */
  percorso: string;
  schedatori: { id: number; username: string; display_name: string | null }[];
  cronologie: Record<string, unknown>[];
  inventari: Record<string, unknown>[];
  misure: (Record<string, unknown> & { misure: Record<string, unknown>[] })[];
  documentazioni_fotografiche: { id: number; riferimento: string }[];
  immagini: { id: number; codice: string; didascalia: string | null; mime: string; larghezza: number | null; altezza: number | null }[];
  revisioni?: { azione: string; commento: string | null; created_at: Date; username: string | null }[];
  permessi: Permessi;
  voci: Record<VocabKey, VocabItem[]>;
}

/** Record with all its linked data, if the user can see it (404 otherwise). */
export async function getScheda(id: number, user?: SessionUser): Promise<SchedaCompleta> {
  const row = await loadRow(pool, id);
  const permessi = computePermessi(row, user, await isAccreditato(pool, id, user));
  // 404 rather than 403: does not reveal the existence of other users' drafts
  if (!permessi.visualizza) throw notFound('Scheda non trovata');
  const riservato = permessi.modifica || permessi.approva || !!user?.isAdmin || row.created_by === user?.id;

  const [schedatori, cronologie, inventari, gruppi, misure, documentazioni, immagini, revisioni, ...voci] = await Promise.all([
    select<{ id: number; username: string; display_name: string | null }>(
      pool,
      `SELECT u.id, u.username, u.display_name FROM tds_users_schede t JOIN users u ON u.id = t.id_user
        WHERE t.id_scheda = ? ORDER BY t.data_modifica`,
      [id],
    ),
    select<Record<string, unknown>>(
      pool,
      `SELECT ambito_storico, etichetta_data, giorno_data_da, mese_data_da, anno_data_da, giorno_data_a, mese_data_a, anno_data_a
         FROM cronologie WHERE id_scheda = ? ORDER BY ordine, id`,
      [id],
    ),
    select<Record<string, unknown>>(
      pool,
      'SELECT numero_inventario, nome_inventario, descrizione FROM inventari WHERE id_scheda = ? ORDER BY ordine, id',
      [id],
    ),
    select<Record<string, unknown> & { id: number }>(
      pool,
      'SELECT id, titolo_gruppo_misure, intero_parziale, note FROM gruppi_misure WHERE id_scheda = ? ORDER BY ordine, id',
      [id],
    ),
    select<Record<string, unknown> & { id_gruppo_misure: number }>(
      pool,
      `SELECT m.id_gruppo_misure, m.direzione, m.tipo, m.valore, m.unita_di_misura
         FROM misure m JOIN gruppi_misure g ON g.id = m.id_gruppo_misure
        WHERE g.id_scheda = ? ORDER BY m.ordine, m.id`,
      [id],
    ),
    select<{ id: number; riferimento: string }>(
      pool,
      'SELECT id, riferimento_bibliografico AS riferimento FROM documentazioniFotografiche WHERE id_scheda = ? ORDER BY ordine, id',
      [id],
    ),
    select<{ id: number; codice: string; didascalia: string | null; mime: string; larghezza: number | null; altezza: number | null }>(
      pool,
      'SELECT id, codice, didascalia, mime, larghezza, altezza FROM immagini WHERE id_scheda = ? ORDER BY ordine, id',
      [id],
    ),
    riservato
      ? select<{ azione: string; commento: string | null; created_at: Date; username: string | null }>(
          pool,
          `SELECT r.azione, r.commento, r.created_at, COALESCE(u.display_name, u.username) AS username
             FROM schede_revisioni r LEFT JOIN users u ON u.id = r.id_user
            WHERE r.id_scheda = ? ORDER BY r.created_at DESC, r.id DESC`,
          [id],
        )
      : Promise.resolve(undefined),
    ...VOCAB_KEYS.map((k) => linkedTo(pool, id, VOCABOLARI[k])),
  ]);

  // HTML is sanitized on read too: imported data never went through the sanitizer
  const { note_schedatore, ...rest } = row;
  for (const k of VOCAB_KEYS) {
    const v = VOCABOLARI[k];
    const inlineFields = v.fields.filter((f) => f.type === 'inline').map((f) => f.name);
    for (const item of voci[VOCAB_KEYS.indexOf(k)]) for (const f of inlineFields) item[f] = cleanHtml(item[f] as string | null, 'inline');
  }
  for (const d of documentazioni) d.riferimento = cleanHtml(d.riferimento, 'inline') ?? '';
  return {
    ...rest,
    titolo_opera: cleanHtml(row.titolo_opera, 'inline') ?? '',
    descrizione_sintetica: cleanHtml(row.descrizione_sintetica, 'block'),
    iscrizioni: cleanHtml(row.iscrizioni, 'block'),
    storia_espositiva: cleanHtml(row.storia_espositiva, 'block'),
    corpo_scheda: cleanHtml(row.corpo_scheda, 'block'),
    ...(riservato ? { note_schedatore } : {}),
    stato_label: STATO_LABEL[row.stato] ?? 'Sconosciuto',
    percorso: percorsoOpera(row.titolo_testo, row.codice),
    schedatori,
    cronologie,
    inventari,
    misure: gruppi.map(({ id: gid, ...g }) => ({
      ...g,
      misure: misure.filter((m) => m.id_gruppo_misure === gid).map(({ id_gruppo_misure: _g, ...m }) => m),
    })),
    documentazioni_fotografiche: documentazioni,
    immagini,
    revisioni,
    permessi,
    voci: Object.fromEntries(VOCAB_KEYS.map((k, i) => [k, voci[i]])) as Record<VocabKey, VocabItem[]>,
  };
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

async function logRevisione(db: Db, schedaId: number, user: SessionUser, azione: string, commento: string | null = null) {
  await execute(db, 'INSERT INTO schede_revisioni (id_scheda, id_user, azione, commento) VALUES (?, ?, ?, ?)', [
    schedaId,
    user.id,
    azione,
    commento,
  ]);
}

async function replaceChildren(conn: PoolConnection, schedaId: number, input: SchedaInput) {
  await execute(conn, 'DELETE FROM cronologie WHERE id_scheda = ?', [schedaId]);
  for (const [ordine, c] of input.cronologie.entries()) {
    await execute(
      conn,
      `INSERT INTO cronologie (id_scheda, ordine, ambito_storico, etichetta_data, giorno_data_da, mese_data_da, anno_data_da,
                               giorno_data_a, mese_data_a, anno_data_a)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [schedaId, ordine, c.ambito_storico, c.etichetta_data, c.giorno_data_da, c.mese_data_da, c.anno_data_da, c.giorno_data_a, c.mese_data_a, c.anno_data_a],
    );
  }

  await execute(conn, 'DELETE FROM inventari WHERE id_scheda = ?', [schedaId]);
  for (const [ordine, i] of input.inventari.entries()) {
    await execute(conn, 'INSERT INTO inventari (id_scheda, ordine, numero_inventario, nome_inventario, descrizione) VALUES (?, ?, ?, ?, ?)', [
      schedaId,
      ordine,
      i.numero_inventario,
      i.nome_inventario,
      i.descrizione,
    ]);
  }

  // Measurements are cascade-deleted with their group
  await execute(conn, 'DELETE FROM gruppi_misure WHERE id_scheda = ?', [schedaId]);
  for (const [ordine, g] of input.misure.entries()) {
    const res = await execute(
      conn,
      'INSERT INTO gruppi_misure (id_scheda, ordine, titolo_gruppo_misure, intero_parziale, note) VALUES (?, ?, ?, ?, ?)',
      [schedaId, ordine, g.titolo_gruppo_misure, g.intero_parziale, g.note],
    );
    for (const [ordineMisura, m] of g.misure.entries()) {
      await execute(
        conn,
        'INSERT INTO misure (id_gruppo_misure, ordine, direzione, tipo, valore, unita_di_misura) VALUES (?, ?, ?, ?, ?, ?)',
        [res.insertId, ordineMisura, m.direzione, m.tipo, m.valore, m.unita_di_misura],
      );
    }
  }

  await execute(conn, 'DELETE FROM documentazioniFotografiche WHERE id_scheda = ?', [schedaId]);
  for (const [ordine, d] of input.documentazioni_fotografiche.entries()) {
    await execute(conn, 'INSERT INTO documentazioniFotografiche (id_scheda, ordine, riferimento_bibliografico) VALUES (?, ?, ?)', [
      schedaId,
      ordine,
      d.riferimento,
    ]);
  }
}

/** Links the given (already uploaded) images and removes those taken off the record. */
async function syncImmagini(conn: PoolConnection, schedaId: number, input: SchedaInput, user: SessionUser) {
  const ids = [...new Set(input.immagini.map((i) => i.id))];
  if (ids.length) {
    const rows = await select<{ id: number; id_scheda: number | null; uploaded_by: number | null }>(
      conn,
      'SELECT id, id_scheda, uploaded_by FROM immagini WHERE id IN (?) FOR UPDATE',
      [ids],
    );
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const id of ids) {
      const r = byId.get(id);
      const usable = r && (r.id_scheda === schedaId || (r.id_scheda === null && (r.uploaded_by === user.id || user.isAdmin)));
      if (!usable) throw badRequest(`Immagine ${id} non disponibile: caricarla di nuovo`);
    }
    await execute(conn, 'DELETE FROM immagini WHERE id_scheda = ? AND id NOT IN (?)', [schedaId, ids]);
  } else {
    await execute(conn, 'DELETE FROM immagini WHERE id_scheda = ?', [schedaId]);
  }
  const seen = new Set<number>();
  let ordine = 0;
  for (const img of input.immagini) {
    if (seen.has(img.id)) continue;
    seen.add(img.id);
    await execute(conn, 'UPDATE immagini SET id_scheda = ?, ordine = ?, didascalia = ? WHERE id = ?', [schedaId, ordine++, img.didascalia, img.id]);
  }
}

/** Only the record's own images are kept in text fields. */
async function conImmaginiDellaScheda(db: Db, input: SchedaInput): Promise<SchedaInput> {
  const ids = input.immagini.map((i) => i.id);
  const righe = ids.length ? await select<{ codice: string }>(db, 'SELECT codice FROM immagini WHERE id IN (?)', [ids]) : [];
  const codici = new Set(righe.map((r) => r.codice));
  return {
    ...input,
    descrizione_sintetica: soloImmagini(input.descrizione_sintetica, codici),
    iscrizioni: soloImmagini(input.iscrizioni, codici),
    storia_espositiva: soloImmagini(input.storia_espositiva, codici),
    corpo_scheda: soloImmagini(input.corpo_scheda, codici),
  };
}

function schedaColumns(input: SchedaInput) {
  return [
    input.titolo_opera,
    htmlToText(input.titolo_opera).slice(0, 500),
    input.classificazione,
    input.descrizione_sintetica,
    input.iscrizioni,
    input.storia_espositiva,
    input.corpo_scheda,
    input.note_schedatore,
  ];
}

export async function createScheda(dati: SchedaInput, user: SessionUser): Promise<number> {
  if (user.isAdmin) throw forbidden(MESSAGGIO_SOLO_SCHEDATORI);
  return withTransaction(async (conn) => {
    const input = await conImmaginiDellaScheda(conn, dati);
    const res = await execute(
      conn,
      `INSERT INTO schede (codice, titolo_opera, titolo_testo, classificazione, descrizione_sintetica, iscrizioni, storia_espositiva,
                           corpo_scheda, note_schedatore, stato, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [generaCodice(LUNGHEZZA_CODICE_OPERA), ...schedaColumns(input), STATI.BOZZA, user.id],
    );
    const id = res.insertId;
    await execute(conn, 'INSERT INTO tds_users_schede (id_user, id_scheda, data_modifica) VALUES (?, ?, NOW())', [user.id, id]);
    await replaceChildren(conn, id, input);
    await syncImmagini(conn, id, input, user);
    for (const k of VOCAB_KEYS) await linkScheda(conn, id, VOCABOLARI[k], input[k]);
    await logRevisione(conn, id, user, 'creata');
    return id;
  });
}

export async function updateScheda(id: number, dati: SchedaInput, user: SessionUser): Promise<void> {
  await withTransaction(async (conn) => {
    const input = await conImmaginiDellaScheda(conn, dati);
    const row = await loadRow(conn, id, true);
    const permessi = computePermessi(row, user, await isAccreditato(conn, id, user));
    if (!permessi.visualizza) throw notFound('Scheda non trovata');
    if (!permessi.modifica) throw forbidden('La scheda non è modificabile nel suo stato attuale');

    await execute(
      conn,
      `UPDATE schede SET titolo_opera = ?, titolo_testo = ?, classificazione = ?, descrizione_sintetica = ?, iscrizioni = ?,
                         storia_espositiva = ?, corpo_scheda = ?, note_schedatore = ?, updated_at = NOW()
        WHERE id = ?`,
      [...schedaColumns(input), id],
    );
    await execute(conn, 'UPDATE tds_users_schede SET data_modifica = NOW() WHERE id_scheda = ? AND id_user = ?', [id, user.id]);
    await replaceChildren(conn, id, input);
    await syncImmagini(conn, id, input, user);
    for (const k of VOCAB_KEYS) await linkScheda(conn, id, VOCABOLARI[k], input[k]);
    await logRevisione(conn, id, user, 'modificata');
  });
}

export async function deleteScheda(id: number, user: SessionUser): Promise<void> {
  await withTransaction(async (conn) => {
    const row = await loadRow(conn, id, true);
    const permessi = computePermessi(row, user, await isAccreditato(conn, id, user));
    if (!permessi.visualizza) throw notFound('Scheda non trovata');
    if (!permessi.elimina) throw forbidden('La scheda non può essere eliminata nel suo stato attuale');
    // Own data, links, images and history are cascade-deleted
    await execute(conn, 'DELETE FROM schede WHERE id = ?', [id]);
  });
}

const TRANSIZIONI: Record<Azione, { stato: number; registro: string }> = {
  invia: { stato: STATI.IN_REVISIONE, registro: 'inviata' },
  ritira: { stato: STATI.BOZZA, registro: 'ritirata' },
  approva: { stato: STATI.PUBBLICATA, registro: 'approvata' },
  respingi: { stato: STATI.BOZZA, registro: 'respinta' },
  depubblica: { stato: STATI.BOZZA, registro: 'depubblicata' },
};

/** A record sent back must reach someone who can work on it. */
async function haSchedatore(db: Db, id: number): Promise<boolean> {
  const row = await selectOne(
    db,
    `SELECT 1 AS ok FROM users u
      WHERE u.id IN (SELECT created_by FROM schede WHERE id = ? UNION SELECT id_user FROM tds_users_schede WHERE id_scheda = ?)
        AND COALESCE(u.isAdmin, '0') NOT IN ('1', 'true')
      LIMIT 1`,
    [id, id],
  );
  return !!row;
}

export async function cambiaStato(id: number, azione: Azione, user: SessionUser, commento: string | null): Promise<number> {
  if (azione === 'respingi' && !commento) throw badRequest('Indicare il motivo del rifiuto: lo schedatore lo vedrà nella sua area');
  if (azione === 'depubblica' && !commento) throw badRequest('Scrivi un messaggio per lo schedatore: spiega perché la scheda torna indietro');
  return withTransaction(async (conn) => {
    const row = await loadRow(conn, id, true);
    const permessi = computePermessi(row, user, await isAccreditato(conn, id, user));
    if (!permessi.visualizza) throw notFound('Scheda non trovata');
    const soloAdmin = azione === 'approva' || azione === 'respingi' || azione === 'depubblica';
    if (soloAdmin && !user.isAdmin) throw forbidden('Riservato agli amministratori');
    if (!permessi[azione]) {
      throw user.isAdmin || row.created_by === user.id
        ? conflict(`Operazione non possibile: la scheda è "${STATO_LABEL[row.stato]}"`)
        : forbidden();
    }
    if ((azione === 'respingi' || azione === 'depubblica') && !(await haSchedatore(conn, id))) {
      throw conflict('Nessuno schedatore può riprendere questa scheda: chiedi a uno schedatore di farsene carico prima di rimandarla indietro');
    }
    const { stato, registro } = TRANSIZIONI[azione];
    // "Published" is reached only through approval; any other transition revokes it
    await execute(conn, 'UPDATE schede SET stato = ?, updated_at = NOW(), published_at = IF(? = 2, NOW(), NULL) WHERE id = ?', [
      stato,
      stato,
      id,
    ]);
    await logRevisione(conn, id, user, registro, commento);
    return stato;
  });
}

// ---------------------------------------------------------------------------
// Lists for the restricted area
// ---------------------------------------------------------------------------

export interface SchedaSintesi {
  id: number;
  codice: string;
  percorso: string;
  titolo_opera: string;
  titolo_testo: string;
  stato: number;
  stato_label: string;
  updated_at: Date;
  autore_scheda: string | null;
  copertina: string | null;
  ultima_azione: string | null;
  ultimo_commento: string | null;
  ultima_azione_il: Date | null;
}

const SINTESI_SELECT = `
  SELECT s.id, s.codice, s.titolo_opera, s.titolo_testo, s.stato, s.updated_at,
         COALESCE(u.display_name, u.username) AS autore_scheda,
         (SELECT i.codice FROM immagini i WHERE i.id_scheda = s.id ORDER BY i.ordine, i.id LIMIT 1) AS copertina,
         r.azione AS ultima_azione, r.commento AS ultimo_commento, r.created_at AS ultima_azione_il
    FROM schede s
    LEFT JOIN users u ON u.id = s.created_by
    LEFT JOIN schede_revisioni r ON r.id = (SELECT r2.id FROM schede_revisioni r2 WHERE r2.id_scheda = s.id
                                             ORDER BY r2.created_at DESC, r2.id DESC LIMIT 1)`;

const withLabel = (rows: Omit<SchedaSintesi, 'stato_label' | 'percorso'>[]): SchedaSintesi[] =>
  rows.map((r) => ({ ...r, stato_label: STATO_LABEL[r.stato] ?? '', percorso: percorsoOpera(r.titolo_testo, r.codice) }));

/** Internal artwork ID from its public code. */
export async function idDaCodice(codice: string): Promise<number | null> {
  const row = await selectOne<{ id: number }>(pool, 'SELECT id FROM schede WHERE codice = ?', [codice]);
  return row?.id ?? null;
}

export async function listMie(user: SessionUser): Promise<SchedaSintesi[]> {
  return withLabel(
    await select(
      pool,
      `${SINTESI_SELECT}
       WHERE s.created_by = ? OR EXISTS (SELECT 1 FROM tds_users_schede t WHERE t.id_scheda = s.id AND t.id_user = ?)
       ORDER BY s.updated_at DESC`,
      [user.id, user.id],
    ),
  );
}

export async function listPerStato(stato: number): Promise<SchedaSintesi[]> {
  return withLabel(await select(pool, `${SINTESI_SELECT} WHERE s.stato = ? ORDER BY s.updated_at ASC`, [stato]));
}

export async function contaPerStato(): Promise<Record<number, number>> {
  const rows = await select<{ stato: number; n: number }>(pool, 'SELECT stato, COUNT(*) AS n FROM schede GROUP BY stato');
  return Object.fromEntries(rows.map((r) => [r.stato, Number(r.n)]));
}
