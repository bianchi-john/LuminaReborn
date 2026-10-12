// Shared utilities: API calls, notifications, confirmation dialogs.
// No HTML built from untrusted data: textContent is used.
import { lang, t } from './i18n.js';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api(method, url, body) {
  // The page language also applies to API messages (no cookie)
  const init = { method, headers: { Accept: 'application/json', 'Accept-Language': lang }, credentials: 'same-origin' };
  if (body instanceof Blob) {
    init.body = body;
    init.headers['Content-Type'] = body.type || 'application/octet-stream';
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers['Content-Type'] = 'application/json';
  }
  let res;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError(0, t('Connessione non riuscita: verifica la rete e riprova'));
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError(401, t('Sessione scaduta: effettua di nuovo l\'accesso in un\'altra scheda del browser, poi salva di nuovo'));
    }
    throw new ApiError(res.status, data?.error || t('Errore {n}', { n: res.status }), data?.details);
  }
  return data;
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Plain text from an HTML fragment (for authority entry labels with italics). */
export function htmlToText(html) {
  const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export function toast(message, variant = 'success') {
  const container = document.getElementById('toasts');
  if (!container) return;
  const node = el(
    'div',
    { class: `toast align-items-center text-bg-${variant} border-0`, role: variant === 'danger' ? 'alert' : 'status' },
    el('div', { class: 'd-flex' }, el('div', { class: 'toast-body', text: message }), el('button', { type: 'button', class: 'btn-close btn-close-white me-2 m-auto', 'data-bs-dismiss': 'toast', 'aria-label': t('Chiudi') })),
  );
  container.append(node);
  const t = new window.bootstrap.Toast(node, { delay: variant === 'danger' ? 8000 : 4000 });
  node.addEventListener('hidden.bs.toast', () => node.remove());
  t.show();
}

/**
 * Confirmation dialog. With `input` it also asks for text (e.g. the reason for rejection).
 * Returns false if cancelled, otherwise true or the text entered.
 */
export function confirmDialog({ title, body, confirmText = t('Conferma'), variant = 'primary', input }) {
  return new Promise((resolve) => {
    const textarea = input
      ? el('textarea', { class: 'form-control', rows: 4, id: 'dlg-input', maxlength: 5000, required: input.required })
      : null;
    const confirmBtn = el('button', { type: 'button', class: `btn btn-${variant}`, text: confirmText });
    const modal = el(
      'div',
      { class: 'modal fade', tabindex: '-1', 'aria-hidden': 'true' },
      el(
        'div',
        { class: 'modal-dialog modal-dialog-centered' },
        el(
          'div',
          { class: 'modal-content' },
          el('div', { class: 'modal-header' }, el('h2', { class: 'modal-title h5', text: title }), el('button', { type: 'button', class: 'btn-close', 'data-bs-dismiss': 'modal', 'aria-label': t('Chiudi') })),
          el(
            'div',
            { class: 'modal-body' },
            body ? el('p', { text: body }) : null,
            input ? el('label', { class: 'form-label', for: 'dlg-input', text: input.label }) : null,
            textarea,
            input ? el('div', { class: 'invalid-feedback', text: t('Campo obbligatorio') }) : null,
          ),
          el('div', { class: 'modal-footer' }, el('button', { type: 'button', class: 'btn btn-outline-secondary', 'data-bs-dismiss': 'modal', text: t('Annulla') }), confirmBtn),
        ),
      ),
    );
    document.body.append(modal);
    const m = new window.bootstrap.Modal(modal);
    let result = false;
    confirmBtn.addEventListener('click', () => {
      if (textarea) {
        const value = textarea.value.trim();
        if (input.required && !value) {
          textarea.classList.add('is-invalid');
          textarea.focus();
          return;
        }
        result = value;
      } else {
        result = true;
      }
      m.hide();
    });
    modal.addEventListener('shown.bs.modal', () => (textarea || confirmBtn).focus());
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
      resolve(result);
    });
    m.show();
  });
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
