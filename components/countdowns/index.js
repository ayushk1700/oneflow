import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, uid, dayKey } from '../../core/utils.js';
import { resumePanel, openPanel, field, act, watch, confirmAction } from '../../core/ui.js';
import { daysUntil } from '../../core/stats-logic.js';
let root, list, host, off, interval, search;
const matches=c=>c.label.toLowerCase().includes(search?.value.trim().toLowerCase()||'');
const label = date => { const days = daysUntil(date); return days === 0 ? translate('m0165') : days < 0 ? translate('m0684', {p0: -days}) : `${days} ${days === 1 ? 'day' : 'days'} to go`; };
export function render() {
  const rows = get().countdowns;
  if (root) { const pinned = rows.find(x => x.pinned); root.replaceChildren(...(pinned ? [el('button', { class: 'countdown-pin', onclick: open }, `${pinned.label} · ${label(pinned.date)}`)] : [])); }
  if (list) list.replaceChildren(...(rows.filter(matches).length ? rows.filter(matches).slice().sort((a,b)=>a.date.localeCompare(b.date)).map(c => el('article', { class: 'entry-card' }, el('div', { class: 'row' }, el('strong', { class: 'grow' }, c.label), el('span', {}, label(c.date))), el('p', { class: 'muted' }, c.date), el('div', { class: 'row wrap' }, el('button', { 'aria-pressed': c.pinned, onclick: act(() => update(d => { d.countdowns.forEach(x => { x.pinned = x.id === c.id ? !c.pinned : false; }); })) }, c.pinned ? translate('m0166') : translate('m0167')), el('details',{},el('summary',{},'Manage milestone'),el('button', { onclick: () => edit(c) }, translate('m0168')), el('button', { onclick: () => confirmAction(host, translate('m0169'), () => update(d => { d.countdowns = d.countdowns.filter(x => x.id !== c.id); })) }, translate('m0170')))))) : [el('p', { class: 'empty-state' }, rows.length?'No matching milestones. Try another search.':translate('m0171'))]));
}
function edit(item) {
  const name = el('input', { required: true, maxlength: 120, value: item?.label || '', 'aria-label': translate('m0172') }), date = el('input', { required: true, type: 'date', value: item?.date || dayKey(), 'aria-label': translate('m0173') });
  const form = el('form', { class: 'stack entry-card', onsubmit: act(async event => { event.preventDefault(); if (!name.value.trim()) return; await update(d => { const existing = d.countdowns.find(x => x.id === item?.id); if (existing) Object.assign(existing, { label: name.value.trim(), date: date.value }); else d.countdowns.push({ id: uid(), label: name.value.trim(), date: date.value, pinned: false }); }); form.remove(); }) }, field(translate('m0172'), name), field(translate('m0173'), date), el('div', { class: 'row' }, el('button', { type: 'submit', class: 'primary' }, translate('m0174')), el('button', { type: 'button', onclick: () => form.remove() }, translate('m0128')))); host.prepend(form); name.focus();
}
export function open() {
  if (resumePanel('countdowns')) return; list = el('div', { class: 'stack' });search=el('input',{type:'search','aria-label':'Search milestones',placeholder:'Find a milestone…',oninput:render});host = el('div', { class: 'stack' }, el('button', { class: 'primary', onclick: () => edit() }, translate('m0175')), search,list); openPanel(translate('m0026'), 'countdowns', host, () => { list = host = null; }); render(); }
export function init(node) { root = node; off = watch(d => d.countdowns, render); interval = setInterval(render, 60000); render(); }
export function destroy() { off?.(); clearInterval(interval); root?.replaceChildren(); root = list = host = null; }
