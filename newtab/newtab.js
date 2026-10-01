import * as storage from '../core/storage.js';
import * as theme from '../core/theme.js';
import { initUI, button, icon, act, openPanel } from '../core/ui.js';
import { emit, on } from '../core/events.js';
import { el, inputActive } from '../core/utils.js';
import '../core/state.js';
import * as clock from '../components/clock/index.js';
import * as focus from '../components/focus/index.js';
import * as search from '../components/search/index.js';
import * as links from '../components/links/index.js';
import * as quotes from '../components/quotes/index.js';
import * as weather from '../components/weather/index.js';
import * as tasks from '../components/tasks/index.js';
import * as settings from '../components/settings/index.js';
import * as onboarding from '../components/onboarding/index.js';
const modules = { clock, focus, search, links, quotes, weather, tasks }, mounted = new Set();
let previousWidgets = '';
async function applyWidgets(data) {
  const widgets = data.settings.widgets, key = JSON.stringify(widgets);
  if (key === previousWidgets) return;
  previousWidgets = key;
  for (const [name, module] of Object.entries(modules)) {
    const node = document.getElementById(name);
    if (node) node.hidden = !widgets[name];
    if (widgets[name] && !mounted.has(name)) { mounted.add(name); Promise.resolve(module.init(node)).catch(error => emit('error', error)); }
    else if (!widgets[name] && mounted.has(name)) { module.destroy(); mounted.delete(name); }
  }
  const dock = document.querySelector('#dock'); dock.replaceChildren();
  const add = (label, glyph, action) => { const b = button(label, null, action, 'dock-button'); b.append(icon(glyph), el('span', {}, label)); dock.append(b); };
  if (widgets.tasks) add('My tasks', 'list-todo', act(tasks.open));
  if (widgets.links) add('Shortcuts', 'layout-grid', links.manage);
  dock.append(el('span', { class: 'dock-divider', 'aria-hidden': 'true' }));
  add('Scenery', 'image', () => emit('settings:open', 'backgrounds'));
  add('Settings', 'sliders-horizontal', () => emit('settings:open', 'appearance'));
}
function shortcuts() {
  openPanel('A little less clicking', 'shortcuts', el('div', { class: 'stack' }, ...[['N', 'Add a new task'], ['/', 'Focus web search'], ['Esc', 'Close any panel']].map(([key, label]) => el('div', { class: 'row' }, el('kbd', {}, key), label)), el('p', { class: 'muted' }, 'Shortcuts pause while you type. Timer and Flow Mode shortcuts arrive in later stages.')));
}
async function start() {
  initUI();
  await storage.init();
  settings.init();
  await theme.init();
  await applyWidgets(storage.get());
  storage.subscribe(data => { applyWidgets(data).catch(error => emit('error', error)); });
  document.querySelector('#background-button').onclick = () => emit('settings:open', 'backgrounds');
  document.querySelector('#shortcuts-button').onclick = shortcuts;
  on('panel:open', name => { for (const b of document.querySelectorAll('#dock button')) b.classList.toggle('active', (name === 'tasks' && b.textContent === 'My tasks') || (name === 'settings' && b.textContent === 'Settings')); });
  on('panel:closed', () => document.querySelectorAll('#dock .active').forEach(b => b.classList.remove('active')));
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || inputActive(event.target) || document.querySelector('#panel').open) return;
    if (event.key === '/' && storage.get().settings.widgets.search) { event.preventDefault(); document.querySelector('#web-search')?.focus(); }
    if (event.key.toLowerCase() === 'n' && storage.get().settings.widgets.tasks) { event.preventDefault(); emit('task:new'); }
  });
  performance.mark('oneflow-ready');
  document.documentElement.dataset.ready = 'true';
  onboarding.init();
}
addEventListener('unhandledrejection', event => { event.preventDefault(); emit('error', event.reason); });
start().catch(error => {
  console.error('ONEFLOW startup failed', error);
  document.querySelector('#main').replaceChildren(el('div', { class: 'stack' }, el('h1', {}, 'Your space needs a moment.'), el('p', {}, 'Local data could not be opened. Your saved content has not been reset.'), el('p', {}, error.message), el('button', { onclick: () => location.reload() }, 'Try again')));
});
