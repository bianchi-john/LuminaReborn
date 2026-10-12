import fs from 'fs/promises';
import path from 'path';
import mysql, { Connection } from 'mysql2/promise';
import { config, ROOT_DIR } from '../config';
import { logger } from '../logger';
import { CODE_MIGRATIONS } from './codeMigrations';

const MIGRATIONS_DIR = path.join(ROOT_DIR, 'migrations');

interface Migration {
  version: string;
  run: (conn: Connection) => Promise<void>;
}

/** In SQL files, {{MAIN_DB}} and {{MEDIA_DB}} become the configured database names. */
function expand(sql: string): string {
  return sql.replace(/\{\{MAIN_DB\}\}/g, config.db.database).replace(/\{\{MEDIA_DB\}\}/g, config.db.mediaDatabase);
}

async function loadMigrations(): Promise<Migration[]> {
  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => /^\d+_.+\.sql$/.test(f));
  const sqlMigrations: Migration[] = files.map((file) => ({
    version: file,
    run: async (conn) => {
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await conn.query(expand(sql));
    },
  }));
  const codeMigrations: Migration[] = Object.entries(CODE_MIGRATIONS).map(([version, run]) => ({ version, run }));
  return [...sqlMigrations, ...codeMigrations].sort((a, b) => a.version.localeCompare(b.version));
}

/**
 * Applies pending migrations in order: the `migrations/NNN_*.sql` files
 * and the code steps in `codeMigrations.ts` (e.g. image processing).
 * Uses a dedicated connection with `multipleStatements` (never enabled on the
 * application pool) and records each migration in `schema_migrations`.
 * MySQL DDL is not transactional: take a backup before upgrading.
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
    // Only one process at a time (e.g. several replicas started together)
    const [[lock]] = await conn.query<mysql.RowDataPacket[]>("SELECT GET_LOCK('lumina_migrations', 300) AS ok");
    if (!lock?.ok) throw new Error('Impossibile ottenere il lock per le migrazioni');

    const [appliedRows] = await conn.query<mysql.RowDataPacket[]>('SELECT version FROM schema_migrations');
    const applied = new Set(appliedRows.map((r) => String(r.version)));

    for (const migration of await loadMigrations()) {
      if (applied.has(migration.version)) continue;
      logger.info(`Migrazione database: applico ${migration.version}`);
      try {
        await migration.run(conn);
      } catch (error) {
        logger.error(`Migrazione ${migration.version} fallita: ripristinare il backup prima di riprovare`, error);
        if ((error as { code?: string }).code === 'ER_DBACCESS_DENIED_ERROR' || (error as { code?: string }).code === 'ER_TABLEACCESS_DENIED_ERROR') {
          logger.error(`L'utente ${config.db.user} non ha accesso al database ${config.db.mediaDatabase}: eseguire scripts/grant-media.sh`);
        }
        throw error;
      }
      await conn.query('INSERT INTO schema_migrations (version) VALUES (?)', [migration.version]);
      logger.info(`Migrazione database: ${migration.version} completata`);
    }
    await conn.query("SELECT RELEASE_LOCK('lumina_migrations')");
  } finally {
    await conn.end();
  }
}
