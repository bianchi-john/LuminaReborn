import { Connection, RowDataPacket } from 'mysql2/promise';
import { createHash } from 'crypto';
import { logger } from '../logger';
import { config } from '../config';
import { creaAnteprima, elaboraImmagine, salvaFile } from '../services/immagini.service';
import { generaCodice, LUNGHEZZA_CODICE_IMMAGINE, LUNGHEZZA_CODICE_OPERA } from '../util/codici';

/**
 * Migrazioni che richiedono codice (non solo SQL). Il nome determina l'ordine
 * insieme ai file di migrations/ e viene registrato in schema_migrations.
 */
export const CODE_MIGRATIONS: Record<string, (conn: Connection) => Promise<void>> = {
  /**
   * Sposta i byte delle immagini nel database media generando anteprima e
   * miniatura. Una immagine alla volta, per non caricare tutto in memoria.
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
        // Un file illeggibile non deve bloccare l'avvio: viene rimosso e segnalato nei log
        logger.warn(`Immagine ${id} non elaborabile, rimossa`, error instanceof Error ? error.message : error);
        await conn.query('DELETE FROM immagini WHERE id = ?', [id]);
      }
    }
    logger.info(`Immagini spostate nel database media: ${fatte}`);
  },

  /** Rigenera le anteprime pubbliche dagli originali aggiungendo il watermark. */
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

  /** Codici pubblici casuali per opere e immagini (indirizzi non sequenziali). */
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
