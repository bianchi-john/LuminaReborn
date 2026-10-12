import 'dotenv/config';
import path from 'path';

/** Radice del progetto: funziona sia da `src/` (tsx) sia da `dist/` (build). */
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
  /** Valore per `app.set('trust proxy')`: numero di proxy fidati davanti all'app. */
  trustProxy: int('TRUST_PROXY', 0),

  db: {
    host: str('DB_HOST', 'localhost'),
    port: int('DB_PORT', 3306),
    user: str('DB_USER'),
    password: str('DB_PASSWORD'),
    database: str('DB_NAME', 'luminadb'),
    /** Database separato che contiene i file delle immagini (originali e versioni ridotte). */
    mediaDatabase: str('MEDIA_DB_NAME', 'luminamedia'),
    connectionLimit: int('DB_CONNECTION_LIMIT', 10),
  },
  migrateOnStart: bool('MIGRATE_ON_START', true),

  userManagerUrl: str('USER_MANAGER_API_URL', 'http://user-manager-api').replace(/\/+$/, ''),

  session: {
    /** In HTTPS il prefisso __Host- impedisce che il cookie sia impostato da sottodomini o senza Secure. */
    cookieName: secureCookie ? '__Host-lumina_session' : 'lumina_session',
    /** Da attivare quando il sito è servito in HTTPS (obbligatorio in produzione). */
    secureCookie,
    /** Durata massima assoluta della sessione. */
    maxAgeHours: int('SESSION_MAX_AGE_HOURS', 8),
    /** Chiusura automatica dopo questo periodo di inattività. */
    idleMinutes: int('SESSION_IDLE_MINUTES', 60),
  },

  /** Contatto per le segnalazioni di vulnerabilità (/.well-known/security.txt, RFC 9116). */
  securityContact: process.env.SECURITY_CONTACT ?? '',

  /** Origini ammesse per le richieste che modificano dati (protezione CSRF). Vuoto = stesso host. */
  allowedOrigins: list('ALLOWED_ORIGINS'),

  /** Limiti per indirizzo IP contro la copia automatica del catalogo (src/http/antiscraping.ts). */
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
    /** Dimensioni massime dell'immagine decodificata: un file piccolo può nascondere milioni di pixel. */
    maxImageSide: int('MAX_IMAGE_LATO_PX', 20_000),
    maxImageMegapixels: int('MAX_IMAGE_MEGAPIXEL', 150),
  },

  media: {
    /** Lato lungo (px) della versione pubblica: l'originale resta riservato allo staff. */
    previewSize: int('MEDIA_PREVIEW_PX', 1280),
    thumbSize: int('MEDIA_THUMB_PX', 480),
    /** Firma sovrapposta alle anteprime pubbliche (vuoto = nessun watermark). */
    watermark: process.env.MEDIA_WATERMARK ?? '© Musei Nazionali di Lucca',
  },

  export: {
    /** Cartella in cui salvare ogni notte l'esportazione Excel del catalogo (vuoto = disattivato). */
    dir: process.env.EXPORT_DIR ?? '',
    /** Ora (0-23, fuso Europe/Rome) dell'esportazione automatica. */
    hour: int('EXPORT_HOUR', 2),
    keep: int('EXPORT_KEEP', 14),
  },
} as const;

// In HTTPS (cioè in un'installazione reale) non si parte con le credenziali dimostrative
const DEMO_PASSWORDS = ['letmein', 'admin', 'password', 'changeme'];
if (config.session.secureCookie && DEMO_PASSWORDS.includes(config.db.password)) {
  throw new Error('DB_PASSWORD è ancora la password dimostrativa: impostarne una nuova in .env (vedi docs/SICUREZZA.md)');
}

// Il nome del database media viene usato nelle query: solo caratteri sicuri
for (const name of [config.db.database, config.db.mediaDatabase]) {
  if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error(`Nome di database non valido: ${name}`);
}

export type Config = typeof config;
