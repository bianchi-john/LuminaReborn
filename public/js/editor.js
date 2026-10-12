import { api, confirmDialog, el, htmlToText, toast } from './lib/api.js';
import { attachAutocomplete } from './lib/autocomplete.js';
import { locale, t } from './lib/i18n.js';
import { createRichText } from './lib/richtext.js';

const form = document.getElementById('editor');
const statusEl = document.getElementById('editor-stato');
const erroriEl = document.getElementById('editor-errori');
const scheda = JSON.parse(document.getElementById('scheda-data').textContent);
const config = await api('GET', '/api/config');
const VOCAB = Object.fromEntries(config.vocabolari.map((v) => [v.key, v]));

let schedaId = scheda?.id ?? null;
let dirty = false;
const listeners = new Set();
const markDirty = () => {
  dirty = true;
  statusEl.textContent = t('Modifiche non salvate');
  listeners.forEach((fn) => fn());
};
form.addEventListener('input', markDirty);
form.addEventListener('change', markDirty);
window.addEventListener('beforeunload', (event) => {
  if (dirty) event.preventDefault();
});

let uid = 0;
const nextId = (prefix) => `${prefix}-${++uid}`;

// ---------------------------------------------------------------------------
// Campi elementari
// ---------------------------------------------------------------------------

function labelled(labelText, control, { col = 'col-md-6', id } = {}) {
  return el('div', { class: col }, el('label', { class: 'form-label small mb-1', for: id, text: labelText }), control);
}

/** <select> con le opzioni proposte; un valore diverso (dati importati) viene mantenuto. */
function selectWith(options, value, { id, translate = true, empty = '—', ariaLabel } = {}) {
  const select = el('select', { class: 'form-select', id, 'aria-label': ariaLabel }, el('option', { value: '', text: empty }));
  for (const o of options) select.append(el('option', { value: o, text: translate ? t(o) : o }));
  if (value && !options.includes(value)) select.append(el('option', { value, text: value }));
  select.value = value ?? '';
  return select;
}

/** Campo generico da una definizione {name, label, type, options, ...}. */
function field(def, value, { col } = {}) {
  const id = nextId(def.name);
  if (def.type === 'inline') {
    const lblId = nextId('lbl');
    const rte = createRichText({ kind: 'inline', value: value ?? '', labelledBy: lblId, onChange: markDirty });
    return {
      node: el('div', { class: col ?? 'col-12' }, el('span', { class: 'form-label small mb-1 d-block', id: lblId, text: t(def.label) }), rte.root),
      get: () => rte.getValue() || null,
      set: (v) => rte.setValue(v),
    };
  }
  let control;
  if (def.options) {
    control = selectWith(def.options, value, { id });
  } else if (def.type === 'longtext') {
    control = el('textarea', { class: 'form-control', id, rows: 2, maxlength: def.max });
    control.value = value ?? '';
  } else {
    control = el('input', { class: 'form-control', id, type: def.type === 'int' ? 'number' : 'text', maxlength: def.max, min: def.min, max: def.maxValue });
    control.value = value ?? '';
  }
  return {
    node: labelled(t(def.label), control, { col: col ?? (def.type === 'longtext' ? 'col-12' : def.type === 'int' ? 'col-4 col-md-2' : 'col-md-6'), id }),
    get: () => (control.value.trim() === '' ? null : control.value.trim()),
    set: (v) => (control.value = v ?? ''),
  };
}

/** Anno con era (a.C./d.C.): nel database gli anni a.C. sono negativi. */
function annoConEra(label, valore) {
  const input = el('input', { class: 'form-control', type: 'number', min: 0, max: 99999, placeholder: t('Anno'), 'aria-label': `${label}: ${t('anno')}` });
  const era = el('select', { class: 'form-select flex-grow-0 w-auto', 'aria-label': `${label}: ${t('era')}` }, el('option', { value: 'dc', text: t('d.C.') }), el('option', { value: 'ac', text: t('a.C.') }));
  if (valore !== null && valore !== undefined && valore !== '') {
    input.value = Math.abs(Number(valore));
    era.value = Number(valore) < 0 ? 'ac' : 'dc';
  }
  return {
    node: el('div', { class: 'input-group' }, input, era),
    get: () => (input.value === '' ? null : (era.value === 'ac' ? -1 : 1) * Math.abs(Number(input.value))),
  };
}

// ---------------------------------------------------------------------------
// Righe ripetibili (con riordino e limite massimo)
// ---------------------------------------------------------------------------

