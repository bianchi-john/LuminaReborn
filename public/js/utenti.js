import { api, confirmDialog, el, toast } from './lib/api.js';

const tbody = document.getElementById('utenti');
const me = await api('GET', '/api/me');

const fmt = (d) => (d ? new Date(d).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : '—');

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
        el('td', {}, el('span', { class: `badge ${u.isAdmin ? 'text-bg-dark' : 'text-bg-light border'}`, text: u.isAdmin ? 'Amministratore' : 'Schedatore' })),
        el('td', {}, u.locked ? el('span', { class: 'badge text-bg-danger', text: 'Bloccato' }) : el('span', { class: 'badge text-bg-success', text: 'Attivo' })),
        el('td', { class: 'd-none d-md-table-cell small', text: fmt(u.last_login) }),
        el(
          'td',
          { class: 'text-end' },
          el(
            'div',
            { class: 'd-inline-flex flex-wrap justify-content-end gap-1' },
            action('Password', 'btn-outline-secondary', cambiaPassword),
            self ? null : action(u.isAdmin ? 'Rendi schedatore' : 'Rendi amministratore', 'btn-outline-secondary', toggleAdmin),
            self ? null : action(u.locked ? 'Sblocca' : 'Blocca', 'btn-outline-warning', toggleLock),
            self ? null : action('Disconnetti', 'btn-outline-secondary', disconnetti),
            self ? null : action('Elimina', 'btn-outline-danger', elimina),
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
  const pwd = await confirmDialog({ title: `Nuova password per ${u.username}`, input: { label: '8-30 caratteri, solo lettere e numeri', required: true }, confirmText: 'Imposta' });
  if (pwd) run(api('PUT', `/api/utenti/${u._id}/password`, { password: pwd }), 'Password aggiornata');
}

async function toggleAdmin(u) {
  const ok = await confirmDialog({ title: u.isAdmin ? 'Togliere i privilegi di amministratore?' : 'Rendere amministratore?', body: u.username });
  if (ok) run(api('PATCH', `/api/utenti/${u._id}`, { isAdmin: !u.isAdmin }), 'Ruolo aggiornato');
}

async function toggleLock(u) {
  const ok = await confirmDialog({ title: u.locked ? 'Sbloccare l\'utente?' : 'Bloccare l\'utente?', body: u.locked ? u.username : `${u.username} non potrà più accedere.`, variant: u.locked ? 'primary' : 'warning' });
  if (ok) run(api('PATCH', `/api/utenti/${u._id}`, { locked: !u.locked }), u.locked ? 'Utente sbloccato' : 'Utente bloccato');
}

async function disconnetti(u) {
  const ok = await confirmDialog({ title: 'Chiudere tutte le sessioni?', body: `${u.username} dovrà effettuare di nuovo l'accesso su tutti i dispositivi.` });
  if (ok) run(api('POST', `/api/utenti/${u._id}/disconnetti`), 'Sessioni chiuse');
}

async function elimina(u) {
  const ok = await confirmDialog({ title: 'Eliminare l\'utente?', body: `${u.username}: le sue schede resteranno nel catalogo.`, confirmText: 'Elimina', variant: 'danger' });
  if (ok) run(api('DELETE', `/api/utenti/${u._id}`), 'Utente eliminato');
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
    toast('Utente creato');
    await load();
  } catch (error) {
    errore.textContent = error.details?.map((d) => d.messaggio).join('; ') || error.message;
    errore.classList.remove('d-none');
  }
});

load();
