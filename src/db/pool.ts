import mysql, { Connection, Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { config } from '../config';
import { logger } from '../logger';

/** Unico pool di connessioni per tutta l'applicazione. */
export const pool: Pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: config.db.connectionLimit,
  charset: 'utf8mb4_0900_ai_ci',
  waitForConnections: true,
  decimalNumbers: true,
  dateStrings: false,
  timezone: 'Z',
});

/** Esecutore di query: il pool oppure una connessione dentro una transazione. */
export type Db = Pool | Connection;

export async function select<T>(db: Db, sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await db.query<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

export async function selectOne<T>(db: Db, sql: string, params: unknown[] = []): Promise<T | undefined> {
  const rows = await select<T>(db, sql, params);
  return rows[0];
}

export async function execute(db: Db, sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await db.query<ResultSetHeader>(sql, params);
  return result;
}

/** Esegue `fn` in una transazione: commit se va a buon fine, rollback altrimenti. */
export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback().catch(() => undefined);
    throw error;
  } finally {
    conn.release();
  }
}

/** Attende che MySQL accetti connessioni (al primo avvio l'inizializzazione può richiedere tempo). */
export async function waitForDatabase(attempts = 60, delayMs = 2000): Promise<void> {
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (i === attempts) throw error;
      logger.info(`Database non ancora disponibile (tentativo ${i}/${attempts})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