function repeater(container, { addLabel, createRow, initial = [], startWithOne = false, emptyText, max = Infinity, rowClass = () => '' }) {
  const list = el('div', { class: 'repeat-list' });
  const empty = emptyText ? el('p', { class: 'small text-muted-lu', text: emptyText }) : null;
  const rows = [];
  const addBtn = el('button', { type: 'button', class: 'btn btn-sm btn-outline-primary mt-2', text: `+ ${addLabel}` });
  const limit = el('span', { class: 'small text-muted-lu ms-2 d-none', text: t('Numero massimo raggiunto ({n})', { n: max }) });

  const refresh = () => {
    if (empty) empty.classList.toggle('d-none', rows.length > 0);
    rows.forEach((r, i) => {
      r.up.disabled = i === 0;
      r.down.disabled = i === rows.length - 1;
      r.node.className = `repeat-row ${rowClass(i)}`;
      r.onIndex?.(i);
    });
    addBtn.disabled = rows.length >= max;
    limit.classList.toggle('d-none', rows.length < max);
    listeners.forEach((fn) => fn());
  };

  const add = (data, focus) => {
    const row = createRow(data ?? {});
    const btn = (text, label, cls = 'btn-outline-secondary') => el('button', { type: 'button', class: `btn btn-sm ${cls}`, title: label, 'aria-label': label, text });
    const up = btn('↑', t('Sposta su'));
    const down = btn('↓', t('Sposta giù'));
    const remove = btn(t('Rimuovi'), t('Rimuovi'), 'btn-outline-danger');
    const node = el('div', { class: 'repeat-row' }, el('div', { class: 'row-tools' }, row.title ?? '', el('div', { class: 'ms-auto d-flex gap-1' }, up, down, remove)), row.node);
    const entry = { ...row, node, up, down };
    rows.push(entry);
    list.append(node);
    remove.addEventListener('click', () => {
      rows.splice(rows.indexOf(entry), 1);
      node.remove();
      markDirty();
      refresh();
    });
    const move = (delta) => {
      const i = rows.indexOf(entry);
      const j = i + delta;
      if (j < 0 || j >= rows.length) return;
      rows.splice(i, 1);
      rows.splice(j, 0, entry);
      if (delta < 0) rows[j + 1].node.before(node);
      else rows[j - 1].node.after(node);
      markDirty();
      refresh();
    };
    up.addEventListener('click', () => move(-1));
    down.addEventListener('click', () => move(1));
    refresh();
    if (focus) (row.focus ? row.focus() : node.querySelector('input, select, textarea, [contenteditable]')?.focus());
  };

  initial.forEach((d) => add(d));
  if (!initial.length && startWithOne) add({});
  addBtn.addEventListener('click', () => {
    add({}, true);
    markDirty();
  });
  container.append(empty ?? '', list, el('div', {}, addBtn, limit));
  refresh();
  return { get: () => rows.map((r) => r.get()), rows };
}

// ---------------------------------------------------------------------------
// Voci condivise: prima si cerca tra quelle esistenti, poi (se serve) si crea
// ---------------------------------------------------------------------------

function describeVoce(v, item) {
  const parts = [];
  if (item.date_vita) parts.push(item.date_vita);
  if (v.key === 'mostre') parts.push(...[item.luogo_mostra, item.anno_data_da].filter(Boolean));
  if (v.key === 'provenienze' && item.descrizione) parts.push(item.descrizione);
  if (item.schede_totali !== undefined) parts.push(t(item.schede_totali === 1 ? 'usata in {n} scheda' : 'usata in {n} schede', { n: item.schede_totali }));
  return parts.join(' · ');
}

