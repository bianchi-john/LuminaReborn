/**
 * Test end-to-end sull'istanza avviata (dati dimostrativi): `make test-e2e`
 * oppure BASE_URL=http://localhost:3000 npm run test:e2e.
 * Crea una scheda di prova, la porta fino alla pubblicazione e poi la elimina.
 */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const ADMIN = { username: process.env.E2E_ADMIN_USER ?? 'admin', password: process.env.E2E_ADMIN_PASSWORD ?? 'admin' };
const SCHEDATORE = { username: process.env.E2E_USER ?? 'elena', password: process.env.E2E_PASSWORD ?? 'schedatore' };

class Client {
  cookie = '';
  async req(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(BASE + path, {
      method,
      redirect: 'manual',
      headers: {
        ...(this.cookie ? { Cookie: this.cookie } : {}),
        // Come un browser: le richieste che modificano dati portano l'origine del sito
        ...(method !== 'GET' ? { Origin: BASE } : {}),
        ...(body !== undefined && !(body instanceof Uint8Array) ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : body instanceof Uint8Array ? body : JSON.stringify(body),
    });
    const set = res.headers.get('set-cookie');
    if (set && /^(__Host-)?lumina_session=/.test(set)) this.cookie = set.split(';')[0];
    return res;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async json(method: string, path: string, body?: unknown): Promise<{ status: number; data: any }> {
    const res = await this.req(method, path, body);
    return { status: res.status, data: res.status === 204 ? null : await res.json().catch(() => null) };
  }
  async login(u: { username: string; password: string }) {
    const r = await this.json('POST', '/api/auth/login', u);
    assert.equal(r.status, 200, `login ${u.username}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getJson = async (url: string): Promise<any> => (await fetch(url)).json();

const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

/** Indirizzo pubblico di un'opera trovata con una ricerca (gli indirizzi non sono prevedibili). */
async function unaOpera(q = 'sebastiano'): Promise<string> {
  const html = await (await fetch(`${BASE}/?q=${q}`)).text();
  const percorso = html.match(/href="(\/opere\/[a-z0-9-]+)"/)?.[1];
  assert.ok(percorso, `la ricerca "${q}" trova almeno un'opera`);
  return percorso;
}

describe('catalogo pubblico', () => {
  it('pagine principali', async () => {
    const opera = await unaOpera();
    for (const [path, status] of [['/', 200], [opera, 200], ['/voci', 200], ['/voci/autori', 200], ['/login', 200], ['/area', 302], ['/inesistente', 404]] as const) {
      const res = await fetch(BASE + path, { redirect: 'manual' });
      assert.equal(res.status, status, path);
    }
  });

  it('la home mostra le opere solo dopo una ricerca', async () => {
    const vuota = await (await fetch(BASE + '/')).text();
    assert.doesNotMatch(vuota, /class="opera-card"/);
    const cercata = await (await fetch(BASE + '/?q=sebastiano')).text();
    assert.match(cercata, /class="opera-card"/);
  });

  it('nessun cookie per i visitatori, nemmeno cambiando lingua', async () => {
    for (const path of ['/', '/?lang=en', '/?q=giordano', await unaOpera(), '/informazioni', '/privacy?lang=en', '/termini']) {
      const res = await fetch(BASE + path);
      assert.equal(res.status, 200, path);
      assert.equal(res.headers.get('set-cookie'), null, path);
    }
  });

  it('header di sicurezza', async () => {
    const res = await fetch(BASE + '/');
    assert.match(res.headers.get('content-security-policy') ?? '', /script-src 'self'/);
    assert.match(res.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.match(res.headers.get('permissions-policy') ?? '', /camera=\(\)/);
    assert.equal(res.headers.get('referrer-policy'), 'same-origin');
    assert.equal(res.headers.get('x-powered-by'), null);
    const login = await fetch(BASE + '/login');
    assert.equal(login.headers.get('cache-control'), 'no-store');
  });

  it('login senza JavaScript: POST con token anti-CSRF, mai credenziali nell\'URL', async () => {
    const pagina = await fetch(BASE + '/login');
    const html = await pagina.text();
    assert.match(html, /<form id="login-form" method="post" action="\/login"/);
    const token = html.match(/name="csrf_token" value="([a-f0-9]{64})"/)?.[1];
    const cookie = pagina.headers.get('set-cookie')?.split(';')[0] ?? '';
    assert.ok(token && cookie.startsWith('lumina_csrf='));
    const invia = (extra: Record<string, string>, headers: Record<string, string>) =>
      fetch(BASE + '/login', {
        method: 'POST',
        redirect: 'manual',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: BASE, ...headers },
        body: new URLSearchParams({ username: ADMIN.username, password: ADMIN.password, next: '/area', ...extra }).toString(),
      });
    assert.equal((await invia({}, {})).status, 403, 'senza token');
    assert.equal((await invia({ csrf_token: token! }, { Cookie: cookie })).status, 303, 'con token');
  });

  it('la lingua segue il browser senza cookie', async () => {
    const en = await fetch(BASE + '/', { headers: { 'Accept-Language': 'en-GB,en;q=0.9' } });
    assert.match(await en.text(), /<html lang="en">/);
    assert.equal(en.headers.get('set-cookie'), null);
    const fr = await fetch(BASE + '/', { headers: { 'Accept-Language': 'fr-FR' } });
    assert.match(await fr.text(), /<html lang="it">/);
  });

  it('versione inglese', async () => {
    const res = await fetch(BASE + '/?lang=en');
    const html = await res.text();
    assert.match(html, /<html lang="en">/);
    assert.match(html, /National Museums of Lucca/);
    assert.match(html, /Or browse the indexes/);
  });

  it('ricerca: rilevanza, injection innocua, suggerimenti', async () => {
    const r = await getJson(`${BASE}/api/search?q=giordano`);
    assert.ok(r.total >= 1);
    const inj = await fetch(`${BASE}/api/search?q=${encodeURIComponent("' OR 1=1 -- ")}`);
    assert.equal(inj.status, 200);
    assert.equal(((await inj.json()) as { total: number }).total, 0);
    const s = await getJson(`${BASE}/api/suggerimenti?q=giord`);
    assert.ok(s.voci.some((v: { tipo: string }) => v.tipo === 'autori'));
  });

  it('immagini: anteprima pubblica, originale riservato', async () => {
    const html = await (await fetch(BASE + (await unaOpera()))).text();
    const id = html.match(/\/media\/([a-z2-9]{16})\/anteprima/)?.[1];
    assert.ok(id, 'l\'opera ha immagini');
    assert.equal((await fetch(`${BASE}/media/${id}/anteprima`)).headers.get('content-type'), 'image/webp');
    assert.equal((await fetch(`${BASE}/media/${id}/originale`)).status, 404);
  });
});

describe('flusso di lavoro', () => {
  const schedatore = new Client();
  const admin = new Client();
  let schedaId = 0;

  before(async () => {
    await schedatore.login(SCHEDATORE);
    await admin.login(ADMIN);
  });

  after(async () => {
    if (!schedaId) return;
    await admin.json('POST', `/api/schede/${schedaId}/depubblica`, {});
    await admin.json('DELETE', `/api/schede/${schedaId}`);
  });

  it('crea una bozza collegando voci esistenti e nuove', async () => {
    const up = await schedatore.req('POST', '/api/immagini', PNG_1PX, { 'Content-Type': 'image/png' });
    assert.equal(up.status, 201);
    const img = (await up.json()) as { id: number };
    const r = await schedatore.json('POST', '/api/schede', {
      titolo_opera: 'Prova e2e <script>x</script>',
      classificazione: 'Dipinti',
      autori: [{ nome: 'luca giordano', categoria: 'Opera attribuita' }],
      materiali: [{ nome_materiale: 'Tela' }],
      misure: [{ titolo_gruppo_misure: 'intero', misure: [{ direzione: 'altezza', valore: '100,5', unita_di_misura: 'cm' }] }],
      immagini: [{ id: img.id, didascalia: 'fronte' }],
      stato: 2,
    });
    assert.equal(r.status, 201);
    schedaId = r.data.id;
    const s = await schedatore.json('GET', `/api/schede/${schedaId}`);
    assert.equal(s.data.stato, 0);
    assert.equal(s.data.titolo_opera, 'Prova e2e');
    assert.equal(s.data.voci.autori[0].nome, 'Luca Giordano', 'riusa l\'autore esistente');
  });

  it('la bozza non è visibile al pubblico', async () => {
    assert.equal((await fetch(`${BASE}/api/schede/${schedaId}`)).status, 401);
    assert.equal((await fetch(`${BASE}/scheda/${schedaId}`)).status, 404, 'gli ID numerici non portano a nulla');
  });

  it('protezioni: CSRF e permessi', async () => {
    const csrf = await schedatore.req('POST', `/api/schede/${schedaId}/invia`, {}, { Origin: 'https://evil.example' });
    assert.equal(csrf.status, 403);
    const crossSite = await schedatore.req('POST', `/api/schede/${schedaId}/invia`, {}, { 'Sec-Fetch-Site': 'cross-site' });
    assert.equal(crossSite.status, 403);
    const senzaOrigine = await fetch(`${BASE}/api/schede/${schedaId}/invia`, {
      method: 'POST',
      headers: { Cookie: schedatore.cookie, 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(senzaOrigine.status, 403);
    assert.equal((await schedatore.req('GET', '/area')).headers.get('cache-control'), 'no-store');
    const approva = await schedatore.json('POST', `/api/schede/${schedaId}/approva`, {});
    assert.equal(approva.status, 403);
  });

  it('invio, rifiuto con motivazione, approvazione', async () => {
    assert.equal((await schedatore.json('POST', `/api/schede/${schedaId}/invia`, { commento: 'pronta' })).status, 200);
    assert.equal((await admin.json('POST', `/api/schede/${schedaId}/respingi`, {})).status, 400);
    assert.equal((await admin.json('POST', `/api/schede/${schedaId}/respingi`, { commento: 'manca la datazione' })).status, 200);
    assert.equal((await schedatore.json('POST', `/api/schede/${schedaId}/invia`, {})).status, 200);
    assert.equal((await admin.json('POST', `/api/schede/${schedaId}/approva`, {})).status, 200);
    const { percorso } = (await schedatore.json('GET', `/api/schede/${schedaId}`)).data as { percorso: string };
    assert.match(percorso, /^\/opere\/prova-e2e-[a-z2-9]{10}$/);
    assert.equal((await fetch(BASE + percorso)).status, 200);
    const altroTitolo = await fetch(`${BASE}/opere/titolo-sbagliato-${percorso.slice(-10)}`, { redirect: 'manual' });
    assert.equal(altroTitolo.status, 301, 'il titolo nell\'indirizzo si corregge da solo');
    assert.equal(new URL(altroTitolo.headers.get('location') ?? '', BASE).pathname, percorso);
  });

  it('cambio password: richiede quella attuale e chiude le altre sessioni', async () => {
    const altra = new Client();
    await altra.login(SCHEDATORE);
    const sbagliata = await schedatore.json('POST', '/api/auth/password', { attuale: 'sbagliata', nuova: 'NuovaPassword2026' });
    assert.equal(sbagliata.status, 400);
    assert.equal((await schedatore.json('POST', '/api/auth/password', { attuale: SCHEDATORE.password, nuova: 'NuovaPassword2026' })).status, 200);
    assert.equal((await altra.req('GET', '/api/schede')).status, 401, 'la sessione sull\'altro dispositivo è chiusa');
    assert.equal((await schedatore.req('GET', '/api/schede')).status, 200, 'la sessione corrente resta attiva');
    assert.equal((await schedatore.json('POST', '/api/auth/password', { attuale: 'NuovaPassword2026', nuova: SCHEDATORE.password })).status, 200);
  });

  it('esportazione Excel solo per gli amministratori', async () => {
    assert.equal((await schedatore.req('GET', '/api/esportazioni/catalogo.xlsx')).status, 403);
    const res = await admin.req('GET', '/api/esportazioni/catalogo.xlsx');
    assert.equal(res.status, 200);
    assert.equal(Buffer.from(await res.arrayBuffer()).subarray(0, 2).toString(), 'PK');
  });
});
