import { SessionUser } from '../auth/session';
import { execute, pool, selectOne } from '../db/pool';
import { badRequest, notFound } from '../http/errors';
import { logger } from '../logger';
import { computePermessi } from './schede.service';

/**
 * Il tipo dell'immagine viene ricavato dai primi byte del file, non dal nome o
 * dall'header della richiesta. Sono ammessi solo formati raster: niente SVG
 * (potrebbe contenere script).
 */
export function detectImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buf.subarray(0, 6).toString('ascii') === 'GIF87a' || buf.subarray(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  return null;
}

export async function uploadImmagine(data: Buffer, user: SessionUser): Promise<{ id: number; mime: string }> {
  const mime = detectImageType(data);
  if (!mime) throw badRequest('Formato non supportato: caricare un file JPEG, PNG, WebP o GIF');
  const res = await execute(pool, 'INSERT INTO immagini (id_scheda, mime, dati, uploaded_by) VALUES (NULL, ?, ?, ?)', [mime, data, user.id]);
  return { id: res.insertId, mime };
}

export interface ImmagineFile {
  mime: string;
  dati: Buffer;
  pubblica: boolean;
}

/** Restituisce l'immagine solo se la scheda è pubblicata o l'utente ha accesso. */
export async function getImmagine(id: number, user?: SessionUser): Promise<ImmagineFile> {
  const row = await selectOne<{
    mime: string;
    dati: Buffer;
    id_scheda: number | null;
    uploaded_by: number | null;
    stato: number | null;
    created_by: number | null;
    accreditato: number | null;
  }>(
    pool,
    `SELECT i.mime, i.dati, i.id_scheda, i.uploaded_by, s.stato, s.created_by,
            (SELECT 1 FROM tds_users_schede t WHERE t.id_scheda = s.id AND t.id_user = ?) AS accreditato
       FROM immagini i LEFT JOIN schede s ON s.id = i.id_scheda
      WHERE i.id = ?`,
    [user?.id ?? 0, id],
  );
  if (!row) throw notFound('Immagine non trovata');

  if (row.id_scheda === null) {
    // Caricata ma non ancora salvata in una scheda: solo chi l'ha caricata
    if (!user || (row.uploaded_by !== user.id && !user.isAdmin)) throw notFound('Immagine non trovata');
    return { mime: row.mime, dati: row.dati, pubblica: false };
  }
  const permessi = computePermessi({ stato: row.stato ?? 0, created_by: row.created_by }, user, !!row.accreditato);
  if (!permessi.visualizza) throw notFound('Immagine non trovata');
  return { mime: row.mime, dati: row.dati, pubblica: row.stato === 2 };
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