function vocabRow(v, data) {
  const display = v.fields[0];
  const extra = v.fields.slice(1);
  const singolare = t(v.singolare).toLowerCase();
  let mode = data.id ? 'collegata' : data[display.name] ? 'nuova' : 'cerca';
  let selected = data.id ? { id: data.id, label: htmlToText(data[display.name]), detail: describeVoce(v, data) } : null;

  // --- Ricerca
  const searchId = nextId('cerca');
  const search = el('input', { class: 'form-control', id: searchId, maxlength: 300, placeholder: t('Cerca {voce} esistente…', { voce: singolare }) });
  const searchPane = el(
    'div',
    { class: 'voce-cerca' },
    el('label', { class: 'form-label small mb-1', for: searchId, text: t('Cerca tra le voci esistenti') }),
    el('div', {}, search),
    el('div', { class: 'form-text', text: t('Scrivi almeno 2 lettere e scegli dall\'elenco. Se non la trovi, scegli "Crea nuova voce" in fondo all\'elenco.') }),
  );

  // --- Avviso voci simili
  const similarPane = el('div', { class: 'voce-simili alert alert-warning d-none', role: 'alert' });

  // --- Nuova voce
  const lblId = nextId('lbl');
  let getDisplay;
  let setDisplay;
  let displayNode;
  if (display.type === 'inline') {
    const rte = createRichText({ kind: 'inline', value: mode === 'nuova' ? data[display.name] : '', labelledBy: lblId, onChange: markDirty });
    displayNode = el('div', { class: 'col-12' }, el('span', { class: 'form-label small mb-1 d-block', id: lblId, text: t(display.label) }), rte.root);
    getDisplay = () => rte.getValue();
    setDisplay = (html) => rte.setValue(html);
  } else {
    const input = el('input', { class: 'form-control', id: lblId, maxlength: display.max });
    input.value = mode === 'nuova' ? data[display.name] ?? '' : '';
    displayNode = labelled(t(display.label), input, { col: 'col-md-8', id: lblId });
    getDisplay = () => input.value.trim();
    setDisplay = (text) => (input.value = htmlToText(text));
  }
  const extraFields = extra.map((f) => field(f, mode === 'nuova' ? data[f.name] : null));
  const backBtn = el('button', { type: 'button', class: 'btn btn-sm btn-link', text: t('Torna alla ricerca') });
  const newPane = el(
    'div',
    { class: 'voce-nuova' },
    el('div', { class: 'd-flex align-items-center gap-2 mb-2' }, el('span', { class: 'badge text-bg-warning', text: t('Nuova voce') }), el('span', { class: 'small text-muted-lu', text: t('Verrà aggiunta al vocabolario condiviso.') }), backBtn),
    el('div', { class: 'row g-2' }, displayNode, extraFields.map((f) => f.node)),
  );

  // --- Voce collegata
  const linkedLabel = el('span', { class: 'fw-semibold' });
  const linkedDetail = el('span', { class: 'small text-muted-lu' });
  const changeBtn = el('button', { type: 'button', class: 'btn btn-sm btn-link ms-auto', text: t('Cambia') });
  const linkedPane = el('div', { class: 'voce-collegata' }, el('span', { class: 'voce-icona', 'aria-hidden': 'true', text: '✓' }), el('span', {}, linkedLabel, ' ', linkedDetail), changeBtn);

  // --- Campi del collegamento (es. "copia da", categoria)
  const linkFields = v.linkFields.map((f) => field(f, data[f.name], { col: v.linkFields.length > 1 ? 'col-md-4' : 'col-12' }));
  const linkPane = linkFields.length ? el('div', { class: 'row g-2 mt-2 voce-link' }, linkFields.map((f) => f.node)) : null;

  const render = () => {
    searchPane.classList.toggle('d-none', mode !== 'cerca');
    newPane.classList.toggle('d-none', mode !== 'nuova');
    linkedPane.classList.toggle('d-none', mode !== 'collegata');
    linkPane?.classList.toggle('d-none', mode === 'cerca');
    if (mode !== 'cerca') similarPane.classList.add('d-none');
    if (selected) {
      linkedLabel.textContent = selected.label;
      linkedDetail.textContent = selected.detail ? `(${selected.detail})` : '';
    }
    listeners.forEach((fn) => fn());
  };

  const collega = (item, label) => {
    selected = { id: item.id, label, detail: describeVoce(v, item) };
    mode = 'collegata';
    search.value = '';
    render();
    markDirty();
  };

  const creaNuova = (text) => {
    selected = null;
    mode = 'nuova';
    setDisplay(text);
    render();
    markDirty();
  };

  /** Prima di creare una voce, propone quelle con un nome simile. */
  const proponiSimili = async (text) => {
    let simili = [];
    try {
      simili = await api('GET', `/api/vocabolari/${v.key}/simili?testo=${encodeURIComponent(text)}`);
    } catch {
      /* in caso di errore si procede con la creazione */
    }
    if (!simili.length) return creaNuova(text);
    similarPane.replaceChildren(
      el('p', { class: 'mb-2', text: t('Esistono già voci simili a «{testo}». Si tratta di una di queste?', { testo: text }) }),
      el(
        'div',
        { class: 'd-flex flex-column gap-2 mb-2' },
        simili.map((item) => {
          const label = htmlToText(item[display.name]);
          return el(
            'div',
            { class: 'd-flex align-items-center gap-2' },
            el('button', { type: 'button', class: 'btn btn-sm btn-success', text: t('Usa questa'), onclick: () => collega(item, label) }),
            el('span', { text: label }),
            el('span', { class: 'small text-muted-lu', text: describeVoce(v, item) }),
          );
        }),
      ),
      el('button', { type: 'button', class: 'btn btn-sm btn-outline-secondary', text: t('No, è una voce diversa: crea «{testo}»', { testo: text }), onclick: () => creaNuova(text) }),
    );
    similarPane.classList.remove('d-none');
  };

  attachAutocomplete(search, {
    minChars: 2,
    fetchItems: async (q) => {
      const items = await api('GET', `/api/vocabolari/${v.key}?q=${encodeURIComponent(q)}&limit=10`);
      return [...items, { _nuova: true, text: q }];
    },
    label: (item) => (item._nuova ? t('+ Crea nuova voce «{testo}»', { testo: item.text }) : htmlToText(item[display.name])),
    detail: (item) => (item._nuova ? t('solo se non compare sopra') : describeVoce(v, item)),
    onSelect: (item, label) => (item._nuova ? proponiSimili(item.text) : collega(item, label)),
  });
  search.addEventListener('input', () => {
    similarPane.classList.add('d-none');
    listeners.forEach((fn) => fn());
  });
  changeBtn.addEventListener('click', () => {
    mode = 'cerca';
    selected = null;
    render();
    markDirty();
    search.focus();
  });
  backBtn.addEventListener('click', () => {
    search.value = htmlToText(getDisplay());
    mode = 'cerca';
    render();
    search.focus();
  });

  render();
  return {
    node: el('div', {}, searchPane, similarPane, linkedPane, newPane, linkPane),
    focus: () => search.focus(),
    /** Testo cercato ma non scelto: va risolto prima di salvare. */
    pending: () => (mode === 'cerca' && search.value.trim() ? search.value.trim() : null),
    get() {
      const link = {};
      v.linkFields.forEach((f, i) => (link[f.name] = linkFields[i].get()));
      if (mode === 'collegata') return { id: selected.id, ...link };
      if (mode === 'nuova') {
        const entity = { id: null, [display.name]: getDisplay() || null };
        extra.forEach((f, i) => (entity[f.name] = extraFields[i].get()));
        return { ...entity, ...link };
      }
      return {};
    },
  };
}

