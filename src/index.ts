import { createApp } from './app';
import { config } from './config';
import { runMigrations } from './db/migrate';
import { pool, waitForDatabase } from './db/pool';
import { logger } from './logger';
import { pulisciImmaginiOrfane } from './services/immagini.service';

async function main(): Promise<void> {
  await waitForDatabase();
  if (config.migrateOnStart) await runMigrations();

  await pulisciImmaginiOrfane();
  const cleanup = setInterval(pulisciImmaginiOrfane, 60 * 60 * 1000);
  cleanup.unref();

  const server = createApp().listen(config.port, () => {
    logger.info(`LUMiNA in ascolto sulla porta ${config.port} (${config.isProduction ? 'produzione' : 'sviluppo'})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} ricevuto: chiusura in corso`);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Avvio non riuscito', error);
  process.exit(1);
});
