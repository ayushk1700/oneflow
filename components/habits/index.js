import { get, update } from '../../core/storage.js';
import { el, uid, dayKey } from '../../core/utils.js';
import { openPanel, field, act, watch, confirmAction } from '../../core/ui.js';
import { streak, shiftDay } from '../../core/stats-logic.js';
import { backgroundSync } from '../../core/timer-client.js';
let root, list, off;
export function render() {
  if (!list) return;
  const today = dayKey(), days = Array.from({ length: 7 }, (_, i) => shiftDay(today, i - 6));
  list.replaceChildren(...get().habits.map(habit => el('article', { class: 'entry-card stack' }, el('div', { class: 'row' }, el('strong', { class: 'grow' }, habit.name), el('small', { class: 'muted' }, `${streak(habit.dates)} day streak`)),
    el('div', { class: 'habit-week', 'aria-label': `${habit.name} last seven days` }, ...days.map(date => el('button', { class: 'habit-day', 'aria-pressed': habit.dates.includes(date), 'aria-label': `${habit.name} on ${date}`, title: date, onclick: act(async () => { await update(d => { const h = d.habits.find(x => x.id === habit.id); if (h) h.dates = h.dates.includes(date) ? h.dates.filter(x => x !== date) : [...h.dates, date]; }); }) }, new Date(`${date}T12:00:00`).toLocaleDateString('en', { weekday: 'narrow' }), el('span', {}, habit.dates.includes(date) ? '✓' : '·')))),
    el('div', { class: 'row' }, el('small', { class: 'muted grow' }, habit.reminder ? `Daily reminder · ${habit.reminder}` : 'No reminder'), el('button', { onclick: () => edit(habit) }, 'Edit'), el('button', { onclick: () => confirmAction(root, 'Delete this habit and its check-ins?', async () => { await update(d => { d.habits = d.habits.filter(h => h.id !== habit.id); }); await backgroundSync(); }) }, 'Delete')))));
  if (!get().habits.length) list.append(el('p', { class: 'empty-state' }, 'Small promises, kept gently. Add your first habit.'));
}
function edit(habit) {
  const name = el('input', { value: habit?.name || '', maxlength: 120, required: true, placeholder: 'Read a few pages', 'aria-label': 'Habit name' }), time = el('input', { type: 'time', value: habit?.reminder || '', 'aria-label': 'Habit reminder' });
  const form = el('form', { class: 'stack entry-card', onsubmit: act(async event => { event.preventDefault(); if (!name.value.trim()) return; await update(d => { const existing = d.habits.find(h => h.id === habit?.id); if (existing) Object.assign(existing, { name: name.value.trim(), reminder: time.value }); else d.habits.push({ id: uid(), name: name.value.trim(), dates: [], reminder: time.value }); }); await backgroundSync(); form.remove(); }) }, field('Habit name', name), field('Optional daily reminder', time, 'Uses your local time. Leave empty for no reminder.'), el('div', { class: 'row' }, el('button', { type: 'submit', class: 'primary' }, 'Save habit'), el('button', { type: 'button', onclick: () => form.remove() }, 'Cancel')));
  root.prepend(form); name.focus();
}
export function open() { list = el('div', { class: 'stack' }); root = el('div', { class: 'stack' }, el('p', { class: 'muted' }, 'Consistency can be quiet. Tap any day to check in or correct your history.'), el('button', { class: 'primary', onclick: () => edit() }, 'Add habit'), list); openPanel('The things you return to', 'habits', root, () => { root = list = null; }); render(); }
export function init() { off = watch(d => d.habits, render); }
export function destroy() { off?.(); root = list = null; }
