import { createPool, Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Un solo pool di connessioni per tutta l'applicazione.
// Prima ogni richiesta ne creava uno nuovo e alcune non lo chiudevano mai:
// dopo qualche decina di schede MySQL rifiutava nuove connessioni
// ("Too many connections") e il sito si bloccava per tutti.
const pool: Pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  charset: 'utf8mb4',
});

// I controller esistenti chiamano pool.end() a fine richiesta: con il pool
// condiviso non va chiuso, quindi end() qui non fa nulla.
const condiviso = new Proxy(pool, {
  get(target, prop, receiver) {
    if (prop === 'end') return async () => undefined;
    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export const connection = async (): Promise<Pool> => condiviso;
