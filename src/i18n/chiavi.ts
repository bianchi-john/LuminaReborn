import fs from 'fs';
import path from 'path';
import { CATEGORIE_AUTORE, VOCABOLARI, VOCAB_KEYS } from '../domain/vocabolari';
import {
  CLASSIFICAZIONI,
  DIREZIONI_MISURA,
  INTERO_PARZIALE,
  PROPRIETA_GIURIDICA,
  STATO_LABEL,
  TIPI_MISURA,
} from '../domain/classificazioni';

/**
 * Collects all texts to translate: the t('...') calls in templates, browser
 * scripts and server, plus the labels coming from the domain (vocabularies,
 * classifications, measurements...). Used by the test that checks en.json is complete
 * and by `npm run i18n:check` to list missing keys.
 */

const CALL = /\bt\(\s*(['"`])((?:\\.|(?!\1).)*?)\1/g;
// Messages thrown by the server (translated by the error handler)
const ERROR = /\b(?:badRequest|forbidden|notFound|conflict|unauthorized)\(\s*(['"`])((?:\\.|(?!\1).)*?)\1/g;
const HTTP_ERROR = /new HttpError\(\s*\d+\s*,\s*(['"`])((?:\\.|(?!\1).)*?)\1/g;
const ZOD_MESSAGE = /message:\s*(['"`])((?:\\.|(?!\1).)*?)\1/g;
// Plurals (h.plural(n, 'one', 'many')) and alternatives inside t(cond ? 'a' : 'b')
const PLURAL = /\bplural\([^,]+,\s*(['"])((?:\\.|(?!\1).)*?)\1\s*,\s*(['"])((?:\\.|(?!\3).)*?)\3/g;
const TERNARY = /\bt\(\s*[^'"`()]*?\?\s*(['"])((?:\\.|(?!\1).)*?)\1\s*:\s*(['"])((?:\\.|(?!\3).)*?)\3/g;
// Labels used in browser scripts and later passed to t()
const LABEL_MAP = /\b(?:title|body|confirmText|ok|label):\s*(['"])((?:\\.|(?!\1).)*?)\1/g;

function walk(dir: string, exts: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p, exts);
    return exts.some((x) => p.endsWith(x)) ? [p] : [];
  });
}

const unescape = (s: string) => s.replace(/\\(['"`\\])/g, '$1');

function chiaviDaFile(files: string[]): Set<string> {
  const keys = new Set<string>();
  for (const file of files) {
    if (file.endsWith('chiavi.ts')) continue;
    const text = fs.readFileSync(file, 'utf8');
    const patterns = [CALL, ERROR, HTTP_ERROR, ZOD_MESSAGE, ...(file.includes(`${path.sep}public${path.sep}`) ? [LABEL_MAP] : [])];
    for (const re of patterns) {
      for (const m of text.matchAll(re)) {
        const key = unescape(m[2]);
        // Skip template literals with interpolations: they are not fixed keys
        if (key && !key.includes('${')) keys.add(key);
      }
    }
    for (const re of [PLURAL, TERNARY]) {
      for (const m of text.matchAll(re)) [unescape(m[2]), unescape(m[4])].forEach((k) => k && !k.includes('${') && keys.add(k));
    }
  }
  return keys;
}

/** Labels coming from the domain (vocabularies, classifications, measurements...). */
function chiaviDominio(): string[] {
  return [
    ...VOCAB_KEYS.flatMap((k) => {
      const v = VOCABOLARI[k];
      return [v.singolare, v.plurale, ...v.fields.map((f) => f.label), ...v.linkFields.map((f) => f.label)];
    }),
    ...CLASSIFICAZIONI.map((c) => c.label),
    ...Object.values(STATO_LABEL),
    ...CATEGORIE_AUTORE,
    ...DIREZIONI_MISURA,
    ...TIPI_MISURA,
    ...INTERO_PARZIALE,
    ...PROPRIETA_GIURIDICA,
  ];
}

/** All interface texts: templates, browser scripts, server and domain. */
export function chiaviDaTradurre(root: string): Set<string> {
  const files = [...walk(path.join(root, 'views'), ['.ejs']), ...walk(path.join(root, 'public', 'js'), ['.js']), ...walk(path.join(root, 'src'), ['.ts'])];
  const keys = chiaviDaFile(files);
  chiaviDominio().forEach((k) => keys.add(k));
  return keys;
}

/** Only the texts used by browser scripts: this is the dictionary embedded in pages. */
export function chiaviClient(root: string): Set<string> {
  const keys = chiaviDaFile(walk(path.join(root, 'public', 'js'), ['.js']));
  chiaviDominio().forEach((k) => keys.add(k));
  return keys;
}
