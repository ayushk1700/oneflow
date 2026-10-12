import { t as translate } from './i18n.js';
import { refinementDefaults, validateRefinement } from './refinement-schema.js';
import { extraDefaults, EXTRA_WIDGETS, validateExtra } from './stage2-schema.js';
import { stage3Defaults, validateStage3 } from './stage3-schema.js';
import { studioDefaults, mergeStudio, validateStudio } from './studio-schema.js';
export const SCHEMA_VERSION = 10;
export const WIDGETS = ['clock', 'focus', 'search', 'links', 'quotes', 'weather', 'tasks', ...EXTRA_WIDGETS];
/** A fresh default document; never share mutable defaults between callers. */
export function defaults() {
  return {
    ...extraDefaults(), ...stage3Defaults(), ...refinementDefaults(), schemaVersion: SCHEMA_VERSION,
    settings: {
      name: '', theme: 'dark', accent: '#c9d9b5', font: 'sans', clock24: false, units: 'celsius',
      reducedMotion: false, onboarding: false, engine: 'browser', language: 'en', contrast: 'normal',
      widgets: Object.fromEntries(WIDGETS.map(key => [key, !['links', 'countdowns'].includes(key)])),
      // The checked-in wallpaper folder is the visual starting point. The
      // generated alpine scene remains the safe fallback when media is absent.
      background: { kind: 'bundled', id: 'still-ec30a7337910c6ec', blur: 0, rotate: false, color: '#293c36' },
      appearance: { clockSize: 128, clockWeight: 400, panelOpacity: 94, overlay: 60, motionSpeed: 30, showBrand: true, showDate: true, showCaption: true, ambientClock: false, defaultView: 'home' },
      journal: { autosave: true, prompts: true, font: 'sans', fontSize: 18, width: 780, theme: 'light' },
      studio: studioDefaults()
    },
    focus: { date: '', text: '', completed: false },
    lists: [{ id: 'inbox', name: translate('m0056') }], tasks: [], links: [], favorites: [],
    weather: { location: null, cache: null },
    notes: [], habits: [], countdowns: [], notifications: []
  };
}
const string = (value, limit = 500) => typeof value === 'string' && value.length <= limit;
const taskDate=v=>v===undefined||v===''||typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const oneOf = (value, values) => values.includes(value);
/** Upgrade existing documents without dropping unknown future widget data. */
export function migrate(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(translate('m0057'));
  if (raw.schemaVersion !== undefined && (!Number.isInteger(raw.schemaVersion) || raw.schemaVersion < 0)) throw new Error(translate('m0058'));
  if ((raw.schemaVersion ?? 0) > SCHEMA_VERSION) throw new Error(translate('m0059'));
  const base = defaults();
  const result = { ...base, ...raw, schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...raw.settings,
      widgets: { ...base.settings.widgets, ...raw.settings?.widgets },
      background: { ...base.settings.background, ...raw.settings?.background } },
    weather: { ...base.weather, ...raw.weather }
  };
  result.settings.appearance = { ...base.settings.appearance, ...raw.settings?.appearance };
  result.settings.journal = { ...base.settings.journal, ...raw.settings?.journal };
  result.settings.studio = mergeStudio(raw.settings?.studio);
  // Upgrade only the complete old stock look. A customized accent, clock or
  // enabled studio is an intentional choice and remains untouched.
  if ((raw.schemaVersion ?? 0) < 8 && !result.settings.studio.enabled &&
      raw.settings?.accent?.toLowerCase() === '#7845df' &&
      raw.settings?.appearance?.clockSize === 150 && raw.settings.appearance.clockWeight === 750) {
    result.settings.accent = base.settings.accent;
    result.settings.appearance.clockSize = base.settings.appearance.clockSize;
    result.settings.appearance.clockWeight = base.settings.appearance.clockWeight;
    result.settings.studio.type.clock.size = base.settings.appearance.clockSize;
    result.settings.studio.type.clock.weight = base.settings.appearance.clockWeight;
  }
  if (!raw.settings?.studio) {
    result.settings.studio.type.clock.size = result.settings.appearance.clockSize;
    result.settings.studio.type.clock.weight = result.settings.appearance.clockWeight;
    result.settings.studio.type.journal.font = result.settings.journal.font;
    result.settings.studio.type.journal.size = result.settings.journal.fontSize;
  }
  if ((raw.schemaVersion ?? 0) < 5) result.settings.engine = 'browser';
  validate(result);
  return result;
}
/** Validate persisted and imported content before it can affect the UI. */
export function validate(doc) {
  if (!Array.isArray(doc.notifications) || doc.notifications.length > 40 || doc.notifications.some(n => !n || !string(n.id, 120) || !string(n.message, 500) || !['info','success','error'].includes(n.kind) || typeof n.read !== 'boolean' || !Number.isFinite(n.createdAt) || n.createdAt < 0)) throw new Error('Invalid notification history.');
  const s = doc.settings, b = s?.background;
  if (!s || !string(s.name, 80) || !oneOf(s.theme, ['light', 'dark', 'auto']) ||
      !/^#[0-9a-f]{6}$/i.test(s.accent) || !oneOf(s.font, ['sans', 'serif', 'mono']) ||
      !oneOf(s.units, ['celsius', 'fahrenheit']) || !oneOf(s.engine, ['browser', 'google', 'bing', 'duckduckgo']) ||
      !b || !oneOf(b.kind, ['bundled', 'solid', 'gradient', 'upload', 'animated', 'video', 'local-video']) || !string(b.id, 100) ||
      !Number.isFinite(b.blur) || b.blur < 0 || b.blur > 20 || !/^#[0-9a-f]{6}$/i.test(b.color) ||
      ['clock24', translate('m0060'), 'onboarding'].some(key => typeof s[key] !== 'boolean') ||
      typeof b.rotate !== 'boolean' || WIDGETS.some(key => typeof s.widgets[key] !== 'boolean')) throw new Error(translate('m0061'));
  const a = s.appearance, j = s.journal;
  validateStudio(s.studio);
  const range = (v, low, high) => Number.isFinite(v) && v >= low && v <= high;
  if (!a || !range(a.clockSize,80,220) || !range(a.clockWeight,300,800) || !range(a.panelOpacity,80,100) || !range(a.overlay,50,85) || !range(a.motionSpeed,10,90) || !oneOf(a.defaultView,['home','focus','ambient']) || ['showBrand','showDate','showCaption','ambientClock'].some(k => typeof a[k] !== 'boolean') || !j || typeof j.autosave !== 'boolean' || typeof j.prompts !== 'boolean' || !oneOf(j.font,['sans','serif','mono']) || !oneOf(j.theme,['light','dark','auto']) || !range(j.fontSize,14,28) || !range(j.width,480,1000)) throw new Error('Invalid appearance or journal preferences.');
  if (!doc.focus || !string(doc.focus.text, 240) || !string(doc.focus.date, 10) || typeof doc.focus.completed !== 'boolean') throw new Error(translate('m0062'));
  for (const key of ['lists', 'tasks', 'links', 'favorites', 'notes', 'habits', 'countdowns']) {
    if (!Array.isArray(doc[key]) || doc[key].length > 10000) throw new Error(translate('m0063', {p0: key}));
  }
  if (!doc.lists.length || doc.lists.some(x => !x || !string(x.id, 100) || !string(x.name, 80))) throw new Error(translate('m0064'));
  if (doc.tasks.some(x => !x || !string(x.id, 100) || !string(x.text, 240) || !doc.lists.some(l => l.id === x.listId) || typeof x.completed !== 'boolean' || !taskDate(x.dueDate))) throw new Error(translate('m0065'));
  if (doc.links.some(x => !x || !string(x.id, 100) || !string(x.title, 80) || !safeURL(x.url))) throw new Error(translate('m0066'));
  for (const key of ['lists', 'tasks', 'links']) if (new Set(doc[key].map(x => x.id)).size !== doc[key].length) throw new Error(translate('m0067', {p0: key}));
  if (doc.favorites.some(x => !string(x, 100))) throw new Error(translate('m0068'));
  const loc = doc.weather?.location;
  if (loc && (!string(loc.name, 200) || !Number.isFinite(loc.latitude) || Math.abs(loc.latitude) > 90 || !Number.isFinite(loc.longitude) || Math.abs(loc.longitude) > 180)) throw new Error(translate('m0069'));
  const cache = doc.weather?.cache;
  if (cache && (!Number.isFinite(cache.temperature) || !Number.isFinite(cache.code) || !Number.isFinite(cache.at) || !string(cache.key, 100))) throw new Error(translate('m0070'));
  validateExtra(doc);
  validateStage3(doc);
  validateRefinement(doc);
  return doc;
}
/** Restrict navigation to web URLs, never executable schemes. */
export function safeURL(value) {
  if (!string(value, 2048)) return null;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
