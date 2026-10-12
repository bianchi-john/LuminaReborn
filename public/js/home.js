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


// Header background: the CSS filter blur(12px) saturate(1.25) would be recomputed
// on every frame of the slow zoom. The same effect is applied once, in a canvas,
// at the image's own resolution (radius scaled to the displayed size): a blurred
// image has no fine detail, so enlarging it afterwards looks the same.
const SFOCATURA_PX = 12;
function presfoca(img) {
  if (img.dataset.presfocata || !img.naturalWidth) return;
  img.dataset.presfocata = '1';
  const scala = Math.max(img.clientWidth / img.naturalWidth, img.clientHeight / img.naturalHeight) || 1;
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx || !('filter' in ctx)) return; // older browsers: the CSS filter stays
  ctx.filter = `blur(${(SFOCATURA_PX / scala).toFixed(2)}px) saturate(1.25)`;
  ctx.drawImage(img, 0, 0);
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      // Decoded beforehand, so the swap happens without a blank frame
      const url = URL.createObjectURL(blob);
      const pronta = new Image();
      pronta.src = url;
      pronta
        .decode()
        .then(() => {
          img.src = url;
          img.classList.add('presfocata');
        })
        .catch(() => URL.revokeObjectURL(url));
    },
    'image/jpeg',
    0.92,
  );
}

// Header background: the blurred covers alternate with a cross-fade
// (random order chosen by the server on each visit). No animation if the visitor
// has asked the system to reduce motion.
const sfondo = document.querySelector('[data-hero-sfondo]');
const immagini = sfondo ? [...sfondo.querySelectorAll('img')] : [];
immagini.forEach((img) => {
  if (img.complete) presfoca(img);
  else img.addEventListener('load', () => presfoca(img), { once: true });
});
if (immagini.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let corrente = 0;
  // No new cross-fade (and no new slow zoom) while the header is off screen
  let visibile = true;
  new IntersectionObserver(([voce]) => (visibile = voce.isIntersecting)).observe(sfondo.closest('section') ?? sfondo);
  setInterval(() => {
    if (document.hidden || !visibile) return;
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
