import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, dayKey } from '../../core/utils.js';
import { button, watch, openPanel, act } from '../../core/ui.js';
let root, unsubscribe, quotes = [], index = 0, generation = 0;
export function render() {
  if (!quotes.length) return;
  const quote = quotes[index], favorite = get().favorites.includes(quote.id);
  const expanded = root.querySelector('.quote-details')?.open || false;
  root.replaceChildren(el('div', { class: 'quote-line' }, el('blockquote', {}, `“${quote.text}”`)),
    el('details', { class: 'quote-details', ...(expanded ? { open: '' } : {}) }, el('summary', {}, 'About this quote'),
      el('div', { class: 'quote-detail-content' }, el('p', { class: 'quote-author' }, quote.author),
        el('div', { class: 'quote-actions' }, button(favorite ? translate('m0315') : translate('m0316'), favorite ? 'heart-filled' : 'heart', act(() => toggle(quote.id))), button(translate('m0317'), 'refresh-cw', () => { index = (index + 1) % quotes.length; render(); }), button(translate('m0318'), 'bookmark', favorites)))));
}
async function toggle(id) { await update(d => { d.favorites = d.favorites.includes(id) ? d.favorites.filter(x => x !== id) : [...d.favorites, id]; }); }
function favorites() {
  const content = el('div', { class: 'stack' });
  const draw = () => { const saved = quotes.filter(q => get().favorites.includes(q.id)); content.replaceChildren(...(saved.length ? saved.map(q => el('div', { class: 'row' }, el('p', { class: 'grow' }, q.text), button(translate('m0319'), 'heart-filled', act(async () => { await toggle(q.id); draw(); })))) : [el('p', { class: 'empty-state' }, translate('m0320'))])); };
  draw(); openPanel(translate('m0321'), 'quotes', content);
}
export async function init(node) { root = node; const version = ++generation; const response = await fetch('../data/quotes.json'); if (!response.ok) throw new Error(translate('m0322')); const data = await response.json(); if (version !== generation) return; quotes = data; index = [...dayKey()].reduce((sum, c) => sum + c.charCodeAt(0), 0) % quotes.length; render(); unsubscribe = watch(d => d.favorites, render); }
export function destroy() { generation++; unsubscribe?.(); root?.replaceChildren(); }
