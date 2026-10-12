import { randomInt } from 'crypto';
import { htmlToText } from './html';

/**
 * Public identifiers that are non-sequential and not guessable.
 *
 * Numeric database IDs stay internal (staff area): in the public catalogue,
 * works and images can only be reached via a random code, so they cannot be
 * enumerated (/scheda/1, /scheda/2, ...) to copy them.
 */

/** 31 symbols with no ambiguous characters (0/o, 1/l/i). */
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';

export const LUNGHEZZA_CODICE_OPERA = 10; // ~49 bit
export const LUNGHEZZA_CODICE_IMMAGINE = 16; // ~79 bit

export function generaCodice(lunghezza: number): string {
  let codice = '';
  for (let i = 0; i < lunghezza; i++) codice += ALFABETO[randomInt(ALFABETO.length)];
  return codice;
}

export const CODICE_OPERA = new RegExp(`^[${ALFABETO}]{${LUNGHEZZA_CODICE_OPERA}}$`);
export const CODICE_IMMAGINE = new RegExp(`^[${ALFABETO}]{${LUNGHEZZA_CODICE_IMMAGINE}}$`);

/** First words of the title, without accents or punctuation (at most ~50 characters). */
export function slugTitolo(titolo: string): string {
  const parole = htmlToText(titolo)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  let slug = '';
  for (const parola of parole) {
    const candidato = slug ? `${slug}-${parola}` : parola;
    if (candidato.length > 50) break;
    slug = candidato;
  }
  return slug || 'opera';
}

/** Public address of a work: /opere/<first-words-of-the-title>-<code>. */
export function percorsoOpera(titolo: string, codice: string): string {
  return `/opere/${slugTitolo(titolo)}-${codice}`;
}

/** Extracts the code from the last path segment; the descriptive part is ignored. */
export function codiceDaPercorso(segmento: string): string | null {
  const codice = segmento.slice(segmento.lastIndexOf('-') + 1);
  return CODICE_OPERA.test(codice) ? codice : null;
}
