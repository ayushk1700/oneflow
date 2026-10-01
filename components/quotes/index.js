import { get, update } from '../../core/storage.js';
import { el, dayKey } from '../../core/utils.js';
import { button, watch, openPanel, act } from '../../core/ui.js';
let root, unsubscribe, quotes = [], index = 0, generation = 0;
export function render() {
  if (!quotes.length) return;
  const quote = quotes[index], favorite = get().favorites.includes(quote.id);
  root.replaceChildren(el('div', { class: 'quote-line' }, el('blockquote', {}, `“${quote.text}”`), el('div', { class: 'quote-actions' }, button(favorite ? 'Unfavorite quote' : 'Favorite quote', favorite ? 'heart-filled' : 'heart', act(() => toggle(quote.id))), button('Another thought', 'refresh-cw', () => { index = (index + 1) % quotes.length; render(); }), button('Favorite quotes', 'bookmark', favorites))), el('p', { class: 'quote-author' }, quote.author));
}
async function toggle(id) { await update(d => { d.favorites = d.favorites.includes(id) ? d.favorites.filter(x => x !== id) : [...d.favorites, id]; }); }
function favorites() {
  const content = el('div', { class: 'stack' });
  const draw = () => { const saved = quotes.filter(q => get().favorites.includes(q.id)); content.replaceChildren(...(saved.length ? saved.map(q => el('div', { class: 'row' }, el('p', { class: 'grow' }, q.text), button('Remove favorite', 'heart-filled', act(async () => { await toggle(q.id); draw(); })))) : [el('p', { class: 'empty-state' }, 'Save a thought that speaks to you using the heart.')])); };
  draw(); openPanel('Words to come back to', 'quotes', content);
}
export async function init(node) { root = node; const version = ++generation; const response = await fetch('../data/quotes.json'); if (!response.ok) throw new Error('Local quotes could not be loaded.'); const data = await response.json(); if (version !== generation) return; quotes = data; index = [...dayKey()].reduce((sum, c) => sum + c.charCodeAt(0), 0) % quotes.length; render(); unsubscribe = watch(d => d.favorites, render); }
export function destroy() { generation++; unsubscribe?.(); root?.replaceChildren(); }
