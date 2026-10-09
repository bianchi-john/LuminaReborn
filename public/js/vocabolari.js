import { api, confirmDialog, el, htmlToText, toast } from './lib/api.js';
import { attachAutocomplete } from './lib/autocomplete.js';

const table = document.getElementById('tabella-voci');
const tipo = table.dataset.tipo;
const fields = JSON.parse(document.getElementById('voc-def').textContent);
const display = fields[0].name;

const voceModal = new window.bootstrap.Modal(document.getElementById('modale-voce'));
const unisciModal = new window.bootstrap.Modal(document.getElementById('modale-unisci'));
let corrente = null;
let destinazione = null;

table.addEventListener('click', async (event) => {
  const btn = event.target.closest('[data-voce-azione]');
  if (!btn) return;
  corrente = JSON.parse(btn.closest('tr').dataset.voce);
  const azione = btn.dataset.voceAzione;
  if (azione === 'modifica') apriModifica();
  if (azione === 'unisci') apriUnisci();
  if (azione === 'elimina') {
    const ok = await confirmDialog({ title: 'Eliminare la voce?', body: htmlToText(corrente[display]), confirmText: 'Elimina', variant: 'danger' });
    if (!ok) return;
    try {
      await api('DELETE', `/api/vocabolari/${tipo}/${corrente.id}`);
      toast('Voce eliminata');
      btn.closest('tr').remove();
    } catch (error) {
      toast(error.message, 'danger');
    }
  }
});

// --- Modifica ---------------------------------------------------------------

const campi = document.getElementById('voce-campi');
const voceErrore = document.getElementById('voce-errore');

function apriModifica() {
  voceErrore.classList.add('d-none');
  campi.replaceChildren(
    ...fields.map((f) => {
      const id = `voce-${f.name}`;
      const value = corrente[f.name] ?? '';
      const control =
        f.type === 'longtext' || f.type === 'inline'
          ? el('textarea', { class: 'form-control', id, name: f.name, rows: f.type === 'inline' ? 2 : 3, maxlength: f.max })
          : el('input', { class: 'form-control', id, name: f.name, type: f.type === 'int' ? 'number' : 'text', maxlength: f.max });
      control.value = value;
      const col = f.type === 'int' ? 'col-4 col-md-2' : f.type === 'text' && fields.length > 2 ? 'col-md-6' : 'col-12';
      return el(
        'div',
        { class: col },
        el('label', { class: 'form-label', for: id, text: f.label }),
        control,
        f.type === 'inline' ? el('div', { class: 'form-text', text: 'Corsivo con <i>…</i>' }) : null,
      );
    }),
  );
  voceModal.show();
}

document.getElementById('form-voce').addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(fields.map((f) => [f.name, event.target.elements[f.name].value]));
  try {
    await api('PUT', `/api/vocabolari/${tipo}/${corrente.id}`, body);
    toast('Voce aggiornata');
    window.location.reload();
  } catch (error) {
    voceErrore.textContent = error.details?.map((d) => d.messaggio).join('; ') || error.message;
    voceErrore.classList.remove('d-none');
  }
});

// --- Unione dei duplicati ----------------------------------------------------

const cerca = document.getElementById('unisci-cerca');
const scelta = document.getElementById('unisci-scelta');
const conferma = document.getElementById('unisci-conferma');
const unisciErrore = document.getElementById('unisci-errore');

attachAutocomplete(cerca, {
  fetchItems: async (q) => (await api('GET', `/api/vocabolari/${tipo}?q=${encodeURIComponent(q)}&limit=15`)).filter((i) => i.id !== corrente?.id),
  label: (item) => htmlToText(item[display]),
  detail: (item) => `#${item.id} · ${item.schede_totali} schede`,
  onSelect: (item, label) => {
    destinazione = item;
    scelta.replaceChildren(el('span', { class: 'voce-label', text: `${label} (#${item.id})` }));
    scelta.classList.remove('d-none');
    cerca.value = '';
    conferma.disabled = false;
  },
});

function apriUnisci() {
  destinazione = null;
  conferma.disabled = true;
  scelta.classList.add('d-none');
  unisciErrore.classList.add('d-none');
  document.getElementById('unisci-origine').textContent = `${htmlToText(corrente[display])} (#${corrente.id})`;
  unisciModal.show();
  setTimeout(() => cerca.focus(), 300);
}

document.getElementById('form-unisci').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!destinazione) return;
  try {
    await api('POST', `/api/vocabolari/${tipo}/${corrente.id}/unisci`, { in: destinazione.id });
    toast('Voci unite');
    window.location.reload();
  } catch (error) {
    unisciErrore.textContent = error.message;
    unisciErrore.classList.remove('d-none');
  }
});
