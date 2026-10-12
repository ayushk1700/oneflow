import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { openPanel, act, isPanel, panelRequest } from '../../core/ui.js';
import { emit } from '../../core/events.js';
const moods = [['😴',translate('m0265')],['🌧️',translate('m0654')],['🌤️',translate('m0266')],['🌿',translate('m0267')],['☀️',translate('m0268')]];
export function render() { open(); }
export function open() {
  const recent = get().moods.slice(-5).reverse();
  const content = el('div', { class: 'stack' }, el('p', { class: 'journal-prompt' }, translate('m0269')), el('p', { class: 'muted' }, translate('m0270')), el('div', { class: 'mood-choices' }, ...moods.map(([emoji,label], i) => el('button', { 'aria-label': label, onclick: act(async () => { const current=panelRequest();await update(d => { d.moods.push({ id: uid(), at: Date.now(), value: i + 1 }); }); emit('toast', translate('m0271')); if(current()&&isPanel('mood'))open(); }) }, el('span', { 'aria-hidden': 'true' }, emoji), el('small', {}, label)))), el('h3', {}, translate('m0272')), ...recent.map(m => el('p', { class: 'muted' }, `${moods[m.value - 1][0]} ${moods[m.value - 1][1]} · ${new Date(m.at).toLocaleString()}`)));
  if(!recent.length)content.append(el('p',{class:'empty-state'},'Your recent check-ins will appear here. Choose how you feel above.'));
  openPanel(translate('m0633'), 'mood', content);
}
export function init() {}
export function destroy() {}
