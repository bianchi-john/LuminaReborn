import { randomInt } from 'crypto';
import { htmlToText } from './html';

/**
 * Identificativi pubblici non sequenziali e non calcolabili.
 *
 * Gli ID numerici del database restano interni (area riservata): nel catalogo
 * pubblico opere e immagini sono raggiungibili solo tramite un codice casuale,
 * quindi non si possono enumerare (/scheda/1, /scheda/2, ...) per copiarle.
 */

/** 31 simboli senza caratteri ambigui (0/o, 1/l/i). */
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

/** Prime parole del titolo, senza accenti né punteggiatura (al massimo ~50 caratteri). */
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

/** Indirizzo pubblico dell'opera: /opere/<prime-parole-del-titolo>-<codice>. */
export function percorsoOpera(titolo: string, codice: string): string {
  return `/opere/${slugTitolo(titolo)}-${codice}`;
}

/** Estrae il codice dall'ultimo segmento dell'indirizzo; la parte descrittiva è ignorata. */
export function codiceDaPercorso(segmento: string): string | null {
  const codice = segmento.slice(segmento.lastIndexOf('-') + 1);
  return CODICE_OPERA.test(codice) ? codice : null;
}
