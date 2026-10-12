import { toast } from './lib/api.js';
import { t } from './lib/i18n.js';

// Record gallery: caption, active thumbnail and link to the original kept in sync;
// zoom on the public version (the original is available to staff only).
const galleria = document.getElementById('galleria');

if (galleria) {
  const didascalia = document.getElementById('galleria-didascalia');
  const originale = document.getElementById('galleria-originale');
  const dimensioni = document.getElementById('galleria-dimensioni');

  galleria.addEventListener('slid.bs.carousel', (event) => {
    const item = event.relatedTarget;
    if (didascalia) didascalia.textContent = item.dataset.caption || '';
    if (originale && item.dataset.originale) originale.href = item.dataset.originale;
    if (dimensioni) dimensioni.textContent = item.dataset.dimensioni || '';
    document.querySelectorAll('.gallery-thumbs button').forEach((b, i) => b.classList.toggle('active', i === event.to));
  });

  const lightbox = document.getElementById('lightbox');
  const modal = new window.bootstrap.Modal(lightbox);
  const lbOriginale = document.getElementById('lightbox-originale');
  galleria.addEventListener('click', (event) => {
    const img = event.target.closest('img[data-lightbox]');
    if (!img) return;
    const item = img.closest('.carousel-item');
    document.getElementById('lightbox-img').src = img.src;
    document.getElementById('lightbox-img').alt = img.alt;
    document.getElementById('lightbox-caption').textContent = item?.dataset.caption || '';
    if (item?.dataset.originale) {
      lbOriginale.href = item.dataset.originale;
      lbOriginale.classList.remove('d-none');
    }
    modal.show();
  });
}

// ---------------------------------------------------------------------------
// Long content: the whole text is in the page (search engines, printing, no
// JavaScript); here it is shortened, with a button to open it.
// ---------------------------------------------------------------------------

const root = document.documentElement;
const header = document.querySelector('.site-header');
const nav = document.querySelector('[data-sezioni-nav]');

/** The section bar and the anchors sit below the sticky header: use the real heights. */
function misuraBarre() {
  root.style.setProperty('--lu-header-h', `${header?.offsetHeight ?? 0}px`);
  if (nav) root.style.setProperty('--lu-sezioni-h', `${nav.offsetHeight}px`);
}
misuraBarre();
window.addEventListener('resize', misuraBarre, { passive: true });

let progressivo = 0;
const idPer = (node) => (node.id ||= `comprimibile-${++progressivo}`);

/** Shortened parts of each section, so its title can open or close them all at once. */
const perSezione = new Map();

/** A toggle button for `target`; `onToggle(aperto)` applies the state and returns the label. */
function pulsante(target, classe, etichettaChiusa, onToggle) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = classe;
  btn.textContent = etichettaChiusa;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', idPer(target));
  btn.addEventListener('click', () => {
    const aperto = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(aperto));
    btn.textContent = onToggle(aperto);
    aggiornaTitolo(target.closest('section'));
  });
  const sezione = target.closest('section');
  if (sezione) perSezione.set(sezione, [...(perSezione.get(sezione) ?? []), btn]);
  return btn;
}

const tuttiAperti = (sezione) => (perSezione.get(sezione) ?? []).every((b) => b.getAttribute('aria-expanded') === 'true');

function aggiornaTitolo(sezione) {
  const btn = sezione?.querySelector(':scope > h2 > .btn-sezione');
  if (!btn) return;
  const aperti = tuttiAperti(sezione);
  btn.setAttribute('aria-expanded', String(aperti));
  btn.textContent = aperti ? t('Riduci') : t('Espandi');
}

/** When closing a long block, bring its start back into view if it scrolled away. */
function riportaInVista(node) {
  const top = node.getBoundingClientRect().top;
  const margine = (header?.offsetHeight ?? 0) + (nav?.offsetHeight ?? 0);
  if (top < margine) node.scrollIntoView({ block: 'start' });
}

