import { el } from '../../core/utils.js';
import { field, openPanel, resumePanel, act } from '../../core/ui.js';
import { searchWeb } from '../../core/search.js';
let root;
/** Open an explicit web search without background requests or tracking history. */
export function open() {
  if (resumePanel('websearch')) return;
  const query = el('input', { type: 'search', name: 'q', required: true, maxlength: 1000, autocomplete: 'off', placeholder: 'What would you like to find?' });
  const form = el('form', { class: 'stack lookup-form', role: 'search', onsubmit: act(async event => { event.preventDefault(); await searchWeb(query.value, 'NEW_TAB'); }) }, field('Search the web', query), el('button', { type: 'submit', class: 'primary' }, 'Search in a new tab'));
  root = el('div', { class: 'stack lookup-workspace' }, el('h3', {}, 'What are you looking for?'), el('p', { class: 'muted' }, 'Uses your browser’s default search engine. Results open in a new tab. ONEFLOW does not save your searches.'), form);
  openPanel('Web search', 'websearch', root, destroy);
  query.focus();
}
export const render = open;
export function init() {}
export function destroy() { root = null; }
