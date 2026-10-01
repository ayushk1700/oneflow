import { el } from './utils.js';
import { openPanel, act } from './ui.js';
import { get } from './storage.js';
const modules = new Map();
export function registerFeature(name, module) { modules.set(name, module); }
const labels = { journal: ['The good in today','A gratitude journal'], notes: ['Room for a thought','Your notes & loose ends'], habits: ['Small promises','Habits & daily check-ins'], countdowns: ['Looking forward','Dates that matter'], stats: ['Your progress','Focus time & patterns'], mood: ['A moment for you','Mood & energy'], music: ['Your soundtrack','Optional Spotify / YouTube'] };
/** Lazy panel modules retain their isolated lifecycle. */
export async function openFeature(name) {
  if (!get().settings.widgets[name]) return;
  if (!modules.has(name)) { const module = await import(`../components/${name}/index.js`); module.init(); modules.set(name, module); }
  await modules.get(name).open();
}
export function destroyFeature(name) { modules.get(name)?.destroy(); modules.delete(name); }
export function openDay() {
  const content = el('div', { class: 'day-grid' });
  for (const [name,[title,subtitle]] of Object.entries(labels)) if (get().settings.widgets[name]) content.append(el('button', { class: 'day-card', onclick: act(() => openFeature(name)) }, el('strong', {}, title), el('small', {}, subtitle)));
  if (!content.children.length) content.append(el('p', { class: 'muted' }, 'Enable a reflection or tracking widget in Settings to make this space yours.'));
  openPanel('A day with a little more room', 'day', content);
}
