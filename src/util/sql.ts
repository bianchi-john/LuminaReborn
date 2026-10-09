/** Rende letterali i caratteri speciali di LIKE (%, _ e il carattere di escape). */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
