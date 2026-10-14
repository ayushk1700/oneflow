import { t as translate } from './i18n.js';
import { TIMER_DEFAULTS, freshTimer } from './timer-logic.js';
export const EXTRA_WIDGETS = ['timer', 'sounds', 'journal', 'notes', 'habits', 'countdowns', 'stats', 'mood', 'music'];
export const SOUND_NAMES = ['rain', 'cafe', 'fireplace', 'forest', 'ocean', 'white', 'brown'];
export function extraDefaults() {
  return { timerConfig: { ...TIMER_DEFAULTS }, timer: freshTimer(), sessionOutbox: [], timerNotice: null, lastFocusSession: null,
    audio: { playing: false, master: .5, volumes: Object.fromEntries(SOUND_NAMES.map(x => [x, x === 'rain' ? .5 : 0])), sleepAt: null },
    moods: [], music: { url: '' }, integrations: { unsplashKey: '' } };
}
const str = (x, max) => typeof x === 'string' && x.length <= max;
const num = (x, min, max) => Number.isFinite(x) && x >= min && x <= max;
const date = x => /^\d{4}-\d{2}-\d{2}$/.test(x) && new Date(`${x}T12:00:00Z`).toISOString().slice(0, 10) === x;
export function validateSession(s) {
  if (!s || !str(s.id, 100) || !num(s.start, 0, 9e15) || !num(s.end, s.start, 9e15) || !num(s.duration, 0, 180 * 60000) || typeof s.completed !== 'boolean' || !(s.taskId === null || str(s.taskId, 100)) || !str(s.taskTitle, 240)) throw new Error(translate('m0071'));
}
export function validateJournal(j) {
  if(j?.notebook!==undefined&&!str(j.notebook,60)||j?.mood!==undefined&&!str(j.mood,40))throw new Error('Invalid journal notebook or mood.');
  if (!j || !str(j.id, 100) || !date(j.date) || !str(j.text, 20000) || !str(j.prompt, 500) || !num(j.updatedAt, 0, 9e15)) throw new Error(translate('m0072'));
}
export function validateExtra(d) {
  if (d.integrations?.pexelsKey !== undefined && !str(d.integrations.pexelsKey, 200)) throw new Error('Invalid Pexels API key.');
  const c = d.timerConfig, t = d.timer, a = d.audio;
  if (!c || ['focus','short','long'].some(k => !num(c[k], 1, 180)) || !Number.isInteger(c.cycles) || !num(c.cycles, 1, 12) || ["autoFocus","autoBreak",'notifications','chime'].some(k => typeof c[k] !== 'boolean')) throw new Error(translate('m0075'));
  if (!t || !['focus','short','long'].includes(t.phase) || !['idle','paused','running'].includes(t.status) || !num(t.duration, 1, 10800000) || !num(t.remaining, 0, t.duration) || !num(t.observedAt, 0, 9e15) || !Number.isInteger(t.revision) || !num(t.cycle, 0, 1e9) || !(t.taskId === null || str(t.taskId, 100)) || !str(t.taskTitle, 240) || !(t.sessionId === null || str(t.sessionId, 100)) || (t.status === 'running' && (!num(t.endsAt, 0, 9e15) || !num(t.startedAt, 0, 9e15)))) throw new Error(translate('m0076'));
  if (!a || typeof a.playing !== 'boolean' || !num(a.master, 0, 1) || SOUND_NAMES.some(k => !num(a.volumes?.[k], 0, 1)) || !(a.sleepAt === null || num(a.sleepAt, 0, 9e15))) throw new Error(translate('m0077'));
  if (!Array.isArray(d.sessionOutbox) || d.sessionOutbox.length > 1000) throw new Error(translate('m0078'));
  d.sessionOutbox.forEach(validateSession);
  if (d.lastFocusSession !== null) validateSession(d.lastFocusSession);
  if (d.timerNotice !== null && (!d.timerNotice || !str(d.timerNotice.id, 100) || !['focus','short','long'].includes(d.timerNotice.finishedPhase))) throw new Error(translate('m0079'));
  if (!Array.isArray(d.moods) || d.moods.length > 10000 || d.moods.some(m => !str(m.id, 100) || !num(m.at, 0, 9e15) || !Number.isInteger(m.value) || !num(m.value, 1, 5))) throw new Error(translate('m0080'));
  if (d.notes.some(n => !n || !str(n.id, 100) || !str(n.title, 120) || !str(n.text, 50000) || !num(n.updatedAt, 0, 9e15))) throw new Error(translate('m0081'));
  if (d.habits.some(h => !h || !str(h.id, 100) || !str(h.name, 120) || !Array.isArray(h.dates) || h.dates.length > 10000 || h.dates.some(x => !date(x)) || !(h.reminder === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(h.reminder)))) throw new Error(translate('m0082'));
  if (d.countdowns.some(c => !c || !str(c.id, 100) || !str(c.label, 120) || !date(c.date) || typeof c.pinned !== 'boolean') || d.countdowns.filter(c => c.pinned).length > 1) throw new Error(translate('m0083'));
  for (const key of ['notes','habits','countdowns','moods']) if (new Set(d[key].map(x => x.id)).size !== d[key].length) throw new Error(translate('m0005', {p0: key}));
  if (!d.music || !str(d.music.url, 2048) || (d.music.youtubeKey !== undefined && !str(d.music.youtubeKey, 200)) || !d.integrations || !str(d.integrations.unsplashKey, 200)) throw new Error(translate('m0084'));
}
