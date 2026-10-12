import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import { SessionUser } from '../auth/session';
import { config } from '../config';
import { pool, select } from '../db/pool';
import { CLASSIFICAZIONI, STATO_LABEL } from '../domain/classificazioni';
import { VOCAB_KEYS, VOCABOLARI } from '../domain/vocabolari';
import { logger } from '../logger';
import { htmlToText } from '../util/html';
import { getScheda, SchedaCompleta } from './schede.service';
import { listVoci } from './vocabolari.service';

/**
 * Catalogue export to Excel, readable without technical tools:
 * a "Schede" sheet (one row per artwork, plain text without formatting) and
 * one sheet per vocabulary. Includes all records (schede), in any state.
 */

// System user with the administrator's read permissions
const SISTEMA: SessionUser = { id: 0, remoteId: '', username: 'sistema', displayName: 'Esportazione', role: 'admin', isAdmin: true };
const MAX_CELL = 32_000; // Excel per-cell limit: 32,767 characters
const classLabel = new Map(CLASSIFICAZIONI.map((c) => [c.value, c.label]));

const anno = (y: unknown) => (typeof y === 'number' ? (y < 0 ? `${-y} a.C.` : String(y)) : '');
const clip = (s: string) => (s.length > MAX_CELL ? `${s.slice(0, MAX_CELL)} […]` : s);
const join = (items: string[], sep = '; ') => clip(items.filter(Boolean).join(sep));

export function rigaScheda(s: SchedaCompleta, baseUrl = '') {
  const v = s.voci;
  return {
    id: s.id,
    stato: STATO_LABEL[s.stato] ?? '',
    titolo: htmlToText(s.titolo_opera),
    classificazione: s.classificazione ? (classLabel.get(s.classificazione) ?? s.classificazione) : '',
    autori: join(v.autori.map((a) => [a.formula_precedente, a.nome, a.formula_successiva].filter(Boolean).join(' ') + (a.categoria ? ` (${a.categoria})` : ''))),
    datazione: join(s.cronologie.map((c) => String(c.etichetta_data ?? ''))),
    anno_da: s.cronologie[0] ? anno(s.cronologie[0].anno_data_da) : '',
    anno_a: s.cronologie[0] ? anno(s.cronologie[0].anno_data_a) : '',
    ambito: join(s.cronologie.map((c) => String(c.ambito_storico ?? ''))),
    materiali: join(v.materiali.map((m) => String(m.nome_materiale)), ', '),
    tecniche: join(v.tecniche.map((t) => String(t.nome_tecnica)), ', '),
    misure: join(
      s.misure.map((g) => {
        const titolo = [g.titolo_gruppo_misure, g.intero_parziale ? `(${g.intero_parziale})` : ''].filter(Boolean).join(' ');
        const valori = g.misure.map((m) => [m.direzione, m.tipo, m.valore, m.unita_di_misura].filter((x) => x !== null && x !== '').join(' ')).join(', ');
        return titolo ? `${titolo}: ${valori}` : valori;
      }),
    ),
    ubicazione: join(v.ubicazioni.map((u) => [u.ubicazione, u.collocazione].filter(Boolean).join(', '))),
    inventario: join(s.inventari.map((i) => [i.numero_inventario, i.nome_inventario].filter(Boolean).join(', '))),
    proprieta: join(s.inventari.map((i) => String(i.descrizione ?? ''))),
    provenienze: join(v.provenienze.map((p) => [p.provenienza, p.descrizione, p.note].filter(Boolean).join(', '))),
    mostre: join(v.mostre.map((m) => [htmlToText(String(m.titolo_mostra)), m.luogo_mostra, m.anno_data_da].filter(Boolean).join(', '))),
    bibliografia: join(v.bibliografie.map((b) => htmlToText(String(b.riferimento_bibliografico))), '\n'),
    altra_bibliografia: join(v.altre_bibliografie.map((b) => htmlToText(String(b.riferimento_bibliografico))), '\n'),
    documentazione: join(s.documentazioni_fotografiche.map((d) => htmlToText(d.riferimento)), '\n'),
    descrizione: clip(htmlToText(s.descrizione_sintetica)),
    commento: clip(htmlToText(s.corpo_scheda)),
    iscrizioni: clip(htmlToText(s.iscrizioni)),
    storia: clip(htmlToText(s.storia_espositiva)),
    schedatori: join(s.schedatori.map((u) => u.display_name || u.username), ', '),
    immagini: s.immagini.length,
    creata: s.created_at,
    modificata: s.updated_at,
    pubblicata: s.published_at ?? '',
    url: s.stato === 2 ? `${baseUrl}${s.percorso}` : '',
  };
}

