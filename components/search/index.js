import { t as translate } from '../../core/i18n.js';
import { el } from '../../core/utils.js';
import { icon, act } from '../../core/ui.js';
import { searchWeb } from '../../core/search.js';
let root;
export function render() {
  const input = el('input', { id: 'web-search', type: 'search', maxlength: 1000, required: true, placeholder: 'Search with your browser', 'aria-label': 'Search with your default search engine', autocomplete: 'off' });
  root.replaceChildren(el('form', { class: 'search-form glass', role: 'search', onsubmit: act(async event => { event.preventDefault(); await searchWeb(input.value); }) }, icon('search', 18), input, el('button', { type: 'submit', class: 'icon-button', 'aria-label': translate('m0231') }, icon('arrow-up-right', 17))));
}
export function init(node) { root = node; render(); }
export function destroy() { root?.replaceChildren(); root = null; }
