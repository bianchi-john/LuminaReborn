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


// Header background: the blurred covers alternate with a cross-fade
// (random order chosen by the server on each visit). No animation if the user
// has asked the system to reduce motion.
const sfondo = document.querySelector('[data-hero-sfondo]');
const immagini = sfondo ? [...sfondo.querySelectorAll('img')] : [];
if (immagini.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let corrente = 0;
  setInterval(() => {
    if (document.hidden) return;
    const prossima = (corrente + 1) % immagini.length;
    // Move to the next one only once it has loaded, to avoid blank flashes
    if (!immagini[prossima].complete) {
      immagini[prossima].loading = 'eager';
      return;
    }
    immagini[corrente].classList.remove('attiva');
    immagini[prossima].classList.add('attiva');
    corrente = prossima;
  }, 6500);
}