// ---------------------------------------------------------------------------
// Righe specifiche
// ---------------------------------------------------------------------------

function cronologiaRow(c) {
  const etichetta = field({ name: 'etichetta_data', label: 'Datazione (come appare nella scheda)', type: 'text', max: 255 }, c.etichetta_data, { col: 'col-md-6' });
  const ambitoId = nextId('ambito');
  const ambito = el('input', { class: 'form-control', id: ambitoId, list: 'dl-ambiti', maxlength: 1000, placeholder: t('es. Italico, Etrusco') });
  ambito.value = c.ambito_storico ?? '';
  const dmy = (prefix, labelText) => {
    const giorno = el('input', { class: 'form-control', type: 'number', min: 1, max: 31, placeholder: t('GG'), 'aria-label': `${labelText}: ${t('giorno')}` });
    const mese = el('input', { class: 'form-control', type: 'number', min: 1, max: 12, placeholder: t('MM'), 'aria-label': `${labelText}: ${t('mese')}` });
    giorno.value = c[`giorno_data_${prefix}`] ?? '';
    mese.value = c[`mese_data_${prefix}`] ?? '';
    const anno = annoConEra(labelText, c[`anno_data_${prefix}`]);
    return {
      node: el('div', { class: 'col-md-6' }, el('span', { class: 'form-label small mb-1 d-block', text: labelText }), el('div', { class: 'd-flex gap-2' }, el('div', { class: 'w-25' }, giorno), el('div', { class: 'w-25' }, mese), el('div', { class: 'flex-grow-1' }, anno.node))),
      get: () => ({ [`giorno_data_${prefix}`]: giorno.value || null, [`mese_data_${prefix}`]: mese.value || null, [`anno_data_${prefix}`]: anno.get() }),
    };
  };
  const da = dmy('da', t('Dal'));
  const a = dmy('a', t('Al'));
  return {
    node: el('div', { class: 'row g-2' }, etichetta.node, labelled(t('Ambito storico-culturale'), ambito, { id: ambitoId }), da.node, a.node, el('div', { class: 'col-12 form-text', text: t('Gli estremi numerici servono alla ricerca per periodo; giorno e mese sono facoltativi.') })),
    get: () => ({ etichetta_data: etichetta.get(), ambito_storico: ambito.value.trim() || null, ...da.get(), ...a.get() }),
  };
}

function inventarioRow(i) {
  const numero = field({ name: 'numero_inventario', label: 'Numero di inventario', type: 'text', max: 255 }, i.numero_inventario, { col: 'col-md-4' });
  const nome = field({ name: 'nome_inventario', label: 'Inventario', type: 'text', max: 255 }, i.nome_inventario, { col: 'col-md-3' });
  const propId = nextId('prop');
  const proprieta = selectWith(config.proprieta, i.descrizione, { id: propId });
  return {
    node: el('div', { class: 'row g-2' }, numero.node, nome.node, labelled(t('Proprietà giuridica'), proprieta, { col: 'col-md-5', id: propId })),
    get: () => ({ numero_inventario: numero.get(), nome_inventario: nome.get(), descrizione: proprieta.value || null }),
  };
}

function documentazioneRow(d) {
  const f = field({ name: 'riferimento', label: 'Riferimento', type: 'inline' }, d.riferimento);
  return { node: el('div', { class: 'row' }, f.node), get: () => ({ riferimento: f.get() }) };
}

// --- Misure: gruppi colorati con una tabella di misure ciascuno -------------

function misuraRow(m) {
  const direzione = selectWith(config.misure.direzioni, m.direzione, { ariaLabel: t('Direzione') });
  const tipo = selectWith(config.misure.tipi, m.tipo, { ariaLabel: t('Tipo') });
  const valore = el('input', { class: 'form-control', inputmode: 'decimal', placeholder: '0,0', 'aria-label': t('Valore') });
  valore.value = m.valore === null || m.valore === undefined ? '' : String(m.valore).replace('.', locale === 'it-IT' ? ',' : '.');
  const unita = selectWith(config.misure.unita, m.unita_di_misura ?? (Object.keys(m).length ? null : 'cm'), { translate: false, ariaLabel: t('Unità di misura') });
  const remove = el('button', { type: 'button', class: 'btn btn-sm btn-outline-danger', title: t('Rimuovi misura'), 'aria-label': t('Rimuovi misura'), text: '×' });
  const tr = el('tr', {}, el('td', {}, direzione), el('td', {}, tipo), el('td', {}, valore), el('td', {}, unita), el('td', { class: 'text-end' }, remove));
  return {
    tr,
    remove,
    get: () => ({ direzione: direzione.value || null, tipo: tipo.value || null, valore: valore.value.trim() || null, unita_di_misura: unita.value || null }),
  };
}

