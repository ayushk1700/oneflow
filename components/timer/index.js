import { get, update } from '../../core/storage.js';
import { remaining } from '../../core/timer-logic.js';
import { timerCommand, backgroundSync } from '../../core/timer-client.js';
import { el } from '../../core/utils.js';
import { watch, openPanel, act, field, toggle, select } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { render as breakCard } from '../break/index.js';
let root, unsubscribe, interval, panelSummary, syncing = false;
export const timeText = ms => { const seconds = Math.ceil(ms / 1000); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; };
const phaseName = phase => ({ focus: 'Focus', short: 'Short break', long: 'Long break' })[phase];
export function render() {
  const timer = get().timer, text = `${phaseName(timer.phase)} · ${timeText(remaining(timer, Date.now()))}`;
  if (root) { let control = root.querySelector('button'); if (!control) { control = el('button', { class: 'timer-pill', onclick: open }); root.append(control); } control.textContent = text; control.setAttribute('aria-label', `Open focus timer. ${text}. ${timer.status}`); }
  if (panelSummary) {
    panelSummary.querySelector('.timer-numbers').textContent = timeText(remaining(timer, Date.now()));
    panelSummary.querySelector('.timer-phase').textContent = `${phaseName(timer.phase)} · ${timer.status}`;
    panelSummary.querySelector('.timer-task').textContent = timer.taskTitle || 'One thing at a time.';
    panelSummary.querySelector('[data-action=toggle]').textContent = timer.status === 'running' ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start';
    const companion = panelSummary.querySelector('.break-slot');
    if (companion.dataset.phase !== timer.phase) { companion.dataset.phase = timer.phase; companion.replaceChildren(...(timer.phase === 'focus' ? [] : [breakCard(timer.cycle)])); }
  }
  if (timer.status === 'running' && remaining(timer, Date.now()) === 0 && !syncing) {
    syncing = true; timerCommand('tick').catch(error => emit('error', error)).finally(() => { syncing = false; });
  }
}
export function open() {
  const s = get(), content = el('div', { class: 'stack' });
  panelSummary = el('section', { class: 'timer-summary stack' }, el('p', { class: 'timer-phase', role: 'status' }), el('div', { class: 'timer-numbers', role: 'timer', 'aria-live': 'off', 'aria-label': 'Remaining time' }), el('p', { class: 'timer-task muted' }),
    el('div', { class: 'row timer-actions' }, el('button', { class: 'primary grow', 'data-action': 'toggle', onclick: act(() => timerCommand(get().timer.status === 'running' ? 'pause' : 'start')) }), el('button', { onclick: act(() => timerCommand('skip')) }, 'Skip'), el('button', { onclick: act(() => timerCommand('reset')) }, 'Reset')), el('div', { class: 'break-slot' }));
  content.append(panelSummary);
  const settings = el('details', {}, el('summary', {}, 'Make the rhythm yours'));
  const form = el('form', { class: 'stack rhythm-form' });
  const controls = {};
  const presets = select([['custom','Choose a preset'],['gentle','Gentle · 15 / 3 / 10'],['classic','Classic · 25 / 5 / 15'],['deep','Deep work · 50 / 10 / 20']], 'custom', event => {
    const values = { gentle: [15,3,10], classic: [25,5,15], deep: [50,10,20] }[event.target.value]; if (values) ['focus','short','long'].forEach((key, i) => { controls[key].value = values[i]; });
  });
  form.append(field('Presets', presets));
  for (const [key, label] of [['focus','Focus minutes'],['short','Short break minutes'],['long','Long break minutes'],['cycles','Sessions before a long break']]) {
    controls[key] = el('input', { type: 'number', min: 1, max: key === 'cycles' ? 12 : 180, step: 1, required: true, value: s.timerConfig[key] }); form.append(field(label, controls[key]));
  }
  const flags = {};
  for (const [key, label] of [['autoFocus','Automatically start focus'],['autoBreak','Automatically start breaks'],['notifications','Phase-change notifications'],['chime','Soft chime']]) { flags[key] = s.timerConfig[key]; form.append(toggle(label, flags[key], e => { flags[key] = e.target.checked; })); }
  form.append(el('button', { type: 'submit', class: 'primary' }, 'Save rhythm'), el('small', { class: 'muted' }, 'Changes apply to the next phase. On waking from sleep, the next phase starts then.'));
  form.addEventListener('submit', act(async event => {
    event.preventDefault(); await update(d => { d.timerConfig = { ...d.timerConfig, ...flags, ...Object.fromEntries(Object.entries(controls).map(([key, input]) => [key, Number(input.value)])) }; if (d.timer.status === 'idle') { d.timer.duration = d.timerConfig[d.timer.phase] * 60000; d.timer.remaining = d.timer.duration; } }); await backgroundSync(); emit('toast', 'Your rhythm is saved.');
  }));
  settings.append(form); content.append(settings, el('p', { class: 'muted' }, 'Space starts or pauses from the dashboard. Start a linked session from any task.'));
  openPanel('A little time, well spent', 'timer', content, () => { panelSummary = null; }); render();
}
export function init(node) { root = node; render(); unsubscribe = watch(d => d.timer, render); interval = setInterval(render, 1000); timerCommand('tick').catch(error => emit('error', error)); }
export function destroy() { unsubscribe?.(); clearInterval(interval); root?.replaceChildren(); root = null; panelSummary = null; }
