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
        ...(body !== undefined && !(body instanceof Uint8Array) ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : body instanceof Uint8Array ? body : JSON.stringify(body),
    });
    const set = res.headers.get('set-cookie');
    if (set?.startsWith('lumina_session=')) this.cookie = set.split(';')[0];
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

describe('catalogo pubblico', () => {
  it('pagine principali', async () => {
    for (const [path, status] of [['/', 200], ['/scheda/1', 200], ['/voci', 200], ['/voci/autori', 200], ['/login', 200], ['/area', 302], ['/inesistente', 404]] as const) {
      const res = await fetch(BASE + path, { redirect: 'manual' });
      assert.equal(res.status, status, path);
    }
  });

  it('header di sicurezza', async () => {
    const res = await fetch(BASE + '/');
    assert.match(res.headers.get('content-security-policy') ?? '', /script-src 'self'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  it('versione inglese', async () => {
    const res = await fetch(BASE + '/?lang=en');
    const html = await res.text();
    assert.match(html, /<html lang="en">/);
    assert.match(html, /Catalogue of works/);
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
    const html = await (await fetch(BASE + '/scheda/1')).text();
    const id = html.match(/\/media\/(\d+)\/anteprima/)?.[1];
    assert.ok(id, 'la scheda 1 ha immagini');
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
    assert.equal((await fetch(`${BASE}/api/schede/${schedaId}`)).status, 404);
  });

  it('protezioni: CSRF e permessi', async () => {
    const csrf = await schedatore.req('POST', `/api/schede/${schedaId}/invia`, {}, { Origin: 'https://evil.example' });
    assert.equal(csrf.status, 403);
    const approva = await schedatore.json('POST', `/api/schede/${schedaId}/approva`, {});
    assert.equal(approva.status, 403);
  });

  it('invio, rifiuto con motivazione, approvazione', async () => {
    assert.equal((await schedatore.json('POST', `/api/schede/${schedaId}/invia`, { commento: 'pronta' })).status, 200);
    assert.equal((await admin.json('POST', `/api/schede/${schedaId}/respingi`, {})).status, 400);
    assert.equal((await admin.json('POST', `/api/schede/${schedaId}/respingi`, { commento: 'manca la datazione' })).status, 200);
    assert.equal((await schedatore.json('POST', `/api/schede/${schedaId}/invia`, {})).status, 200);
    assert.equal((await admin.json('POST', `/api/schede/${schedaId}/approva`, {})).status, 200);
    assert.equal((await fetch(`${BASE}/scheda/${schedaId}`)).status, 200);
  });

  it('esportazione Excel solo per gli amministratori', async () => {
    assert.equal((await schedatore.req('GET', '/api/esportazioni/catalogo.xlsx')).status, 403);
    const res = await admin.req('GET', '/api/esportazioni/catalogo.xlsx');
    assert.equal(res.status, 200);
    assert.equal(Buffer.from(await res.arrayBuffer()).subarray(0, 2).toString(), 'PK');
  });
});
