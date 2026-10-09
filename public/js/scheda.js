// Galleria della scheda: didascalia, miniatura attiva e link all'originale sincronizzati;
// ingrandimento della versione pubblica (l'originale è disponibile solo allo staff).
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
