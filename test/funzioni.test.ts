import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import sharp from 'sharp';
import { confrontoDimensionale } from '../src/domain/dimensioni';
import { chiaviDaTradurre } from '../src/i18n/chiavi';
import { detectLang, DIZIONARI, translate } from '../src/i18n';
import { elaboraImmagine } from '../src/services/immagini.service';
import { buildWhere, searchQuerySchema, searchTerms } from '../src/services/search.service';
import { rigaScheda } from '../src/services/export.service';
import type { SchedaCompleta } from '../src/services/schede.service';
import { cleanHtml } from '../src/util/html';
import { haCriteri } from '../src/routes/pages';
import { findDuplicatePairs, findSimilar, similarity } from '../src/util/similarity';

describe('somiglianza tra nomi', () => {
  it('riconosce errori di battitura, ordine diverso e iniziali', () => {
    assert.ok(similarity('Luca Giordano', 'Luca Giordani') > 0.85);
    assert.ok(similarity('Luca Giordano', 'Giordano Luca') > 0.95);
    assert.ok(similarity('Luca Giordano', 'L. Giordano') >= 0.85);
    assert.ok(similarity('Luca Giordano', 'Angelo Puccinelli') < 0.5);
  });

  it('ignora maiuscole, accenti e corsivi', () => {
    assert.equal(similarity('Niccolò <i>dell\'Arca</i>', 'niccolo dell arca'), 1);
  });

  it('propone voci simili ma non quella identica', () => {
    const voci = [
      { id: 1, label: 'Luca Giordano' },
      { id: 2, label: 'Angelo Puccinelli' },
      { id: 3, label: 'Michele Tosini' },
    ];
    assert.deepEqual(findSimilar('Luca Giordani', voci).map((v) => v.id), [1]);
    assert.deepEqual(findSimilar('Luca Giordano', voci), []);
  });

  it('trova le coppie di probabili duplicati', () => {
    const voci = [
      { id: 1, label: 'Pittura a olio' },
      { id: 2, label: 'pittura ad olio' },
      { id: 3, label: 'Fusione' },
    ];
    const coppie = findDuplicatePairs(voci);
    assert.equal(coppie.length, 1);
    assert.deepEqual([coppie[0].a.id, coppie[0].b.id], [1, 2]);
  });
});

describe('confronto dimensionale', () => {
  const misura = (direzione: string, valore: number, unita = 'cm') => ({ direzione, valore, unita_di_misura: unita });

  it('usa la misura intera più grande (con cornice) e la sagoma umana', () => {
    const c = confrontoDimensionale([
      { titolo_gruppo_misure: 'senza cornice', intero_parziale: 'intero', misure: [misura('altezza', 113.5), misura('larghezza', 93.5)] },
      { titolo_gruppo_misure: 'con cornice', intero_parziale: 'intero', misure: [misura('altezza', 167.5), misura('larghezza', 147.5)] },
    ]);
    assert.equal(c?.riferimento, 'persona');
    assert.equal(c?.pezzi.length, 1);
    assert.equal(c?.pezzi[0].altezza, 167.5);
  });

  it('affianca le parti quando tutte le misure sono parziali (trittico)', () => {
    const c = confrontoDimensionale([
      { titolo_gruppo_misure: 'scomparto centrale', intero_parziale: 'parziale', misure: [misura('altezza', 165), misura('larghezza', 77)] },
      { titolo_gruppo_misure: 'scomparto destro', intero_parziale: 'parziale', misure: [misura('altezza', 167.5), misura('larghezza', 59)] },
      { titolo_gruppo_misure: 'scomparto sinistro', intero_parziale: 'parziale', misure: [misura('altezza', 142), misura('larghezza', 59)] },
    ]);
    assert.equal(c?.pezzi.length, 3);
  });

  it('per gli oggetti piccoli usa la mano e converte le unità', () => {
    const c = confrontoDimensionale([{ misure: [misura('h.', 70, 'mm'), misura('diam. sup', 9.3)] }]);
    assert.equal(c?.riferimento, 'mano');
    assert.equal(c?.pezzi[0].altezza, 7);
    assert.equal(c?.pezzi[0].larghezza, 9.3);
  });

  it('senza misure utilizzabili non mostra nulla', () => {
    assert.equal(confrontoDimensionale([{ misure: [misura('peso', 3, 'kg')] }]), null);
    assert.equal(confrontoDimensionale([]), null);
  });

  it('con una sola dimensione segnala le proporzioni come indicative', () => {
    const c = confrontoDimensionale([{ misure: [misura('altezza', 180)] }]);
    assert.equal(c?.pezzi[0].larghezzaStimata, true);
  });
});

