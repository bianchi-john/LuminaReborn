/* Photo catalogue export: `make export-foto` (inside the container) or `npx tsx src/cli/esporta-foto.ts [originale|anteprima] [tutte|pubblicate]`. */
import { config } from '../config';
import { pool } from '../db/pool';
import { esportaFotoInCartella } from '../services/foto.service';

const variante = process.argv[2] === 'anteprima' ? 'anteprima' : 'originale';
const ambito = process.argv[3] === 'pubblicate' ? 'pubblicate' : 'tutte';

esportaFotoInCartella(config.export.fotoDir || 'backups/foto', { variante, ambito, baseUrl: config.allowedOrigins[0] ?? '' })
  .then((file) => console.log(`Esportazione delle foto creata: ${file}`))
  .catch((error) => {
    console.error('Esportazione delle foto non riuscita', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
