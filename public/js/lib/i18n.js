// Traduzioni per gli script del browser: il server incorpora nella pagina il
// dizionario della lingua corrente (vuoto in italiano, che è la lingua delle chiavi).
const dict = JSON.parse(document.getElementById('i18n')?.textContent || '{}');

export const lang = document.documentElement.lang || 'it';
export const locale = lang === 'en' ? 'en-GB' : 'it-IT';

export function t(text, vars) {
  const s = dict[text] ?? text;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s;
}
