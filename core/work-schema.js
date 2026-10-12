import { defaults, validate, safeURL } from './schema.js';
import { validateNote } from './notes-schema.js';
import { journeyDefaults, validateJourneys } from './journeys-schema.js';
export const REASONS = ['interruption', 'unclear next step', 'too difficult', 'low energy', 'intentional pause'];
export const ENERGIES = ['deep', 'normal', 'light', 'recovery'];
export const workDefaults = () => ({ schemaVersion: 2, toolbox:{favorites:[],recent:[]}, journeys:journeyDefaults(), capsules: [], recovery: null, active: null,
  learning: false, recoveryEnabled: true, countSwitches: false, blocks: [], plan: { date: '', assignments: [] } });
const str = (v, n) => typeof v === 'string' && v.length <= n;
const num = (v, a, b) => Number.isFinite(v) && v >= a && v <= b;
const list = (v, n) => Array.isArray(v) && v.length <= n;
const assert = (ok, message) => { if (!ok) throw new Error(message); };
/** Upgrade local work preferences without interpreting future versions. */
export function migrateWork(raw) {
  if (raw != null) assert(raw && typeof raw === 'object' && !Array.isArray(raw) && [1,2].includes(raw.schemaVersion), 'Unsupported work context version.');
  return validateWork({ ...workDefaults(), ...raw, schemaVersion:2, journeys:{...journeyDefaults(),...raw?.journeys} });
}
/** Validate an offline capsule before saving or restoring a backup. */
export function validateCapsule(c) {
  assert(c && str(c.id, 100) && str(c.name, 100) && c.name.trim() && num(c.at, 0, 9e15) && str(c.sceneId, 100) && str(c.resumeNote, 2000), 'Invalid focus capsule.');
  assert(list(c.tabs, 100) && c.tabs.every(t => t && str(t.title, 240) && safeURL(t.url)), 'Invalid capsule tabs.');
  assert(list(c.notes, 100), 'Invalid capsule notes.');c.notes.forEach(validateNote);
  assert(c.timer && ['focus','short','long'].includes(c.timer.phase) && num(c.timer.remaining, 0, 10800000) && str(c.timer.taskTitle, 240) && (c.timer.taskId === null || str(c.timer.taskId, 100)), 'Invalid capsule timer.');
  const d = defaults();
  d.focus = c.focus; d.tasks = c.tasks; d.lists = c.lists;
  d.settings.background = c.background; d.timerConfig = c.timerConfig; d.audio = c.audio;
  validate(d);
  assert(c.tasks.length<=100 && c.lists.length<=100, 'A capsule can hold up to 100 tasks and lists.');
  return c;
}
export function validateEnvironment(e) {
  assert(e && num(e.minutes, 1, 180) && num(e.hour, 0, 23) && str(e.sound, 160) && str(e.wallpaper, 100) && num(e.breakMinutes, 1, 180) && num(e.interruptions, 0, 100000) && str(e.taskTitle, 240) && num(e.at, 0, 9e15), 'Invalid focus conditions.');
  assert(e.energy===undefined || ['deep','normal','light'].includes(e.energy), 'Invalid task energy observation.');
  assert(e.switchCounting===undefined || typeof e.switchCounting==='boolean', 'Invalid switch counting observation.');
  return e;
}
export function validateSample(s) {
  assert(s && str(s.id, 100) && typeof s.completed === 'boolean' && num(s.duration, 0, 10800000), 'Invalid local focus sample.');
  validateEnvironment(s); return s;
}
/** Bound all collections and reject executable URLs or malformed imported state. */
export function validateWork(w) {
  assert(w?.schemaVersion === 2 && ['learning','recoveryEnabled','countSwitches'].every(k => typeof w[k] === 'boolean'), 'Invalid focus privacy preferences.');
  validateJourneys(w.journeys);
  assert(w.toolbox && ['favorites','recent'].every(k=>list(w.toolbox[k],k==='favorites'?20:6)&&new Set(w.toolbox[k]).size===w.toolbox[k].length&&w.toolbox[k].every(id=>str(id,40)&&/^[a-z]+$/.test(id))), 'Invalid tool launcher preferences.');
  assert(list(w.capsules, 50) && new Set(w.capsules.map(c => c?.id)).size === w.capsules.length, 'Keep up to 50 capsules; delete one before saving another.');
  w.capsules.forEach(validateCapsule);
  assert(new TextEncoder().encode(JSON.stringify(w.capsules)).byteLength <= 3000000, 'Capsules exceed the local 3 MB limit. Remove a capsule or select fewer notes.');
  if (w.active) { assert(str(w.active.id, 100) && str(w.active.taskTitle,240) && num(w.active.at,0,9e15) && num(w.active.interruptions,0,100000), 'Invalid active recovery context.'); if(w.active.minutes!==undefined)validateEnvironment(w.active); }
  if (w.recovery) assert(str(w.recovery.id, 100) && str(w.recovery.taskTitle, 240) && (w.recovery.taskId === null || str(w.recovery.taskId, 100)) && str(w.recovery.next, 2000) && (w.recovery.reason === '' || REASONS.includes(w.recovery.reason)) && num(w.recovery.at, 0, 9e15) && num(w.recovery.interruptions, 0, 100000), 'Invalid recovery point.');
  assert(list(w.blocks, 24) && new Set(w.blocks.map(b => b?.id)).size === w.blocks.length && w.blocks.every(b => b && str(b.id, 100) && Number.isInteger(b.start) && Number.isInteger(b.end) && num(b.start, 0, 1439) && num(b.end, b.start + 1, 1440) && ENERGIES.includes(b.energy)), 'Invalid energy blocks.');
  const ordered = [...w.blocks].sort((a,b) => a.start-b.start);
  assert(ordered.every((b,i) => !i || ordered[i-1].end <= b.start), 'Energy blocks cannot overlap.');
  assert(w.plan && str(w.plan.date, 10) && list(w.plan.assignments, 100) && w.plan.assignments.every(a => a && str(a.taskId, 100) && str(a.blockId, 100) && num(a.minutes, 1, 180) && Number.isInteger(a.start) && num(a.start, 0, 1439)), 'Invalid daily plan.');
  return w;
}
