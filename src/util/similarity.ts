/**
 * Similarity between short texts (names of authors, places, materials...), used to:
 * - warn the cataloguer that they are about to create a likely duplicate;
 * - point out to the administrator pairs of authority entries to merge;
 * - suggest "Did you mean..." when a search returns no results.
 */

/** Lowercase, without accents, HTML tags or punctuation. */
export function normalize(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

const ratio = (a: string, b: string) => (a || b ? 1 - levenshtein(a, b) / Math.max(a.length, b.length) : 1);

/**
 * Value between 0 and 1. Accounts for typos ("Giordani"), word order
 * ("Giordano Luca") and abbreviated forms ("L. Giordano").
 */
export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = na.split(' ');
  const tb = nb.split(' ');
  const sorted = ratio([...ta].sort().join(' '), [...tb].sort().join(' '));
  // Every word of the shorter text has a match in the other (including a dotted initial)
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const match = (x: string, y: string) =>
    x === y || (x.length === 1 && y.startsWith(x)) || (y.length === 1 && x.startsWith(y)) || (x.length > 3 && ratio(x, y) >= 0.8);
  const covered = short.every((t) => long.some((u) => match(t, u)));
  const coverage = covered && short.length >= 1 && long.length - short.length <= 2 ? 0.88 : 0;
  return Math.max(ratio(na, nb), sorted, coverage);
}

export interface Candidate {
  id: number;
  label: string;
}

export function findSimilar<T extends Candidate>(text: string, candidates: T[], threshold = 0.75, limit = 5): (T & { score: number })[] {
  return candidates
    .map((c) => ({ ...c, score: similarity(text, c.label) }))
    .filter((c) => c.score >= threshold && normalize(c.label) !== normalize(text))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Pairs of likely duplicate authority entries. Only compares entries sharing a word (fast even with thousands of entries). */
export function findDuplicatePairs<T extends Candidate>(items: T[], threshold = 0.85, limit = 50): { a: T; b: T; score: number }[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const tokens = new Set(normalize(item.label).split(' ').filter((t) => t.length >= 4));
    for (const t of tokens) {
      const key = t.slice(0, 4);
      buckets.set(key, [...(buckets.get(key) ?? []), item]);
    }
  }
  const seen = new Set<string>();
  const pairs: { a: T; b: T; score: number }[] = [];
  for (const group of buckets.values()) {
    if (group.length > 200) continue; // words that are too common (e.g. "museo"): not very informative
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const [a, b] = group[i].id < group[j].id ? [group[i], group[j]] : [group[j], group[i]];
        const key = `${a.id}-${b.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const score = similarity(a.label, b.label);
        if (score >= threshold) pairs.push({ a, b, score });
      }
    }
  }
  return pairs.sort((x, y) => y.score - x.score).slice(0, limit);
}
