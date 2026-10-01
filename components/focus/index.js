import { get, set } from '../../core/storage.js';
import { dayKey, el, loadScript } from '../../core/utils.js';
import { watch, act, button } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { reduceMotion } from '../../core/theme.js';
let root, unsubscribe, timer, currentDay;
export function render() {
  const focus = get().focus, today = focus.date === dayKey();
  root.replaceChildren(el('p', { class: 'focus-label' }, today && focus.text ? 'TODAY, ONE THING AT A TIME' : 'WHAT MATTERS MOST TODAY?'));
  if (!today || !focus.text) {
    const input = el('input', { type: 'text', maxlength: 240, placeholder: 'Give your day a little direction…', 'aria-label': 'Your main focus today', autocomplete: 'off' });
    root.append(el('form', { class: 'focus-form', onsubmit: act(async event => { event.preventDefault(); if (input.value.trim()) await set('focus', { date: dayKey(), text: input.value.trim(), completed: false }); }) }, input, button('Save daily focus', 'arrow-right', act(async () => { if (input.value.trim()) await set('focus', { date: dayKey(), text: input.value.trim(), completed: false }); }))));
  } else {
    const check = el('input', { type: 'checkbox', checked: focus.completed, 'aria-label': 'Complete daily focus', onchange: act(async event => {
      const completed = event.target.checked; await set('focus', { ...focus, completed });
      if (completed) { emit('toast', 'One meaningful thing, done. Take a breath.'); if (!reduceMotion()) { await loadScript('../vendor/canvas-confetti/1.9.3/confetti.browser.min.js'); globalThis.confetti({ particleCount: 45, spread: 65, origin: { y: .58 }, colors: ['#d6e9ba', '#e8dcb5', '#ffffff'], disableForReducedMotion: true }); } }
    }) });
    root.append(el('div', { class: `focus-value${focus.completed ? ' completed' : ''}` }, el('label', {}, check, el('span', {}, focus.text)), button('Edit daily focus', 'pencil', () => {
      const input = el('input', { value: focus.text, maxlength: 240, 'aria-label': 'Edit daily focus' });
      root.replaceChildren(el('form', { class: 'focus-form', onsubmit: act(async event => { event.preventDefault(); await set('focus', { ...focus, text: input.value.trim() }); }) }, input, el('button', { type: 'submit' }, 'Save'))); input.focus();
    })));
  }
}
export function init(node) { root = node; currentDay = dayKey(); render(); unsubscribe = watch(d => d.focus, render); timer = setInterval(() => { if (currentDay !== dayKey()) { currentDay = dayKey(); render(); } }, 1000); }
export function destroy() { unsubscribe?.(); clearInterval(timer); root?.replaceChildren(); }
