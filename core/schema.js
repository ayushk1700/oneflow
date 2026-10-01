export const SCHEMA_VERSION = 1;
export const WIDGETS = ['clock', 'focus', 'search', 'links', 'quotes', 'weather', 'tasks'];
/** A fresh default document; never share mutable defaults between callers. */
export function defaults() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      name: '', theme: 'dark', accent: '#d6e9ba', font: 'sans', clock24: false, units: 'celsius',
      reducedMotion: false, onboarding: false, engine: 'google',
      widgets: Object.fromEntries(WIDGETS.map(key => [key, true])),
      background: { kind: 'bundled', id: 'alpine', blur: 0, rotate: false, color: '#293c36' }
    },
    focus: { date: '', text: '', completed: false },
    lists: [{ id: 'inbox', name: 'My day' }], tasks: [], links: [], favorites: [],
    weather: { location: null, cache: null },
    notes: [], habits: [], countdowns: []
  };
}
const string = (value, limit = 500) => typeof value === 'string' && value.length <= limit;
const oneOf = (value, values) => values.includes(value);
/** Upgrade existing documents without dropping unknown future widget data. */
export function migrate(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid data document.');
  if (raw.schemaVersion !== undefined && (!Number.isInteger(raw.schemaVersion) || raw.schemaVersion < 0)) throw new Error('Invalid schema version.');
  if ((raw.schemaVersion ?? 0) > SCHEMA_VERSION) throw new Error('This backup needs a newer ONEFLOW version.');
  const base = defaults();
  const result = { ...base, ...raw, schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...raw.settings,
      widgets: { ...base.settings.widgets, ...raw.settings?.widgets },
      background: { ...base.settings.background, ...raw.settings?.background } },
    weather: { ...base.weather, ...raw.weather }
  };
  validate(result);
  return result;
}
/** Validate persisted and imported content before it can affect the UI. */
export function validate(doc) {
  const s = doc.settings, b = s?.background;
  if (!s || !string(s.name, 80) || !oneOf(s.theme, ['light', 'dark', 'auto']) ||
      !/^#[0-9a-f]{6}$/i.test(s.accent) || !oneOf(s.font, ['sans', 'serif', 'mono']) ||
      !oneOf(s.units, ['celsius', 'fahrenheit']) || !oneOf(s.engine, ['google', 'bing', 'duckduckgo']) ||
      !b || !oneOf(b.kind, ['bundled', 'solid', 'gradient', 'upload']) || !string(b.id, 100) ||
      !Number.isFinite(b.blur) || b.blur < 0 || b.blur > 20 || !/^#[0-9a-f]{6}$/i.test(b.color) ||
      ['clock24', 'reducedMotion', 'onboarding'].some(key => typeof s[key] !== 'boolean') ||
      typeof b.rotate !== 'boolean' || WIDGETS.some(key => typeof s.widgets[key] !== 'boolean')) throw new Error('Invalid settings in backup.');
  if (!doc.focus || !string(doc.focus.text, 240) || !string(doc.focus.date, 10) || typeof doc.focus.completed !== 'boolean') throw new Error('Invalid daily focus.');
  for (const key of ['lists', 'tasks', 'links', 'favorites', 'notes', 'habits', 'countdowns']) {
    if (!Array.isArray(doc[key]) || doc[key].length > 10000) throw new Error(`Invalid ${key} data.`);
  }
  if (!doc.lists.length || doc.lists.some(x => !x || !string(x.id, 100) || !string(x.name, 80))) throw new Error('Invalid task lists.');
  if (doc.tasks.some(x => !x || !string(x.id, 100) || !string(x.text, 240) || !doc.lists.some(l => l.id === x.listId) || typeof x.completed !== 'boolean')) throw new Error('Invalid tasks.');
  if (doc.links.some(x => !x || !string(x.id, 100) || !string(x.title, 80) || !safeURL(x.url))) throw new Error('Quick links must use http or https.');
  for (const key of ['lists', 'tasks', 'links']) if (new Set(doc[key].map(x => x.id)).size !== doc[key].length) throw new Error(`Duplicate IDs in ${key}.`);
  if (doc.favorites.some(x => !string(x, 100))) throw new Error('Invalid quote favorites.');
  const loc = doc.weather?.location;
  if (loc && (!string(loc.name, 200) || !Number.isFinite(loc.latitude) || Math.abs(loc.latitude) > 90 || !Number.isFinite(loc.longitude) || Math.abs(loc.longitude) > 180)) throw new Error('Invalid weather location.');
  const cache = doc.weather?.cache;
  if (cache && (!Number.isFinite(cache.temperature) || !Number.isFinite(cache.code) || !Number.isFinite(cache.at) || !string(cache.key, 100))) throw new Error('Invalid cached weather.');
  return doc;
}
/** Restrict navigation to web URLs, never executable schemes. */
export function safeURL(value) {
  if (!string(value, 2048)) return null;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
