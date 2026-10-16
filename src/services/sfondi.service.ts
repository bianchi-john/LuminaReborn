import { createHash, randomInt } from 'crypto';
import sharp from 'sharp';
import { config } from '../config';
import { pool, select } from '../db/pool';
import { logger } from '../logger';

/**
 * Home page backgrounds: a small pool of covers of published works, chosen at
 * random, blurred once on the server and kept in memory.
 *
 * - The database is read only when the pool is renewed (every few hours), never
 *   on a page view.
 * - Each visit gets the pool in a random order; the browser downloads only the
 *   first image at once and each following one shortly before its turn.
 * - Blurring here (not with a CSS filter) keeps the browser light.
 * The previous pool stays available for a while, so pages opened before a
 * renewal can still load their next image.
 */

export const DIMENSIONE_POOL = 6;
const RINNOVO_MS = 6 * 60 * 60 * 1000;
/** Same look as the old CSS blur(12px) saturate(1.25) on a full-HD screen. */
const LARGHEZZA = 1100;
const SFOCATURA = 9;

export interface Sfondo {
  dati: Buffer;
  etag: string;
}

interface Generazione {
  id: string;
  sfondi: Sfondo[];
}

let attuale: Generazione | null = null;
let precedente: Generazione | null = null;
let inCorso: Promise<void> | null = null;

/** One random cover per published work (its first image), at most `quanti`. */
async function scegliCopertine(quanti: number): Promise<number[]> {
  const righe = await select<{ id: number }>(
    pool,
    `SELECT i.id FROM immagini i JOIN schede s ON s.id = i.id_scheda
      WHERE s.stato = 2
        AND i.id = (SELECT i2.id FROM immagini i2 WHERE i2.id_scheda = s.id ORDER BY i2.ordine, i2.id LIMIT 1)
      ORDER BY RAND() LIMIT ?`,
    [quanti],
  );
  return righe.map((r) => r.id);
}

async function sfoca(idImmagine: number): Promise<Sfondo | null> {
  // The public preview (1280 px) is enough: the blur hides its small watermark
  const [file] = await select<{ dati: Buffer }>(
    pool,
    `SELECT dati FROM \`${config.db.mediaDatabase}\`.immagini_file WHERE id_immagine = ? AND variante = 'anteprima'`,
    [idImmagine],
  );
  if (!file) return null;
  const dati = await sharp(file.dati)
    .resize({ width: LARGHEZZA, withoutEnlargement: true })
    .blur(SFOCATURA)
    .modulate({ saturation: 1.25 })
    .webp({ quality: 74 })
    .toBuffer();
  return { dati, etag: `"${createHash('sha1').update(dati).digest('hex').slice(0, 16)}"` };
}

/** Builds a new pool; on failure the current one stays in use. */
export function rinnovaSfondi(): Promise<void> {
  inCorso ??= (async () => {
    try {
      const sfondi: Sfondo[] = [];
      for (const id of await scegliCopertine(DIMENSIONE_POOL)) {
        const s = await sfoca(id).catch((error) => {
          logger.warn(`Sfondo della home non generato per l'immagine ${id}`, error);
          return null;
        });
        if (s) sfondi.push(s);
      }
      if (sfondi.length) {
        precedente = attuale;
        attuale = { id: Date.now().toString(36), sfondi };
      }
    } catch (error) {
      logger.warn('Rinnovo degli sfondi della home non riuscito', error);
    } finally {
      inCorso = null;
    }
  })();
  return inCorso;
}

/** First pool at start-up (in the background) and renewal every few hours. */
export function avviaSfondi(): void {
  void rinnovaSfondi();
  setInterval(() => void rinnovaSfondi(), RINNOVO_MS).unref();
}

/** Addresses of the current pool in a random order (empty until the first pool is ready). */
export function sfondiPerVisita(): string[] {
  if (!attuale) return [];
  const indirizzi = attuale.sfondi.map((_, i) => `/sfondi/${attuale!.id}-${i}.webp`);
  for (let i = indirizzi.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [indirizzi[i], indirizzi[j]] = [indirizzi[j], indirizzi[i]];
  }
  return indirizzi;
}

export function getSfondo(generazione: string, indice: number): Sfondo | null {
  const g = [attuale, precedente].find((x) => x?.id === generazione);
  return g?.sfondi[indice] ?? null;
}
