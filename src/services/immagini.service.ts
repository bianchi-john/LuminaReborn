import { createHash } from 'crypto';
import sharp from 'sharp';
import { SessionUser } from '../auth/session';
import { config } from '../config';
import { Db, execute, pool, selectOne, withTransaction } from '../db/pool';
import { badRequest, notFound } from '../http/errors';
import { logger } from '../logger';
import { computePermessi } from './schede.service';
import { generaCodice, LUNGHEZZA_CODICE_IMMAGINE } from '../util/codici';

/**
 * Record (scheda) images.
 *
 * - `immagini` (main database): which record it belongs to, order, caption, dimensions;
 * - `immagini_file` (separate media database): the bytes, in three variants:
 *     originale  original: the uploaded file, untouched; only for authenticated users who can see the record
 *     anteprima  preview: downscaled WebP (long side MEDIA_PREVIEW_PX), no metadata; what the public sees
 *     miniatura  thumbnail: small WebP for lists and results
 */

export type Variante = 'originale' | 'anteprima' | 'miniatura';
export const VARIANTI: Variante[] = ['originale', 'anteprima', 'miniatura'];

const MEDIA_TABLE = () => `\`${config.db.mediaDatabase}\`.immagini_file`;

/** Accepted formats, detected from the file's first bytes (never from the extension). No SVG: it can contain scripts. */
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

/** Guard against "decompression bombs": images over 200 megapixels are rejected. */
// Headroom over the configured limit: the explicit check in elaboraImmagine gives a clear message
const MAX_PIXELS = config.upload.maxImageMegapixels * 1_000_000 + 1;

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] ?? c);

/**
 * Small watermark in the bottom-right corner: light semi-transparent text with a
 * thin dark outline, readable on both light and dark backgrounds. The SVG is
 * generated here (never from user input) and rendered by sharp.
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
  // rotate() applies the EXIF orientation; the output contains no metadata (GPS, camera...)
  const ridotta = await sharp(buf, { limitInputPixels: MAX_PIXELS })
    .rotate()
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  let img = sharp(ridotta.data);
  if (watermark) img = img.composite([{ input: watermarkSvg(ridotta.info.width, ridotta.info.height, watermark), top: 0, left: 0 }]);
  const { data, info } = await img.webp({ quality }).toBuffer({ resolveWithObject: true });
  return { variante, mime: 'image/webp', larghezza: info.width, altezza: info.height, dati: data };
}

/** Public preview (downscaled, watermarked) from the original. */
export function creaAnteprima(originale: Buffer): Promise<FileVariante> {
  return derivato(originale, config.media.previewSize, 82, 'anteprima', config.media.watermark);
}

/** Limits on pixel dimensions (in addition to the file size limit). */
export function verificaDimensioni(larghezza: number, altezza: number): void {
  const { maxImageSide: lato, maxImageMegapixels: mp } = config.upload;
  if (larghezza > lato || altezza > lato) {
    throw badRequest('Immagine troppo grande: {w}×{h} pixel (massimo {lato} pixel per lato)', undefined, { w: larghezza, h: altezza, lato });
  }
  if (larghezza * altezza > mp * 1_000_000) {
    throw badRequest('Immagine troppo grande: {n} megapixel (massimo {mp})', undefined, { n: Math.round((larghezza * altezza) / 1e6), mp });
  }
}

/** Validates the file and produces the three variants to store. */
export async function elaboraImmagine(buf: Buffer): Promise<FileVariante[]> {
  const mime = detectImageType(buf);
  if (!mime) throw badRequest('Formato non supportato: caricare un file JPEG, PNG, WebP, GIF o TIFF');
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(buf, { limitInputPixels: false }).metadata();
  } catch {
    throw badRequest('Il file immagine è danneggiato o troppo grande');
  }
  if (!meta.width || !meta.height) throw badRequest('Impossibile leggere le dimensioni dell\'immagine');
  verificaDimensioni(meta.width, meta.height);
  const ruotata = (meta.orientation ?? 1) >= 5;
  let ridotte: FileVariante[];
  try {
    ridotte = [await creaAnteprima(buf), await derivato(buf, config.media.thumbSize, 76, 'miniatura')];
  } catch {
    // Readable header but corrupt content: a user error, not a server error
    throw badRequest('Il file immagine è danneggiato o troppo grande');
  }
  return [{ variante: 'originale', mime, larghezza: ruotata ? meta.height : meta.width, altezza: ruotata ? meta.width : meta.height, dati: buf }, ...ridotte];
}