function gruppoMisureRow(g) {
  const titolo = field({ name: 'titolo_gruppo_misure', label: 'Titolo del gruppo (es. con cornice)', type: 'text', max: 255 }, g.titolo_gruppo_misure, { col: 'col-md-6' });
  const ipId = nextId('ip');
  const ip = selectWith(config.misure.interoParziale, (g.intero_parziale ?? '').toLowerCase() || null, { id: ipId });
  const note = field({ name: 'note', label: 'Note (es. fonte delle misure)', type: 'text', max: 1000 }, g.note, { col: 'col-12' });

  const tbody = el('tbody');
  const misure = [];
  const addBtn = el('button', { type: 'button', class: 'btn btn-sm btn-outline-primary', text: `+ ${t('Misura')}` });
  const refresh = () => {
    addBtn.disabled = misure.length >= config.misure.maxMisure;
    listeners.forEach((fn) => fn());
  };
  const addMisura = (m, focus) => {
    const row = misuraRow(m);
    misure.push(row);
    tbody.append(row.tr);
    row.remove.addEventListener('click', () => {
      misure.splice(misure.indexOf(row), 1);
      row.tr.remove();
      markDirty();
      refresh();
    });
    if (focus) row.tr.querySelector('select')?.focus();
    refresh();
  };
  (g.misure?.length ? g.misure : [{}]).forEach((m) => addMisura(m));
  addBtn.addEventListener('click', () => {
    addMisura({}, true);
    markDirty();
  });

  const table = el(
    'table',
    { class: 'table table-sm table-misure mb-2' },
    el('thead', {}, el('tr', {}, el('th', { text: t('Direzione') }), el('th', { text: t('Tipo') }), el('th', { text: t('Valore') }), el('th', { text: t('Unità') }), el('th'))),
    tbody,
  );
  const title = el('span', { class: 'gruppo-titolo' });
  return {
    title,
    onIndex: (i) => (title.textContent = t('Gruppo {n}', { n: i + 1 })),
    node: el('div', { class: 'row g-2' }, titolo.node, labelled(t('Intero/parziale'), ip, { col: 'col-md-6', id: ipId }), el('div', { class: 'col-12 table-responsive' }, table, addBtn), note.node),
    get: () => ({ titolo_gruppo_misure: titolo.get(), intero_parziale: ip.value || null, note: note.get(), misure: misure.map((m) => m.get()) }),
  };
}

// ---------------------------------------------------------------------------
// Immagini (caricamento separato, poi collegate alla scheda al salvataggio)
// ---------------------------------------------------------------------------

const imgContainer = document.getElementById('immagini');
/** Editor di testo ricco, per nome del campo (montati più sotto). */
const rich = {};
const images = (scheda?.immagini ?? []).map((i) => ({ id: i.id, codice: i.codice, didascalia: i.didascalia ?? '', larghezza: i.larghezza, altezza: i.altezza }));

function renderImages() {
  imgContainer.replaceChildren(
    ...images.map((img, i) => {
      const caption = el('input', { class: 'form-control form-control-sm', placeholder: t('Didascalia'), maxlength: 1000, 'aria-label': t('Didascalia immagine {n}', { n: i + 1 }) });
      caption.value = img.didascalia;
      caption.addEventListener('input', () => (img.didascalia = caption.value));
      const btn = (text, label, onclick, disabled) => el('button', { type: 'button', class: 'btn btn-sm btn-outline-secondary', text, title: label, 'aria-label': label, onclick, disabled });
      const move = (delta) => () => {
        images.splice(i + delta, 0, images.splice(i, 1)[0]);
        markDirty();
        renderImages();
      };
      return el(
        'div',
        { class: 'col' },
        el(
          'div',
          { class: 'img-tile shadow-sm' },
          el('img', { src: `/media/${img.codice}/miniatura`, alt: img.didascalia || t('Immagine {n}', { n: i + 1 }) }),
          el(
            'div',
            { class: 'p-2' },
            el(
              'div',
              { class: 'd-flex justify-content-between align-items-center mb-2' },
              i === 0 ? el('span', { class: 'badge badge-soft', text: t('Copertina') }) : el('span'),
              el('a', { class: 'small', href: `/media/${img.codice}/originale`, target: '_blank', rel: 'noopener', text: img.larghezza ? `${t('Originale')} ${img.larghezza}×${img.altezza}` : t('Originale') }),
            ),
            caption,
            el(
              'div',
              { class: 'd-flex gap-1 mt-2' },
              btn('←', t('Sposta prima'), move(-1), i === 0),
              btn('→', t('Sposta dopo'), move(1), i === images.length - 1),
              el('button', {
                type: 'button',
                class: 'btn btn-sm btn-outline-danger ms-auto',
                text: t('Rimuovi'),
                onclick: () => {
                  images.splice(i, 1);
                  markDirty();
                  renderImages();
                },
              }),
            ),
          ),
        ),
      );
    }),
  );
  // Le immagini tolte dalla scheda spariscono anche dai testi
  Object.values(rich).forEach((r) => r.refreshImages());
  listeners.forEach((fn) => fn());
}

/** Dimensioni in pixel, se il browser sa decodificare il formato (TIFF no: lo verifica il server). */
async function dimensioniImmagine(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const dim = { w: bitmap.width, h: bitmap.height };
    bitmap.close();
    return dim;
  } catch {
    return null;
  }
}

