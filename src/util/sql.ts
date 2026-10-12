/** Escapes LIKE special characters (%, _ and the escape character) so they match literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
