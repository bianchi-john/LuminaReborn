import { NextFunction, Request, Response } from 'express';
import { isIPv4, isIPv6 } from 'net';
import { config } from '../config';
import { logger } from '../logger';

/**
 * Protezione dalla copia automatica del catalogo (scraping).
 *
 * Ogni indirizzo IP ha un numero massimo di richieste al minuto e all'ora per
 * pagine, immagini e API. Chi supera più volte il limite al minuto, o anche una
 * sola volta quello orario, viene bloccato per un'ora (poi 2, 4, ... fino a 24
 * ore se insiste). Lo staff autenticato non è soggetto ai limiti.
 *
 * Tutto resta in memoria e si azzera al riavvio: gli indirizzi non vengono mai
 * scritti su disco né nei log e sono dimenticati quando non servono più.
 */

export type Categoria = 'pagine' | 'media' | 'api';

export interface Regola {
  categoria: Categoria;
  finestraMs: number;
  limite: number;
  /** Superamenti conteggiati ogni volta che la regola viene violata. */
  peso: number;
}

export interface OpzioniSorveglianza {
  regole: Regola[];
  /** Superamenti (entro `periodoMs`) che fanno scattare il blocco. */
  superamentiPerBlocco: number;
  periodoMs: number;
  bloccoMs: number;
  bloccoMaxMs: number;
  /** Indirizzi seguiti contemporaneamente al massimo (limite di memoria). */
  maxIndirizzi: number;
}

export type Esito = { ok: true } | { ok: false; bloccato: boolean; riprovaTraS: number };

interface Stato {
  contatori: { finestra: number; n: number }[];
  superamenti: number[];
  bloccatoFino: number;
  blocchi: number;
  ultimoBlocco: number;
}

const GIORNO = 24 * 60 * 60 * 1000;

export class Sorveglianza {
  private readonly stati = new Map<string, Stato>();

  constructor(
    private readonly o: OpzioniSorveglianza,
    private readonly ora: () => number = Date.now,
    private readonly alBlocco: (durataMs: number) => void = () => undefined,
  ) {}

  get indirizziSeguiti(): number {
    return this.stati.size;
  }

  /** Verifica solo se l'indirizzo è bloccato, senza conteggiare la richiesta. */
  bloccato(chiave: string): Esito {
    const s = this.stati.get(chiave);
    const adesso = this.ora();
    return s && s.bloccatoFino > adesso ? { ok: false, bloccato: true, riprovaTraS: Math.ceil((s.bloccatoFino - adesso) / 1000) } : { ok: true };
  }

  registra(chiave: string, categoria: Categoria): Esito {
    const adesso = this.ora();
    const s = this.stato(chiave);
    if (s.bloccatoFino > adesso) return { ok: false, bloccato: true, riprovaTraS: Math.ceil((s.bloccatoFino - adesso) / 1000) };

    let riprovaTraMs = 0;
    this.o.regole.forEach((r, i) => {
      if (r.categoria !== categoria) return;
      const finestra = Math.floor(adesso / r.finestraMs);
      const c = s.contatori[i];
      if (c.finestra !== finestra) Object.assign(c, { finestra, n: 0 });
      c.n++;
      if (c.n <= r.limite) return;
      riprovaTraMs = Math.max(riprovaTraMs, (finestra + 1) * r.finestraMs - adesso);
      // Un solo superamento per finestra: le richieste successive vengono solo respinte
      if (c.n === r.limite + 1) for (let k = 0; k < r.peso; k++) s.superamenti.push(adesso);
    });
    if (!riprovaTraMs) return { ok: true };

    s.superamenti = s.superamenti.filter((t) => adesso - t < this.o.periodoMs);
    if (s.superamenti.length >= this.o.superamentiPerBlocco) {
      if (adesso - s.ultimoBlocco > GIORNO) s.blocchi = 0;
      const durata = Math.min(this.o.bloccoMs * 2 ** s.blocchi, this.o.bloccoMaxMs);
      Object.assign(s, { bloccatoFino: adesso + durata, blocchi: s.blocchi + 1, ultimoBlocco: adesso, superamenti: [] });
      this.alBlocco(durata);
      return { ok: false, bloccato: true, riprovaTraS: Math.ceil(durata / 1000) };
    }
    return { ok: false, bloccato: false, riprovaTraS: Math.ceil(riprovaTraMs / 1000) };
  }

  /** Dimentica gli indirizzi senza blocchi in corso né richieste recenti. */
  pulisci(): void {
    const adesso = this.ora();
    for (const [chiave, s] of this.stati) if (this.dimenticabile(s, adesso)) this.stati.delete(chiave);
  }

  private dimenticabile(s: Stato, adesso: number): boolean {
    if (s.bloccatoFino > adesso || (s.blocchi > 0 && adesso - s.ultimoBlocco < GIORNO)) return false;
    if (s.superamenti.some((t) => adesso - t < this.o.periodoMs)) return false;
    return this.o.regole.every((r, i) => s.contatori[i].finestra < Math.floor(adesso / r.finestraMs));
  }