async function uploadFiles(files) {
  for (const file of files) {
    if (!/^image\/(jpeg|png|webp|gif|tiff)$/.test(file.type)) {
      toast(t('{file}: formato non supportato', { file: file.name }), 'danger');
      continue;
    }
    if (file.size > config.maxImageBytes) {
      toast(t('{file}: file troppo grande (massimo {mb} MB)', { file: file.name, mb: Math.round(config.maxImageBytes / 1048576) }), 'danger');
      continue;
    }
    const dim = await dimensioniImmagine(file);
    if (dim && (Math.max(dim.w, dim.h) > config.maxImageSide || dim.w * dim.h > config.maxImageMegapixels * 1e6)) {
      toast(t('{file}: immagine troppo grande ({w}×{h} pixel; massimo {lato} pixel per lato e {mp} megapixel)', { file: file.name, w: dim.w, h: dim.h, lato: config.maxImageSide, mp: config.maxImageMegapixels }), 'danger');
      continue;
    }
    statusEl.textContent = t('Caricamento ed elaborazione di {file}…', { file: file.name });
    try {
      const res = await api('POST', '/api/immagini', file);
      images.push({ id: res.id, codice: res.codice, didascalia: file.name.replace(/\.[^.]+$/, ''), larghezza: res.larghezza, altezza: res.altezza });
      markDirty();
      renderImages();
    } catch (error) {
      toast(`${file.name}: ${error.message}`, 'danger');
    }
  }
  statusEl.textContent = dirty ? t('Modifiche non salvate') : '';
}

document.getElementById('immagini-input').addEventListener('change', (event) => {
  const files = [...event.target.files];
  event.target.value = '';
  uploadFiles(files);
});
const dropzone = document.getElementById('dropzone');
['dragenter', 'dragover'].forEach((type) =>
  dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  }),
);
['dragleave', 'drop'].forEach((type) => dropzone.addEventListener(type, () => dropzone.classList.remove('dragover')));
dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadFiles([...event.dataTransfer.files]);
});

// ---------------------------------------------------------------------------
// Montaggio
// ---------------------------------------------------------------------------

document.querySelectorAll('[data-rte]').forEach((mount) => {
  const name = mount.dataset.name;
  const rte = createRichText({ kind: mount.dataset.rte, value: scheda?.[name] ?? '', placeholder: mount.dataset.placeholder ?? '', labelledBy: mount.dataset.labelledby, onChange: markDirty, images: mount.dataset.rte === 'block' ? () => images : undefined });
  mount.replaceWith(rte.root);
  rich[name] = rte;
});

const ADD_LABEL = {
  autori: 'Autore',
  materiali: 'Materiale',
  tecniche: 'Tecnica',
  ubicazioni: 'Ubicazione',
  provenienze: 'Provenienza',
  mostre: 'Mostra',
  bibliografie: 'Riferimento',
  altre_bibliografie: 'Riferimento',
};

const vocabRepeaters = {};
document.querySelectorAll('[data-vocab]').forEach((mount) => {
  const v = VOCAB[mount.dataset.vocab];
  const label = t(ADD_LABEL[v.key] ?? v.singolare);
  vocabRepeaters[v.key] = repeater(mount, {
    addLabel: label,
    createRow: (data) => vocabRow(v, data),
    initial: scheda?.voci?.[v.key] ?? [],
    startWithOne: !scheda && ['autori', 'materiali', 'tecniche', 'ubicazioni'].includes(v.key),
    emptyText: t('Nessun elemento: usa «+ {voce}».', { voce: label }),
  });
});

const repeaters = {
  cronologie: repeater(document.querySelector('[data-repeat="cronologie"]'), { addLabel: t('Datazione'), createRow: cronologiaRow, initial: scheda?.cronologie ?? [], startWithOne: !scheda, max: 10 }),
  inventari: repeater(document.querySelector('[data-repeat="inventari"]'), { addLabel: t('Inventario'), createRow: inventarioRow, initial: scheda?.inventari ?? [], startWithOne: !scheda, max: 20 }),
  misure: repeater(document.getElementById('misure'), {
    addLabel: t('Gruppo di misure'),
    createRow: gruppoMisureRow,
    initial: scheda?.misure ?? [],
    startWithOne: !scheda,
    emptyText: t('Nessuna misura.'),
    max: config.misure.maxGruppi,
    rowClass: (i) => `gruppo-misure gm-${i % 6}`,
  }),
  documentazioni_fotografiche: repeater(document.querySelector('[data-repeat="documentazioni_fotografiche"]'), { addLabel: t('Riferimento'), createRow: documentazioneRow, initial: scheda?.documentazioni_fotografiche ?? [], emptyText: t('Nessun riferimento.') }),
};

const fillDatalist = (id, values) => document.getElementById(id).replaceChildren(...values.map((v) => el('option', { value: v })));
api('GET', '/api/suggerimenti/ambiti?q=').then((v) => fillDatalist('dl-ambiti', v)).catch(() => undefined);

form.classificazione.value = scheda?.classificazione ?? '';
form.note_schedatore.value = scheda?.note_schedatore ?? '';
renderImages();

