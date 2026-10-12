import archiver from 'archiver';
import ExcelJS from 'exceljs';
import { once } from 'events';
import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import { config } from '../config';
import { pool, select, selectOne } from '../db/pool';
import { STATO_LABEL } from '../domain/classificazioni';
import { percorsoOpera, slugTitolo } from '../util/codici';

/**
 * Photo catalogue export: a ZIP with one folder per work and a spreadsheet
 * listing every photo with its record. Images are stored as they are (no
 * recompression) and read from the database one at a time, so the export
 * never holds the whole archive in memory, however large it is.
 */

export type VarianteFoto = 'originale' | 'anteprima';
export type AmbitoFoto = 'pubblicate' | 'tutte';

export interface OpzioniFoto {
  variante: VarianteFoto;
  ambito: AmbitoFoto;
  /** Base of the public addresses written in the spreadsheet (e.g. https://catalogue.example.org). */
  baseUrl?: string;
}

interface RigaFoto {
  id_immagine: number;
  ordine: number;
  didascalia: string | null;
  id_scheda: number;
  codice_scheda: string;
  titolo_testo: string;
  stato: number;
  inventario: string | null;
  autori: string | null;
  mime: string;
  larghezza: number;
  altezza: number;
  dimensione: number;
}

const ESTENSIONI: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/tiff': 'tif',
};

const MEDIA = () => `\`${config.db.mediaDatabase}\`.immagini_file`;

function elencoFoto(o: OpzioniFoto): Promise<RigaFoto[]> {
  return select<RigaFoto>(
    pool,
    `SELECT i.id AS id_immagine, i.ordine, i.didascalia, s.id AS id_scheda, s.codice AS codice_scheda, s.titolo_testo, s.stato,
            (SELECT inv.numero_inventario FROM inventari inv WHERE inv.id_scheda = s.id ORDER BY inv.ordine LIMIT 1) AS inventario,
            (SELECT GROUP_CONCAT(a.nome ORDER BY l.ordine SEPARATOR '; ')
               FROM tds_schede_autori l JOIN autori a ON a.id = l.id_autore WHERE l.id_scheda = s.id) AS autori,
            f.mime, f.larghezza, f.altezza, f.dimensione
       FROM immagini i
       JOIN schede s ON s.id = i.id_scheda
       JOIN ${MEDIA()} f ON f.id_immagine = i.id AND f.variante = ?
      ${o.ambito === 'pubblicate' ? 'WHERE s.stato = 2' : ''}
      ORDER BY s.titolo_testo, s.id, i.ordine, i.id`,
    [o.variante],
  );
}

/** Number of photos and total size of an export, to show before downloading. */
export async function stimaFoto(o: Omit<OpzioniFoto, 'baseUrl'>): Promise<{ foto: number; schede: number; byte: number }> {
  const row = await selectOne<{ foto: number; schede: number; byte: number | null }>(
    pool,
    `SELECT COUNT(*) AS foto, COUNT(DISTINCT s.id) AS schede, SUM(f.dimensione) AS byte
       FROM immagini i
       JOIN schede s ON s.id = i.id_scheda
       JOIN ${MEDIA()} f ON f.id_immagine = i.id AND f.variante = ?
      ${o.ambito === 'pubblicate' ? 'WHERE s.stato = 2' : ''}`,
    [o.variante],
  );
  return { foto: Number(row?.foto ?? 0), schede: Number(row?.schede ?? 0), byte: Number(row?.byte ?? 0) };
}

