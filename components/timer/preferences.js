import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { backgroundSync } from '../../core/timer-client.js';
import { el } from '../../core/utils.js';
import { act, field, toggle, select } from '../../core/ui.js';
import { emit } from '../../core/events.js';
/** Render session preferences inside the single Settings hub. @param {HTMLElement} body */
export function renderSettings(body) {
  const s = get();
  const settings = el('section', { class: 'stack' }, el('p', { class: 'muted' }, translate('Session durations and preferences. Use the dashboard to control your current session.')));
  const form = el('form', { class: 'stack rhythm-form' });
  const controls = {}; let dirty = false;
  const presets = select([['custom',translate('m0515')],['gentle',translate('m0516')],['classic',translate('m0517')],['deep',translate('m0518')]], 'custom', event => {
    const values = { gentle: [15,3,10], classic: [25,5,15], deep: [50,10,20] }[event.target.value]; if (values) ['focus','short','long'].forEach((key, i) => { controls[key].value = values[i]; });
  });
  form.append(field(translate('m0519'), presets));
  for (const [key, label] of [['focus',translate('m0471')],['short',translate('m0520')],['long',translate('m0521')],['cycles',translate('m0522')]]) {
    controls[key] = el('input', { type: 'number', min: 1, max: key === 'cycles' ? 12 : 180, step: 1, required: true, value: s.timerConfig[key] }); form.append(field(label, controls[key]));
  }
  const flags = {};
  for (const [key, label] of [["autoFocus",translate('m0523')],["autoBreak",translate('m0524')],['notifications',translate('m0525')],['chime',translate('m0526')]]) { flags[key] = s.timerConfig[key]; form.append(toggle(label, flags[key], e => { flags[key] = e.target.checked; })); }
  form.append(el('button', { type: 'submit', class: 'primary' }, translate('m0527')), el('small', { class: 'muted' }, translate('m0528')));
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('change', () => { dirty = true; });
  form.addEventListener('submit', act(async event => {
    event.preventDefault(); await update(d => { d.timerConfig = { ...d.timerConfig, ...flags, ...Object.fromEntries(Object.entries(controls).map(([key, input]) => [key, Number(input.value)])) }; if (d.timer.status === 'idle') { d.timer.duration = d.timerConfig[d.timer.phase] * 60000; d.timer.remaining = d.timer.duration; } }); dirty = false; await backgroundSync(); emit('toast', translate('m0529'));
  }));
  settings.append(form); body.append(settings, el('p', { class: 'muted' }, translate('m0530')));
  return () => {
    // Preserve unsaved edits; otherwise reflect durations changed from Home or a Scene.
    if (dirty) return;
    for (const [key, input] of Object.entries(controls)) input.value = get().timerConfig[key];
    Object.assign(flags, Object.fromEntries(Object.keys(flags).map(key => [key, get().timerConfig[key]])));
    form.querySelectorAll('[role=switch]').forEach((input, index) => { input.checked = Object.values(flags)[index]; });
  };
}
