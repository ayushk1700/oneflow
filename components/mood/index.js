import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { openPanel, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
const moods = [['😴','Running low'],['🌧️','A little flat'],['🌤️','Steady'],['🌿','Feeling good'],['☀️','Full of energy']];
export function render() { open(); }
export function open() {
  const recent = get().moods.slice(-5).reverse();
  const content = el('div', { class: 'stack' }, el('p', { class: 'journal-prompt' }, 'How are you arriving today?'), el('p', { class: 'muted' }, 'No right answer. Just a moment to notice.'), el('div', { class: 'mood-choices' }, ...moods.map(([emoji,label], i) => el('button', { 'aria-label': label, onclick: act(async () => { await update(d => { d.moods.push({ id: uid(), at: Date.now(), value: i + 1 }); }); emit('toast', 'A moment noticed. Your check-in is saved.'); open(); }) }, el('span', { 'aria-hidden': 'true' }, emoji), el('small', {}, label)))), el('h3', {}, 'Recent check-ins'), ...recent.map(m => el('p', { class: 'muted' }, `${moods[m.value - 1][0]} ${new Date(m.at).toLocaleString()}`)));
  openPanel('A moment for you', 'mood', content);
}
export function init() {}
export function destroy() {}