/** Folder of a work: inventory number (if any) + first words of the title + code, always unique. */
export function cartellaOpera(r: Pick<RigaFoto, 'inventario' | 'titolo_testo' | 'codice_scheda'>): string {
  const inv = (r.inventario ?? '').replace(/^inv\.?\s*(n\.?\s*)?/i, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return [inv && `inv-${inv}`, slugTitolo(r.titolo_testo).slice(0, 40).replace(/-$/, ''), r.codice_scheda].filter(Boolean).join('_');
}

/** File name: position in the record + caption, readable and safe on every system. */
export function nomeFile(posizione: number, didascalia: string | null, mime: string): string {
  const descrizione = didascalia ? slugTitolo(didascalia).slice(0, 50).replace(/-$/, '') : 'foto';
  return `${String(posizione).padStart(2, '0')}-${descrizione}.${ESTENSIONI[mime] ?? 'bin'}`;
}

const LEGGIMI = (o: OpzioniFoto, n: number, data: string) => `LUMiNA - Catalogo dei Musei Nazionali di Lucca
Catalogo fotografico esportato il ${data}

Contenuto: ${n} fotografie ${o.variante === 'originale' ? 'originali, nel formato in cui sono state caricate' : 'in versione ridotta (WebP, con watermark)'},
schede ${o.ambito === 'pubblicate' ? 'pubblicate' : 'in qualunque stato (bozze e schede in revisione comprese)'}.

- Una cartella per opera: numero di inventario, prime parole del titolo, codice della scheda.
- I file sono numerati nell'ordine della scheda (01 = immagine di copertina).
- catalogo-foto.xlsx elenca ogni fotografia con la sua scheda, la didascalia e le dimensioni.

Le immagini sono di proprietà dei Musei Nazionali di Lucca: l'uso è regolato dai termini del sito.
`;

async function foglioElenco(righe: (RigaFoto & { cartella: string; file: string })[], baseUrl: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'LUMiNA';
  const ws = wb.addWorksheet('Foto');
  ws.columns = [
    { header: 'Cartella', key: 'cartella', width: 45 },
    { header: 'File', key: 'file', width: 40 },
    { header: 'Opera', key: 'titolo', width: 50 },
    { header: 'Autori', key: 'autori', width: 30 },
    { header: 'Inventario', key: 'inventario', width: 16 },
    { header: 'Stato della scheda', key: 'stato', width: 16 },
    { header: 'Posizione', key: 'posizione', width: 10 },
    { header: 'Didascalia', key: 'didascalia', width: 40 },
    { header: 'Larghezza (px)', key: 'larghezza', width: 14 },
    { header: 'Altezza (px)', key: 'altezza', width: 14 },
    { header: 'Formato', key: 'formato', width: 10 },
    { header: 'Dimensione (KB)', key: 'kb', width: 14 },
    { header: 'Indirizzo pubblico', key: 'url', width: 45 },
  ];
  const posizioni = new Map<number, number>();
  for (const r of righe) {
    const posizione = (posizioni.get(r.id_scheda) ?? 0) + 1;
    posizioni.set(r.id_scheda, posizione);
    ws.addRow({
      cartella: r.cartella,
      file: r.file,
      titolo: r.titolo_testo,
      autori: r.autori ?? '',
      inventario: r.inventario ?? '',
      stato: STATO_LABEL[r.stato] ?? '',
      posizione,
      didascalia: r.didascalia ?? '',
      larghezza: r.larghezza,
      altezza: r.altezza,
      formato: ESTENSIONI[r.mime]?.toUpperCase() ?? r.mime,
      kb: Math.round(r.dimensione / 1024),
      url: r.stato === 2 ? `${baseUrl}${percorsoOpera(r.titolo_testo, r.codice_scheda)}` : '',
    });
  }
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7A1F24' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/**
 * Writes the ZIP to `output` (an HTTP response or a file). Each photo is read
 * and added only after the previous one has been written, so memory stays flat
 * and a slow download simply slows the reading down. If the client goes away
 * the export stops at the next photo.
 */
export async function scriviZipFoto(output: Writable, o: OpzioniFoto): Promise<number> {
  const elenco = await elencoFoto(o);
  const posizioni = new Map<number, number>();
  const righe = elenco.map((r) => {
    const posizione = (posizioni.get(r.id_scheda) ?? 0) + 1;
    posizioni.set(r.id_scheda, posizione);
    return { ...r, cartella: cartellaOpera(r), file: nomeFile(posizione, r.didascalia, r.mime) };
  });

  const zip = archiver('zip', { store: true, comment: 'LUMiNA - catalogo fotografico' });
  const errore = new Promise<never>((_, reject) => zip.on('error', reject));
  errore.catch(() => undefined);
  let interrotta = false;
  const chiusura = new Promise<void>((resolve) =>
    output.once('close', () => {
      interrotta = true;
      resolve();
    }),
  );
  zip.pipe(output);
  const adesso = new Date();
  const radice = `lumina-foto-${adesso.toISOString().slice(0, 10).replace(/-/g, '')}`;
  const aggiungi = async (dati: Buffer | string, nome: string) => {
    zip.append(dati, { name: `${radice}/${nome}`, date: adesso });
    await Promise.race([once(zip, 'entry'), errore, chiusura]);
  };

  await aggiungi(LEGGIMI(o, righe.length, adesso.toLocaleDateString('it-IT')), 'LEGGIMI.txt');
  await aggiungi(await foglioElenco(righe, o.baseUrl ?? ''), 'catalogo-foto.xlsx');
  for (const r of righe) {
    if (interrotta) {
      zip.abort();
      return 0;
    }
    const file = await selectOne<{ dati: Buffer }>(pool, `SELECT dati FROM ${MEDIA()} WHERE id_immagine = ? AND variante = ?`, [
      r.id_immagine,
      o.variante,
    ]);
    if (file) await aggiungi(file.dati, `${r.cartella}/${r.file}`);
  }
  await Promise.race([zip.finalize(), errore]);
  return righe.length;
}

/** Export to a folder on the server (`make export-foto`): for very large archives. */
export async function esportaFotoInCartella(dir: string, o: OpzioniFoto): Promise<string> {
  await fs.promises.mkdir(dir, { recursive: true });
  const file = path.join(dir, `lumina-foto-${o.variante}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.zip`);
  const out = fs.createWriteStream(`${file}.tmp`);
  const chiuso = once(out, 'close');
  await scriviZipFoto(out, o);
  await chiuso;
  await fs.promises.rename(`${file}.tmp`, file);
  return file;
}
