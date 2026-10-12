import { el } from '../../core/utils.js';
import { act, field, openPanel, resumePanel } from '../../core/ui.js';
import { lookupWord, normalizeWord } from './api.js';
const origin = 'https://api.dictionaryapi.dev/*', cache = new Map();
let root, cancel;
function entryCard(entry) {
  return el('article', { class: 'entry-card stack dictionary-entry' }, el('h3', {}, entry.word), entry.phonetic ? el('p', { class: 'muted' }, entry.phonetic) : null,
    ...entry.meanings.map(meaning => el('section', { class: 'stack' }, el('h4', {}, meaning.part || 'Meaning'), el('ol', { class: 'stack' }, ...meaning.definitions.map(item => el('li', {}, el('p', {}, item.definition), item.example ? el('p', { class: 'muted' }, `Example: ${item.example}`) : null, item.synonyms.length ? el('small', {}, `Related words: ${item.synonyms.join(', ')}`) : null))))));
}
/** Open English definitions in the shared accessible tool panel. */
export function open() {
  if (resumePanel('dictionary')) return;
  let version = 0, request, disposed = false;
  const word = el('input', { type: 'search', required: true, maxlength: 64, autocomplete: 'off', spellcheck: 'true', placeholder: 'Try “focus”' });
  const status = el('p', { role: 'status', class: 'muted' }), results = el('div', { class: 'stack dictionary-results', 'aria-label': 'Word definitions' });
  const submit = el('button', { type: 'submit', class: 'primary' }, 'Look up word');
  const stop = () => { version++; request?.abort(); if (submit.disabled) status.textContent = 'Lookup paused. Submit again to continue.'; submit.disabled = false; results.setAttribute('aria-busy', 'false'); };
  cancel = () => { disposed = true; stop(); };
  const form = el('form', { class: 'stack lookup-form', onsubmit: act(async event => {
    event.preventDefault(); stop(); const current = version;
    let term;
    try { term = normalizeWord(word.value); } catch (error) { status.textContent = error.message; results.replaceChildren(); return; }
    word.value = term; results.replaceChildren();
    if (cache.has(term)) { results.append(...cache.get(term).map(entryCard)); status.textContent = 'From this dashboard session — available offline.'; return; }
    status.textContent = 'Connecting to the dictionary…';
    try {
      if (globalThis.chrome?.permissions && !await chrome.permissions.request({ origins: [origin] })) { if (current === version && !disposed) status.textContent = 'Dictionary access was declined. Lookups only connect when you choose to allow access.'; return; }
      if (current !== version || disposed) return;
      request = new AbortController(); const controller = request, timeout = setTimeout(() => controller.abort(), 12000);
      submit.disabled = true; results.setAttribute('aria-busy', 'true'); status.textContent = `Looking up ${term}…`;
      let entries;
      try { entries = await lookupWord(term, controller.signal); } finally { clearTimeout(timeout); }
      if (current !== version || disposed) return;
      if (cache.size >= 30) cache.delete(cache.keys().next().value);
      cache.set(term, entries); results.append(...entries.map(entryCard)); status.textContent = `Definitions for ${term}.`;
    } catch (error) {
      if (current === version && !disposed) status.textContent = error.name === 'AbortError' ? 'The lookup took too long. Please try again.' : error.message;
    } finally { if (current === version && !disposed) { submit.disabled = false; results.setAttribute('aria-busy', 'false'); } }
  }) }, field('English word', word), submit);
  const forget = el('button', { type: 'button', onclick: act(async () => { stop(); cache.clear(); results.replaceChildren(); if (globalThis.chrome?.permissions) await chrome.permissions.remove({ origins: [origin] }); if (!disposed) status.textContent = 'Session words cleared and dictionary access disconnected.'; }) }, 'Clear words & disconnect');
  root = el('div', { class: 'stack lookup-workspace' }, el('p', { class: 'eyebrow' }, 'A LITTLE CLARITY'), el('p', { class: 'muted' }, 'Find a meaning, pronunciation or example for one English word.'), form, status, results, el('details',{},el('summary',{},'Dictionary connection & privacy'),el('p',{class:'muted'},'A lookup sends your word to Free Dictionary API after optional access. Session results remain available offline; no account or API key is needed.'), el('a', { href: 'https://dictionaryapi.dev/', target: '_blank', rel: 'noopener noreferrer' }, 'Powered by Free Dictionary API'), forget));
  openPanel('Dictionary', 'dictionary', root, destroy, 'dictionary', stop);
  word.focus();
}
export const render = open;
export function init() {}
export function destroy() { cancel?.(); cancel = null; root = null; }
