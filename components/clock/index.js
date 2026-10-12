import { t as translate } from '../../core/i18n.js';
import { get } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { watch } from '../../core/ui.js';
let root, timer, unsubscribe, last = '';
export function render() {
  const s = get().settings, now = new Date(), hour = now.getHours();
  const greeting = hour < 12 ? translate('m0151') : hour < 17 ? translate('m0152') : translate('m0153');
  const time = now.toLocaleTimeString([], { hour: s.clock24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !s.clock24 });
  const parts = time.match(/^(.*?)(\s?[ap]m)$/i);
  // Seconds are not displayed. Keep Home and customized clock nodes stable
  // until a visible value changes instead of rebuilding the tree each tick.
  const key = JSON.stringify([s.name, time, greeting, now.toDateString()]);
  if (key === last) return;
  last = key;
  root.replaceChildren(el('p', { class: 'date-label' }, now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()),
    el('div', { class: 'clock-time', role: 'timer', 'aria-label': time }, parts ? parts[1] : time, parts ? el('span', { class: 'clock-period' }, parts[2].trim()) : null),
    el('h1', { class: 'greeting' }, `${greeting}${s.name ? `, ${s.name}` : ''}.`));
}
export function init(node) { root = node; render(); timer = setInterval(render, 1000); unsubscribe = watch(d => [d.settings.name, d.settings.clock24], render); }
export function destroy() { clearInterval(timer); unsubscribe?.(); root?.replaceChildren(); last = ''; }
