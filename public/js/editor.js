import { api, confirmDialog, el, htmlToText, toast } from './lib/api.js';
import { attachAutocomplete } from './lib/autocomplete.js';
import { createRichText } from './lib/richtext.js';

const form = document.getElementById('editor');
const statusEl = document.getElementById('editor-stato');
const erroriEl = document.getElementById('editor-errori');
const scheda = JSON.parse(document.getElementById('scheda-data').textContent);
const config = await api('GET', '/api/config');
const VOCAB = Object.fromEntries(config.vocabolari.map((v) => [v.key, v]));

let schedaId = scheda?.id ?? null;
let dirty = false;
const markDirty = () => {
  dirty = true;
  statusEl.textContent = 'Modifiche non salvate';
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

/** Campo generico da una definizione {name, label, type, options, ...}. */
function field(def, value, { col } = {}) {
  const id = nextId(def.name);
  if (def.type === 'inline') {
    const lblId = nextId('lbl');
    const rte = createRichText({ kind: 'inline', value: value ?? '', labelledBy: lblId, onChange: markDirty });
    return {
      node: el('div', { class: col ?? 'col-12' }, el('span', { class: 'form-label small mb-1 d-block', id: lblId, text: def.label }), rte.root),
      get: () => rte.getValue() || null,
    };
  }
  let control;
  if (def.options) {
    control = el('select', { class: 'form-select', id }, el('option', { value: '', text: '—' }), def.options.map((o) => el('option', { value: o, text: o, selected: o === value })));
  } else if (def.type === 'longtext') {
    control = el('textarea', { class: 'form-control', id, rows: 2, maxlength: def.max });
    control.value = value ?? '';
  } else {
    control = el('input', { class: 'form-control', id, type: def.type === 'int' ? 'number' : 'text', maxlength: def.max, min: def.min, max: def.maxValue });
    control.value = value ?? '';
  }
  return {
    node: labelled(def.label, control, { col: col ?? (def.type === 'longtext' ? 'col-12' : 'col-md-6'), id }),
    get: () => (control.value.trim() === '' ? null : control.value.trim()),
  };
}

/** Anno con era (a.C./d.C.): nel database gli anni a.C. sono negativi. */
function annoConEra(label, valore) {
  const id = nextId('anno');
  const input = el('input', { class: 'form-control', id, type: 'number', min: 0, max: 99999, placeholder: 'Anno' });
  const era = el('select', { class: 'form-select flex-grow-0 w-auto', 'aria-label': `${label}: era` }, el('option', { value: 'dc', text: 'd.C.' }), el('option', { value: 'ac', text: 'a.C.' }));
  if (valore !== null && valore !== undefined && valore !== '') {
    input.value = Math.abs(Number(valore));
    era.value = Number(valore) < 0 ? 'ac' : 'dc';
  }
  return {
    node: el('div', { class: 'input-group' }, input, era),
    id,
    get: () => (input.value === '' ? null : (era.value === 'ac' ? -1 : 1) * Math.abs(Number(input.value))),
  };
}

// ---------------------------------------------------------------------------
// Righe ripetibili (con riordino)
// ---------------------------------------------------------------------------

function repeater(container, { addLabel, createRow, initial = [], startWithOne = false, emptyText }) {
  const list = el('div');
  const empty = emptyText ? el('p', { class: 'small text-muted-lu', text: emptyText }) : null;
  const rows = [];

  const refresh = () => {
    if (empty) empty.classList.toggle('d-none', rows.length > 0);
    rows.forEach((r, i) => {
      r.up.disabled = i === 0;
      r.down.disabled = i === rows.length - 1;
    });
  };

  const add = (data, focus) => {
    const row = createRow(data ?? {});
    const up = el('button', { type: 'button', class: 'btn btn-sm btn-outline-secondary', title: 'Sposta su', 'aria-label': 'Sposta su', text: '↑' });
    const down = el('button', { type: 'button', class: 'btn btn-sm btn-outline-secondary', title: 'Sposta giù', 'aria-label': 'Sposta giù', text: '↓' });
    const remove = el('button', { type: 'button', class: 'btn btn-sm btn-outline-danger', text: 'Rimuovi' });
    const node = el('div', { class: 'repeat-row' }, el('div', { class: 'd-flex justify-content-end gap-1 mb-2' }, up, down, remove), row.node);
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
    if (focus) node.querySelector('input, select, textarea, [contenteditable]')?.focus();
  };

  initial.forEach((d) => add(d));
  if (!initial.length && startWithOne) add({});
  const addBtn = el('button', { type: 'button', class: 'btn btn-sm btn-outline-primary mt-2', text: `+ ${addLabel}` });
  addBtn.addEventListener('click', () => {
    add({}, true);
    markDirty();
  });
  container.append(empty ?? '', list, addBtn);
  refresh();
  return { get: () => rows.map((r) => r.get()) };
}

// ---------------------------------------------------------------------------
// Voci condivise: collega una voce esistente oppure creane una nuova
// ---------------------------------------------------------------------------

function describeVoce(v, item) {
  const parts = [];
  if (item.date_vita) parts.push(item.date_vita);
  if (v.key === 'mostre') parts.push(...[item.luogo_mostra, item.anno_data_da].filter(Boolean));
  if (v.key === 'provenienze' && item.descrizione) parts.push(item.descrizione);
  if (item.schede_totali !== undefined) parts.push(`usata in ${item.schede_totali} ${item.schede_totali === 1 ? 'scheda' : 'schede'}`);
  return parts.join(' · ');
}

function vocabRow(v, data) {
  const display = v.fields[0];
  const extra = v.fields.slice(1);
  let selected = data.id ? { id: data.id, label: htmlToText(data[display.name]), detail: describeVoce(v, data) } : null;

  // Campi della voce (solo per una voce nuova)
  const searchLblId = nextId('lbl');
  let getDisplay;
  let searchTarget;
  let setDisplay;
  const displayWrap = el('div', { class: 'col-12' });
  if (display.type === 'inline') {
    const rte = createRichText({ kind: 'inline', value: selected ? '' : (data[display.name] ?? ''), labelledBy: searchLblId, onChange: markDirty, placeholder: 'Scrivi per cercare tra le voci esistenti…' });
    displayWrap.append(el('span', { class: 'form-label small mb-1 d-block', id: searchLblId, text: display.label }), rte.root);
    getDisplay = () => rte.getValue();
    setDisplay = (html) => rte.setValue(html);
    searchTarget = rte.root.querySelector('.rte-content');
  } else {
    const input = el('input', { class: 'form-control', id: searchLblId, maxlength: display.max, placeholder: 'Scrivi per cercare tra le voci esistenti…' });
    input.value = selected ? '' : (data[display.name] ?? '');
    displayWrap.append(el('label', { class: 'form-label small mb-1', for: searchLblId, text: display.label }), el('div', {}, input));
    getDisplay = () => input.value.trim();
    setDisplay = (text) => (input.value = htmlToText(text));
    searchTarget = input;
  }
  const extraFields = extra.map((f) => field(f, selected ? null : data[f.name]));
  const hint = el('div', { class: 'voce-nuova-hint col-12', text: 'Nessuna voce selezionata: ne verrà creata una nuova (se esiste già una voce identica, verrà collegata quella).' });
  const extraWrap = extra.length
    ? el('details', { class: 'col-12' }, el('summary', { class: 'small', text: `Altri dati della nuova voce (${extra.map((f) => f.label.toLowerCase()).join(', ')})` }), el('div', { class: 'row g-2 mt-1' }, extraFields.map((f) => f.node)))
    : null;
  const editPane = el('div', { class: 'row g-2' }, displayWrap, hint, extraWrap);

  // Voce collegata
  const linkedLabel = el('span', { class: 'voce-label' });
  const linkedDetail = el('span', { class: 'small text-muted-lu' });
  const changeBtn = el('button', { type: 'button', class: 'btn btn-sm btn-link', text: 'Cambia' });
  const linkedPane = el('div', { class: 'voce-collegata' }, el('span', { 'aria-hidden': 'true', text: '🔗' }), el('span', { class: 'voce-label' }, linkedLabel, ' ', linkedDetail), changeBtn);

  const updateHint = () => hint.classList.toggle('d-none', !getDisplay());
  const render = () => {
    linkedPane.classList.toggle('d-none', !selected);
    editPane.classList.toggle('d-none', !!selected);
    if (selected) {
      linkedLabel.textContent = selected.label;
      linkedDetail.textContent = selected.detail ? `(${selected.detail})` : '';
    }
    updateHint();
  };
  searchTarget.addEventListener('input', updateHint);
  changeBtn.addEventListener('click', () => {
    setDisplay(selected?.label ?? '');
    selected = null;
    render();
    markDirty();
    searchTarget.focus();
  });

  attachAutocomplete(searchTarget, {
    fetchItems: (q) => api('GET', `/api/vocabolari/${v.key}?q=${encodeURIComponent(q)}&limit=10`),
    label: (item) => htmlToText(item[display.name]),
    detail: (item) => describeVoce(v, item),
    onSelect: (item, label) => {
      selected = { id: item.id, label, detail: describeVoce(v, item) };
      setDisplay('');
      render();
      markDirty();
    },
  });
  const linkFields = v.linkFields.map((f) => field(f, data[f.name], { col: v.linkFields.length > 1 ? 'col-md-4' : 'col-12' }));
  const linkPane = linkFields.length ? el('div', { class: 'row g-2 mt-1' }, linkFields.map((f) => f.node)) : null;

  render();
  return {
    node: el('div', {}, linkedPane, editPane, linkPane),
    get() {
      const out = {};
      v.linkFields.forEach((f, i) => (out[f.name] = linkFields[i].get()));
      if (selected) return { id: selected.id, ...out };
      const entity = { id: null, [display.name]: getDisplay() || null };
      extra.forEach((f, i) => (entity[f.name] = extraFields[i].get()));
      return { ...entity, ...out };
    },
  };
}

// ---------------------------------------------------------------------------
// Righe specifiche
// ---------------------------------------------------------------------------

function cronologiaRow(c) {
  const etichetta = field({ name: 'etichetta_data', label: 'Datazione (come appare nella scheda)', type: 'text', max: 255 }, c.etichetta_data, { col: 'col-md-6' });
  const ambitoId = nextId('ambito');
  const ambito = el('input', { class: 'form-control', id: ambitoId, list: 'dl-ambiti', maxlength: 1000, placeholder: 'es. Italico, Etrusco' });
  ambito.value = c.ambito_storico ?? '';
  const dmy = (prefix, labelText) => {
    const giorno = el('input', { class: 'form-control', type: 'number', min: 1, max: 31, placeholder: 'GG', 'aria-label': `${labelText}: giorno` });
    const mese = el('input', { class: 'form-control', type: 'number', min: 1, max: 12, placeholder: 'MM', 'aria-label': `${labelText}: mese` });
    giorno.value = c[`giorno_data_${prefix}`] ?? '';
    mese.value = c[`mese_data_${prefix}`] ?? '';
    const anno = annoConEra(labelText, c[`anno_data_${prefix}`]);
    return {
      node: el('div', { class: 'col-md-6' }, el('span', { class: 'form-label small mb-1 d-block', text: labelText }), el('div', { class: 'd-flex gap-2' }, el('div', { class: 'w-25' }, giorno), el('div', { class: 'w-25' }, mese), el('div', { class: 'flex-grow-1' }, anno.node))),
      get: () => ({
        [`giorno_data_${prefix}`]: giorno.value || null,
        [`mese_data_${prefix}`]: mese.value || null,
        [`anno_data_${prefix}`]: anno.get(),
      }),
    };
  };
  const da = dmy('da', 'Dal');
  const a = dmy('a', 'Al');
  return {
    node: el('div', { class: 'row g-2' }, etichetta.node, labelled('Ambito storico-culturale', ambito, { id: ambitoId }), da.node, a.node, el('div', { class: 'col-12 form-text', text: "Gli estremi numerici servono alla ricerca per periodo; giorno e mese sono facoltativi." })),
    get: () => ({ etichetta_data: etichetta.get(), ambito_storico: ambito.value.trim() || null, ...da.get(), ...a.get() }),
  };
}

function inventarioRow(i) {
  const numero = field({ name: 'numero_inventario', label: 'Numero di inventario', type: 'text', max: 255 }, i.numero_inventario, { col: 'col-md-4' });
  const nome = field({ name: 'nome_inventario', label: 'Inventario', type: 'text', max: 255 }, i.nome_inventario, { col: 'col-md-4' });
  const proprieta = field({ name: 'descrizione', label: 'Proprietà giuridica', type: 'text', max: 1000 }, i.descrizione, { col: 'col-md-4' });
  return {
    node: el('div', { class: 'row g-2' }, numero.node, nome.node, proprieta.node),
    get: () => ({ numero_inventario: numero.get(), nome_inventario: nome.get(), descrizione: proprieta.get() }),
  };
}

function misuraRow(m) {
  const direzione = el('input', { class: 'form-control', list: 'dl-direzioni', maxlength: 64, placeholder: 'altezza', 'aria-label': 'Direzione' });
  const tipo = el('input', { class: 'form-control', list: 'dl-tipi', maxlength: 64, placeholder: 'assoluta', 'aria-label': 'Tipo' });
  const valore = el('input', { class: 'form-control', inputmode: 'decimal', placeholder: '0,0', 'aria-label': 'Valore' });
  const unita = el('select', { class: 'form-select', 'aria-label': 'Unità di misura' }, el('option', { value: '', text: '—' }), config.misure.unita.map((u) => el('option', { value: u, text: u })));
  direzione.value = m.direzione ?? '';
  tipo.value = m.tipo ?? '';
  valore.value = m.valore === null || m.valore === undefined ? '' : String(m.valore).replace('.', ',');
  unita.value = m.unita_di_misura ?? '';
  if (m.unita_di_misura && unita.value !== m.unita_di_misura) {
    unita.append(el('option', { value: m.unita_di_misura, text: m.unita_di_misura }));
    unita.value = m.unita_di_misura;
  }
  return {
    node: el('div', { class: 'row g-2' }, el('div', { class: 'col-6 col-md-4' }, direzione), el('div', { class: 'col-6 col-md-3' }, tipo), el('div', { class: 'col-6 col-md-3' }, valore), el('div', { class: 'col-6 col-md-2' }, unita)),
    get: () => ({ direzione: direzione.value.trim() || null, tipo: tipo.value.trim() || null, valore: valore.value.trim() || null, unita_di_misura: unita.value || null }),
  };
}

function gruppoMisureRow(g) {
  const titolo = field({ name: 'titolo_gruppo_misure', label: 'Titolo del gruppo (es. con cornice)', type: 'text', max: 255 }, g.titolo_gruppo_misure, { col: 'col-md-5' });
  const ipId = nextId('ip');
  const ip = el('select', { class: 'form-select', id: ipId }, el('option', { value: '', text: '—' }), el('option', { value: 'intero', text: 'Intero' }), el('option', { value: 'parziale', text: 'Parziale' }));
  const ipValue = (g.intero_parziale ?? '').toLowerCase();
  if (ipValue && !['intero', 'parziale'].includes(ipValue)) ip.append(el('option', { value: g.intero_parziale, text: g.intero_parziale }));
  ip.value = ['intero', 'parziale'].includes(ipValue) ? ipValue : (g.intero_parziale ?? '');
  const note = field({ name: 'note', label: 'Note', type: 'text', max: 1000 }, g.note, { col: 'col-md-4' });
  const misureWrap = el('div', { class: 'col-12' });
  const node = el('div', { class: 'row g-2' }, titolo.node, labelled('Intero/parziale', ip, { col: 'col-md-3', id: ipId }), note.node, misureWrap);
  const misure = repeater(misureWrap, { addLabel: 'Misura', createRow: misuraRow, initial: g.misure ?? [], startWithOne: true });
  return {
    node,
    get: () => ({ titolo_gruppo_misure: titolo.get(), intero_parziale: ip.value || null, note: note.get(), misure: misure.get() }),
  };
}

function documentazioneRow(d) {
  const f = field({ name: 'riferimento', label: 'Riferimento', type: 'inline' }, d.riferimento);
  return { node: el('div', { class: 'row' }, f.node), get: () => ({ riferimento: f.get() }) };
}

// ---------------------------------------------------------------------------
// Immagini
// ---------------------------------------------------------------------------

const imgContainer = document.getElementById('immagini');
const images = (scheda?.immagini ?? []).map((i) => ({ id: i.id, didascalia: i.didascalia ?? '' }));

function renderImages() {
  imgContainer.replaceChildren(
    ...images.map((img, i) => {
      const caption = el('input', { class: 'form-control form-control-sm', placeholder: 'Didascalia', maxlength: 1000, 'aria-label': `Didascalia immagine ${i + 1}` });
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
          { class: 'img-tile' },
          el('img', { src: `/api/immagini/${img.id}`, alt: img.didascalia || `Immagine ${i + 1}` }),
          el(
            'div',
            { class: 'p-2' },
            i === 0 ? el('span', { class: 'badge text-bg-light border mb-2', text: 'Copertina' }) : null,
            caption,
            el(
              'div',
              { class: 'd-flex gap-1 mt-2' },
              btn('←', 'Sposta prima', move(-1), i === 0),
              btn('→', 'Sposta dopo', move(1), i === images.length - 1),
              el('button', {
                type: 'button',
                class: 'btn btn-sm btn-outline-danger ms-auto',
                text: 'Rimuovi',
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
}

document.getElementById('immagini-input').addEventListener('change', async (event) => {
  const files = [...event.target.files];
  event.target.value = '';
  for (const file of files) {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      toast(`${file.name}: formato non supportato`, 'danger');
      continue;
    }
    if (file.size > config.maxImageBytes) {
      toast(`${file.name}: file troppo grande (massimo ${Math.round(config.maxImageBytes / 1048576)} MB)`, 'danger');
      continue;
    }
    statusEl.textContent = `Caricamento di ${file.name}…`;
    try {
      const { id } = await api('POST', '/api/immagini', file);
      images.push({ id, didascalia: file.name.replace(/\.[^.]+$/, '') });
      markDirty();
      renderImages();
    } catch (error) {
      toast(`${file.name}: ${error.message}`, 'danger');
    }
  }
  statusEl.textContent = dirty ? 'Modifiche non salvate' : '';
});

// ---------------------------------------------------------------------------
// Montaggio
// ---------------------------------------------------------------------------

const rich = {};
document.querySelectorAll('[data-rte]').forEach((mount) => {
  const name = mount.dataset.name;
  const rte = createRichText({ kind: mount.dataset.rte, value: scheda?.[name] ?? '', placeholder: mount.dataset.placeholder ?? '', labelledBy: mount.dataset.labelledby, onChange: markDirty });
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
  vocabRepeaters[v.key] = repeater(mount, {
    addLabel: ADD_LABEL[v.key] ?? v.singolare,
    createRow: (data) => vocabRow(v, data),
    initial: scheda?.voci?.[v.key] ?? [],
    emptyText: `Nessun elemento: usa “+ ${ADD_LABEL[v.key] ?? v.singolare}”.`,
  });
});

const repeaters = {
  cronologie: repeater(document.querySelector('[data-repeat="cronologie"]'), { addLabel: 'Datazione', createRow: cronologiaRow, initial: scheda?.cronologie ?? [], startWithOne: !scheda }),
  inventari: repeater(document.querySelector('[data-repeat="inventari"]'), { addLabel: 'Inventario', createRow: inventarioRow, initial: scheda?.inventari ?? [], startWithOne: !scheda }),
  misure: repeater(document.querySelector('[data-repeat="misure"]'), { addLabel: 'Gruppo di misure', createRow: gruppoMisureRow, initial: scheda?.misure ?? [], emptyText: 'Nessuna misura.' }),
  documentazioni_fotografiche: repeater(document.querySelector('[data-repeat="documentazioni_fotografiche"]'), { addLabel: 'Riferimento', createRow: documentazioneRow, initial: scheda?.documentazioni_fotografiche ?? [], emptyText: 'Nessun riferimento.' }),
};

const fillDatalist = (id, values) => document.getElementById(id).replaceChildren(...values.map((v) => el('option', { value: v })));
fillDatalist('dl-direzioni', config.misure.direzioni);
fillDatalist('dl-tipi', config.misure.tipi);
api('GET', '/api/suggerimenti/ambiti?q=').then((v) => fillDatalist('dl-ambiti', v)).catch(() => undefined);

form.classificazione.value = scheda?.classificazione ?? '';
form.note_schedatore.value = scheda?.note_schedatore ?? '';
renderImages();

// ---------------------------------------------------------------------------
// Salvataggio
// ---------------------------------------------------------------------------

function collect() {
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
    ...Object.fromEntries(Object.entries(vocabRepeaters).map(([k, r]) => [k, r.get()])),
  };
}

const SEZIONI = {
  titolo_opera: 'Titolo',
  classificazione: 'Classificazione',
  cronologie: 'Datazione',
  inventari: 'Inventario',
  misure: 'Misure',
  documentazioni_fotografiche: 'Documentazione fotografica',
  immagini: 'Immagini',
  ...Object.fromEntries(config.vocabolari.map((v) => [v.key, v.plurale])),
};

function showErrors(error) {
  const items = (error.details ?? []).map((d) => {
    const [first, index, ...rest] = String(d.campo).split('.');
    const where = [SEZIONI[first] ?? first, index !== undefined && /^\d+$/.test(index) ? `riga ${Number(index) + 1}` : index, ...rest].filter(Boolean).join(' › ');
    return el('li', { text: `${where}: ${d.messaggio}` });
  });
  erroriEl.replaceChildren(el('strong', { text: error.message }), items.length ? el('ul', { class: 'mb-0 mt-1' }, items) : '');
  erroriEl.classList.remove('d-none');
  erroriEl.focus();
  erroriEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const buttons = [document.getElementById('salva'), document.getElementById('salva-invia')].filter(Boolean);

async function save(invia) {
  if (invia) {
    const ok = await confirmDialog({
      title: 'Salvare e inviare in revisione?',
      body: "Un amministratore valuterà la scheda. Fino all'esito non potrai modificarla (potrai però ritirarla).",
      confirmText: 'Salva e invia',
    });
    if (!ok) return;
  }
  erroriEl.classList.add('d-none');
  buttons.forEach((b) => (b.disabled = true));
  statusEl.textContent = 'Salvataggio…';
  try {
    const data = collect();
    if (schedaId) {
      await api('PUT', `/api/schede/${schedaId}`, data);
    } else {
      schedaId = (await api('POST', '/api/schede', data)).id;
      history.replaceState(null, '', `/area/schede/${schedaId}/modifica`);
      document.getElementById('editor-annulla').href = `/area/schede/${schedaId}`;
    }
    dirty = false;
    if (invia) {
      await api('POST', `/api/schede/${schedaId}/invia`, {});
      window.location.href = '/area';
      return;
    }
    statusEl.textContent = `Salvata alle ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    toast('Scheda salvata');
  } catch (error) {
    statusEl.textContent = 'Salvataggio non riuscito';
    showErrors(error);
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

// Evidenzia nel menu laterale la sezione visibile
const navLinks = [...document.querySelectorAll('.editor-nav .nav-link')];
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  },
  { rootMargin: '-20% 0px -70% 0px' },
);
document.querySelectorAll('.editor-section').forEach((s) => observer.observe(s));
dirty = false;
statusEl.textContent = scheda ? `Ultima modifica: ${new Date(scheda.updated_at).toLocaleString('it-IT')}` : 'Nuova scheda non ancora salvata';
