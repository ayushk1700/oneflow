import { get } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { aggregate } from '../../core/stats-logic.js';
import { el, loadScript } from '../../core/utils.js';
import { openPanel, select, act } from '../../core/ui.js';
import { reduceMotion } from '../../core/theme.js';
let chart, root, generation = 0;
export async function render(range = 'week') {
  const version = ++generation, sessions = await getAll('sessions'); if (!root || version !== generation) return;
  chart?.destroy(); chart = null;
  const d = get(), data = aggregate(sessions, d.tasks, d.moods, range), content = root.querySelector('.stats-content');
  const metrics = [['Focus time', `${Math.round(data.total / 60000)} min`],['Sessions', String(data.sessions)],['Tasks completed', String(data.completedTasks)],['Focus streak', `${data.streak} ${data.streak === 1 ? 'day' : 'days'}`]];
  const canvas = el('canvas', { 'aria-label': 'Focus minutes per day', role: 'img' });
  content.replaceChildren(el('div', { class: 'stats-grid' }, ...metrics.map(([label,value]) => el('div', { class: 'stat-card' }, el('strong', {}, value), el('small', {}, label)))), el('div', { class: 'chart-wrap' }, canvas),
    el('p', { class: 'muted' }, data.bestHour === null ? 'Your first session is the beginning of a pattern.' : `Most focus time this period began around ${String(data.bestHour).padStart(2,'0')}:00.`),
    el('details', {}, el('summary', {}, 'View chart data'), el('table', { class: 'stats-table' }, el('thead', {}, el('tr', {}, el('th', {}, 'Date'), el('th', {}, 'Minutes'))), el('tbody', {}, ...data.days.map((day,i) => el('tr', {}, el('td', {}, day), el('td', {}, data.minutes[i].toFixed(1))))))),
    el('h3', {}, 'Energy alongside effort'), el('p', { class: 'muted' }, data.moods.length ? `${data.moods.length} check-ins · average energy ${(data.moods.reduce((n,m)=>n+m.value,0)/data.moods.length).toFixed(1)} / 5` : 'Your mood check-ins will appear here.'),
    el('small', { class: 'muted' }, 'Focus time includes completed and partial sessions, attributed to their start date. Month means the last 30 days. Task completions are counted from Stage 2 onward. Everything is calculated on this device.'));
  await loadScript('../vendor/chart.js/4.4.8/chart.umd.js'); if (!root || version !== generation) return;
  const color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
  chart = new globalThis.Chart(canvas, { type: 'bar', data: { labels: data.days.map(x => x.slice(5)), datasets: [{ label: 'Focus minutes', data: data.minutes, backgroundColor: '#91b394', borderRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false, animation: reduceMotion() ? false : { duration: 200 }, plugins: { legend: { display: false } }, scales: { x: { ticks: { color }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color }, grid: { color: '#71847333' } } } } });
}
export async function open() { root = el('div', { class: 'stack' }, select([['day','Today'],['week','Last 7 days'],['month','Last 30 days']], 'week', act(e => render(e.target.value))), el('div', { class: 'stats-content stack' })); root.querySelector('select').setAttribute('aria-label','Statistics period'); openPanel('The shape of your progress', 'stats', root, destroy); await render(); }
export function init() {}
export function destroy() { generation++; chart?.destroy(); chart = null; root = null; }