  private stato(chiave: string): Stato {
    let s = this.stati.get(chiave);
    if (s) return s;
    if (this.stati.size >= this.o.maxIndirizzi) {
      this.pulisci();
      // Ancora pieno: si sacrifica il più vecchio non bloccato (l'ordine della Map è quello di inserimento)
      const adesso = this.ora();
      for (const [k, v] of this.stati) {
        if (this.stati.size < this.o.maxIndirizzi) break;
        if (v.bloccatoFino <= adesso) this.stati.delete(k);
      }
    }
    s = { contatori: this.o.regole.map(() => ({ finestra: -1, n: 0 })), superamenti: [], bloccatoFino: 0, blocchi: 0, ultimoBlocco: 0 };
    this.stati.set(chiave, s);
    return s;
  }
}

/** Gli indirizzi IPv6 si raggruppano per /64: una singola connessione ne ha a disposizione milioni. */
export function chiaveIndirizzo(ip: string): string {
  const v4 = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  if (isIPv4(v4)) return v4;
  if (!isIPv6(ip)) return ip;
  const [testa, coda = ''] = ip.split('::');
  const sx = testa ? testa.split(':') : [];
  const dx = coda ? coda.split(':') : [];
  const gruppi = ip.includes('::') ? [...sx, ...Array(8 - sx.length - dx.length).fill('0'), ...dx] : sx;
  return `${gruppi.slice(0, 4).map((g) => g.toLowerCase().replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

/** Categoria della richiesta; `null` = non conteggiata (accesso staff, controlli tecnici). */
export function categoriaDi(path: string): Categoria | null {
  if (/^\/(login|logout|healthz|robots\.txt|\.well-known)(\/|$)/.test(path)) return null;
  if (path.startsWith('/media/')) return 'media';
  if (path.startsWith('/api/')) return 'api';
  return 'pagine';
}

/** Crawler che raccolgono contenuti per addestrare modelli di IA: esclusi del tutto. */
export const CRAWLER_IA = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'CCBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Google-Extended',
  'Applebot-Extended', 'Bytespider', 'PerplexityBot', 'Meta-ExternalAgent', 'FacebookBot', 'Amazonbot', 'cohere-ai',
  'Diffbot', 'ImagesiftBot', 'Omgilibot', 'Timpibot', 'img2dataset',
];
const CRAWLER_IA_RE = new RegExp(CRAWLER_IA.map((n) => n.replace(/[.-]/g, '\\$&')).join('|'), 'i');

export function robotsTxt(): string {
  const ia = CRAWLER_IA.map((n) => `User-agent: ${n}`).join('\n');
  return `${ia}\nDisallow: /\n\nUser-agent: *\nDisallow: /area\nDisallow: /api\nDisallow: /login\nDisallow: /media\nCrawl-delay: 10\n`;
}

const minuto = 60 * 1000;
const ora = 60 * minuto;
const s = config.scraping;

export const sorveglianza = new Sorveglianza(
  {
    regole: [
      { categoria: 'pagine', finestraMs: minuto, limite: s.pagineMinuto, peso: 1 },
      { categoria: 'pagine', finestraMs: ora, limite: s.pagineOra, peso: 3 },
      { categoria: 'media', finestraMs: minuto, limite: s.mediaMinuto, peso: 1 },
      { categoria: 'media', finestraMs: ora, limite: s.mediaOra, peso: 3 },
      { categoria: 'api', finestraMs: minuto, limite: s.apiMinuto, peso: 1 },
    ],
    superamentiPerBlocco: 3,
    periodoMs: ora,
    bloccoMs: s.bloccoMinuti * minuto,
    bloccoMaxMs: 24 * ora,
    maxIndirizzi: 50_000,
  },
  Date.now,
  (durata) => logger.warn(`Un indirizzo è stato bloccato per ${Math.round(durata / minuto)} minuti: troppe richieste (possibile scraping)`),
);
if (s.attiva) setInterval(() => sorveglianza.pulisci(), 5 * minuto).unref();

export function protezioneScraping(req: Request, res: Response, next: NextFunction): void {
  if (!s.attiva || req.user) return next();
  if (CRAWLER_IA_RE.test(req.get('user-agent') ?? '')) {
    res.setHeader('Cache-Control', 'no-store');
    return void res.status(403).type('text/plain').send('Forbidden');
  }
  const categoria = categoriaDi(req.path);
  if (!categoria) return next();
  const esito = sorveglianza.registra(chiaveIndirizzo(req.ip ?? ''), categoria);
  if (esito.ok) return next();

  const messaggio = esito.bloccato
    ? req.t('Troppe richieste da questo indirizzo: l\'accesso è sospeso temporaneamente. Riprova più tardi.')
    : req.t('Troppe richieste. Riprova tra poco.');
  res.setHeader('Retry-After', String(esito.riprovaTraS));
  res.setHeader('Cache-Control', 'no-store');
  res.status(429);
  if (categoria === 'api') return void res.json({ error: messaggio });
  if (categoria === 'media') return void res.type('text/plain').send(messaggio);
  // Pagina minima, senza consultare database o template
  const titolo = req.t('Troppe richieste');
  res.type('html').send(
    `<!doctype html><html lang="${req.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<meta name="robots" content="noindex"><title>${titolo}</title></head>` +
      `<body><h1>${titolo}</h1><p>${messaggio}</p></body></html>`,
  );
}
