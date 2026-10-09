import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SessionUser } from '../src/auth/session';
import { parseSchedaInput } from '../src/domain/scheda.schema';
import { safeNext } from '../src/routes/pages';
import { detectImageType } from '../src/services/immagini.service';
import { computePermessi } from '../src/services/schede.service';
import { cleanHtml, htmlToText } from '../src/util/html';
import { escapeLike } from '../src/util/sql';

const schedatore: SessionUser = { id: 10, remoteId: 'a', username: 'elena', displayName: 'Elena', role: 'schedatore', isAdmin: false };
const altro: SessionUser = { ...schedatore, id: 11, username: 'virginia' };
const admin: SessionUser = { ...schedatore, id: 1, username: 'admin', role: 'admin', isAdmin: true };

describe('sanitizzazione HTML', () => {
  it('rimuove script, gestori di eventi e link javascript:', () => {
    const out = cleanHtml('<p onclick="x()">Ciao <script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">link</a></p>', 'block');
    assert.equal(out, '<p>Ciao <a rel="noopener noreferrer nofollow" target="_blank">link</a></p>');
  });

  it('nei campi in linea mantiene solo la formattazione del testo', () => {
    assert.equal(cleanHtml('<h1>San <i>Sebastiano</i></h1><p>x</p>', 'inline'), 'San <i>Sebastiano</i>x');
  });

  it('converte in testo semplice', () => {
    assert.equal(htmlToText('Trittico con <i>Matrimonio</i>&nbsp;mistico &amp; altro'), 'Trittico con Matrimonio mistico & altro');
  });

  it('restituisce null per contenuto vuoto', () => {
    assert.equal(cleanHtml('<p> </p><br>', 'block'), null);
  });
});

describe('validazione della scheda', () => {
  const base = { titolo_opera: '<i>San Giovanni</i>' };

  it('accetta una scheda minima e normalizza i campi assenti', () => {
    const s = parseSchedaInput(base);
    assert.equal(s.titolo_opera, '<i>San Giovanni</i>');
    assert.equal(s.classificazione, null);
    assert.deepEqual(s.autori, []);
    assert.deepEqual(s.misure, []);
  });

  it('richiede il titolo', () => {
    assert.throws(() => parseSchedaInput({ titolo_opera: '  ' }), /titolo/i);
  });

  it('rifiuta classificazioni non previste', () => {
    assert.throws(() => parseSchedaInput({ ...base, classificazione: 'Astronavi' }));
  });

  it('ignora le righe vuote del form', () => {
    const s = parseSchedaInput({ ...base, autori: [{ nome: '' }, { id: 3 }], inventari: [{ numero_inventario: '' }] });
    assert.equal(s.autori.length, 1);
    assert.equal(s.autori[0].id, 3);
    assert.equal(s.inventari.length, 0);
  });

  it('una voce richiede un id esistente o il nome per crearla', () => {
    assert.throws(() => parseSchedaInput({ ...base, autori: [{ formula_precedente: 'copia da' }] }), /Autore/);
    const s = parseSchedaInput({ ...base, autori: [{ nome: ' Luca Giordano ', categoria: 'Opera attribuita' }] });
    assert.equal(s.autori[0].nome, 'Luca Giordano');
    assert.equal(s.autori[0].id, null);
  });

  it('controlla i valori ammessi per la categoria di attribuzione', () => {
    assert.throws(() => parseSchedaInput({ ...base, autori: [{ nome: 'X', categoria: 'Inventata' }] }));
  });

  it('accetta i decimali con la virgola nelle misure', () => {
    const s = parseSchedaInput({ ...base, misure: [{ titolo_gruppo_misure: 'con cornice', misure: [{ direzione: 'altezza', valore: '113,5', unita_di_misura: 'cm' }] }] });
    assert.equal(s.misure[0].misure[0].valore, 113.5);
  });

  it('valida le date della cronologia', () => {
    assert.throws(() => parseSchedaInput({ ...base, cronologie: [{ mese_data_da: 13 }] }));
    const s = parseSchedaInput({ ...base, cronologie: [{ anno_data_da: '-300', anno_data_a: -250 }] });
    assert.equal(s.cronologie[0].anno_data_da, -300);
  });

  it('ripulisce l\'HTML nei campi di testo', () => {
    const s = parseSchedaInput({ ...base, corpo_scheda: '<p>Testo<script>x</script></p>' });
    assert.equal(s.corpo_scheda, '<p>Testo</p>');
  });

  it('scarta i campi sconosciuti', () => {
    const s = parseSchedaInput({ ...base, stato: 2, created_by: 1 }) as unknown as Record<string, unknown>;
    assert.equal(s.stato, undefined);
    assert.equal(s.created_by, undefined);
  });
});