/** Stores an image's files in the media database (same connection: same transaction). */
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

export async function uploadImmagine(
  data: Buffer,
  user: SessionUser,
): Promise<{ id: number; codice: string; larghezza: number; altezza: number }> {
  const files = await elaboraImmagine(data);
  const originale = files[0];
  const codice = generaCodice(LUNGHEZZA_CODICE_IMMAGINE);
  const id = await withTransaction(async (conn) => {
    const res = await execute(
      conn,
      `INSERT INTO immagini (codice, id_scheda, mime, larghezza, altezza, dimensione, sha256, uploaded_by)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
      [codice, originale.mime, originale.larghezza, originale.altezza, data.length, sha256(data), user.id],
    );
    await salvaFile(conn, res.insertId, files);
    return res.insertId;
  });
  return { id, codice, larghezza: originale.larghezza, altezza: originale.altezza };
}

export interface ImmagineFile {
  mime: string;
  dati: Buffer;
  /** Visible without authentication (published record, downscaled variant) */
  pubblica: boolean;
  etag: string;
}

/**
 * Returns a file only to those allowed to see it:
 * - preview and thumbnail: to everyone if the record is published, otherwise to whoever can see the record;
 * - original: only to authenticated users who can see the record.
 */
export async function getFile(codice: string, variante: Variante, user?: SessionUser): Promise<ImmagineFile> {
  const row = await selectOne<{
    id: number;
    id_scheda: number | null;
    uploaded_by: number | null;
    stato: number | null;
    created_by: number | null;
    accreditato: number | null;
    sha256: string | null;
  }>(
    pool,
    `SELECT i.id, i.id_scheda, i.uploaded_by, i.sha256, s.stato, s.created_by,
            (SELECT 1 FROM tds_users_schede t WHERE t.id_scheda = s.id AND t.id_user = ?) AS accreditato
       FROM immagini i LEFT JOIN schede s ON s.id = i.id_scheda
      WHERE i.codice = ?`,
    [user?.id ?? 0, codice],
  );
  if (!row) throw notFound('Immagine non trovata');

  let visibile: boolean;
  if (row.id_scheda === null) {
    // Uploaded but not yet saved in a record: only the uploader
    visibile = !!user && (row.uploaded_by === user.id || user.isAdmin);
  } else {
    visibile = computePermessi({ stato: row.stato ?? 0, created_by: row.created_by }, user, !!row.accreditato).visualizza;
  }
  if (!visibile || (variante === 'originale' && !user)) throw notFound('Immagine non trovata');

  const file = await selectOne<{ mime: string; dati: Buffer }>(
    pool,
    `SELECT mime, dati FROM ${MEDIA_TABLE()} WHERE id_immagine = ? AND variante = ?`,
    [row.id, variante],
  );
  if (!file) throw notFound('Immagine non trovata');
  return {
    mime: file.mime,
    dati: file.dati,
    pubblica: row.stato === 2 && variante !== 'originale',
    etag: `"${(row.sha256 ?? codice).slice(0, 16)}-${variante}"`,
  };
}

/** Deletes images uploaded but never linked to a record (editor closed without saving). */
export async function pulisciImmaginiOrfane(): Promise<void> {
  try {
    const res = await execute(pool, 'DELETE FROM immagini WHERE id_scheda IS NULL AND created_at < NOW() - INTERVAL 1 DAY');
    if (res.affectedRows) logger.info(`Rimosse ${res.affectedRows} immagini caricate e non utilizzate`);
  } catch (error) {
    logger.warn('Pulizia immagini non riuscita', error);
  }
}
