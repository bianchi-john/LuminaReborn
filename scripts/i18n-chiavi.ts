/* Lists the translation keys missing from src/i18n/en.json: npx tsx scripts/i18n-chiavi.ts */
import path from 'path';
import { chiaviDaTradurre } from '../src/i18n/chiavi';
import en from '../src/i18n/en.json';

const root = path.resolve(__dirname, '..');
const dict = en as Record<string, string>;
const mancanti = [...chiaviDaTradurre(root)].filter((k) => !(k in dict)).sort();
console.log(JSON.stringify(Object.fromEntries(mancanti.map((k) => [k, ''])), null, 2));
console.error(`${mancanti.length} missing keys`);
