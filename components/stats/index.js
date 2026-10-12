import { tabs } from '../panel-design/index.js';
import { t as translate } from '../../core/i18n.js';
import { get } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { aggregate } from '../../core/stats-logic.js';
import { el, loadScript, download } from '../../core/utils.js';
import { resumePanel, openPanel, select, button, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { reduceMotion } from '../../core/theme.js';

let chart, root, generation = 0, currentRange = 'week';
const minutesLabel = minutes => `${Math.round(minutes)} min`;
const average = (values, divisor = values.length) => divisor ? values.reduce((sum, value) => sum + value, 0) / divisor : 0;

function downloadCSV(data, range) {
  const rows = [['Date', 'Focus minutes'], ...data.days.map((day, index) => [day, data.minutes[index].toFixed(1)])];
  const blob = new Blob([rows.map(row => row.map(value => `\"${String(value).replaceAll('\"', '\"\"')}\"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  download(blob, `oneflow-focus-${range}.csv`);
  emit('toast', { message: 'Focus data exported to CSV.', kind: 'success' });
}

function insight(label, value, detail, modifier = '') {
  return el('article', { class: `stats-insight ${modifier}`.trim() }, el('span', { class: 'stats-insight-label' }, label), el('strong', {}, value), el('small', {}, detail));
}

/** Render local focus history for one of the supported calendar windows. */
export async function render(range = currentRange) {
  const version = ++generation; currentRange = range;
  let sessions;
  try { sessions = await getAll('sessions'); }
  catch { if (root && version === generation) root.querySelector('.stats-content').replaceChildren(el('p', { role: 'status' }, 'Focus history could not be loaded.'), el('button', { type: 'button', onclick: act(() => render(range)) }, 'Retry')); return; }
  if (!root || version !== generation) return;
  chart?.destroy(); chart = null;
  const d = get(), data = aggregate(sessions, d.tasks, d.moods, range), content = root.querySelector('.stats-content');
  const totalMinutes = data.total / 60000, peak = Math.max(...data.minutes, 0), peakIndex = data.minutes.indexOf(peak);
  const averageDay = average(data.minutes), completion = data.sessions ? Math.round((data.completedSessions / data.sessions) * 100) : 0;
  const moodAverage = data.moods.length ? average(data.moods.map(mood => mood.value)).toFixed(1) : '—';
  const periodLabel = range === 'day' ? 'today' : range === 'month' ? 'the last 30 days' : 'the last 7 days';
  const metrics = [
    ['Daily average', `${averageDay.toFixed(1)} min`, 'across every day in this window'],
    ['Sessions', String(data.sessions), `${data.completedSessions} completed`],
    ['Tasks completed', String(data.completedTasks), periodLabel],
    ['Focus streak', `${data.streak} ${data.streak === 1 ? 'day' : 'days'}`, data.streak ? 'keep the rhythm going' : 'start a small rhythm']
  ];
  const canvas = el('canvas', { 'aria-label': translate('m0462'), role: 'img' });
  const dataTable = el('table', { class: 'stats-table' },
    el('caption', {}, 'Focus minutes by day'),
    el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, translate('m0466')), el('th', { scope: 'col' }, translate('m0467')))),
    el('tbody', {}, ...data.days.map((day, index) => el('tr', {}, el('td', {}, day), el('td', {}, data.minutes[index].toFixed(1))))));
  content.replaceChildren(
    el('section', { class: 'stats-hero', 'aria-labelledby': 'stats-hero-title' },
      el('div', { class: 'stats-hero-copy' }, el('p', { class: 'eyebrow' }, 'YOUR RHYTHM'), el('h3', { id: 'stats-hero-title' }, 'Small sessions add up.'), el('p', { class: 'muted' }, `A quiet look at your focus for ${periodLabel}. Everything stays on this device.`)),
      el('div', { class: 'stats-hero-total' }, el('span', {}, 'Total focus'), el('strong', {}, minutesLabel(totalMinutes)), el('small', {}, `${averageDay.toFixed(1)} min per day`))),
    el('div', { class: 'stats-grid', role: 'list', 'aria-label': 'Focus summary' }, ...metrics.map(([label, value, detail]) => el('article', { class: 'stat-card', role: 'listitem' }, el('span', { class: 'stat-card-label' }, label), el('strong', {}, value), el('small', {}, detail)))),
    el('section', { class: 'stats-chart-card', 'aria-labelledby': 'stats-chart-title' }, el('div', { class: 'stats-section-heading' }, el('div', {}, el('p', { class: 'eyebrow' }, 'DAILY PULSE'), el('h3', { id: 'stats-chart-title' }, 'Where your time went')), el('span', { class: 'stats-chart-key' }, 'minutes')), el('div', { class: 'chart-wrap' }, canvas)),
    el('section', { class: 'stats-insights', 'aria-label': 'Focus insights' },
      insight('Best start time', data.bestHour === null ? '—' : `${String(data.bestHour).padStart(2, '0')}:00`, data.bestHour === null ? 'Your first session is the beginning of a pattern.' : 'Most focus time began around this hour.'),
      insight('Peak day', peak ? minutesLabel(peak) : '—', peak ? data.days[peakIndex] : 'No focus logged yet'),
      insight('Session follow-through', data.sessions ? `${completion}%` : '—', data.sessions ? 'sessions completed' : 'complete one session to see this'),
      insight('Energy average', data.moods.length ? `${moodAverage}/5` : '—', data.moods.length ? `${data.moods.length} check-in${data.moods.length === 1 ? '' : 's'} in this period` : 'Mood check-ins appear here')),
    el('details', { class: 'stats-data-disclosure' }, el('summary', {}, 'View daily data'), dataTable),
    el('section', { class: 'stats-support-card', 'aria-labelledby': 'stats-energy-title' }, el('div', {}, el('p', { class: 'eyebrow' }, 'ENERGY ALONGSIDE EFFORT'), el('h3', { id: 'stats-energy-title' }, 'Notice what supports your focus.')), el('p', { class: 'muted' }, data.moods.length ? `${data.moods.length} check-ins average ${moodAverage} out of 5. Your energy notes are kept local.` : 'Your mood check-ins will appear here. A quick check-in can reveal what makes focus easier.')),
    el('section', { class: 'stats-planning-card', 'aria-labelledby': 'stats-planning-title' }, el('div', {}, el('p', { class: 'eyebrow' }, 'PLANNING · ALL TIME'), el('h3', { id: 'stats-planning-title' }, 'Estimate versus reality')), el('div', { class: 'stats-estimates' })),
    el('p', { class: 'muted stats-method' }, 'Time includes completed and partial sessions, grouped by their start date. Streak counts consecutive days with a completed session, ending today or yesterday. Planning totals include all recorded history.')
  );
  const patterns=el('div',{class:'stack'});for(const selector of ['.stats-insights','.stats-support-card','.stats-planning-card'])patterns.append(content.querySelector(selector));const overview=el('div',{class:'stack'},...content.childNodes);content.replaceChildren();tabs(content,[{label:'Overview',content:overview},{label:'Patterns',content:patterns}],'stats');content.querySelector('.context-tabs').addEventListener('click',()=>{if(!overview.hidden)chart?.resize();});
  const estimates = Object.entries(d.planning.estimates).map(([id, estimate]) => {
    const task = d.tasks.find(item => item.id === id), spent = sessions.filter(session => session.taskId === id).reduce((sum, session) => sum + session.duration, 0) / 60000;
    return task ? el('div', { class: 'stats-estimate-row' }, el('span', {}, task.text), el('strong', {}, `${estimate} → ${Math.round(spent)} min`)) : null;
  }).filter(Boolean);
  content.querySelector('.stats-estimates').replaceChildren(...(estimates.length ? estimates : [el('p', { class: 'muted' }, 'Add an estimate to a task to see how your plan compares with your actual focus.')]));
  try { await loadScript('../vendor/chart.js/4.4.8/chart.umd.js'); }
  catch { if (root && version === generation) { canvas.replaceWith(el('p', { role: 'status' }, 'Chart unavailable. Your daily data is available below.')); root.querySelector('.stats-data-disclosure').open = true; } return; }
  if (!root || version !== generation) return;
  const color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
  const neutral = d.settings.accent.toLowerCase() === '#f5f5f5' ? getComputedStyle(document.documentElement).getPropertyValue('--action').trim() : d.settings.accent;
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
  // Canvas text and bar corners follow the same tokens as the surrounding panel.
  const styles = getComputedStyle(root);
  globalThis.Chart.defaults.font.family = styles.fontFamily;
  globalThis.Chart.defaults.font.size = parseFloat(styles.getPropertyValue('--text-small'));
  const barRadius = parseFloat(styles.getPropertyValue('--radius-small'));
  chart = new globalThis.Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.days.map(day => day.slice(5)),
      datasets: [{ label: translate('m0471'), data: data.minutes, backgroundColor: neutral, borderRadius: barRadius, borderSkipped: false, maxBarThickness: 28 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: reduceMotion() ? false : { duration: 200 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: context => ` ${context.parsed.y.toFixed(1)} min` } }
      },
      scales: {
        x: { ticks: { color, maxRotation: 0, autoSkip: true, maxTicksLimit: range === 'month' ? 6 : 7 }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color, callback: value => `${value}m` }, grid: { color: gridColor } }
      }
    }
  });
}

export async function open() {
  if (resumePanel('stats')) return;
  currentRange = 'week';
  const range = select([['day', translate('m0165')], ['week', translate('m0472')], ['month', translate('m0473')]], currentRange, act(event => render(event.target.value)));
  range.setAttribute('aria-label', translate('m0474'));
  const toolbar = el('div', { class: 'stats-toolbar' }, el('div', { class: 'stats-range' }, el('span', { class: 'stats-range-label' }, 'Time window'), range), button('Export CSV', 'download', act(async () => { const selected = currentRange; downloadCSV(aggregate(await getAll('sessions'), get().tasks, get().moods, selected), selected); }), 'text-button'));
  root = el('div', { class: 'stats-panel stack' }, toolbar, el('div', { class: 'stats-content stack' }, el('p', { role: 'status' }, 'Loading your progress…')));
  openPanel(translate('m0475'), 'stats', root, destroy);
  await render(currentRange);
}

export function init() {}
export function destroy() { generation++; chart?.destroy(); chart = null; root = null; }
