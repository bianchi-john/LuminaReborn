// Galleria della scheda: didascalia e miniatura attiva sincronizzate, ingrandimento a tutto schermo.
const galleria = document.getElementById('galleria');
const didascalia = document.getElementById('galleria-didascalia');

if (galleria) {
  galleria.addEventListener('slid.bs.carousel', (event) => {
    if (didascalia) didascalia.textContent = event.relatedTarget.dataset.caption || '';
    document.querySelectorAll('.gallery-thumbs button').forEach((b, i) => b.classList.toggle('active', i === event.to));
  });

  const lightbox = document.getElementById('lightbox');
  const modal = new window.bootstrap.Modal(lightbox);
  galleria.addEventListener('click', (event) => {
    const img = event.target.closest('img[data-lightbox]');
    if (!img) return;
    document.getElementById('lightbox-img').src = img.src;
    document.getElementById('lightbox-img').alt = img.alt;
    document.getElementById('lightbox-caption').textContent = img.closest('.carousel-item')?.dataset.caption || '';
    modal.show();
  });
}
