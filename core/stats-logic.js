import { dayKey } from './utils.js';
/** Calendar arithmetic at noon avoids DST midnight discontinuities. */
export function shiftDay(key, delta) { const date = new Date(`${key}T12:00:00`); date.setDate(date.getDate() + delta); return dayKey(date); }
/** A current streak may end today or yesterday so mornings are not penalized. */
export function streak(dates, today = dayKey()) {
  const days = new Set(dates); let cursor = days.has(today) ? today : shiftDay(today, -1), count = 0;
  while (days.has(cursor)) { count++; cursor = shiftDay(cursor, -1); }
  return count;
}
/** Aggregate actual logged focus duration, including deliberately partial sessions. */
export function aggregate(sessions, tasks, moods, range = 'week', now = new Date()) {
  const today = dayKey(now), count = range === 'day' ? 1 : range === 'month' ? 30 : 7;
  const days = Array.from({ length: count }, (_, i) => shiftDay(today, i - count + 1));
  const buckets = Object.fromEntries(days.map(d => [d, 0])), hours = Array(24).fill(0), selected = [];
  for (const session of sessions) {
    const day = dayKey(new Date(session.start));
    if (!(day in buckets)) continue;
    buckets[day] += session.duration; hours[new Date(session.start).getHours()] += session.duration; selected.push(session);
  }
  const total = selected.reduce((sum, s) => sum + s.duration, 0);
  return { days, minutes: days.map(d => buckets[d] / 60000), total, sessions: selected.length,
    completedSessions: selected.filter(s => s.completed).length,
    completedTasks: tasks.filter(t => t.completed && t.completedAt && days.includes(dayKey(new Date(t.completedAt)))).length,
    bestHour: total ? hours.indexOf(Math.max(...hours)) : null,
    streak: streak(sessions.filter(s => s.completed).map(s => dayKey(new Date(s.start))), today),
    moods: moods.filter(m => days.includes(dayKey(new Date(m.at)))), hours };
}
/** Whole calendar days, independent of timezone offsets and DST. */
export function daysUntil(date, today = dayKey()) { return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000); }
