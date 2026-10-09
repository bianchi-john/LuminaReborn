import { Connection, RowDataPacket } from 'mysql2/promise';
import { createHash } from 'crypto';
import { logger } from '../logger';
import { elaboraImmagine, salvaFile } from '../services/immagini.service';

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
};