// ---------------------------------------------------------------------------
// Navigazione tra i pannelli, contatori e completezza
// ---------------------------------------------------------------------------

const tabs = [...document.querySelectorAll('#editor-tabs [data-pannello]')];
const showTab = (name) => {
  const tab = tabs.find((b) => b.dataset.pannello === name);
  if (tab) window.bootstrap.Tab.getOrCreateInstance(tab).show();
};
tabs.forEach((tab) =>
  tab.addEventListener('shown.bs.tab', () => {
    history.replaceState(null, '', `#${tab.dataset.pannello}`);
    const i = tabs.indexOf(tab);
    document.getElementById('pannello-prec').disabled = i === 0;
    document.getElementById('pannello-succ').disabled = i === tabs.length - 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }),
);
const currentIndex = () => tabs.findIndex((b) => b.classList.contains('active'));
document.getElementById('pannello-prec').addEventListener('click', () => showTab(tabs[Math.max(currentIndex() - 1, 0)].dataset.pannello));
document.getElementById('pannello-succ').addEventListener('click', () => showTab(tabs[Math.min(currentIndex() + 1, tabs.length - 1)].dataset.pannello));
document.getElementById('pannello-prec').disabled = true;
if (location.hash) showTab(location.hash.slice(1));

const filled = (list) => list.filter((x) => x && Object.values(x).some((v) => v !== null && v !== '' && !(Array.isArray(v) && !v.length))).length;
const vocabCount = (k) => vocabRepeaters[k].rows.filter((r) => r.get().id || r.get()[VOCAB[k].fields[0].name]).length;

function updateBadges() {
  const counts = {
    identificazione: rich.titolo_opera.getValue() ? '' : '!',
    autori: vocabCount('autori'),
    datazione: filled(repeaters.cronologie.get()),
    materia: vocabCount('materiali') + vocabCount('tecniche'),
    misure: repeaters.misure.get().length,
    collocazione: vocabCount('ubicazioni') + filled(repeaters.inventari.get()) + vocabCount('provenienze'),
    testi: ['descrizione_sintetica', 'corpo_scheda', 'iscrizioni', 'storia_espositiva'].filter((k) => rich[k].getValue()).length,
    mostre: vocabCount('mostre'),
    bibliografia: vocabCount('bibliografie') + vocabCount('altre_bibliografie') + filled(repeaters.documentazioni_fotografiche.get()),
    immagini: images.length,
  };
  for (const [k, n] of Object.entries(counts)) {
    const badge = document.querySelector(`[data-badge="${k}"]`);
    if (!badge || badge.classList.contains('text-bg-danger')) continue;
    badge.textContent = n || '';
    badge.className = `tab-badge badge rounded-pill ${n === '!' ? 'text-bg-warning' : 'badge-soft'}`;
  }
  updateChecklist(counts);
}

function updateChecklist(c) {
  const voci = [
    [!!rich.titolo_opera.getValue(), t('Titolo dell\'opera'), 'identificazione', true],
    [!!form.classificazione.value, t('Classificazione'), 'identificazione'],
    [c.autori > 0, t('Autore (o ambito, se anonima)'), 'autori'],
    [c.datazione > 0, t('Datazione'), 'datazione'],
    [c.materia > 0, t('Materia e tecnica'), 'materia'],
    [c.misure > 0, t('Misure'), 'misure'],
    [vocabCount('ubicazioni') > 0, t('Ubicazione'), 'collocazione'],
    [filled(repeaters.inventari.get()) > 0, t('Numero di inventario'), 'collocazione'],
    [!!rich.descrizione_sintetica.getValue(), t('Descrizione sintetica'), 'testi'],
    [c.immagini > 0, t('Almeno un\'immagine'), 'immagini'],
  ];
  document.getElementById('checklist').replaceChildren(
    ...voci.map(([ok, label, pane, required]) =>
      el(
        'li',
        { class: ok ? 'ok' : required ? 'ko' : 'warn' },
        el('span', { class: 'check-icon', 'aria-hidden': 'true', text: ok ? '✓' : required ? '✕' : '!' }),
        el('button', { type: 'button', class: 'btn btn-link p-0', text: label, onclick: () => showTab(pane) }),
        el('span', { class: 'visually-hidden', text: ok ? t('completo') : required ? t('obbligatorio, mancante') : t('consigliato, mancante') }),
      ),
    ),
  );
}

let badgeTimer;
listeners.add(() => {
  clearTimeout(badgeTimer);
  badgeTimer = setTimeout(updateBadges, 150);
});
updateBadges();

// ---------------------------------------------------------------------------
// Salvataggio
// ---------------------------------------------------------------------------

function collect() {
  const voci = Object.fromEntries(Object.entries(vocabRepeaters).map(([k, r]) => [k, r.get().filter((x) => Object.keys(x).length)]));
  return {
    titolo_opera: rich.titolo_opera.getValue(),
    classificazione: form.classificazione.value || null,
    descrizione_sintetica: rich.descrizione_sintetica.getValue(),
    corpo_scheda: rich.corpo_scheda.getValue(),
    iscrizioni: rich.iscrizioni.getValue(),
    storia_espositiva: rich.storia_espositiva.getValue(),
    note_schedatore: form.note_schedatore.value,
    cronologie: repeaters.cronologie.get(),
    inventari: repeaters.inventari.get(),
    misure: repeaters.misure.get(),
    documentazioni_fotografiche: repeaters.documentazioni_fotografiche.get(),
    immagini: images.map(({ id, didascalia }) => ({ id, didascalia })),
    ...voci,
  };
}

