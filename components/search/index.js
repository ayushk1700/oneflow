import { t as translate } from '../../core/i18n.js';
import { el } from '../../core/utils.js';
import { icon, act,watch } from '../../core/ui.js';
import { get } from '../../core/storage.js';
import { searchWeb } from '../../core/search.js';
let root,off,lastSpace;
export function render() {
  const data=get(),preferences=data.settings.customization?.widgets?.preferences?.search,space=data.settings.customization?.behavior?.spaceId||'default',draft=space===lastSpace?root.querySelector('input')?.value||'':'';lastSpace=space;
  const label=preferences?.engine&&preferences.engine!=='browser'?'Search '+(preferences.engine==='custom'?'your custom engine':preferences.engine):'Search with your browser';
  const input = el('input', { id: 'web-search', type: 'search', maxlength: 1000, required: true, placeholder: label, 'aria-label': label, autocomplete: 'off' });input.value=draft;
  root.replaceChildren(el('form', { class: 'search-form glass', role: 'search', onsubmit: act(async event => { event.preventDefault(); await searchWeb(input.value); }) }, icon('search', 18), input, el('button', { type: 'submit', class: 'icon-button', 'aria-label': translate('m0231') }, icon('arrow-up-right', 17))));
}
export function init(node) { root = node; render();off=watch(d=>[d.settings.customization?.widgets?.preferences?.search,d.settings.customization?.behavior?.spaceId],render); }
export function destroy() { off?.();root?.replaceChildren(); root = null;lastSpace=null; }