describe('ricerca', () => {
  it('rende equivalenti singolare e plurale', () => {
    assert.deepEqual(searchTerms('dipinto croce San'), ['dipint', 'croc', 'San']);
  });

  it('la ricerca semplice cerca solo nei campi previsti dai requisiti', () => {
    const { where } = buildWhere(searchQuerySchema.parse({ q: 'giordano' }));
    const sql = where.toSql();
    for (const campo of ['titolo_testo', 'tds_schede_autori', 'descrizione_sintetica', 'corpo_scheda', 'tds_schede_ubicazioni', 'tds_schede_provenienze', 'storia_espositiva']) {
      assert.ok(sql.includes(campo), campo);
    }
    for (const escluso of ['iscrizioni', 'tds_schede_materiali', 'inventari']) assert.ok(!sql.includes(escluso), escluso);
  });

  it('riconosce le classificazioni dall\'etichetta ("dipinto" → Dipinti)', () => {
    const { where } = buildWhere(searchQuerySchema.parse({ q: 'dipinto' }));
    assert.ok(where.params.includes('Dipinti'));
  });

  it('passa sempre i valori come parametri', () => {
    const { where } = buildWhere(searchQuerySchema.parse({ q: "' OR 1=1 --", titolo: '%_' }));
    assert.ok(!where.toSql().includes('OR 1=1'));
    assert.ok(where.params.includes('%\\%\\_%'));
  });

  it('converte gli anni a.C.', () => {
    const { where } = buildWhere(searchQuerySchema.parse({ anno_da: '400', era_da: 'ac', anno_a: '200', era_a: 'ac' }));
    assert.ok(where.params.includes(-400) && where.params.includes(-200));
  });

  it('pubblica solo le schede approvate', () => {
    assert.ok(buildWhere(searchQuerySchema.parse({})).where.toSql().startsWith('s.stato = 2'));
  });
});

describe('home', () => {
  it('considera una ricerca solo se c\'è almeno un criterio', () => {
    assert.equal(haCriteri({}), false);
    assert.equal(haCriteri({ lang: 'en', ordina: 'titolo', pagina: '2', era_da: 'ac' }), false);
    assert.equal(haCriteri({ q: '   ' }), false);
    assert.equal(haCriteri({ q: 'giordano' }), true);
    assert.equal(haCriteri({ classificazione: 'Dipinti' }), true);
    assert.equal(haCriteri({ autori: '1' }), true);
  });
});

describe('lingue', () => {
  const req = (query: Record<string, string>, cookies: Record<string, string>, accept?: string) =>
    ({ query, cookies, get: (h: string) => (h.toLowerCase() === 'accept-language' ? accept : undefined) }) as never;

  it('sceglie la lingua da parametro, cookie o browser (italiano predefinito)', () => {
    assert.equal(detectLang(req({ lang: 'en' }, { lumina_lang: 'it' })), 'en');
    assert.equal(detectLang(req({}, { lumina_lang: 'en' })), 'en');
    assert.equal(detectLang(req({}, {}, 'en-US,en;q=0.9,it;q=0.8')), 'en');
    assert.equal(detectLang(req({}, {}, 'fr-FR,de;q=0.9')), 'it');
    assert.equal(detectLang(req({}, {})), 'it');
  });

  it('traduce con segnaposto e ricade sull\'italiano', () => {
    assert.equal(translate('en', 'Scheda n. {id}', { id: 4 }), 'Record no. 4');
    assert.equal(translate('it', 'Scheda n. {id}', { id: 4 }), 'Scheda n. 4');
    assert.equal(translate('en', 'Testo non tradotto'), 'Testo non tradotto');
  });

  it('ogni testo dell\'interfaccia ha la traduzione inglese', () => {
    const mancanti = [...chiaviDaTradurre(path.resolve(__dirname, '..'))].filter((k) => !(k in DIZIONARI.en));
    assert.deepEqual(mancanti, []);
  });
});

