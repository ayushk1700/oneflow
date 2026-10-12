import { t as translate } from './i18n.js';
import { mergeStudio, validateStudio } from './studio-schema.js';
export const LAYOUT_WIDGETS = ['clock', 'focus', 'search', 'links', 'timer', 'audio-status', 'countdowns'];
export const stage3Defaults = () => ({
  scenes: [],
  sceneId: 'deep-work',
  sceneUndo: null,
  layout: {},
  flow: {
    active: false,
    block: false,
    startedAt: 0,
    snapshot: null
  },
  blocker: {
    enabled: false,
    mode: 'block',
    domains: [],
    overrides: [],
    log: []
  },
  rituals: [],
  ritualReminders: {
    morning: '',
    midday: '',
    evening: ''
  },
  ai: {
    enabled: false,
    key: '',
    model: 'gpt-4.1-mini'
  },
  backup: {
    reminderDays: 7,
    lastExport: 0,
    lastReminder: 0
  },
  diagnostics: []
});
const str = (v, n) => typeof v === 'string' && v.length <= n;
const num = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
/** Accept a hostname, never a path, wildcard, credential, or executable URL. */
export function domain(value) {
  if (typeof value !== 'string') throw new Error(translate('m0085'));
  const host = value.trim().toLowerCase().replace(/\.$/, '');
  if (host.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(host)) throw new Error(translate('m0086'));
  return host;
}
/** Validate a bounded grid layout, including imported scene layouts. */
export function validateLayout(layout) {
  if (!layout || Array.isArray(layout) || typeof layout !== 'object') throw new Error(translate('m0087'));
  for (const [key, cell] of Object.entries(layout)) if (!LAYOUT_WIDGETS.includes(key) || !cell || !['x', 'y', 'w', 'h'].every(k => Number.isInteger(cell[k])) || !num(cell.x, 0, 11) || !num(cell.y, 0, 29) || !num(cell.w, 2, 12 - cell.x) || !num(cell.h, 1, 10)) throw new Error(translate('m0088'));
}
/** Check a scene snapshot without allowing it to overwrite personal content. */
export function validateSnapshot(s, base) {
  if (!s || !s.settings || !s.timerConfig || !s.audio) throw new Error(translate('m0089'));
  const p = s.settings,
    b = p.background;
  if (!['dark', 'light', 'auto'].includes(p.theme) || !/^#[a-f\d]{6}$/i.test(p.accent) || !['sans', 'serif', 'mono'].includes(p.font) || !b || !['bundled', 'upload', 'solid', 'gradient', 'animated', 'video', 'local-video'].includes(b.kind) || !str(b.id, 100) || !/^#[a-f\d]{6}$/i.test(b.color) || !num(b.blur, 0, 20) || typeof b.rotate !== 'boolean' || !p.widgets || Object.keys(base.settings.widgets).some(k => typeof p.widgets[k] !== 'boolean')) throw new Error(translate('m0090'));
  if (p.contrast !== undefined && !['normal', 'strong'].includes(p.contrast)) throw new Error(translate('Invalid scene contrast.'));
  if (p.studio) validateStudio(mergeStudio(p.studio));
  const c = s.timerConfig,
    a = s.audio;
  if (['focus', 'short', 'long'].some(k => !num(c[k], 1, 180)) || !Number.isInteger(c.cycles) || !num(c.cycles, 1, 12) || ["autoFocus", "autoBreak", 'notifications', 'chime'].some(k => typeof c[k] !== 'boolean') || !num(a.master, 0, 1) || typeof a.playing !== 'boolean' || Object.keys(base.audio.volumes).some(k => !num(a.volumes?.[k], 0, 1))) throw new Error(translate('m0091'));
  validateLayout(s.layout);
}
/** Validate all Stage 3 state before storage or restore. */
export function validateStage3(d) {
  if (!['en', 'hi'].includes(d.settings.language)) throw new Error(translate('m0092'));
  validateLayout(d.layout);
  if (!Array.isArray(d.scenes) || d.scenes.length > 50 || new Set(d.scenes.map(s => s.id)).size !== d.scenes.length) throw new Error(translate('m0093'));
  for (const s of d.scenes) {
    if (!str(s.id, 100) || !str(s.name, 80) || !s.name.trim()) throw new Error(translate('m0094'));
    validateSnapshot(s.snapshot, d);
  }
  if (!str(d.sceneId, 100)) throw new Error(translate('m0095'));
  if (d.sceneUndo) validateSnapshot(d.sceneUndo, d);
  if (!d.flow || typeof d.flow.active !== 'boolean' || typeof d.flow.block !== 'boolean' || !num(d.flow.startedAt, 0, 9e15)) throw new Error(translate('m0096'));
  if (d.flow.snapshot) validateSnapshot(d.flow.snapshot, d);
  const b = d.blocker;
  if (!b || typeof b.enabled !== 'boolean' || !['block', 'allow'].includes(b.mode) || !Array.isArray(b.domains) || b.domains.length > 100 || b.domains.some(x => domain(x) !== x) || !Array.isArray(b.overrides) || b.overrides.length > 100 || b.overrides.some(x => domain(x.host) !== x.host || !num(x.until, 0, 9e15)) || !Array.isArray(b.log) || b.log.length > 200 || b.log.some(x => !str(x.id, 100) || domain(x.host) !== x.host || !num(x.at, 0, 9e15))) throw new Error(translate('m0097'));
  if (!Array.isArray(d.rituals) || d.rituals.length > 10000 || d.rituals.some(r => !str(r.id, 100) || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || !['morning', 'midday', 'evening'].includes(r.kind) || !str(r.text, 5000) || !str(r.focus, 240) || !Array.isArray(r.top) || r.top.length > 3 || r.top.some(x => !str(x, 240)) || !num(r.at, 0, 9e15))) throw new Error(translate('m0098'));
  if (!d.ritualReminders || ['morning', 'midday', 'evening'].some(k => !(d.ritualReminders[k] === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(d.ritualReminders[k])))) throw new Error(translate('m0099'));
  if (!d.ai || typeof d.ai.enabled !== 'boolean' || !str(d.ai.key, 300) || !/^[a-zA-Z0-9._:-]{1,100}$/.test(d.ai.model)) throw new Error(translate('m0100'));
  if (!d.backup || ![0, 7, 14, 30].includes(d.backup.reminderDays) || !num(d.backup.lastExport, 0, 9e15) || !num(d.backup.lastReminder, 0, 9e15)) throw new Error(translate('m0101'));
  if (!Array.isArray(d.diagnostics) || d.diagnostics.length > 100 || d.diagnostics.some(x => !num(x.at, 0, 9e15) || !str(x.code, 80))) throw new Error(translate('m0102'));
}
