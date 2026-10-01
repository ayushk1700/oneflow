import { get } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { icon, watch } from '../../core/ui.js';
const engines = { google: ['Google', 'https://www.google.com/search'], bing: ['Bing', 'https://www.bing.com/search'], duckduckgo: ['DuckDuckGo', 'https://duckduckgo.com/'] };
let root, unsubscribe;
export function render() {
  const [label, url] = engines[get().settings.engine];
  root.replaceChildren(el('form', { class: 'search-form glass', action: url, method: 'get', role: 'search' }, icon('search', 18), el('input', { id: 'web-search', name: 'q', type: 'search', required: true, placeholder: `Search with ${label}`, 'aria-label': `Search the web with ${label}`, autocomplete: 'off' }), el('button', { type: 'submit', class: 'icon-button', 'aria-label': 'Search' }, icon('arrow-up-right', 17))));
}
export function init(node) { root = node; render(); unsubscribe = watch(d => d.settings.engine, render); }
export function destroy() { unsubscribe?.(); root?.replaceChildren(); }
