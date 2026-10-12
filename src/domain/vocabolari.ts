/**
 * Authority entries ("voci") shared between records (schede): each entry exists only
 * once in the database and is linked to records through its own TDS table.
 *
 * - `fields`      the entry's columns (the first is the one displayed and searched);
 * - `linkFields`  columns of the link: they depend on the individual record
 *                 (e.g. "copia da" or "Opera attribuita" for an author).
 *
 * This definition drives validation, saving, search, public pages
 * and the editor (it is exposed to the client via /api/vocabolari).
 */

export type FieldType = 'text' | 'longtext' | 'inline' | 'int';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  max?: number;
  required?: boolean;
  options?: string[];
  min?: number;
  maxValue?: number;
}

export const VOCAB_KEYS = [
  'autori',
  'materiali',
  'tecniche',
  'ubicazioni',
  'provenienze',
  'mostre',
  'bibliografie',
  'altre_bibliografie',
] as const;

export type VocabKey = (typeof VOCAB_KEYS)[number];

export interface VocabDef {
  key: VocabKey;
  table: string;
  link: string;
  fk: string;
  singolare: string;
  plurale: string;
  display: string;
  fields: FieldDef[];
  linkFields: FieldDef[];
  /** Shown in the public indexes (bibliographies can be browsed but are not listed in the menu). */
  indice: boolean;
}

export const CATEGORIE_AUTORE = ['Opera firmata', 'Opera attribuita', 'Opera documentata'];

const giorno = (name: string, label: string): FieldDef => ({ name, label, type: 'int', min: 1, maxValue: 31 });
const mese = (name: string, label: string): FieldDef => ({ name, label, type: 'int', min: 1, maxValue: 12 });
const anno = (name: string, label: string): FieldDef => ({ name, label, type: 'int', min: -99999, maxValue: 9999 });

export const VOCABOLARI: Record<VocabKey, VocabDef> = {
  autori: {
    key: 'autori',
    table: 'autori',
    link: 'tds_schede_autori',
    fk: 'id_autore',
    singolare: 'Autore',
    plurale: 'Autori',
    display: 'nome',
    indice: true,
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', max: 255, required: true },
      { name: 'date_vita', label: 'Date di vita / attività', type: 'text', max: 100 },
      { name: 'note', label: 'Note biografiche', type: 'longtext', max: 5000 },
    ],
    linkFields: [
      { name: 'formula_precedente', label: 'Formula precedente', type: 'text', max: 255 },
      { name: 'formula_successiva', label: 'Formula successiva', type: 'text', max: 255 },
      { name: 'categoria', label: 'Categoria', type: 'text', max: 64, options: CATEGORIE_AUTORE },
    ],
  },
  materiali: {
    key: 'materiali',
    table: 'materiali',
    link: 'tds_schede_materiali',
    fk: 'id_materiale',
    singolare: 'Materiale',
    plurale: 'Materiali',
    display: 'nome_materiale',
    indice: true,
    fields: [
      { name: 'nome_materiale', label: 'Materiale', type: 'text', max: 255, required: true },
      { name: 'descrizione', label: 'Descrizione', type: 'longtext', max: 5000 },
    ],
    linkFields: [],
  },
  tecniche: {
    key: 'tecniche',
    table: 'tecniche',
    link: 'tds_schede_tecniche',
    fk: 'id_tecnica',
    singolare: 'Tecnica',
    plurale: 'Tecniche',
    display: 'nome_tecnica',
    indice: true,
    fields: [
      { name: 'nome_tecnica', label: 'Tecnica', type: 'text', max: 255, required: true },
      { name: 'descrizione', label: 'Descrizione', type: 'longtext', max: 5000 },
    ],
    linkFields: [],
  },
  ubicazioni: {
    key: 'ubicazioni',
    table: 'ubicazioni',
    link: 'tds_schede_ubicazioni',
    fk: 'id_ubicazione',
    singolare: 'Ubicazione',
    plurale: 'Ubicazioni',
    display: 'ubicazione',
    indice: true,
    fields: [
      { name: 'ubicazione', label: 'Ubicazione (museo, sede)', type: 'text', max: 255, required: true },
      { name: 'descrizione', label: 'Descrizione', type: 'longtext', max: 5000 },
    ],
    linkFields: [{ name: 'collocazione', label: 'Collocazione (sala, vetrina...)', type: 'text', max: 255 }],
  },
  provenienze: {
    key: 'provenienze',
    table: 'provenienze',
    link: 'tds_schede_provenienze',
    fk: 'id_provenienza',
    singolare: 'Provenienza',
    plurale: 'Provenienze',
    display: 'provenienza',
    indice: true,
    fields: [
      { name: 'provenienza', label: 'Provenienza', type: 'text', max: 2000, required: true },
      { name: 'descrizione', label: 'Descrizione', type: 'longtext', max: 5000 },
    ],
    linkFields: [{ name: 'note', label: 'Note', type: 'longtext', max: 5000 }],
  },
  mostre: {
    key: 'mostre',
    table: 'mostre',
    link: 'tds_schede_mostre',
    fk: 'id_mostra',
    singolare: 'Mostra',
    plurale: 'Mostre',
    display: 'titolo_mostra',
    indice: true,
    fields: [
      { name: 'titolo_mostra', label: 'Titolo della mostra', type: 'inline', max: 2000, required: true },
      { name: 'curatore', label: 'Curatore', type: 'text', max: 255 },
      { name: 'luogo_mostra', label: 'Luogo', type: 'text', max: 255 },
      { name: 'descrizione', label: 'Sede', type: 'longtext', max: 5000 },
      giorno('giorno_data_da', 'Giorno inizio'),
      mese('mese_data_da', 'Mese inizio'),
      anno('anno_data_da', 'Anno inizio'),
      giorno('giorno_data_a', 'Giorno fine'),
      mese('mese_data_a', 'Mese fine'),
      anno('anno_data_a', 'Anno fine'),
    ],
    linkFields: [],
  },
  bibliografie: {
    key: 'bibliografie',
    table: 'bibliografie',
    link: 'tds_schede_bibliografie',
    fk: 'id_bibliografia',
    singolare: 'Riferimento bibliografico',
    plurale: 'Bibliografia',
    display: 'riferimento_bibliografico',
    indice: false,
    fields: [{ name: 'riferimento_bibliografico', label: 'Riferimento', type: 'inline', max: 5000, required: true }],
    linkFields: [],
  },
  altre_bibliografie: {
    key: 'altre_bibliografie',
    table: 'altreBibliografie',
    link: 'tds_schede_altreBibliografie',
    fk: 'id_altreBibliografie',
    singolare: 'Riferimento bibliografico',
    plurale: 'Altra bibliografia',
    display: 'riferimento_bibliografico',
    indice: false,
    fields: [{ name: 'riferimento_bibliografico', label: 'Riferimento', type: 'inline', max: 5000, required: true }],
    linkFields: [],
  },
};

export function isVocabKey(value: string): value is VocabKey {
  return (VOCAB_KEYS as readonly string[]).includes(value);
}

/** Serializable description for the client (no table names). */
export function vocabolariPublicSchema() {
  return VOCAB_KEYS.map((key) => {
    const v = VOCABOLARI[key];
    return { key, singolare: v.singolare, plurale: v.plurale, display: v.display, fields: v.fields, linkFields: v.linkFields };
  });
}
