import { attachAutocomplete } from './lib/autocomplete.js';
import { htmlToText } from './lib/api.js';

// Suggerimenti nei campi di ricerca avanzata (voci usate in schede pubblicate)
document.querySelectorAll('input[data-suggest]').forEach((input) => {
  const tipo = input.dataset.suggest;
  attachAutocomplete(input, {
    fetchItems: async (q) => {
      const res = await fetch(`/api/vocabolari/${tipo}?q=${encodeURIComponent(q)}&limit=8`);
      return res.ok ? res.json() : [];
    },
    label: (item) => htmlToText(Object.values(item)[1]),
    onSelect: (item, label) => {
      input.value = label;
    },
  });
});
