import { z } from 'zod';
import { cleanHtml, HtmlKind } from '../util/html';
import { CLASSIFICAZIONI, MAX_GRUPPI_MISURE, MAX_MISURE_PER_GRUPPO } from './classificazioni';
import { FieldDef, VOCAB_KEYS, VOCABOLARI, VocabDef, VocabKey } from './vocabolari';

// ---------------------------------------------------------------------------
// Reusable field types
// ---------------------------------------------------------------------------

const blankToNull = (v: unknown) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' ? null : t;
  }
  return v;
};

export const optText = (max: number) =>
  z.preprocess(blankToNull, z.string({ invalid_type_error: 'Deve essere un testo' }).max(max, `Massimo ${max} caratteri`).nullable());

export const optHtml = (max: number, kind: HtmlKind) =>
  optText(max).transform((v) => cleanHtml(v, kind));

export const optInt = (min: number, max: number) =>
  z.preprocess(
    (v) => {
      const b = blankToNull(v);
      return typeof b === 'string' && /^[-+]?\d+$/.test(b) ? Number(b) : b;
    },
    z.number({ invalid_type_error: 'Deve essere un numero intero' }).int('Deve essere un numero intero').min(min).max(max).nullable(),
  );

export const optDecimal = (min: number, max: number) =>
  z.preprocess(
    (v) => {
      const b = blankToNull(v);
      if (typeof b === 'string') {
        const normalized = b.replace(',', '.');
        return /^[-+]?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : b;
      }
      return b;
    },
    z.number({ invalid_type_error: 'Deve essere un numero' }).min(min).max(max).nullable(),
  );

const isBlankValue = (v: unknown): boolean =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.every(isBlankObject));

function isBlankObject(value: unknown): boolean {
  if (!value || typeof value !== 'object') return isBlankValue(value);
  return Object.entries(value as Record<string, unknown>).every(([k, v]) => k === 'ordine' || isBlankValue(v));
}

/** Array of form rows: completely empty rows are ignored. */
const rows = <T extends z.ZodTypeAny>(item: T, max: number) =>
  z.preprocess((v) => (Array.isArray(v) ? v.filter((r) => !isBlankObject(r)) : v ?? []), z.array(item).max(max, `Massimo ${max} elementi`));

function fieldSchema(f: FieldDef): z.ZodTypeAny {
  let schema: z.ZodTypeAny;
  switch (f.type) {
    case 'int':
      return optInt(f.min ?? -2147483648, f.maxValue ?? 2147483647);
    case 'inline':
      return optHtml(f.max ?? 2000, 'inline');
    default:
      schema = optText(f.max ?? 255);
  }
  if (f.options) {
    const options = f.options;
    schema = schema.refine((v) => v === null || options.includes(v as string), { message: `Valore non ammesso per ${f.label}` });
  }
  return schema;
}

// ---------------------------------------------------------------------------
// Reference to a shared authority entry: the `id` of an existing entry or the
// fields to create a new one (if an identical entry already exists it is reused).
// ---------------------------------------------------------------------------

export function vocabRefSchema(v: VocabDef) {
  const shape: Record<string, z.ZodTypeAny> = {
    id: z.preprocess(blankToNull, z.coerce.number().int().positive().nullable()),
  };
  for (const f of [...v.fields, ...v.linkFields]) shape[f.name] = fieldSchema(f);
  return z
    .object(shape)
    .strip()
    .superRefine((ref, ctx) => {
      if (!ref.id && !ref[v.display]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [v.display],
          message: `${v.singolare}: selezionare una voce esistente o indicare ${v.fields[0].label.toLowerCase()}`,
        });
      }
    });
}

export function vocabFieldsSchema(v: VocabDef) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of v.fields) shape[f.name] = fieldSchema(f);
  return z
    .object(shape)
    .strip()
    .refine((x) => !!x[v.display], { message: `${v.fields[0].label} obbligatorio`, path: [v.display] });
}

// ---------------------------------------------------------------------------
// The record's (scheda) own data
// ---------------------------------------------------------------------------

const cronologiaSchema = z.object({
  ambito_storico: optText(1000),
  etichetta_data: optText(255),
  giorno_data_da: optInt(1, 31),
  mese_data_da: optInt(1, 12),
  anno_data_da: optInt(-99999, 9999),
  giorno_data_a: optInt(1, 31),
  mese_data_a: optInt(1, 12),
  anno_data_a: optInt(-99999, 9999),
});

const inventarioSchema = z.object({
  numero_inventario: optText(255),
  nome_inventario: optText(255),
  descrizione: optText(1000),
});

const misuraSchema = z.object({
  direzione: optText(64),
  tipo: optText(64),
  valore: optDecimal(0, 1_000_000_000),
  unita_di_misura: optText(16),
});

const gruppoMisureSchema = z.object({
  titolo_gruppo_misure: optText(255),
  intero_parziale: optText(64),
  note: optText(1000),
  misure: rows(misuraSchema, MAX_MISURE_PER_GRUPPO),
});

const documentazioneSchema = z.object({ riferimento: optHtml(5000, 'inline') }).refine((d) => !!d.riferimento, {
  message: 'Riferimento obbligatorio',
});

const immagineSchema = z.object({
  id: z.coerce.number().int().positive(),
  didascalia: optText(1000),
});

const CLASSI = CLASSIFICAZIONI.map((c) => c.value);

const baseShape = {
  titolo_opera: optHtml(2000, 'inline').refine((v) => !!v, { message: "Il titolo dell'opera è obbligatorio" }),
  classificazione: optText(255).refine((v) => v === null || CLASSI.includes(v), { message: 'Classificazione non valida' }),
  descrizione_sintetica: optHtml(100_000, 'block'),
  iscrizioni: optHtml(100_000, 'block'),
  storia_espositiva: optHtml(100_000, 'block'),
  corpo_scheda: optHtml(200_000, 'block'),
  note_schedatore: optText(5000),
  cronologie: rows(cronologiaSchema, 10),
  inventari: rows(inventarioSchema, 20),
  misure: rows(gruppoMisureSchema, MAX_GRUPPI_MISURE),
  documentazioni_fotografiche: rows(documentazioneSchema, 100),
  immagini: rows(immagineSchema, 60),
};

const vocabShape = Object.fromEntries(VOCAB_KEYS.map((k) => [k, rows(vocabRefSchema(VOCABOLARI[k]), 200)])) as unknown as Record<
  VocabKey,
  z.ZodTypeAny
>;

export const schedaInputSchema = z.object({ ...baseShape, ...vocabShape }).strip();

export type VocabRef = { id: number | null } & Record<string, string | number | null>;

export type SchedaInput = z.output<z.ZodObject<typeof baseShape>> & Record<VocabKey, VocabRef[]>;

export function parseSchedaInput(body: unknown): SchedaInput {
  return schedaInputSchema.parse(body) as unknown as SchedaInput;
}
