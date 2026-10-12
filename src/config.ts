import 'dotenv/config';
import path from 'path';

/** Project root: works both from `src/` (tsx) and from `dist/` (build). */
export const ROOT_DIR = path.resolve(__dirname, '..');

function str(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Variabile d'ambiente obbligatoria mancante: ${name}`);
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) throw new Error(`${name} deve essere un numero intero (ricevuto "${raw}")`);
  return value;
}

function bool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

function list(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const isProduction = (process.env.NODE_ENV ?? 'development') === 'production';
const secureCookie = bool('COOKIE_SECURE', isProduction);

export const config = {
  isProduction,
  port: int('SERVER_PORT', 3000),
  /** Value for `app.set('trust proxy')`: number of trusted proxies in front of the app. */
  trustProxy: int('TRUST_PROXY', 0),

  db: {
    host: str('DB_HOST', 'localhost'),
    port: int('DB_PORT', 3306),
    user: str('DB_USER'),
    password: str('DB_PASSWORD'),
    database: str('DB_NAME', 'luminadb'),
    /** Separate database holding the image files (originals and resized versions). */
    mediaDatabase: str('MEDIA_DB_NAME', 'luminamedia'),
    connectionLimit: int('DB_CONNECTION_LIMIT', 10),
  },
  migrateOnStart: bool('MIGRATE_ON_START', true),

  userManagerUrl: str('USER_MANAGER_API_URL', 'http://user-manager-api').replace(/\/+$/, ''),

  session: {
    /** Over HTTPS the __Host- prefix prevents the cookie from being set by subdomains or without Secure. */
    cookieName: secureCookie ? '__Host-lumina_session' : 'lumina_session',
    /** Enable when the site is served over HTTPS (mandatory in production). */
    secureCookie,
    /** Absolute maximum session lifetime. */
    maxAgeHours: int('SESSION_MAX_AGE_HOURS', 8),
    /** Automatic logout after this period of inactivity. */
    idleMinutes: int('SESSION_IDLE_MINUTES', 60),
  },

  /** Contact for vulnerability reports (/.well-known/security.txt, RFC 9116). */
  securityContact: process.env.SECURITY_CONTACT ?? '',

  /** Origins allowed for data-modifying requests (CSRF protection). Empty = same host. */
  allowedOrigins: list('ALLOWED_ORIGINS'),

  /** Per-IP limits against automated copying of the catalogue (src/http/antiscraping.ts). */
  scraping: {
    attiva: bool('SCRAPING_PROTEZIONE', true),
    pagineMinuto: int('SCRAPING_PAGINE_MINUTO', 60),
    pagineOra: int('SCRAPING_PAGINE_ORA', 600),
    mediaMinuto: int('SCRAPING_MEDIA_MINUTO', 600),
    mediaOra: int('SCRAPING_MEDIA_ORA', 6000),
    apiMinuto: int('SCRAPING_API_MINUTO', 300),
    bloccoMinuti: int('SCRAPING_BLOCCO_MINUTI', 60),
  },

  upload: {
    maxImageBytes: int('MAX_IMAGE_MB', 25) * 1024 * 1024,
    /** Maximum dimensions of the decoded image: a small file can hide millions of pixels. */
    maxImageSide: int('MAX_IMAGE_LATO_PX', 20_000),
    maxImageMegapixels: int('MAX_IMAGE_MEGAPIXEL', 150),
  },

  media: {
    /** Long side (px) of the public version: the original stays reserved to staff. */
    previewSize: int('MEDIA_PREVIEW_PX', 1280),
    thumbSize: int('MEDIA_THUMB_PX', 480),
    /** Signature overlaid on public previews (empty = no watermark). */
    watermark: process.env.MEDIA_WATERMARK ?? '© Musei Nazionali di Lucca',
  },

  export: {
    /** Folder where the nightly Excel export of the catalogue is saved (empty = disabled). */
    dir: process.env.EXPORT_DIR ?? '',
    /** Hour (0-23, Europe/Rome time zone) of the automatic export. */
    hour: int('EXPORT_HOUR', 2),
    keep: int('EXPORT_KEEP', 14),
  },
} as const;

// Over HTTPS (i.e. in a real installation) the app refuses to start with the demo credentials
const DEMO_PASSWORDS = ['letmein', 'admin', 'password', 'changeme'];
if (config.session.secureCookie && DEMO_PASSWORDS.includes(config.db.password)) {
  throw new Error('DB_PASSWORD è ancora la password dimostrativa: impostarne una nuova in .env (vedi docs/SECURITY.md)');
}

// The media database name is used in queries: safe characters only
for (const name of [config.db.database, config.db.mediaDatabase]) {
  if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error(`Nome di database non valido: ${name}`);
}

export type Config = typeof config;
