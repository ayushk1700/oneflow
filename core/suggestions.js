import { t as translate } from './i18n.js';
import { aggregate, streak } from './stats-logic.js';
/** Deterministic suggestions use only local records. */
export function suggestions(d, sessions, now = new Date()) {
  const stats = aggregate(sessions, d.tasks, d.moods, 'month', now),
    items = [];
  if (d.timer.phase !== 'focus') items.push(translate('m0104'));
  if (stats.bestHour !== null && stats.sessions >= 3) items.push(translate('m0105', {
    p0: String(stats.bestHour).padStart(2, '0')
  }));
  const days = streak(d.rituals.map(r => r.date));
  if (days) items.push(translate('m0106', {
    p0: days
  }));
  if (!d.focus.text) items.push(translate('m0107'));
  if (!items.length) items.push(translate('m0108'));
  return items;
}