// Very long titles (some exceed 400 characters): three lines, then "Full title"
const titolo = document.querySelector('[data-titolo-comprimibile]');
if (titolo) {
  titolo.classList.add('compresso');
  if (titolo.scrollHeight > titolo.clientHeight + 2) {
    titolo.after(
      pulsante(titolo, 'btn-testo no-print', t('Mostra il titolo completo'), (aperto) => {
        titolo.classList.toggle('compresso', !aperto);
        return aperto ? t('Riduci il titolo') : t('Mostra il titolo completo');
      }),
    );
  } else {
    titolo.classList.remove('compresso');
  }
}

// Texts: shortened to about N lines with a fade, only if well beyond that
document.querySelectorAll('[data-comprimi]').forEach((box) => {
  const righe = Number(box.dataset.comprimi) || 16;
  const riga = parseFloat(getComputedStyle(box).lineHeight) || 27;
  const altezza = righe * riga;
  if (box.scrollHeight <= altezza * 1.3) return;
  box.style.setProperty('--altezza-compressa', `${Math.round(altezza)}px`);
  box.classList.add('compresso');
  box.after(
    pulsante(box, 'btn-espandi no-print', t('Continua a leggere'), (aperto) => {
      box.classList.toggle('compresso', !aperto);
      if (!aperto) riportaInVista(box.closest('section') ?? box);
      return aperto ? t('Riduci') : t('Continua a leggere');
    }),
  );
});

// Lists (bibliography, exhibitions...): the first items, then "Show all (N)"
document.querySelectorAll('[data-elenco]').forEach((lista) => {
  const visibili = Number(lista.dataset.elenco) || 6;
  const voci = [...lista.children];
  if (voci.length <= visibili + 2) return; // hiding just one or two items isn't worth a click
  const extra = voci.slice(visibili);
  extra.forEach((li) => li.classList.add('nascosto'));
  const chiuso = t('Mostra tutti ({n})', { n: voci.length });
  lista.after(
    pulsante(lista, 'btn-espandi no-print', chiuso, (aperto) => {
      extra.forEach((li) => li.classList.toggle('nascosto', !aperto));
      if (!aperto) riportaInVista(lista.closest('section') ?? lista);
      return aperto ? t('Mostra meno') : chiuso;
    }),
  );
});

// Each shortened section gets a small "Expand" control next to its title: one click opens everything in it
perSezione.forEach((pulsanti, sezione) => {
  const titolo = sezione.querySelector(':scope > h2');
  if (!titolo) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-sezione no-print';
  btn.setAttribute('aria-controls', pulsanti.map((b) => b.getAttribute('aria-controls')).join(' '));
  btn.addEventListener('click', () => {
    const apri = !tuttiAperti(sezione);
    pulsanti.filter((b) => (b.getAttribute('aria-expanded') === 'true') !== apri).forEach((b) => b.click());
    if (!apri) riportaInVista(sezione);
  });
  titolo.append(btn);
  aggiornaTitolo(sezione);
});

// Section bar: highlights the section being read and keeps its link visible
if (nav) {
  const links = new Map([...nav.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
  const attiva = (id) => {
    links.forEach((a, key) => a.classList.toggle('attiva', key === id));
    const a = links.get(id);
    if (a) nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
  };
  const osservatore = new IntersectionObserver(
    (entries) => {
      const visibile = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visibile) attiva(visibile.target.id);
    },
    { rootMargin: '-25% 0px -65% 0px' },
  );
  links.forEach((_, id) => {
    const sezione = document.getElementById(id);
    if (sezione) osservatore.observe(sezione);
  });
}

// Citation: copy to the clipboard
document.querySelectorAll('[data-copia]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    const testo = document.getElementById(btn.dataset.copia)?.textContent.replace(/\s+/g, ' ').trim() ?? '';
    try {
      await navigator.clipboard.writeText(testo);
      toast(t('Citazione copiata'));
    } catch {
      toast(t('Copia non riuscita: seleziona il testo e copialo a mano'), 'danger');
    }
  }),
);