const PANNELLO_DI = {
  titolo_opera: 'identificazione',
  classificazione: 'identificazione',
  autori: 'autori',
  cronologie: 'datazione',
  materiali: 'materia',
  tecniche: 'materia',
  misure: 'misure',
  ubicazioni: 'collocazione',
  inventari: 'collocazione',
  provenienze: 'collocazione',
  descrizione_sintetica: 'testi',
  corpo_scheda: 'testi',
  iscrizioni: 'testi',
  storia_espositiva: 'testi',
  mostre: 'mostre',
  bibliografie: 'bibliografia',
  altre_bibliografie: 'bibliografia',
  documentazioni_fotografiche: 'bibliografia',
  immagini: 'immagini',
  note_schedatore: 'invio',
};

function showErrors(message, problems) {
  document.querySelectorAll('[data-badge].text-bg-danger').forEach((b) => b.classList.remove('text-bg-danger'));
  const pannelli = new Set();
  const items = problems.map((p) => {
    const [first, index, ...rest] = String(p.campo).split('.');
    const pane = PANNELLO_DI[first];
    if (pane) pannelli.add(pane);
    const tabLabel = tabs.find((b) => b.dataset.pannello === pane)?.querySelector('.tab-label')?.textContent ?? first;
    const where = [tabLabel, index !== undefined && /^\d+$/.test(index) ? t('riga {n}', { n: Number(index) + 1 }) : index, ...rest].filter(Boolean).join(' › ');
    return el('li', {}, el('button', { type: 'button', class: 'btn btn-link p-0 align-baseline', text: where, onclick: () => pane && showTab(pane) }), `: ${p.messaggio}`);
  });
  for (const pane of pannelli) {
    const badge = document.querySelector(`[data-badge="${pane}"]`);
    badge.textContent = '!';
    badge.className = 'tab-badge badge rounded-pill text-bg-danger';
  }
  erroriEl.replaceChildren(el('strong', { text: message }), items.length ? el('ul', { class: 'mb-0 mt-1' }, items) : '');
  erroriEl.classList.remove('d-none');
  erroriEl.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pannelli.size) showTab([...pannelli][0]);
}

/** Voci cercate ma non scelte: l'utente deve collegarle o crearle esplicitamente. */
function pendingVoci() {
  const problems = [];
  for (const [k, r] of Object.entries(vocabRepeaters)) {
    r.rows.forEach((row, i) => {
      const text = row.pending?.();
      if (text) problems.push({ campo: `${k}.${i}`, messaggio: t('«{testo}» non è stato collegato: sceglilo dall\'elenco o crea una nuova voce', { testo: text }) });
    });
  }
  return problems;
}

const buttons = [document.getElementById('salva'), document.getElementById('salva-invia')].filter(Boolean);

async function save(invia) {
  const pending = pendingVoci();
  if (pending.length) return showErrors(t('Alcune voci non sono state collegate'), pending);
  if (invia) {
    const ok = await confirmDialog({
      title: t('Salvare e inviare in revisione?'),
      body: t('Un amministratore valuterà la scheda. Fino all\'esito non potrai modificarla (potrai però ritirarla).'),
      confirmText: t('Salva e invia'),
    });
    if (!ok) return;
  }
  erroriEl.classList.add('d-none');
  document.querySelectorAll('[data-badge].text-bg-danger').forEach((b) => (b.className = 'tab-badge badge rounded-pill badge-soft'));
  buttons.forEach((b) => (b.disabled = true));
  statusEl.textContent = t('Salvataggio…');
  try {
    const data = collect();
    if (schedaId) {
      await api('PUT', `/api/schede/${schedaId}`, data);
    } else {
      schedaId = (await api('POST', '/api/schede', data)).id;
      history.replaceState(null, '', `/area/schede/${schedaId}/modifica${location.hash}`);
      document.getElementById('editor-annulla').href = `/area/schede/${schedaId}`;
    }
    dirty = false;
    if (invia) {
      const messaggio = document.getElementById('messaggio_invio')?.value.trim() || null;
      await api('POST', `/api/schede/${schedaId}/invia`, { commento: messaggio });
      window.location.href = '/area';
      return;
    }
    statusEl.textContent = t('Salvata alle {ora}', { ora: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) });
    toast(t('Scheda salvata'));
  } catch (error) {
    statusEl.textContent = t('Salvataggio non riuscito');
    showErrors(error.message, error.details ?? []);
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

document.getElementById('salva').addEventListener('click', () => save(false));
document.getElementById('salva-invia')?.addEventListener('click', () => save(true));
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    save(false);
  }
});

dirty = false;
statusEl.textContent = scheda
  ? t('Ultima modifica: {data}', { data: new Date(scheda.updated_at).toLocaleString(locale) })
  : t('Nuova scheda non ancora salvata');
