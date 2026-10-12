// Style test panel: try fonts and the transition between the home header and
// the page, then keep what works. Opens with Alt+Shift+S (or #prova-stile in
// the address). Nothing changes for visitors who don't open it: the choice
// lives in this browser tab only (sessionStorage) and the extra fonts are
// downloaded only while testing. Temporary tool: removing this file and its
// <script> in the footer removes it entirely.
import { el } from './lib/api.js';

const CHIAVE = 'lumina-prova-stile';

const TESTO = [
  { id: 'inter', nome: 'Inter (attuale)', css: '' },
  { id: 'sistema', nome: 'Font di sistema (San Francisco su Mac)', css: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { id: 'helvetica', nome: 'Helvetica / Arial', css: '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif' },
  { id: 'geist', nome: 'Geist', css: '"Geist Variable", sans-serif' },
  { id: 'public-sans', nome: 'Public Sans', css: '"Public Sans Variable", sans-serif' },
  { id: 'dm-sans', nome: 'DM Sans', css: '"DM Sans Variable", sans-serif' },
  { id: 'figtree', nome: 'Figtree', css: '"Figtree Variable", sans-serif' },
  { id: 'manrope', nome: 'Manrope', css: '"Manrope Variable", sans-serif' },
  { id: 'instrument-sans', nome: 'Instrument Sans', css: '"Instrument Sans Variable", sans-serif' },
  { id: 'ibm-plex-sans', nome: 'IBM Plex Sans', css: '"IBM Plex Sans Variable", sans-serif' },
  { id: 'source-sans-3', nome: 'Source Sans 3', css: '"Source Sans 3 Variable", sans-serif' },
  { id: 'times', nome: 'Times New Roman', css: '"Times New Roman", Times, "Liberation Serif", serif' },
];

const TITOLI = [
  { id: 'come-testo', nome: 'Come il testo (attuale)', css: '' },
  { id: 'playfair', nome: 'Playfair Display', css: '"Playfair Display Variable", serif' },
  { id: 'bodoni-moda', nome: 'Bodoni Moda', css: '"Bodoni Moda Variable", serif' },
  { id: 'cormorant-garamond', nome: 'Cormorant Garamond', css: '"Cormorant Garamond Variable", serif' },
  { id: 'fraunces', nome: 'Fraunces', css: '"Fraunces Variable", serif' },
  { id: 'eb-garamond', nome: 'EB Garamond', css: '"EB Garamond Variable", serif' },
  { id: 'times', nome: 'Times New Roman', css: '"Times New Roman", Times, "Liberation Serif", serif' },
];

const STACCHI = [
  { id: 'netto', nome: 'Netto (attuale)' },
  { id: 'sfumato', nome: 'Sfumato breve' },
  { id: 'sfumato-lungo', nome: 'Sfumato lungo' },
  { id: 'onda', nome: 'Onda' },
  { id: 'onda-sfumata', nome: 'Onda sfumata' },
  { id: 'seghettato', nome: 'Seghettato' },
  { id: 'seghettato-sfumato', nome: 'Seghettato sfumato' },
  { id: 'curva', nome: 'Curva' },
  { id: 'diagonale', nome: 'Diagonale' },
];

const PREDEFINITA = { testo: 'inter', titoli: 'come-testo', stacco: 'netto' };

function leggi() {
  try {
    return { ...PREDEFINITA, ...JSON.parse(sessionStorage.getItem(CHIAVE) || '{}') };
  } catch {
    return { ...PREDEFINITA };
  }
}

function salva(scelta) {
  try {
    const diversa = Object.keys(PREDEFINITA).some((k) => scelta[k] !== PREDEFINITA[k]);
    if (diversa) sessionStorage.setItem(CHIAVE, JSON.stringify(scelta));
    else sessionStorage.removeItem(CHIAVE);
  } catch {
    // Storage unavailable (private browsing, blocked): the choice simply lasts until the page changes
  }
}

let fontCaricati = false;
function caricaFont() {
  if (fontCaricati) return;
  fontCaricati = true;
  document.head.append(el('link', { rel: 'stylesheet', href: '/static/css/font-prova.css' }));
}

function applica(scelta) {
  const root = document.documentElement;
  const testo = TESTO.find((f) => f.id === scelta.testo) ?? TESTO[0];
  const titoli = TITOLI.find((f) => f.id === scelta.titoli) ?? TITOLI[0];
  if (testo.css || titoli.css) caricaFont();
  if (testo.css) root.style.setProperty('--lu-font', testo.css);
  else root.style.removeProperty('--lu-font');
  // Headings follow the text unless a heading font is chosen
  if (titoli.css) root.style.setProperty('--lu-font-titoli', titoli.css);
  else root.style.removeProperty('--lu-font-titoli');
  if (scelta.stacco && scelta.stacco !== 'netto') root.dataset.stacco = scelta.stacco;
  else delete root.dataset.stacco;
}

let scelta = leggi();
applica(scelta);

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

let pannello = null;

function gruppo(titolo, chiave, voci, conAnteprima) {
  const nome = `prova-${chiave}`;
  return el(
    'fieldset',
    { class: 'prova-gruppo' },
    el('legend', {}, titolo),
    voci.map((v) => {
      const input = el('input', { type: 'radio', name: nome, value: v.id, checked: scelta[chiave] === v.id });
      input.addEventListener('change', () => {
        scelta = { ...scelta, [chiave]: v.id };
        salva(scelta);
        applica(scelta);
        aggiornaRiepilogo();
      });
      const etichetta = el('span', {}, v.nome);
      // Each font is shown in itself, so the list is already a preview
      if (conAnteprima && v.css) etichetta.style.setProperty('font-family', v.css);
      return el('label', { class: 'prova-voce' }, input, etichetta);
    }),
  );
}

const riepilogo = () => {
  const n = (lista, id) => lista.find((x) => x.id === id)?.nome.replace(' (attuale)', '') ?? id;
  return `Testo: ${n(TESTO, scelta.testo)} · Titoli: ${n(TITOLI, scelta.titoli)} · Stacco: ${n(STACCHI, scelta.stacco)}`;
};

function aggiornaRiepilogo() {
  const nodo = pannello?.querySelector('[data-riepilogo]');
  if (nodo) nodo.textContent = riepilogo();
}

function chiudi() {
  pannello?.remove();
  pannello = null;
}

function apri() {
  if (pannello) return chiudi();
  caricaFont();
  const ripristina = el('button', { type: 'button', class: 'btn btn-sm btn-outline-secondary' }, 'Ripristina');
  ripristina.addEventListener('click', () => {
    scelta = { ...PREDEFINITA };
    salva(scelta);
    applica(scelta);
    chiudi();
    apri();
  });
  const copia = el('button', { type: 'button', class: 'btn btn-sm btn-outline-secondary' }, 'Copia la scelta');
  copia.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(riepilogo());
      copia.textContent = 'Copiata';
    } catch {
      copia.textContent = 'Seleziona il testo sopra';
    }
  });
  const x = el('button', { type: 'button', class: 'btn-close', 'aria-label': 'Chiudi' });
  x.addEventListener('click', chiudi);
  pannello = el(
    'aside',
    { class: 'prova-stile', role: 'dialog', 'aria-label': 'Prova di stile' },
    el('div', { class: 'prova-testa' }, el('strong', {}, 'Prova di stile'), el('span', { class: 'prova-tasti' }, 'Alt+Shift+S'), x),
    el(
      'div',
      { class: 'prova-corpo' },
      gruppo('Font del testo', 'testo', TESTO, true),
      gruppo('Font dei titoli', 'titoli', TITOLI, true),
      gruppo('Stacco tra intestazione e pagina (home)', 'stacco', STACCHI, false),
    ),
    el('p', { class: 'prova-riepilogo', 'data-riepilogo': true }, riepilogo()),
    el('div', { class: 'prova-azioni' }, ripristina, copia),
  );
  document.body.append(pannello);
}

document.addEventListener('keydown', (event) => {
  if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyS') {
    event.preventDefault();
    apri();
  } else if (event.key === 'Escape' && pannello) {
    chiudi();
  }
});
if (window.location.hash === '#prova-stile') apri();
