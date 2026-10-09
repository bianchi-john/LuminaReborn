/* Logger minimale su stdout/stderr in formato leggibile; mai token o password nei messaggi. */
type Level = 'debug' | 'info' | 'warn' | 'error';

function write(level: Level, message: string, extra?: unknown): void {
  const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} ${message}`;
  const stream = level === 'error' || level === 'warn' ? console.error : console.log;
  if (extra === undefined) stream(line);
  else stream(line, extra instanceof Error ? (extra.stack ?? extra.message) : extra);
}

export const logger = {
  debug: (message: string, extra?: unknown) => {
    if (process.env.LOG_LEVEL === 'debug') write('debug', message, extra);
  },
  info: (message: string, extra?: unknown) => write('info', message, extra),
  warn: (message: string, extra?: unknown) => write('warn', message, extra),
  error: (message: string, extra?: unknown) => write('error', message, extra),
};
