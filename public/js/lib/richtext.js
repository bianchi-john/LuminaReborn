import { el } from './api.js';
import { t } from './i18n.js';

/**
 * Minimal rich-text editor. The server sanitizes the HTML anyway
 * (sanitize-html), allowing only the tags offered by this toolbar.
 * kind: 'inline' (titles, references: one line, text formatting only)
 *       'block'  (paragraphs, lists, quotations)
 */
const INLINE_TOOLS = [
  { cmd: 'italic', label: 'Corsivo', html: '<em>I</em>', key: 'i' },
  { cmd: 'bold', label: 'Grassetto', html: '<strong>B</strong>', key: 'b' },
  { cmd: 'underline', label: 'Sottolineato', html: '<u>U</u>', key: 'u' },
  { cmd: 'superscript', label: 'Apice', html: 'x²' },
  { cmd: 'subscript', label: 'Pedice', html: 'x₂' },
  { cmd: 'link', label: 'Collegamento', html: '🔗' },
  { cmd: 'removeFormat', label: 'Rimuovi formattazione', html: '⌫' },
];

const BLOCK_TOOLS = [
  ...INLINE_TOOLS.slice(0, 5),
  { cmd: 'insertUnorderedList', label: 'Elenco puntato', html: '•≡' },
  { cmd: 'insertOrderedList', label: 'Elenco numerato', html: '1≡' },
  { cmd: 'blockquote', label: 'Citazione', html: '❝' },
  ...INLINE_TOOLS.slice(5, 6),
  { cmd: 'image', label: 'Inserisci un\'immagine della scheda', html: '▣' },
  ...INLINE_TOOLS.slice(6),
];

/** Only the reduced versions of images already uploaded to the record. */
const IMMAGINE_INTERNA = /^\/media\/([a-z2-9]{16})\/(anteprima|miniatura)$/;

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * images: function returning the record's images ({ codice, didascalia }):
 * 'block' fields can only insert those, picking them from a list.
 */
