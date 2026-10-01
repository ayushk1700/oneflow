import { get, update } from '../../core/storage.js';
import { el, uid, dayKey } from '../../core/utils.js';
import { openPanel, field, act, watch, confirmAction } from '../../core/ui.js';
import { daysUntil } from '../../core/stats-logic.js';
let root, list, host, off, interval;
const label = date => { const days = daysUntil(date); return days === 0 ? 'Today' : days < 0 ? `${-days} days ago` : `${days} ${days === 1 ? 'day' : 'days'} to go`; };
export function render() {
  const rows = get().countdowns;
  if (root) { const pinned = rows.find(x => x.pinned); root.replaceChildren(...(pinned ? [el('button', { class: 'countdown-pin', onclick: open }, `${pinned.label} · ${label(pinned.date)}`)] : [])); }
  if (list) list.replaceChildren(...(rows.length ? rows.map(c => el('article', { class: 'entry-card' }, el('div', { class: 'row' }, el('strong', { class: 'grow' }, c.label), el('span', {}, label(c.date))), el('p', { class: 'muted' }, c.date), el('div', { class: 'row wrap' }, el('button', { 'aria-pressed': c.pinned, onclick: act(() => update(d => { d.countdowns.forEach(x => { x.pinned = x.id === c.id ? !c.pinned : false; }); })) }, c.pinned ? 'Unpin' : 'Pin to dashboard'), el('button', { onclick: () => edit(c) }, 'Edit'), el('button', { onclick: () => confirmAction(host, 'Delete this countdown?', () => update(d => { d.countdowns = d.countdowns.filter(x => x.id !== c.id); })) }, 'Delete')))) : [el('p', { class: 'empty-state' }, 'Something to look forward to.')]));
}
function edit(item) {
  const name = el('input', { required: true, maxlength: 120, value: item?.label || '', 'aria-label': 'Event name' }), date = el('input', { required: true, type: 'date', value: item?.date || dayKey(), 'aria-label': 'Event date' });
  const form = el('form', { class: 'stack entry-card', onsubmit: act(async event => { event.preventDefault(); if (!name.value.trim()) return; await update(d => { const existing = d.countdowns.find(x => x.id === item?.id); if (existing) Object.assign(existing, { label: name.value.trim(), date: date.value }); else d.countdowns.push({ id: uid(), label: name.value.trim(), date: date.value, pinned: false }); }); form.remove(); }) }, field('Event name', name), field('Event date', date), el('div', { class: 'row' }, el('button', { type: 'submit', class: 'primary' }, 'Save event'), el('button', { type: 'button', onclick: () => form.remove() }, 'Cancel'))); host.prepend(form); name.focus();
}
export function open() { list = el('div', { class: 'stack' }); host = el('div', { class: 'stack' }, el('button', { class: 'primary', onclick: () => edit() }, 'Add a countdown'), list); openPanel('Looking forward', 'countdowns', host, () => { list = host = null; }); render(); }
export function init(node) { root = node; off = watch(d => d.countdowns, render); interval = setInterval(render, 60000); render(); }
export function destroy() { off?.(); clearInterval(interval); root?.replaceChildren(); root = list = host = null; }
