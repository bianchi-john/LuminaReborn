// Crea LUMINA-account.docx dal file degli account (non stampa mai le password)
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, AlignmentType, HeadingLevel, LevelFormat,
} = require("docx");

const [, , sorgente, destinazione] = process.argv;
const testo = fs.readFileSync(sorgente, "utf8");
const sito = (testo.match(/Sito: (\S+)/) || [])[1];
const maschera = process.env.MASCHERA === "1"; // copia di controllo: password sostituite da X
const ASSEGNATI = { schedatore01: "Virginia", schedatore02: "Elena", schedatore03: "Pasquale", amministratore: "Emanuele" };
const account = [...testo.matchAll(/utente: (\S+)\s+password: (\S+)/g)].filter((m) => m[1] in ASSEGNATI).map((m) => ({ utente: m[1], password: maschera ? "X".repeat(m[2].length) : m[2] }));
if (!sito || account.length !== 4) throw new Error("File account non riconosciuto");

const FONT = "Arial";
const MONO = "Consolas";
const bordo = { style: BorderStyle.SINGLE, size: 6, color: "8A8A8E" };
const bordi = { top: bordo, bottom: bordo, left: bordo, right: bordo };
const COL = [1950, 2350, 3250, 2088]; // somma = 9638 (A4 con margini di 2 cm)

const cella = (contenuto, larghezza, opz = {}) =>
  new TableCell({
    width: { size: larghezza, type: WidthType.DXA },
    borders: bordi,
    shading: opz.intestazione ? { type: ShadingType.CLEAR, color: "auto", fill: "E8E8ED" } : undefined,
    margins: { top: 70, bottom: 70, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: contenuto, font: opz.mono ? MONO : FONT, size: opz.mono ? 24 : 22, bold: !!opz.grassetto })] })],
  });

const riga = (a, b, c, d, opz = {}) =>
  new TableRow({
    tableHeader: !!opz.intestazione,
    cantSplit: true,
    children: [
      cella(a, COL[0], { intestazione: opz.intestazione, grassetto: opz.intestazione }),
      cella(b, COL[1], { intestazione: opz.intestazione, grassetto: true, mono: !opz.intestazione }),
      cella(c, COL[2], { intestazione: opz.intestazione, grassetto: opz.intestazione, mono: !opz.intestazione }),
      cella(d, COL[3], { intestazione: opz.intestazione, grassetto: opz.intestazione }),
    ],
  });

const p = (testo, opz = {}) => new Paragraph({ spacing: { after: 120 }, ...opz, children: [new TextRun({ text: testo, font: FONT, size: 22, ...(opz.run || {}) })] });
const runs = (parti, opz = {}) => new Paragraph({ spacing: { after: 120 }, ...opz, children: parti.map((x) => new TextRun({ font: FONT, size: 22, ...(typeof x === "string" ? { text: x } : x) })) });
const h = (testo) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(testo)] });
const elenco = (ref, parti) => runs(parti, { numbering: { reference: ref, level: 0 }, spacing: { after: 80 } });

const schedatori = account.filter((a) => a.utente.startsWith("schedatore"));
const admin = account.find((a) => a.utente === "amministratore");

const doc = new Document({
  creator: "LUMiNA",
  title: "LUMiNA - Account per la schedatura",
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: FONT, size: 44, bold: true }, paragraph: { spacing: { before: 0, after: 80 }, keepNext: true } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 28, bold: true }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 0 } },
    ],
  },
  numbering: {
    config: [
      { reference: "passi", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 500, hanging: 300 } } } }] },
      { reference: "punti", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 500, hanging: 300 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    children: [
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("LUMiNA – Account per la schedatura")] }),
      p("Documento riservato", { run: { color: "6E6E73", size: 24 }, spacing: { after: 240 } }),

      new Paragraph({
        spacing: { after: 200 },
        border: { left: { style: BorderStyle.SINGLE, size: 24, color: "C0392B", space: 10 } },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "FDF1EF" },
        children: [
          new TextRun({ text: "Questo documento contiene le password. ", font: FONT, size: 22, bold: true }),
          new TextRun({ text: "Non inoltratelo e non lasciatelo stampato in giro. Ognuno usa soltanto il proprio account.", font: FONT, size: 22 }),
        ],
      }),

      h("Indirizzo del sito"),
      runs([{ text: sito, font: MONO, size: 26, bold: true }]),
      p("Apritelo con Chrome o Firefox, da un computer (non dal telefono)."),

      h("Account per chi scheda"),
      p("Chi scheda crea le schede delle opere e le invia all'amministratore."),
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        columnWidths: COL,
        rows: [
          riga("Ruolo", "Nome utente", "Password", "Assegnato a", { intestazione: true }),
          ...schedatori.map((a) => riga("Schedatore", a.utente, a.password, ASSEGNATI[a.utente])),
        ],
      }),

      h("Account dell'amministratore"),
      p("L'amministratore legge le schede inviate e le approva (diventano pubbliche) oppure le rifiuta (tornano a chi le ha scritte)."),
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        columnWidths: COL,
        rows: [
          riga("Ruolo", "Nome utente", "Password", "Assegnato a", { intestazione: true }),
          riga("Amministratore", admin.utente, admin.password, ASSEGNATI[admin.utente]),
        ],
      }),

      h("Come entrare"),
      elenco("passi", ["Aprite l'indirizzo del sito scritto sopra."]),
      elenco("passi", ["In ", { text: "Nome utente", bold: true }, " scrivete il vostro (es. schedatore01)."]),
      elenco("passi", ["In ", { text: "Password", bold: true }, " scrivete la password della tabella, identica."]),
      elenco("passi", ["Premete ", { text: "Accedi", bold: true }, "."]),

      h("Attenzione"),
      elenco("punti", ["Maiuscole e minuscole contano: ", { text: "Ocra", font: MONO }, " e ", { text: "ocra", font: MONO }, " non sono la stessa cosa."]),
      elenco("punti", ["Se copiate e incollate la password, controllate di non prendere anche uno spazio prima o dopo."]),
      elenco("punti", ["Se compare “Nome utente o password errati”, ricontrollate lettera per lettera e riprovate."]),
      elenco("punti", ["Non scambiatevi gli account: il sito registra chi ha scritto ogni scheda."]),

      new Paragraph({ spacing: { before: 320, after: 0 }, children: [
        new TextRun({ text: "Le istruzioni complete, con le immagini, sono nella guida ", font: FONT, size: 22 }),
        new TextRun({ text: "LUMINA-guida-rapida.pdf", font: FONT, size: 22, bold: true }),
        new TextRun({ text: ".", font: FONT, size: 22 }),
      ] }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(destinazione, buf);
  console.log("creato", destinazione, `(${account.length} account)`);
});
