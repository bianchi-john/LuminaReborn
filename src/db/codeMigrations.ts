import { Connection, RowDataPacket } from 'mysql2/promise';
import { createHash } from 'crypto';
import { logger } from '../logger';
import { config } from '../config';
import { creaAnteprima, elaboraImmagine, salvaFile } from '../services/immagini.service';
import { generaCodice, LUNGHEZZA_CODICE_IMMAGINE, LUNGHEZZA_CODICE_OPERA } from '../util/codici';

/**
 * Migrations that require code (not just SQL). The name determines the order
 * together with the files in migrations/ and is recorded in schema_migrations.
 */
export const CODE_MIGRATIONS: Record<string, (conn: Connection) => Promise<void>> = {
  /**
   * Moves image bytes into the media database, generating preview and
   * thumbnail. One image at a time, so as not to load everything into memory.
   */
  async '003_immagini_nel_database_media'(conn) {
    const [ids] = await conn.query<RowDataPacket[]>('SELECT id FROM immagini WHERE dati IS NOT NULL ORDER BY id');
    let fatte = 0;
    for (const { id } of ids) {
      const [[row]] = await conn.query<RowDataPacket[]>('SELECT dati FROM immagini WHERE id = ?', [id]);
      const dati = row.dati as Buffer;
      try {
        const files = await elaboraImmagine(dati);
        await conn.beginTransaction();
        await salvaFile(conn, id, files);
        await conn.query('UPDATE immagini SET mime = ?, larghezza = ?, altezza = ?, dimensione = ?, sha256 = ?, dati = NULL WHERE id = ?', [
          files[0].mime,
          files[0].larghezza,
          files[0].altezza,
          dati.length,
          createHash('sha256').update(dati).digest('hex'),
          id,
        ]);
        await conn.commit();
        fatte++;
      } catch (error) {
        await conn.rollback().catch(() => undefined);
        // An unreadable file must not block startup: it is removed and reported in the logs
        logger.warn(`Immagine ${id} non elaborabile, rimossa`, error instanceof Error ? error.message : error);
        await conn.query('DELETE FROM immagini WHERE id = ?', [id]);
      }
    }
    logger.info(`Immagini spostate nel database media: ${fatte}`);
  },

  /** Regenerates the public previews from the originals, adding the watermark. */
  async '005_watermark_anteprime'(conn) {
    const media = `\`${config.db.mediaDatabase}\`.immagini_file`;
    const [ids] = await conn.query<RowDataPacket[]>(`SELECT id_immagine AS id FROM ${media} WHERE variante = 'originale' ORDER BY id_immagine`);
    for (const { id } of ids) {
      const [[row]] = await conn.query<RowDataPacket[]>(`SELECT dati FROM ${media} WHERE id_immagine = ? AND variante = 'originale'`, [id]);
      try {
        await salvaFile(conn, id, [await creaAnteprima(row.dati as Buffer)]);
      } catch (error) {
        logger.warn(`Anteprima ${id} non rigenerata`, error instanceof Error ? error.message : error);
      }
    }
    logger.info(`Anteprime con watermark: ${ids.length}`);
  },

  /** Random public codes for works and images (non-sequential addresses). */
  async '006_codici_pubblici'(conn) {
    for (const [tabella, lunghezza] of [
      ['schede', LUNGHEZZA_CODICE_OPERA],
      ['immagini', LUNGHEZZA_CODICE_IMMAGINE],
    ] as const) {
      const [colonne] = await conn.query<RowDataPacket[]>(`SHOW COLUMNS FROM ${tabella} LIKE 'codice'`);
      if (!colonne.length) await conn.query(`ALTER TABLE ${tabella} ADD COLUMN codice VARCHAR(16) NULL AFTER id`);
      const [righe] = await conn.query<RowDataPacket[]>(`SELECT id FROM ${tabella} WHERE codice IS NULL`);
      for (const { id } of righe) await conn.query(`UPDATE ${tabella} SET codice = ? WHERE id = ?`, [generaCodice(lunghezza), id]);
      await conn.query(`ALTER TABLE ${tabella} MODIFY codice VARCHAR(16) NOT NULL, ADD UNIQUE KEY uq_${tabella}_codice (codice)`);
    }
  },
};
