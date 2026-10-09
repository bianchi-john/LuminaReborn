/* Esportazione Excel immediata: `make export` (nel container) o `npx tsx src/cli/esporta.ts`. */
import { config } from '../config';
import { pool } from '../db/pool';
import { esportaInCartella } from '../services/export.service';

esportaInCartella(config.export.dir || 'backups/excel')
  .then((file) => console.log(`Esportazione creata: ${file}`))
  .catch((error) => {
    console.error('Esportazione non riuscita', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
