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

// Ricerca semplice: suggerimenti di opere e voci mentre si scrive.
// Scegliendo un'opera si apre la scheda; scegliendo una voce si filtrano le opere collegate.
const q = document.getElementById('q');
if (q) {
  attachAutocomplete(q, {
    minChars: 2,
    fetchItems: async (text) => {
      const res = await api('GET', `/api/suggerimenti?q=${encodeURIComponent(text)}`);
      return [
        ...res.opere.map((o) => ({ kind: 'opera', id: o.id, label: o.titolo_testo, detail: t('Opera') })),
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
      window.location.href = item.kind === 'opera' ? `/scheda/${item.id}` : `/?${TIPI[item.kind].param}=${item.id}`;
    },
  });
}

// Ricerca avanzata: suggerimenti sui campi testuali di autore e mostra
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


// Sfondo dell'intestazione: le copertine sfocate si alternano con una dissolvenza
// (ordine casuale scelto dal server a ogni visita). Niente animazione se l'utente
// ha chiesto al sistema di ridurre il movimento.
const sfondo = document.querySelector('[data-hero-sfondo]');
const immagini = sfondo ? [...sfondo.querySelectorAll('img')] : [];
if (immagini.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let corrente = 0;
  setInterval(() => {
    if (document.hidden) return;
    const prossima = (corrente + 1) % immagini.length;
    // Passa alla successiva solo quando è già caricata, per evitare lampi vuoti
    if (!immagini[prossima].complete) {
      immagini[prossima].loading = 'eager';
      return;
    }
    immagini[corrente].classList.remove('attiva');
    immagini[prossima].classList.add('attiva');
    corrente = prossima;
  }, 6500);
}