describe('immagini', () => {
  it('conserva l\'originale e crea anteprima e miniatura ridotte senza metadati', async () => {
    const originale = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#7a1f24' } })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Artist: 'Fotografo' } } })
      .toBuffer();
    const [orig, anteprima, miniatura] = await elaboraImmagine(originale);
    assert.equal(orig.dati, originale);
    assert.deepEqual([orig.larghezza, orig.altezza], [3000, 2000]);
    assert.equal(anteprima.mime, 'image/webp');
    assert.equal(Math.max(anteprima.larghezza, anteprima.altezza), 1280);
    assert.equal(Math.max(miniatura.larghezza, miniatura.altezza), 480);
    assert.equal((await sharp(anteprima.dati).metadata()).exif, undefined);
  });

  it('un file danneggiato è un errore di validazione, non del server', async () => {
    const png = await sharp({ create: { width: 50, height: 50, channels: 3, background: '#fff' } }).png().toBuffer();
    await assert.rejects(elaboraImmagine(Buffer.concat([png.subarray(0, 60), Buffer.alloc(40)])), /danneggiato/);
  });

  it('rifiuta file che non sono immagini', async () => {
    await assert.rejects(elaboraImmagine(Buffer.from('<svg onload="alert(1)"></svg>')), /Formato non supportato/);
  });

  it('nel testo formattato ammette solo immagini dell\'archivio', () => {
    assert.equal(cleanHtml('<p><img src="/media/3/anteprima" alt="x"></p>', 'block'), '<p><img src="/media/3/anteprima" alt="x" /></p>');
    assert.equal(cleanHtml('<p>a<img src="https://evil.example/x.png"><img src="data:image/png;base64,AA"></p>', 'block'), '<p>a</p>');
  });
});

describe('esportazione Excel', () => {
  it('trasforma la scheda in una riga leggibile', () => {
    const s = {
      id: 7,
      stato: 2,
      titolo_opera: 'Studio di <i>testa</i>',
      classificazione: 'Dipinti',
      cronologie: [{ etichetta_data: '1660 ca.', anno_data_da: -300, anno_data_a: 1665, ambito_storico: null }],
      misure: [{ titolo_gruppo_misure: 'con cornice', intero_parziale: 'intero', note: null, misure: [{ direzione: 'altezza', tipo: null, valore: 50.5, unita_di_misura: 'cm' }] }],
      inventari: [{ numero_inventario: 'Inv. 999', nome_inventario: null, descrizione: 'Proprietà dello Stato' }],
      documentazioni_fotografiche: [],
      immagini: [{ id: 1 }],
      schedatori: [{ id: 1, username: 'elena', display_name: 'Elena Pontelli' }],
      descrizione_sintetica: '<p>Testo &amp; altro</p>',
      corpo_scheda: null,
      iscrizioni: null,
      storia_espositiva: null,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: null,
      voci: {
        autori: [{ id: 2, nome: 'Michele Tosini', formula_precedente: 'copia da', formula_successiva: null, categoria: 'Opera attribuita' }],
        materiali: [{ id: 1, nome_materiale: 'Tela' }],
        tecniche: [],
        ubicazioni: [{ id: 1, ubicazione: 'Palazzo Mansi', collocazione: 'Sala 3' }],
        provenienze: [],
        mostre: [],
        bibliografie: [{ id: 1, riferimento_bibliografico: '<i>Catalogo</i>, 1909' }],
        altre_bibliografie: [],
      },
    } as unknown as SchedaCompleta;
    const r = rigaScheda(s, 'https://lumina.example');
    assert.equal(r.titolo, 'Studio di testa');
    assert.equal(r.classificazione, 'Dipinto');
    assert.equal(r.autori, 'copia da Michele Tosini (Opera attribuita)');
    assert.equal(r.anno_da, '300 a.C.');
    assert.equal(r.misure, 'con cornice (intero): altezza 50.5 cm');
    assert.equal(r.ubicazione, 'Palazzo Mansi, Sala 3');
    assert.equal(r.descrizione, 'Testo & altro');
    assert.equal(r.bibliografia, 'Catalogo, 1909');
    assert.equal(r.url, 'https://lumina.example/scheda/7');
  });
});
