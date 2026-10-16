import { api, htmlToText } from './lib/api.js';
import { attachAutocomplete } from './lib/autocomplete.js';
import { t } from './lib/i18n.js';

const TIPI = {
  autori: { label: 'Autore', param: 'autori' },
  ubicazioni: { label: 'Ubicazione', param: 'ubicazioni' },
  materiali: { label: 'Materiale', param: 'materiali' },
  tecniche: { label: 'Tecnica', param: 'tecniche' },
  mostre: { label: 'Mostra', param: 'mostre' },
};

// Simple search: suggests works and authority entries while typing.
// Choosing a work opens its record; choosing an authority entry filters the linked works.
const q = document.getElementById('q');
if (q) {
  attachAutocomplete(q, {
    minChars: 2,
    fetchItems: async (text) => {
      const res = await api('GET', `/api/suggerimenti?q=${encodeURIComponent(text)}`);
      return [
        ...res.opere.map((o) => ({ kind: 'opera', url: o.url, label: o.titolo_testo, detail: t('Opera') })),
        ...res.voci.map((v) => ({
          kind: v.tipo,
          id: v.id,
          label: htmlToText(v.label),
          detail: `${t(TIPI[v.tipo].label)} · ${t(v.schede === 1 ? '{n} opera' : '{n} opere', { n: v.schede })}`,
        })),
      ];
    },
    label: (item) => item.label,
    detail: (item) => item.detail,
    onSelect: (item) => {
      window.location.href = item.kind === 'opera' ? item.url : `/?${TIPI[item.kind].param}=${item.id}`;
    },
  });
}

// Advanced search: suggestions on the free-text author and exhibition fields
document.querySelectorAll('input[data-suggest]').forEach((input) => {
  const tipo = input.dataset.suggest;
  attachAutocomplete(input, {
    fetchItems: (text) => api('GET', `/api/vocabolari/${tipo}?q=${encodeURIComponent(text)}&limit=8`),
    label: (item) => htmlToText(Object.values(item)[1]),
    detail: (item) => t(item.schede_pubblicate === 1 ? '{n} opera' : '{n} opere', { n: item.schede_pubblicate }),
    onSelect: (_item, label) => {
      input.value = label;
    },
  });
});

// Header background: the covers take turns every 20 seconds with a slow cross-fade.
// Only the first one is in the page from the start; each of the others is downloaded
// a few seconds before its turn, so opening the home stays light. No changes while
// the header is off screen or the tab is hidden, nor if the visitor asked the system
// to reduce motion.
const INTERVALLO_MS = 20_000;
const ANTICIPO_MS = 5_000;
const sfondo = document.querySelector('[data-hero-sfondo]');
let sfondi = sfondo ? [...sfondo.querySelectorAll('img')] : [];

const carica = (img) => {
  if (img?.dataset.src && !img.getAttribute('src')) img.src = img.dataset.src;
};

if (sfondi.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let corrente = 0;
  let visibile = true;
  new IntersectionObserver(([voce]) => (visibile = voce.isIntersecting)).observe(sfondo.closest('section') ?? sfondo);
  // An image that can't be loaded leaves the rotation instead of showing an empty frame
  sfondi.forEach((img) =>
    img.addEventListener('error', () => {
      img.remove();
      sfondi = sfondi.filter((x) => x !== img);
    }),
  );
  const prossima = () => (corrente + 1) % sfondi.length;
  setTimeout(() => carica(sfondi[prossima()]), INTERVALLO_MS - ANTICIPO_MS);
  setInterval(() => {
    if (document.hidden || !visibile || sfondi.length < 2) return;
    const dopo = sfondi[prossima()];
    // Not downloaded yet (slow connection): try again at the next tick
    if (!dopo.complete || !dopo.naturalWidth) return carica(dopo);
    sfondi[corrente].classList.remove('attiva');
    dopo.classList.add('attiva');
    corrente = prossima();
    setTimeout(() => carica(sfondi[prossima()]), INTERVALLO_MS - ANTICIPO_MS);
  }, INTERVALLO_MS);
}