describe('permessi sulle schede', () => {
  const bozza = { stato: 0, created_by: schedatore.id };
  const inRevisione = { stato: 1, created_by: schedatore.id };
  const pubblicata = { stato: 2, created_by: schedatore.id };

  it('le bozze sono visibili solo al proprietario e agli amministratori', () => {
    assert.equal(computePermessi(bozza, undefined).visualizza, false);
    assert.equal(computePermessi(bozza, altro).visualizza, false);
    assert.equal(computePermessi(bozza, schedatore).visualizza, true);
    assert.equal(computePermessi(bozza, admin).visualizza, true);
  });

  it('le schede pubblicate sono visibili a tutti ma non modificabili dallo schedatore', () => {
    assert.equal(computePermessi(pubblicata, undefined).visualizza, true);
    assert.equal(computePermessi(pubblicata, schedatore).modifica, false);
    assert.equal(computePermessi(pubblicata, admin).modifica, true);
  });

  it('lo schedatore modifica e invia solo le bozze', () => {
    assert.equal(computePermessi(bozza, schedatore).modifica, true);
    assert.equal(computePermessi(bozza, schedatore).invia, true);
    assert.equal(computePermessi(inRevisione, schedatore).modifica, false);
    assert.equal(computePermessi(inRevisione, schedatore).ritira, true);
  });

  it('solo l\'amministratore approva o respinge', () => {
    assert.equal(computePermessi(inRevisione, schedatore).approva, false);
    assert.equal(computePermessi(inRevisione, admin).approva, true);
    assert.equal(computePermessi(inRevisione, admin).respingi, true);
    assert.equal(computePermessi(pubblicata, admin).depubblica, true);
  });

  it('una scheda pubblicata non si elimina senza prima ritirarla', () => {
    assert.equal(computePermessi(pubblicata, admin).elimina, false);
    assert.equal(computePermessi(bozza, admin).elimina, true);
  });

  it('un collaboratore accreditato ha gli stessi diritti del proprietario', () => {
    assert.equal(computePermessi(bozza, altro, true).modifica, true);
  });
});

describe('utilità', () => {
  it('riconosce i formati immagine dai primi byte', () => {
    assert.equal(detectImageType(Buffer.from('ffd8ffe000104a4649460001', 'hex')), 'image/jpeg');
    assert.equal(detectImageType(Buffer.from('89504e470d0a1a0a0000000d', 'hex')), 'image/png');
    assert.equal(detectImageType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'binary')), 'image/webp');
    assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">')), null);
  });

  it('impedisce redirect verso altri siti dopo il login', () => {
    assert.equal(safeNext('/area/schede/3'), '/area/schede/3');
    assert.equal(safeNext('//evil.example'), '/area');
    assert.equal(safeNext('/\\evil.example'), '/area');
    assert.equal(safeNext('https://evil.example'), '/area');
    assert.equal(safeNext(undefined), '/area');
  });

  it('rende letterali i caratteri jolly di LIKE', () => {
    assert.equal(escapeLike('50%_a\\b'), '50\\%\\_a\\\\b');
  });
});
