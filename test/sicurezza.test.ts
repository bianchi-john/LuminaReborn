import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { categoriaDi, chiaveIndirizzo, robotsTxt, Sorveglianza } from '../src/http/antiscraping';
import { codiceDaPercorso, CODICE_IMMAGINE, CODICE_OPERA, generaCodice, LUNGHEZZA_CODICE_OPERA, percorsoOpera, slugTitolo } from '../src/util/codici';

const MINUTO = 60_000;

function sorveglianza(orologio: { t: number }, blocchi: number[] = []) {
  return new Sorveglianza(
    {
      regole: [
        { categoria: 'pagine', finestraMs: MINUTO, limite: 5, peso: 1 },
        { categoria: 'pagine', finestraMs: 60 * MINUTO, limite: 20, peso: 3 },
      ],
      superamentiPerBlocco: 3,
      periodoMs: 60 * MINUTO,
      bloccoMs: 60 * MINUTO,
      bloccoMaxMs: 24 * 60 * MINUTO,
      maxIndirizzi: 3,
    },
    () => orologio.t,
    (d) => blocchi.push(d),
  );
}

describe('protezione dallo scraping', () => {
  it('respinge le richieste oltre il limite al minuto senza bloccare subito', () => {
    const clock = { t: 0 };
    const s = sorveglianza(clock);
    for (let i = 0; i < 5; i++) assert.ok(s.registra('1.2.3.4', 'pagine').ok);
    const esito = s.registra('1.2.3.4', 'pagine');
    assert.equal(esito.ok, false);
    assert.equal(!esito.ok && esito.bloccato, false);
    assert.ok(s.registra('5.6.7.8', 'pagine').ok, 'gli altri indirizzi non sono toccati');
    assert.ok(s.registra('1.2.3.4', 'media').ok, 'categorie senza regole non sono limitate');
    clock.t += MINUTO;
    assert.ok(s.registra('1.2.3.4', 'pagine').ok, 'nuovo minuto, nuovo conteggio');
  });

  it('blocca dopo tre superamenti in un\'ora e raddoppia il blocco se insiste', () => {
    const clock = { t: 0 };
    const blocchi: number[] = [];
    const s = sorveglianza(clock, blocchi);
    const raffica = () => {
      let ultimo = s.registra('9.9.9.9', 'pagine');
      for (let i = 0; i < 5; i++) ultimo = s.registra('9.9.9.9', 'pagine');
      return ultimo;
    };
    raffica();
    clock.t += MINUTO;
    raffica();
    clock.t += MINUTO;
    const terzo = raffica();
    assert.equal(!terzo.ok && terzo.bloccato, true);
    assert.deepEqual(blocchi, [60 * MINUTO]);
    clock.t += 30 * MINUTO;
    const durante = s.registra('9.9.9.9', 'pagine');
    assert.equal(!durante.ok && durante.bloccato && durante.riprovaTraS, 30 * 60);
    assert.equal(s.bloccato('9.9.9.9').ok, false);

    clock.t += 31 * MINUTO;
    assert.ok(s.registra('9.9.9.9', 'pagine').ok, 'il blocco scade');
    for (let k = 0; k < 3; k++) {
      clock.t += MINUTO;
      raffica();
    }
    assert.deepEqual(blocchi, [60 * MINUTO, 120 * MINUTO]);
  });

  it('blocca subito chi supera il limite orario anche andando piano', () => {
    const clock = { t: 0 };
    const s = sorveglianza(clock);
    let esito = s.registra('7.7.7.7', 'pagine');
    for (let i = 0; i < 20; i++) {
      clock.t += 15_000; // 4 per minute: under the per-minute limit
      esito = s.registra('7.7.7.7', 'pagine');
    }
    assert.equal(!esito.ok && esito.bloccato, true);
  });

  it('dimentica gli indirizzi inattivi e non supera il limite di memoria', () => {
    const clock = { t: 0 };
    const s = sorveglianza(clock);
    for (const ip of ['a', 'b', 'c', 'd', 'e']) s.registra(ip, 'pagine');
    assert.ok(s.indirizziSeguiti <= 3);
    clock.t += 2 * 60 * MINUTO;
    s.pulisci();
    assert.equal(s.indirizziSeguiti, 0);
  });

  it('raggruppa gli IPv6 per /64 e riconosce gli IPv4 mappati', () => {
    assert.equal(chiaveIndirizzo('203.0.113.7'), '203.0.113.7');
    assert.equal(chiaveIndirizzo('::ffff:203.0.113.7'), '203.0.113.7');
    assert.equal(chiaveIndirizzo('2001:db8:0:1:aaaa::1'), '2001:db8:0:1::/64');
    assert.equal(chiaveIndirizzo('2001:0db8:0000:0001:ffff:ffff:ffff:ffff'), '2001:db8:0:1::/64');
    assert.equal(chiaveIndirizzo('2001:db8::1'), '2001:db8:0:0::/64');
  });

  it('classifica le richieste e chiude il sito ai crawler di IA', () => {
    assert.equal(categoriaDi('/opere/annunciazione-abc'), 'pagine');
    assert.equal(categoriaDi('/media/abc/anteprima'), 'media');
    assert.equal(categoriaDi('/sfondi/abc-0.webp'), 'media', 'gli sfondi della home contano come immagini, non come pagine');
    assert.equal(categoriaDi('/api/ricerca/suggerimenti'), 'api');
    assert.equal(categoriaDi('/login'), null);
    assert.equal(categoriaDi('/healthz'), null);
    assert.match(robotsTxt(), /User-agent: GPTBot[\s\S]*Disallow: \/\n/);
  });
});

describe('codici pubblici', () => {
  it('sono casuali, del formato atteso e non sequenziali', () => {
    const codici = new Set(Array.from({ length: 2000 }, () => generaCodice(LUNGHEZZA_CODICE_OPERA)));
    assert.equal(codici.size, 2000);
    for (const c of codici) assert.match(c, CODICE_OPERA);
    assert.match(generaCodice(16), CODICE_IMMAGINE);
  });

  it('l\'indirizzo usa solo le prime parole del titolo', () => {
    assert.equal(slugTitolo('<i>Annunciazione</i> con San Giovannino, Santa Caterina d\'Alessandria e committenti in preghiera'), 'annunciazione-con-san-giovannino-santa-caterina-d');
    assert.equal(slugTitolo('Città & paesaggio'), 'citta-paesaggio');
    assert.equal(slugTitolo('!!!'), 'opera');
    const p = percorsoOpera('Madonna col Bambino', 'abcdefghjk');
    assert.equal(p, '/opere/madonna-col-bambino-abcdefghjk');
    assert.equal(codiceDaPercorso(p.slice('/opere/'.length)), 'abcdefghjk');
    assert.equal(codiceDaPercorso('titolo-qualsiasi-abcdefghjk'), 'abcdefghjk', 'il titolo nell\'indirizzo può cambiare');
    assert.equal(codiceDaPercorso('madonna-123'), null);
    assert.equal(codiceDaPercorso('abcdefghj0'), null);
  });
});
