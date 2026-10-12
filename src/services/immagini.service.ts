import { createHash } from 'crypto';
import sharp from 'sharp';
import { SessionUser } from '../auth/session';
import { config } from '../config';
import { Db, execute, pool, select, selectOne, withTransaction } from '../db/pool';
import { badRequest, notFound } from '../http/errors';
import { logger } from '../logger';
import { computePermessi } from './schede.service';

/**
 * Immagini delle schede.
 *
 * - `immagini` (database principale): a quale scheda appartiene, ordine, didascalia, dimensioni;
 * - `immagini_file` (database media separato): i byte, in tre varianti:
 *     originale  il file caricato, intatto: solo per utenti autenticati che possono vedere la scheda
 *     anteprima  WebP ridotto (lato lungo MEDIA_PREVIEW_PX), senza metadati: è ciò che vede il pubblico
 *     miniatura  WebP piccolo per elenchi e risultati
 */

export type Variante = 'originale' | 'anteprima' | 'miniatura';
export const VARIANTI: Variante[] = ['originale', 'anteprima', 'miniatura'];

const MEDIA_TABLE = () => `\`${config.db.mediaDatabase}\`.immagini_file`;

/** Formati accettati, riconosciuti dai primi byte del file (mai dall'estensione). Niente SVG: può contenere script. */
export function detectImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (['GIF87a', 'GIF89a'].includes(buf.subarray(0, 6).toString('ascii'))) return 'image/gif';
  if (buf.subarray(0, 4).equals(Buffer.from([0x49, 0x49, 0x2a, 0x00])) || buf.subarray(0, 4).equals(Buffer.from([0x4d, 0x4d, 0x00, 0x2a]))) {
    return 'image/tiff';
  }
  return null;
}

export interface FileVariante {
  variante: Variante;
  mime: string;
  larghezza: number;
  altezza: number;
  dati: Buffer;
}

/** Limite contro le "decompression bomb": immagini oltre 200 megapixel vengono rifiutate. */
const MAX_PIXELS = 200_000_000;

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] ?? c);

/**
 * Watermark piccolo in basso a destra: testo chiaro semitrasparente con un
 * contorno scuro leggero, leggibile su fondi chiari e scuri. SVG generato qui
 * (mai da input dell'utente) e disegnato da sharp.
 */
export function watermarkSvg(width: number, height: number, testo: string): Buffer {
  const size = Math.max(11, Math.round(Math.min(width, height * 1.4) * 0.022));
  const pad = Math.round(size * 0.9);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="${width - pad}" y="${height - pad}" text-anchor="end"
            font-family="Liberation Serif, Times New Roman, Times, serif" font-size="${size}"
            fill="#ffffff" fill-opacity="0.82" stroke="#000000" stroke-opacity="0.45"
            stroke-width="${Math.max(1, size * 0.12).toFixed(2)}" paint-order="stroke">${escapeXml(testo)}</text>
    </svg>`,
  );
}

async function derivato(buf: Buffer, size: number, quality: number, variante: Variante, watermark = ''): Promise<FileVariante> {
  // rotate() applica l'orientamento EXIF; l'output non contiene metadati (GPS, fotocamera...)
  const ridotta = await sharp(buf, { limitInputPixels: MAX_PIXELS })
    .rotate()
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  let img = sharp(ridotta.data);
  if (watermark) img = img.composite([{ input: watermarkSvg(ridotta.info.width, ridotta.info.height, watermark), top: 0, left: 0 }]);
  const { data, info } = await img.webp({ quality }).toBuffer({ resolveWithObject: true });
  return { variante, mime: 'image/webp', larghezza: info.width, altezza: info.height, dati: data };
}

/** Anteprima pubblica (ridotta, con watermark) a partire dall'originale. */
export function creaAnteprima(originale: Buffer): Promise<FileVariante> {
  return derivato(originale, config.media.previewSize, 82, 'anteprima', config.media.watermark);
}

/** Verifica il file e produce le tre varianti da salvare. */
export async function elaboraImmagine(buf: Buffer): Promise<FileVariante[]> {
  const mime = detectImageType(buf);
  if (!mime) throw badRequest('Formato non supportato: caricare un file JPEG, PNG, WebP, GIF o TIFF');
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(buf, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw badRequest('Il file immagine è danneggiato o troppo grande');
  }
  if (!meta.width || !meta.height) throw badRequest('Impossibile leggere le dimensioni dell\'immagine');
  const ruotata = (meta.orientation ?? 1) >= 5;
  let ridotte: FileVariante[];
  try {
    ridotte = [await creaAnteprima(buf), await derivato(buf, config.media.thumbSize, 76, 'miniatura')];
  } catch {
    // Intestazione leggibile ma contenuto corrotto: errore dell'utente, non del server
    throw badRequest('Il file immagine è danneggiato o troppo grande');
  }
  return [{ variante: 'originale', mime, larghezza: ruotata ? meta.height : meta.width, altezza: ruotata ? meta.width : meta.height, dati: buf }, ...ridotte];
}

/** Salva i file di un'immagine nel database media (stessa connessione: stessa transazione). */
export async function salvaFile(db: Db, idImmagine: number, files: FileVariante[]): Promise<void> {
  for (const f of files) {
    await execute(
      db,
      `INSERT INTO ${MEDIA_TABLE()} (id_immagine, variante, mime, larghezza, altezza, dimensione, dati) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE mime = VALUES(mime), larghezza = VALUES(larghezza), altezza = VALUES(altezza),
                               dimensione = VALUES(dimensione), dati = VALUES(dati)`,
      [idImmagine, f.variante, f.mime, f.larghezza, f.altezza, f.dati.length, f.dati],
    );
  }
}

const sha256 = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

export async function uploadImmagine(data: Buffer, user: SessionUser): Promise<{ id: number; larghezza: number; altezza: number }> {
  const files = await elaboraImmagine(data);
  const originale = files[0];
  const id = await withTransaction(async (conn) => {
    const res = await execute(
      conn,
      `INSERT INTO immagini (id_scheda, mime, larghezza, altezza, dimensione, sha256, uploaded_by)
       VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
      [originale.mime, originale.larghezza, originale.altezza, data.length, sha256(data), user.id],
    );
    await salvaFile(conn, res.insertId, files);
    return res.insertId;
  });
  return { id, larghezza: originale.larghezza, altezza: originale.altezza };
}

