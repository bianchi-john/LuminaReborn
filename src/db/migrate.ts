import fs from 'fs/promises';
import path from 'path';
import mysql from 'mysql2/promise';
import { config, ROOT_DIR } from '../config';
import { logger } from '../logger';

const MIGRATIONS_DIR = path.join(ROOT_DIR, 'migrations');

/**
 * Applica in ordine i file `migrations/NNN_*.sql` non ancora eseguiti.
 * Usa una connessione dedicata con `multipleStatements` (mai abilitato sul pool
 * applicativo) e registra ogni migrazione in `schema_migrations`.
 * Le DDL di MySQL non sono transazionali: fare un backup prima di aggiornare.
 */
export async function runMigrations(): Promise<void> {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    charset: 'utf8mb4_0900_ai_ci',
    multipleStatements: true,
  });

  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(191) PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    // Un solo processo alla volta (es. più repliche avviate insieme)
    const [[lock]] = await conn.query<mysql.RowDataPacket[]>("SELECT GET_LOCK('lumina_migrations', 120) AS ok");
    if (!lock?.ok) throw new Error('Impossibile ottenere il lock per le migrazioni');

    const [appliedRows] = await conn.query<mysql.RowDataPacket[]>('SELECT version FROM schema_migrations');
    const applied = new Set(appliedRows.map((r) => String(r.version)));
    const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      logger.info(`Migrazione database: applico ${file}`);
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await conn.query(sql);
      } catch (error) {
        logger.error(`Migrazione ${file} fallita: ripristinare il backup prima di riprovare`, error);
        throw error;
      }
      await conn.query('INSERT INTO schema_migrations (version) VALUES (?)', [file]);
      logger.info(`Migrazione database: ${file} completata`);
    }
    await conn.query("SELECT RELEASE_LOCK('lumina_migrations')");
  } finally {
    await conn.end();
  }
}
