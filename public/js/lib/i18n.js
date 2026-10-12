// Translations for browser scripts: the server embeds the current language's
// dictionary in the page (empty for Italian, which is the language of the keys).
const dict = JSON.parse(document.getElementById('i18n')?.textContent || '{}');

export const lang = document.documentElement.lang || 'it';
export const locale = lang === 'en' ? 'en-GB' : 'it-IT';

export function t(text, vars) {
  const s = dict[text] ?? text;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s;
}
