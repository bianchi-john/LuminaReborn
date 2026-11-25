// eliminaScheda.ts
//
// Eliminazione completa di una scheda, usata sia dallo schedatore (bozze) sia
// dall'amministratore (schede pubblicate).
//
// Cancellare la riga di `schede` basta a togliere i collegamenti (ON DELETE
// CASCADE sulle tabelle tds_*), ma lascerebbe nel database le righe che
// appartenevano solo a quella scheda: immagini, misure, cronologie, inventari,
// stato... Qui si tolgono anche quelle, e le voci condivise (autori, materiali,
// ecc.) che non sono più usate da nessun'altra scheda, così non restano tra i
// suggerimenti del modulo. Tutto avviene in un'unica transazione.
import { RowDataPacket } from 'mysql2';
import { connection } from '../config/mysql.config';

/** Tabella collegata alla scheda tramite una tabella ponte tds_schede_*. */
type Collegata = { tabella: string; ponte: string; colonna: string };

// Prima le voci proprie della scheda, poi quelle condivise: per tutte vale la
// stessa regola (si cancellano solo se nessun'altra scheda le usa ancora).
const COLLEGATE: Collegata[] = [
  { tabella: 'statoScheda', ponte: 'tds_schede_statoScheda', colonna: 'id_stato' },
  { tabella: 'cronologie', ponte: 'tds_schede_cronologie', colonna: 'id_cronologia' },
  { tabella: 'inventari', ponte: 'tds_schede_inventari', colonna: 'id_inventario' },
  { tabella: 'immagini', ponte: 'tds_schede_immagini', colonna: 'id_immagine' },
  { tabella: 'documentazioniFotografiche', ponte: 'tds_schede_documentazioniFotografiche', colonna: 'id_documentazioneFotografica' },
  { tabella: 'autori', ponte: 'tds_schede_autori', colonna: 'id_autore' },
  { tabella: 'materiali', ponte: 'tds_schede_materiali', colonna: 'id_materiale' },
  { tabella: 'tecniche', ponte: 'tds_schede_tecniche', colonna: 'id_tecnica' },
  { tabella: 'ubicazioni', ponte: 'tds_schede_ubicazioni', colonna: 'id_ubicazione' },
  { tabella: 'provenienze', ponte: 'tds_schede_provenienze', colonna: 'id_provenienza' },
  { tabella: 'mostre', ponte: 'tds_schede_mostre', colonna: 'id_mostra' },
  { tabella: 'bibliografie', ponte: 'tds_schede_bibliografie', colonna: 'id_bibliografia' },
  { tabella: 'altreBibliografie', ponte: 'tds_schede_altreBibliografie', colonna: 'id_altreBibliografie' },
];

/** Elimina la scheda e tutto ciò che resta senza schede. Restituisce false se la scheda non esiste. */
export async function eliminaScheda(schedaId: number): Promise<boolean> {
  const pool = await connection();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Prima di cancellare si annotano le voci collegate a questa scheda
    const daControllare = new Map<Collegata, number[]>();
    for (const c of COLLEGATE) {
      const [righe] = await conn.query(`SELECT \`${c.colonna}\` AS id FROM \`${c.ponte}\` WHERE id_scheda = ?`, [schedaId]);
      daControllare.set(c, (righe as RowDataPacket[]).map((r) => r.id).filter((id) => id !== null));
    }
    const [gruppiRighe] = await conn.query('SELECT id_gruppo_misure AS id FROM tds_schede_misure WHERE id_scheda = ?', [schedaId]);
    const gruppi = (gruppiRighe as RowDataPacket[]).map((r) => r.id).filter((id) => id !== null);

    // 2. La scheda: i collegamenti tds_* spariscono da soli (ON DELETE CASCADE)
    const [esito] = await conn.query('DELETE FROM schede WHERE id = ?', [schedaId]);
    if ((esito as { affectedRows: number }).affectedRows === 0) {
      await conn.rollback();
      return false;
    }

    // 3. Le voci rimaste senza schede
    for (const [c, ids] of daControllare) {
      if (!ids.length) continue;
      await conn.query(
        `DELETE FROM \`${c.tabella}\` WHERE id IN (?) AND NOT EXISTS (SELECT 1 FROM \`${c.ponte}\` p WHERE p.\`${c.colonna}\` = \`${c.tabella}\`.id)`,
        [ids],
      );
    }
    // Le misure stanno in gruppi; si tolgono le misure e poi i gruppi rimasti senza schede
    if (gruppi.length) {
      await conn.query(
        'DELETE FROM misure WHERE id_gruppo_misure IN (?) AND NOT EXISTS (SELECT 1 FROM tds_schede_misure p WHERE p.id_gruppo_misure = misure.id_gruppo_misure)',
        [gruppi],
      );
      await conn.query(
        'DELETE FROM tds_schede_gruppo_misure WHERE id IN (?) AND NOT EXISTS (SELECT 1 FROM tds_schede_misure p WHERE p.id_gruppo_misure = tds_schede_gruppo_misure.id)',
        [gruppi],
      );
    }

    await conn.commit();
    return true;
  } catch (errore) {
    await conn.rollback();
    throw errore;
  } finally {
    conn.release();
  }
}
