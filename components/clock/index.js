import { get } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { watch } from '../../core/ui.js';
let root, timer, unsubscribe;
export function render() {
  const s = get().settings, now = new Date(), hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const time = now.toLocaleTimeString([], { hour: s.clock24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !s.clock24 });
  const parts = time.match(/^(.*?)(\s?[ap]m)$/i);
  root.replaceChildren(el('p', { class: 'date-label' }, now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()),
    el('div', { class: 'clock-time', role: 'timer', 'aria-label': time }, parts ? parts[1] : time, parts ? el('span', { class: 'clock-period' }, parts[2].trim()) : null),
    el('h1', { class: 'greeting' }, `${greeting}${s.name ? `, ${s.name}` : ''}.`));
}
export function init(node) { root = node; render(); timer = setInterval(render, 1000); unsubscribe = watch(d => [d.settings.name, d.settings.clock24], render); }
export function destroy() { clearInterval(timer); unsubscribe?.(); root?.replaceChildren(); }