const COLONNE_SCHEDE: { header: string; key: keyof ReturnType<typeof rigaScheda>; width: number }[] = [
  { header: 'ID', key: 'id', width: 7 },
  { header: 'Stato', key: 'stato', width: 12 },
  { header: 'Titolo', key: 'titolo', width: 45 },
  { header: 'Classificazione', key: 'classificazione', width: 20 },
  { header: 'Autori', key: 'autori', width: 35 },
  { header: 'Datazione', key: 'datazione', width: 18 },
  { header: 'Anno da', key: 'anno_da', width: 10 },
  { header: 'Anno a', key: 'anno_a', width: 10 },
  { header: 'Ambito storico-culturale', key: 'ambito', width: 22 },
  { header: 'Materiali', key: 'materiali', width: 25 },
  { header: 'Tecniche', key: 'tecniche', width: 25 },
  { header: 'Misure', key: 'misure', width: 40 },
  { header: 'Ubicazione', key: 'ubicazione', width: 35 },
  { header: 'Inventario', key: 'inventario', width: 18 },
  { header: 'Proprietà giuridica', key: 'proprieta', width: 22 },
  { header: 'Provenienze', key: 'provenienze', width: 35 },
  { header: 'Mostre', key: 'mostre', width: 40 },
  { header: 'Bibliografia', key: 'bibliografia', width: 50 },
  { header: 'Altra bibliografia', key: 'altra_bibliografia', width: 40 },
  { header: 'Documentazione fotografica', key: 'documentazione', width: 35 },
  { header: 'Descrizione sintetica', key: 'descrizione', width: 50 },
  { header: 'Commento storico-critico', key: 'commento', width: 60 },
  { header: 'Iscrizioni', key: 'iscrizioni', width: 35 },
  { header: 'Vicende collezionistiche e storia espositiva', key: 'storia', width: 50 },
  { header: 'Schedatori', key: 'schedatori', width: 22 },
  { header: 'Immagini', key: 'immagini', width: 10 },
  { header: 'Creata', key: 'creata', width: 18 },
  { header: 'Ultima modifica', key: 'modificata', width: 18 },
  { header: 'Pubblicata', key: 'pubblicata', width: 18 },
  { header: 'Indirizzo pubblico', key: 'url', width: 35 },
];

function stileIntestazione(ws: ExcelJS.Worksheet) {
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7A1F24' } };
  header.alignment = { vertical: 'middle' };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
}

export async function creaWorkbook(baseUrl = ''): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'LUMiNA';
  wb.created = new Date();

  const ws = wb.addWorksheet('Schede');
  ws.columns = COLONNE_SCHEDE.map((c) => ({ ...c, style: { alignment: { vertical: 'top', wrapText: true } } }));
  const ids = await select<{ id: number }>(pool, 'SELECT id FROM schede ORDER BY id');
  for (const { id } of ids) ws.addRow(rigaScheda(await getScheda(id, SISTEMA), baseUrl));
  for (const key of ['creata', 'modificata', 'pubblicata']) ws.getColumn(key).numFmt = 'dd/mm/yyyy hh:mm';
  stileIntestazione(ws);

  for (const key of VOCAB_KEYS) {
    const v = VOCABOLARI[key];
    const sheet = wb.addWorksheet(v.plurale.slice(0, 31));
    sheet.columns = [
      { header: 'ID', key: 'id', width: 7 },
      ...v.fields.map((f) => ({ header: f.label, key: f.name, width: f.type === 'longtext' || f.type === 'inline' ? 50 : 25 })),
      { header: 'Schede collegate', key: 'schede_totali', width: 16 },
      { header: 'di cui pubblicate', key: 'schede_pubblicate', width: 16 },
    ];
    for (const item of await listVoci(v, { limit: 100_000 })) {
      const row: Record<string, unknown> = { ...item };
      for (const f of v.fields) if (f.type === 'inline' && typeof row[f.name] === 'string') row[f.name] = htmlToText(row[f.name] as string);
      sheet.addRow(row);
    }
    stileIntestazione(sheet);
  }

  const info = wb.addWorksheet('Informazioni');
  info.columns = [{ width: 30 }, { width: 60 }];
  info.addRows([
    ['Catalogo', 'LUMiNA - Musei Nazionali di Lucca'],
    ['Esportato il', new Date()],
    ['Schede', ids.length],
    ['Stati', 'Bozza = non pubblicata; In revisione = in attesa di approvazione; Pubblicata = visibile nel catalogo'],
  ]);
  info.getColumn(1).font = { bold: true };
  return wb;
}

export async function esportaInCartella(dir = config.export.dir): Promise<string> {
  await fs.mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const file = path.join(dir, `lumina-catalogo-${stamp}.xlsx`);
  const wb = await creaWorkbook();
  await wb.xlsx.writeFile(file);
  // Rotation: keep only the last N exports
  const old = (await fs.readdir(dir)).filter((f) => /^lumina-catalogo-\d{8}\.xlsx$/.test(f)).sort().reverse().slice(config.export.keep);
  await Promise.all(old.map((f) => fs.unlink(path.join(dir, f)).catch(() => undefined)));
  return file;
}

/** Automatic daily export, if EXPORT_DIR is configured. */
export function avviaEsportazioneProgrammata(): void {
  if (!config.export.dir) return;
  const oraRoma = () => Number(new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
  let ultimoGiorno = '';
  const controlla = async () => {
    const oggi = new Date().toISOString().slice(0, 10);
    if (oraRoma() !== config.export.hour || ultimoGiorno === oggi) return;
    ultimoGiorno = oggi;
    try {
      logger.info(`Esportazione Excel creata: ${await esportaInCartella()}`);
    } catch (error) {
      logger.warn('Esportazione Excel non riuscita', error);
    }
  };
  setInterval(controlla, 10 * 60 * 1000).unref();
}
