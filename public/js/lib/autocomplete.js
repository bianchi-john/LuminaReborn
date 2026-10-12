import { debounce, el } from './api.js';

let counter = 0;

/**
 * Accessible autocomplete (ARIA combobox pattern) on an <input> or a
 * contenteditable element (rich-text editor).
 * - fetchItems(q): Promise<item[]>
 * - label(item): text to display
 * - detail(item): optional secondary text
 * - onSelect(item, label)
 */
export function attachAutocomplete(input, { fetchItems, label, detail, onSelect, minChars = 1 }) {
  const id = `ac-${++counter}`;
  const wrapper = input.parentElement;
  wrapper.classList.add('ac');
  const menu = el('div', { class: 'ac-menu d-none', id, role: 'listbox' });
  wrapper.append(menu);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', id);
  input.setAttribute('autocomplete', 'off');

  const read = () => ('value' in input ? input.value : input.textContent) ?? '';
  let items = [];
  let active = -1;
  let requestId = 0;

  const close = () => {
    menu.classList.add('d-none');
    menu.replaceChildren();
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };

  const highlight = (index) => {
    const buttons = [...menu.querySelectorAll('button')];
    buttons.forEach((b, i) => b.classList.toggle('active', i === index));
    active = index;
    if (buttons[index]) {
      input.setAttribute('aria-activedescendant', buttons[index].id);
      buttons[index].scrollIntoView({ block: 'nearest' });
    }
  };

  const choose = (index) => {
    const item = items[index];
    if (!item) return;
    close();
    onSelect(item, label(item));
  };

  const render = () => {
    menu.replaceChildren(
      ...items.map((item, i) =>
        el(
          'button',
          { type: 'button', role: 'option', id: `${id}-${i}`, tabindex: '-1', onmousedown: (e) => e.preventDefault(), onclick: () => choose(i) },
          el('div', { text: label(item) }),
          detail && detail(item) ? el('div', { class: 'ac-uso', text: detail(item) }) : null,
        ),
      ),
    );
    menu.classList.toggle('d-none', items.length === 0);
    input.setAttribute('aria-expanded', String(items.length > 0));
    active = -1;
  };

  const search = debounce(async () => {
    const q = read().trim();
    if (q.length < minChars) return close();
    const current = ++requestId;
    try {
      const result = await fetchItems(q);
      if (current !== requestId || document.activeElement !== input) return;
      items = result;
      render();
    } catch {
      close();
    }
  }, 200);

  input.addEventListener('input', search);
  input.addEventListener('focus', () => {
    if (read().trim().length >= minChars) search();
  });
  input.addEventListener('blur', () => setTimeout(close, 150));
  input.addEventListener('keydown', (event) => {
    if (menu.classList.contains('d-none')) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlight(Math.min(active + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(Math.max(active - 1, 0));
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape') {
      close();
    }
  });

  return { close };
}
