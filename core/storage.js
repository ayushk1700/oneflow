import { defaults, migrate, validate } from './schema.js';
import { emit } from './events.js';
const KEY = 'oneflow';
const ext = globalThis.chrome?.storage;
let current, syncTimer;
const subscribers = new Set();
const publish = value => { current = value; subscribers.forEach(fn => fn(structuredClone(value))); };
async function read() {
  if (ext) return (await ext.local.get(KEY))[KEY];
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : undefined;
}
async function write(value) {
  if (ext) await ext.local.set({ [KEY]: value });
  else localStorage.setItem(KEY, JSON.stringify(value));
}
/** Initialize local storage, migrations, and cross-tab change notifications. */
export async function init() {
  let raw = await read();
  if (!raw && ext?.sync) {
    try { const { preferences } = await ext.sync.get('preferences'); if (preferences) raw = { settings: preferences }; }
    catch { /* Local-first startup remains usable if sync is unavailable. */ }
  }
  current = migrate(raw);
  if (!raw || raw.schemaVersion !== current.schemaVersion) await write(current);
  if (ext) ext.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[KEY]?.newValue) {
      try { publish(migrate(changes[KEY].newValue)); } catch (error) { emit('error', error); }
    }
  });
  else addEventListener('storage', event => {
    if (event.key === KEY && event.newValue) {
      try { publish(migrate(JSON.parse(event.newValue))); } catch (error) { emit('error', error); }
    }
  });
  return get();
}
/** Return an isolated snapshot. */
export function get() { return structuredClone(current ?? defaults()); }
/** Listen for storage updates. */
export function subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }
/** Serialize read-modify-write operations across new tabs using an origin lock. */
export async function update(mutator) {
  const run = async () => {
    const next = migrate(await read());
    await mutator(next);
    validate(next);
    await write(next);
    publish(next);
    scheduleSync(next.settings);
    return get();
  };
  return navigator.locks.request('oneflow-storage', run);
}
/** Merge a top-level field through the same write boundary. */
export function set(key, value) { return update(doc => { doc[key] = structuredClone(value); }); }
/** Replace a validated document for restore/reset. */
export async function replace(value) {
  const next = migrate(value);
  return update(doc => { for (const key of Object.keys(doc)) delete doc[key]; Object.assign(doc, next); });
}
function scheduleSync(settings) {
  if (!ext?.sync) return;
  clearTimeout(syncTimer);
  const preferences = { name: settings.name, theme: settings.theme, accent: settings.accent, widgets: settings.widgets };
  syncTimer = setTimeout(async () => {
    try {
      const old = await ext.sync.get('preferences');
      if (JSON.stringify(old.preferences) !== JSON.stringify(preferences)) await ext.sync.set({ preferences });
    } catch { emit('toast', 'Saved on this device. Browser settings sync is unavailable.'); }
  }, 1800);
}
/** Clear synced personal preferences during an explicit full reset. */
export async function clearSync() { clearTimeout(syncTimer); if (ext?.sync) await ext.sync.remove('preferences'); }
