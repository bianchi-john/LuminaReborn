import { api, confirmDialog, toast } from './lib/api.js';
import { t } from './lib/i18n.js';

// Logout: il cookie di sessione è httpOnly, quindi va chiuso lato server
document.addEventListener('click', async (event) => {
  const logout = event.target.closest('[data-logout]');
  if (!logout) return;
  try {
    await api('POST', '/api/auth/logout');
  } finally {
    window.location.href = '/';
  }
});

// Form che si inviano al cambio di una select (es. ordinamento dei risultati)
document.querySelectorAll('form[data-autosubmit]').forEach((form) => {
  form.addEventListener('change', () => form.submit());
});

document.querySelectorAll('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));

// Azioni sulle schede (area riservata): invio, ritiro, approvazione, rifiuto, eliminazione
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
    confirmText: 'Respingi',
    variant: 'danger',
    input: { label: 'Motivazione (visibile allo schedatore)', required: true },
    ok: 'Scheda respinta',
  },
  depubblica: {
    title: 'Ritirare dalla pubblicazione?',
    body: 'La scheda non sarà più visibile nel catalogo e tornerà in bozza.',
    confirmText: 'Ritira',
    variant: 'danger',
    input: { label: 'Motivazione (facoltativa)', required: false },
    ok: 'Scheda ritirata dalla pubblicazione',
  },
  elimina: {
    title: 'Eliminare la scheda?',
    body: "L'operazione è definitiva: verranno eliminati anche immagini e storico.",
    confirmText: 'Elimina definitivamente',
    variant: 'danger',
    ok: 'Scheda eliminata',
  },
};

/** Testi della finestra di conferma nella lingua dell'interfaccia. */
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
