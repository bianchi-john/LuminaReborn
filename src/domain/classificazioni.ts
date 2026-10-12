/** Object classes: the stored value is the plural, the label is shown in forms. */
export const CLASSIFICAZIONI: { value: string; label: string }[] = [
  { value: 'Dipinti', label: 'Dipinto' },
  { value: 'Mosaici', label: 'Mosaico' },
  { value: 'Sculture e frammenti lapidei', label: 'Scultura e frammento lapideo' },
  { value: 'Piccola plastica', label: 'Piccola plastica' },
  { value: 'Elementi architettonici', label: 'Elemento architettonico' },
  { value: 'Disegni, stampe e matrici', label: 'Disegno, stampa e matrice' },
  { value: 'Fotografie', label: 'Fotografia' },
  { value: 'Libri e riviste', label: 'Libro e rivista' },
  { value: 'Manoscritti', label: 'Manoscritto' },
  { value: 'Armi e armature', label: 'Arma e armatura' },
  { value: 'Tessuti e moda', label: 'Tessuto e moda' },
  { value: 'Gioielleria e ornamenti', label: 'Gioielleria e ornamento' },
  { value: 'Paramenti sacri, oggetti liturgici e devozionali', label: 'Paramento sacro, oggetto liturgico e devozionale' },
  { value: 'Utensili e strumenti di lavoro', label: 'Utensile e strumento di lavoro' },
  { value: 'Materiali organici, fossili e resti umani', label: 'Materiale organico, fossile e resto umano' },
  { value: 'Tarsie', label: 'Tarsia' },
  { value: 'Arredi e mobili', label: 'Arredo e mobilio' },
  { value: 'Medaglie, monete e gemme', label: 'Medaglia, moneta e gemma' },
  { value: 'Calchi', label: 'Calco' },
  { value: 'Lapidi e cippi funerari', label: 'Lapide e cippo funerario' },
  { value: 'Urne, sarcofagi e casse tombali', label: 'Urna, sarcofago e cassa tombale' },
  { value: 'Vasellame ceramico', label: 'Vasellame ceramico' },
  { value: 'Vasellame metallico', label: 'Vasellame metallico' },
  { value: 'Vetri', label: 'Vetro' },
  { value: 'Sigilli e impronte di sigilli', label: 'Sigillo e impronte di sigilli' },
  { value: 'Strumenti musicali', label: 'Strumento musicale' },
  { value: 'Giocattoli', label: 'Giocattolo' },
  { value: 'Altro', label: 'Altro' },
];

export const STATI = { BOZZA: 0, IN_REVISIONE: 1, PUBBLICATA: 2 } as const;
export type Stato = (typeof STATI)[keyof typeof STATI];

export const STATO_LABEL: Record<number, string> = {
  0: 'Bozza',
  1: 'In revisione',
  2: 'Pubblicata',
};

// Values offered in the measurement menus (imported data may contain others, which remain valid)
export const UNITA_MISURA = ['m', 'cm', 'mm', 'μm', 'g', 'hg', 'kg'];
export const DIREZIONI_MISURA = [
  'altezza',
  'larghezza',
  'profondità',
  'lunghezza',
  'spessore',
  'diametro',
  'diametro superiore',
  'diametro inferiore',
  'diametro massimo',
  'circonferenza',
  'peso',
];
export const TIPI_MISURA = ['assoluta', 'minima', 'massima', 'media', 'ricostruita', 'conservata'];
export const INTERO_PARZIALE = ['intero', 'parziale'];
export const MAX_GRUPPI_MISURE = 10;
export const MAX_MISURE_PER_GRUPPO = 12;

/** Legal status (modelled on the ICCD "CDGG" entries). */
export const PROPRIETA_GIURIDICA = [
  'Proprietà dello Stato',
  'Proprietà Ente pubblico territoriale',
  'Proprietà Ente pubblico non territoriale',
  'Proprietà Ente religioso cattolico',
  'Proprietà Ente religioso non cattolico',
  'Proprietà privata',
  'Proprietà mista',
  'Detenzione / deposito',
  'Condizione giuridica non accertata',
];
