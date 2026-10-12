// Database overview: one shared tooltip for every mark (cells, bars, nodes)
// and the filter/sort controls of the completeness map.
import { t } from './lib/i18n.js';

const tooltip = document.querySelector('[data-viz-tooltip]');
const [tipTitolo, tipValore, tipNota] = tooltip ? tooltip.children : [];

function mostra(target, x, y) {
  // Values first, label after: the reader already knows which mark they are on
  tipValore.textContent = target.dataset.tipValore || '';
  tipTitolo.textContent = target.dataset.tip || '';
  tipNota.textContent = target.dataset.tipNota || '';
  tooltip.hidden = false;
  const { width, height } = tooltip.getBoundingClientRect();
  const left = Math.min(window.innerWidth - width - 8, Math.max(8, x + 14));
  const top = y + height + 20 > window.innerHeight ? y - height - 12 : y + 16;
  tooltip.style.setProperty('--x', `${left}px`);
  tooltip.style.setProperty('--y', `${top}px`);
}

if (tooltip) {
  let attivo = null;
  document.addEventListener('pointermove', (event) => {
    const target = event.target.closest?.('[data-tip]');
    if (attivo && attivo !== target) attivo.classList.remove('viz-hover');
    attivo = target;
    if (!target) {
      tooltip.hidden = true;
      return;
    }
    target.classList.add('viz-hover');
    mostra(target, event.clientX, event.clientY);
  });
  // Keyboard: the same details as on hover
  document.addEventListener('focusin', (event) => {
    const target = event.target.closest?.('[data-tip]');
    if (!target) return;
    const r = target.getBoundingClientRect();
    mostra(target, r.left + r.width / 2, r.bottom);
  });
  document.addEventListener('focusout', () => (tooltip.hidden = true));
  window.addEventListener('scroll', () => (tooltip.hidden = true), { passive: true });
}

// Completeness map: filter by state, sort by completeness or title
const mappa = document.querySelector('[data-mappa] tbody');
const filtroStato = document.querySelector('[data-filtro-stato]');
const ordina = document.querySelector('[data-ordina]');
const conteggio = document.querySelector('[data-conteggio-righe]');

function aggiorna() {
  const righe = [...mappa.rows];
  const stato = filtroStato.value;
  righe.sort((a, b) =>
    ordina.value === 'titolo'
      ? a.dataset.titolo.localeCompare(b.dataset.titolo)
      : Number(a.dataset.completezza) - Number(b.dataset.completezza) || a.dataset.titolo.localeCompare(b.dataset.titolo),
  );
  let visibili = 0;
  for (const r of righe) {
    r.hidden = !!stato && r.dataset.stato !== stato;
    if (!r.hidden) visibili++;
  }
  mappa.append(...righe);
  conteggio.textContent = t(visibili === 1 ? '{n} scheda' : '{n} schede', { n: visibili });
}

if (mappa && filtroStato && ordina) {
  filtroStato.addEventListener('change', aggiorna);
  ordina.addEventListener('change', aggiorna);
  aggiorna();
}
