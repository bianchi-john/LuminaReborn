import { api, confirmDialog, el, toast } from './lib/api.js';
import { locale, t } from './lib/i18n.js';

const tbody = document.getElementById('utenti');
const me = await api('GET', '/api/me');

const fmt = (d) => (d ? new Date(d).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—');

async function load() {
  let users;
  try {
    users = await api('GET', '/api/utenti');
  } catch (error) {
    tbody.replaceChildren(el('tr', {}, el('td', { colspan: 5, class: 'text-danger', text: error.message })));
    return;
  }
  tbody.replaceChildren(
    ...users.map((u) => {
      const self = u.username === me?.username;
      const action = (text, cls, handler) => el('button', { type: 'button', class: `btn btn-sm ${cls}`, text, onclick: () => handler(u) });
      return el(
        'tr',
        {},
        el('td', {}, el('div', { class: 'fw-semibold', text: u.display_name || u.username }), el('div', { class: 'small text-muted-lu', text: `${u.username}${u.email_address ? ` · ${u.email_address}` : ''}` })),
        el('td', {}, el('span', { class: `badge ${u.isAdmin ? 'text-bg-dark' : 'text-bg-light border'}`, text: u.isAdmin ? t('Amministratore') : t('Schedatore') })),
        el('td', {}, u.locked ? el('span', { class: 'badge text-bg-danger', text: t('Bloccato') }) : el('span', { class: 'badge text-bg-success', text: t('Attivo') })),
        el('td', { class: 'd-none d-md-table-cell small', text: fmt(u.last_login) }),
        el(
          'td',
          { class: 'text-end' },
          el(
            'div',
            { class: 'd-inline-flex flex-wrap justify-content-end gap-1' },
            action(t('Password'), 'btn-outline-secondary', cambiaPassword),
            self ? null : action(u.isAdmin ? t('Rendi schedatore') : t('Rendi amministratore'), 'btn-outline-secondary', toggleAdmin),
            self ? null : action(u.locked ? t('Sblocca') : t('Blocca'), 'btn-outline-warning', toggleLock),
            self ? null : action(t('Disconnetti'), 'btn-outline-secondary', disconnetti),
            self ? null : action(t('Elimina'), 'btn-outline-danger', elimina),
          ),
        ),
      );
    }),
  );
}

async function run(promise, message) {
  try {
    await promise;
    toast(message);
    await load();
  } catch (error) {
    toast(error.message, 'danger');
  }
}

async function cambiaPassword(u) {
  const pwd = await confirmDialog({ title: t('Nuova password per {utente}', { utente: u.username }), input: { label: t('8-30 caratteri, solo lettere e numeri'), required: true }, confirmText: t('Imposta') });
  if (pwd) run(api('PUT', `/api/utenti/${u._id}/password`, { password: pwd }), t('Password aggiornata'));
}

async function toggleAdmin(u) {
  const ok = await confirmDialog({ title: u.isAdmin ? t('Togliere i privilegi di amministratore?') : t('Rendere amministratore?'), body: u.username });
  if (ok) run(api('PATCH', `/api/utenti/${u._id}`, { isAdmin: !u.isAdmin }), t('Ruolo aggiornato'));
}

async function toggleLock(u) {
  const ok = await confirmDialog({ title: u.locked ? t('Sbloccare l\'utente?') : t('Bloccare l\'utente?'), body: u.locked ? u.username : t('{utente} non potrà più accedere.', { utente: u.username }), variant: u.locked ? 'primary' : 'warning' });
  if (ok) run(api('PATCH', `/api/utenti/${u._id}`, { locked: !u.locked }), u.locked ? t('Utente sbloccato') : t('Utente bloccato'));
}

async function disconnetti(u) {
  const ok = await confirmDialog({ title: t('Chiudere tutte le sessioni?'), body: t('{utente} dovrà effettuare di nuovo l\'accesso su tutti i dispositivi.', { utente: u.username }) });
  if (ok) run(api('POST', `/api/utenti/${u._id}/disconnetti`), t('Sessioni chiuse'));
}

async function elimina(u) {
  const ok = await confirmDialog({ title: t('Eliminare l\'utente?'), body: t('{utente}: le sue schede resteranno nel catalogo.', { utente: u.username }), confirmText: t('Elimina'), variant: 'danger' });
  if (ok) run(api('DELETE', `/api/utenti/${u._id}`), t('Utente eliminato'));
}

const form = document.getElementById('form-utente');
const errore = document.getElementById('utente-errore');
const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById('modale-utente'));
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errore.classList.add('d-none');
  try {
    await api('POST', '/api/utenti', {
      username: form.username.value.trim(),
      display_name: form.display_name.value.trim() || undefined,
      email_address: form.email_address.value.trim(),
      password: form.password.value,
      isAdmin: form.isAdmin.checked,
    });
    form.reset();
    modal.hide();
    toast(t('Utente creato'));
    await load();
  } catch (error) {
    errore.textContent = error.details?.map((d) => d.messaggio).join('; ') || error.message;
    errore.classList.remove('d-none');
  }
});

load();