export interface ImmagineFile {
  mime: string;
  dati: Buffer;
  /** Visibile senza autenticazione (scheda pubblicata, variante ridotta) */
  pubblica: boolean;
  etag: string;
}

/**
 * Restituisce un file solo a chi può vederlo:
 * - anteprima e miniatura: a tutti se la scheda è pubblicata, altrimenti a chi può vedere la scheda;
 * - originale: solo a utenti autenticati che possono vedere la scheda.
 */
export async function getFile(id: number, variante: Variante, user?: SessionUser): Promise<ImmagineFile> {
  const row = await selectOne<{
    id_scheda: number | null;
    uploaded_by: number | null;
    stato: number | null;
    created_by: number | null;
    accreditato: number | null;
    sha256: string | null;
  }>(
    pool,
    `SELECT i.id_scheda, i.uploaded_by, i.sha256, s.stato, s.created_by,
            (SELECT 1 FROM tds_users_schede t WHERE t.id_scheda = s.id AND t.id_user = ?) AS accreditato
       FROM immagini i LEFT JOIN schede s ON s.id = i.id_scheda
      WHERE i.id = ?`,
    [user?.id ?? 0, id],
  );
  if (!row) throw notFound('Immagine non trovata');

  let visibile: boolean;
  if (row.id_scheda === null) {
    // Caricata ma non ancora salvata in una scheda: solo chi l'ha caricata
    visibile = !!user && (row.uploaded_by === user.id || user.isAdmin);
  } else {
    visibile = computePermessi({ stato: row.stato ?? 0, created_by: row.created_by }, user, !!row.accreditato).visualizza;
  }
  if (!visibile || (variante === 'originale' && !user)) throw notFound('Immagine non trovata');

  const file = await selectOne<{ mime: string; dati: Buffer }>(
    pool,
    `SELECT mime, dati FROM ${MEDIA_TABLE()} WHERE id_immagine = ? AND variante = ?`,
    [id, variante],
  );
  if (!file) throw notFound('Immagine non trovata');
  return {
    mime: file.mime,
    dati: file.dati,
    pubblica: row.stato === 2 && variante !== 'originale',
    etag: `"${(row.sha256 ?? String(id)).slice(0, 16)}-${variante}"`,
  };
}

/** Copertine di schede pubblicate in ordine casuale (sfondo dell'intestazione della home). */
export async function copertineCasuali(limite: number): Promise<number[]> {
  const rows = await select<{ id: number }>(
    pool,
    `SELECT i.id FROM immagini i JOIN schede s ON s.id = i.id_scheda
      WHERE s.stato = 2 AND i.ordine = 0 ORDER BY RAND() LIMIT ?`,
    [limite],
  );
  return rows.map((r) => r.id);
}

/** Elimina le immagini caricate ma mai collegate a una scheda (editor chiuso senza salvare). */
export async function pulisciImmaginiOrfane(): Promise<void> {
  try {
    const res = await execute(pool, 'DELETE FROM immagini WHERE id_scheda IS NULL AND created_at < NOW() - INTERVAL 1 DAY');
    if (res.affectedRows) logger.info(`Rimosse ${res.affectedRows} immagini caricate e non utilizzate`);
  } catch (error) {
    logger.warn('Pulizia immagini non riuscita', error);
  }
}