export function createRichText({ kind = 'block', value = '', placeholder = '', labelledBy, onChange, images } = {}) {
  const content = el('div', {
    class: 'rte-content',
    contenteditable: 'true',
    role: 'textbox',
    'aria-multiline': kind === 'block' ? 'true' : 'false',
    'aria-labelledby': labelledBy,
    'data-placeholder': placeholder,
  });
  content.innerHTML = value || '';

  // Image picker: a panel below the toolbar, with the record's thumbnails
  const picker = el('div', { class: 'rte-picker', hidden: true, role: 'dialog', 'aria-label': t('Inserisci un\'immagine della scheda') });
  let range = null;
  const closePicker = () => {
    picker.hidden = true;
    picker.replaceChildren();
  };
  const openPicker = () => {
    const sel = window.getSelection();
    range = sel.rangeCount && content.contains(sel.getRangeAt(0).commonAncestorContainer) ? sel.getRangeAt(0).cloneRange() : null;
    const list = images?.() ?? [];
    picker.replaceChildren(
      list.length
        ? el(
            'div',
            { class: 'rte-picker-grid' },
            list.map((img) =>
              el(
                'button',
                { type: 'button', class: 'rte-picker-item', title: img.didascalia || t('Immagine'), onclick: () => insertImage(img) },
                el('img', { src: `/media/${img.codice}/miniatura`, alt: '' }),
                el('span', {}, img.didascalia || t('Immagine')),
              ),
            ),
          )
        : el('p', { class: 'hint mb-0' }, t('Carica prima le immagini nella sezione «Immagini»: qui si possono inserire solo quelle della scheda.')),
      el('button', { type: 'button', class: 'btn btn-sm btn-outline-secondary mt-2', onclick: closePicker }, t('Chiudi')),
    );
    picker.hidden = false;
  };
  const insertImage = (img) => {
    closePicker();
    content.focus();
    if (range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    const alt = escapeHtml(img.didascalia || '');
    document.execCommand('insertHTML', false, `<p><img src="/media/${img.codice}/anteprima" alt="${alt}"></p><p><br></p>`);
    onChange?.();
  };

  /** Removes images that no longer belong to the record, e.g. after one has been deleted. */
  const pruneImages = () => {
    const allowed = new Set((images?.() ?? []).map((i) => i.codice));
    let changed = false;
    content.querySelectorAll('img').forEach((node) => {
      const codice = IMMAGINE_INTERNA.exec(node.getAttribute('src') ?? '')?.[1];
      if (kind === 'block' && codice && allowed.has(codice)) return;
      const p = node.parentElement;
      node.remove();
      if (p !== content && p?.tagName === 'P' && !p.textContent.trim() && !p.querySelector('img')) p.remove();
      changed = true;
    });
    return changed;
  };

  const exec = (cmd) => {
    content.focus();
    if (cmd === 'image') {
      if (picker.hidden) openPicker();
      else closePicker();
      return;
    }
    if (cmd === 'link') {
      const url = window.prompt(t('Indirizzo del collegamento (https://…)'), 'https://');
      if (url && /^(https?:\/\/|mailto:)/i.test(url)) document.execCommand('createLink', false, url);
    } else if (cmd === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote');
    } else {
      document.execCommand(cmd, false);
    }
    onChange?.();
  };

  const tools = kind === 'block' ? BLOCK_TOOLS.filter((x) => x.cmd !== 'image' || images) : INLINE_TOOLS;
  const toolbar = el(
    'div',
    { class: 'rte-toolbar', role: 'toolbar', 'aria-label': t('Formattazione') },
    tools.map((tool) => {
      const b = el('button', { type: 'button', title: t(tool.label), 'aria-label': t(tool.label), onmousedown: (e) => e.preventDefault(), onclick: () => exec(tool.cmd) });
      b.innerHTML = tool.html; // static content defined above
      return b;
    }),
  );

  if (kind === 'block') document.execCommand('defaultParagraphSeparator', false, 'p');

  content.addEventListener('keydown', (event) => {
    if (kind === 'inline' && event.key === 'Enter') event.preventDefault();
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
      const tool = INLINE_TOOLS.find((x) => x.key === event.key.toLowerCase());
      if (tool) {
        event.preventDefault();
        exec(tool.cmd);
      }
    }
  });

  // Paste plain text only: avoids foreign styles and markup (e.g. from Word)
  content.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (kind === 'inline') {
      document.execCommand('insertText', false, text.replace(/\s*\n\s*/g, ' '));
    } else {
      const paragraphs = text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`);
      document.execCommand('insertHTML', false, paragraphs.length > 1 ? paragraphs.join('') : escapeHtml(text).replace(/\n/g, '<br>'));
    }
    onChange?.();
  });
  content.addEventListener('input', () => onChange?.());

  // No images dragged in from the computer or other sites: only those uploaded to the record are used
  content.addEventListener('dragover', (event) => {
    if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
  });
  content.addEventListener('drop', (event) => {
    const dt = event.dataTransfer;
    if (!dt) return;
    event.preventDefault();
    if (dt.types.includes('Files')) {
      if (kind === 'block' && images) openPicker();
      return;
    }
    const text = dt.getData('text/plain');
    if (text) document.execCommand('insertText', false, kind === 'inline' ? text.replace(/\s*\n\s*/g, ' ') : text);
  });
  picker.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePicker();
      content.focus();
    }
  });

  const root = el('div', { class: `rte rte-${kind}` }, toolbar, picker, content);

  return {
    root,
    focus: () => content.focus(),
    getValue() {
      pruneImages();
      if (!content.textContent.trim() && !content.querySelector('img')) return '';
      return content.innerHTML.trim();
    },
    /** Call when the record's image list changes. */
    refreshImages() {
      if (pruneImages()) onChange?.();
      if (!picker.hidden) openPicker();
    },
    setValue(html) {
      content.innerHTML = html || '';
    },
  };
}
