import { api, confirmDialog, toast } from './lib/api.js';
import { t } from './lib/i18n.js';

// Logout: the session cookie is httpOnly, so it must be closed server-side
document.addEventListener('click', async (event) => {
  const logout = event.target.closest('[data-logout]');
  if (!logout) return;
  try {
    await api('POST', '/api/auth/logout');
  } finally {
    window.location.href = '/';
  }
});

// Language chosen with the selector: it travels in the URL (?lang=) rather than in
// a cookie, so it must be added to the page's internal links and forms.
const langScelta = new URLSearchParams(window.location.search).get('lang');
if (langScelta === 'it' || langScelta === 'en') {
  document.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    const interno = url.origin === window.location.origin && !/^\/(api|media|static|vendor)\//.test(url.pathname);
    if (!interno || url.searchParams.has('lang') || a.getAttribute('href').startsWith('#')) return;
    url.searchParams.set('lang', langScelta);
    a.setAttribute('href', url.pathname + url.search + url.hash);
  });
  document.querySelectorAll('form[method="get" i]').forEach((form) => {
    if (form.querySelector('[name="lang"]')) return;
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'lang';
    hidden.value = langScelta;
    form.append(hidden);
  });
}

// Forms submitted automatically when a drop-down changes (e.g. result sorting)
document.querySelectorAll('form[data-autosubmit]').forEach((form) => {
  form.addEventListener('change', () => form.submit());
});

document.querySelectorAll('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));

// Record actions (staff area): submit, withdraw, approve, reject, delete
const AZIONI = {
  invia: {
    title: 'Inviare in revisione?',
    body: "La scheda sarà valutata da un amministratore e non potrai modificarla finché non verrà approvata, respinta o ritirata.",
    confirmText: 'Invia',
    input: { label: "Messaggio per l'amministratore (facoltativo)", required: false },
    ok: 'Scheda inviata in revisione',
  },
  ritira: { title: 'Ritirare dalla revisione?', body: 'La scheda tornerà tra le tue bozze.', confirmText: 'Ritira', ok: 'Scheda ritirata' },
  approva: {
    title: 'Approvare e pubblicare?',
    body: 'La scheda sarà visibile a tutti nel catalogo pubblico.',
    confirmText: 'Approva e pubblica',
    variant: 'success',
    input: { label: 'Nota per lo schedatore (facoltativa)', required: false },
    ok: 'Scheda pubblicata',
  },
  respingi: {
    title: 'Respingere la scheda?',
    body: 'La scheda torna allo schedatore con il tuo messaggio: potrà correggerla e inviarla di nuovo, oppure eliminarla.',
    confirmText: 'Respingi',
    variant: 'danger',
    input: { label: 'Motivazione (visibile allo schedatore)', required: true },
    ok: 'Scheda respinta',
  },
  depubblica: {
    title: 'Rimandare la scheda allo schedatore?',
    body: 'La scheda esce dal catalogo pubblico e torna tra le bozze dello schedatore, che potrà correggerla e inviarla di nuovo, oppure eliminarla.',
    confirmText: 'Rimanda allo schedatore',
    variant: 'danger',
    input: { label: 'Messaggio per lo schedatore (obbligatorio)', required: true },
    ok: 'Scheda rimandata allo schedatore',
  },
  elimina: {
    title: 'Eliminare la scheda?',
    body: "L'operazione è definitiva: verranno eliminati anche immagini e storico.",
    confirmText: 'Elimina definitivamente',
    variant: 'danger',
    ok: 'Scheda eliminata',
  },
};

/** Confirmation dialog texts in the interface language. */
const tradotta = (cfg) => ({
  ...cfg,
  title: t(cfg.title),
  body: cfg.body ? t(cfg.body) : undefined,
  confirmText: t(cfg.confirmText),
  input: cfg.input ? { ...cfg.input, label: t(cfg.input.label) } : undefined,
});

document.addEventListener('click', async (event) => {
  const btn = event.target.closest('[data-azione]');
  if (!btn) return;
  const azione = btn.dataset.azione;
  const cfg = AZIONI[azione];
  if (!cfg) return;
  const answer = await confirmDialog(tradotta(cfg));
  if (answer === false) return;
  btn.disabled = true;
  try {
    const id = btn.dataset.id;
    if (azione === 'elimina') await api('DELETE', `/api/schede/${id}`);
    else await api('POST', `/api/schede/${id}/${azione}`, { commento: typeof answer === 'string' && answer ? answer : null });
    toast(t(cfg.ok));
    setTimeout(() => {
      if (btn.dataset.dopo) window.location.href = btn.dataset.dopo;
      else window.location.reload();
    }, 600);
  } catch (error) {
    btn.disabled = false;
    toast(error.message, 'danger');
  }
});

// Changing one's own password (staff area)
const formPassword = document.getElementById('form-password');
if (formPassword) {
  const errore = document.getElementById('password-errore');
  formPassword.addEventListener('submit', async (event) => {
    event.preventDefault();
    errore.classList.add('d-none');
    const { attuale, nuova, conferma } = formPassword.elements;
    if (nuova.value !== conferma.value) {
      errore.textContent = t('Le due password non coincidono');
      errore.classList.remove('d-none');
      return;
    }
    try {
      await api('POST', '/api/auth/password', { attuale: attuale.value, nuova: nuova.value });
      formPassword.reset();
      window.bootstrap.Modal.getInstance(document.getElementById('modale-password'))?.hide();
      toast(t('Password aggiornata'));
    } catch (error) {
      errore.textContent = error.details?.map((d) => d.messaggio).join('; ') || error.message;
      errore.classList.remove('d-none');
    }
  });
}
