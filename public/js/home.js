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

