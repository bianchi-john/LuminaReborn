import { el } from './api.js';

/**
 * Editor di testo formattato minimale. Il server ripulisce comunque l'HTML
 * (sanitize-html) ammettendo solo i tag offerti da questa barra.
 * kind: 'inline' (titoli, riferimenti: una riga, solo formattazione del testo)
 *       'block'  (paragrafi, elenchi, citazioni)
 */
const INLINE_TOOLS = [
  { cmd: 'italic', label: 'Corsivo', html: '<em>C</em>', key: 'i' },
  { cmd: 'bold', label: 'Grassetto', html: '<strong>G</strong>', key: 'b' },
  { cmd: 'underline', label: 'Sottolineato', html: '<u>S</u>', key: 'u' },
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
  ...INLINE_TOOLS.slice(5),
];

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function createRichText({ kind = 'block', value = '', placeholder = '', labelledBy, onChange } = {}) {
  const content = el('div', {
    class: 'rte-content',
    contenteditable: 'true',
    role: 'textbox',
    'aria-multiline': kind === 'block' ? 'true' : 'false',
    'aria-labelledby': labelledBy,
    'data-placeholder': placeholder,
  });
  content.innerHTML = value || '';

  const exec = (cmd) => {
    content.focus();
    if (cmd === 'link') {
      const url = window.prompt('Indirizzo del collegamento (https://…)', 'https://');
      if (url && /^(https?:\/\/|mailto:)/i.test(url)) document.execCommand('createLink', false, url);
    } else if (cmd === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote');
    } else {
      document.execCommand(cmd, false);
    }
    onChange?.();
  };

  const tools = kind === 'block' ? BLOCK_TOOLS : INLINE_TOOLS;
  const toolbar = el(
    'div',
    { class: 'rte-toolbar', role: 'toolbar', 'aria-label': 'Formattazione' },
    tools.map((t) => {
      const b = el('button', { type: 'button', title: t.label, 'aria-label': t.label, onmousedown: (e) => e.preventDefault(), onclick: () => exec(t.cmd) });
      b.innerHTML = t.html; // contenuto statico definito sopra
      return b;
    }),
  );

  if (kind === 'block') document.execCommand('defaultParagraphSeparator', false, 'p');

  content.addEventListener('keydown', (event) => {
    if (kind === 'inline' && event.key === 'Enter') event.preventDefault();
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
      const tool = INLINE_TOOLS.find((t) => t.key === event.key.toLowerCase());
      if (tool) {
        event.preventDefault();
        exec(tool.cmd);
      }
    }
  });

  // Incolla solo testo: evita stili e markup estranei (es. da Word)
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

  const root = el('div', { class: `rte rte-${kind}` }, toolbar, content);

  return {
    root,
    focus: () => content.focus(),
    getValue() {
      if (!content.textContent.trim()) return '';
      return content.innerHTML.trim();
    },
    setValue(html) {
      content.innerHTML = html || '';
    },
  };
}
