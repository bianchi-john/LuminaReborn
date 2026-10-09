/**
 * Confronto dimensionale "a sagome": l'opera accanto a una figura umana (o a una
 * mano, per gli oggetti piccoli). Non è salvato nel database: viene calcolato
 * dalle misure ogni volta che si visualizza la scheda.
 */

export interface MisuraInput {
  direzione?: unknown;
  valore?: unknown;
  unita_di_misura?: unknown;
}

export interface GruppoInput {
  titolo_gruppo_misure?: unknown;
  intero_parziale?: unknown;
  misure: MisuraInput[];
}

export interface Pezzo {
  etichetta: string;
  altezza: number;
  larghezza: number;
  larghezzaStimata: boolean;
}

export interface Confronto {
  riferimento: 'persona' | 'mano';
  /** Altezza della figura di riferimento in cm */
  altezzaRiferimento: number;
  pezzi: Pezzo[];
}

export const ALTEZZA_PERSONA = 175;
export const LUNGHEZZA_MANO = 18;

const IN_CM: Record<string, number> = { m: 100, dm: 10, cm: 1, mm: 0.1, 'μm': 0.0001, 'µm': 0.0001, um: 0.0001 };

function asCm(valore: unknown, unita: unknown): number | null {
  const n = typeof valore === 'number' ? valore : Number(String(valore ?? '').replace(',', '.'));
  const factor = IN_CM[String(unita ?? 'cm').trim().toLowerCase() || 'cm'];
  if (!Number.isFinite(n) || n <= 0 || factor === undefined) return null;
  return n * factor;
}

type Asse = 'altezza' | 'larghezza' | null;

function asse(direzione: unknown): Asse {
  const d = String(direzione ?? '').trim().toLowerCase();
  if (/^(alt|h\b|h\.)/.test(d)) return 'altezza';
  if (/^(larg|lungh|diam|l\b|l\.|lung)/.test(d)) return 'larghezza';
  return null; // profondità, spessore, peso: non disegnati
}

function pezzo(g: GruppoInput): Pezzo | null {
  let altezza = 0;
  let larghezza = 0;
  for (const m of g.misure) {
    const a = asse(m.direzione);
    const cm = asCm(m.valore, m.unita_di_misura);
    if (!a || cm === null) continue;
    if (a === 'altezza') altezza = Math.max(altezza, cm);
    else larghezza = Math.max(larghezza, cm);
  }
  if (!altezza && !larghezza) return null;
  // Con una sola dimensione la sagoma è indicativa
  const stimata = !altezza || !larghezza;
  if (!altezza) altezza = larghezza * 0.5;
  if (!larghezza) larghezza = altezza * 0.4;
  const etichetta = [g.titolo_gruppo_misure, g.intero_parziale].map((x) => String(x ?? '').trim()).filter(Boolean).join(', ');
  return { etichetta, altezza, larghezza, larghezzaStimata: stimata };
}

/**
 * - con misure "intere" (o senza indicazione) si mostra il gruppo più grande
 *   (es. "con cornice" invece di "senza cornice");
 * - se tutte le misure sono "parziali" (es. scomparti di un trittico) si
 *   mostrano tutti i pezzi affiancati.
 */
export function confrontoDimensionale(gruppi: GruppoInput[]): Confronto | null {
  const candidati = gruppi.map((g) => ({ g, p: pezzo(g) })).filter((x): x is { g: GruppoInput; p: Pezzo } => x.p !== null);
  if (!candidati.length) return null;

  const parziale = (g: GruppoInput) => /parz/i.test(String(g.intero_parziale ?? ''));
  const interi = candidati.filter((c) => !parziale(c.g));
  const pezzi = interi.length
    ? [interi.reduce((best, c) => (c.p.altezza * c.p.larghezza > best.p.altezza * best.p.larghezza ? c : best)).p]
    : candidati.map((c) => c.p).slice(0, 8);

  const maxDim = Math.max(...pezzi.map((p) => Math.max(p.altezza, p.larghezza)));
  const totaleLarghezza = pezzi.reduce((sum, p) => sum + p.larghezza, 0);
  const piccolo = maxDim < 40 && totaleLarghezza < 60;
  return {
    riferimento: piccolo ? 'mano' : 'persona',
    altezzaRiferimento: piccolo ? LUNGHEZZA_MANO : ALTEZZA_PERSONA,
    pezzi,
  };
}
