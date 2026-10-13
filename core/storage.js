import { t as translate } from './i18n.js';
import { defaults, migrate, validate } from './schema.js';
import { emit } from './events.js';
const KEY = 'oneflow';
const ext = globalThis.chrome?.storage;
let current, syncTimer, initialized;
const subscribers = new Set();
const publish = value => { current = value; subscribers.forEach(fn => fn(structuredClone(value))); };
async function read() {
  try { return ext ? (await ext.local.get(KEY))[KEY] : (await import('./storage-recovery.js')).read(KEY); }
  catch { emit('toast', 'Browser storage could not be read. Safe defaults are available.'); return current; }
}
async function write(value) {
  try { if (ext) await ext.local.set({ [KEY]: value }); else localStorage.setItem(KEY, JSON.stringify(value)); }
  catch { throw new Error('Changes could not be saved. Check browser storage space and retry.'); }
}
/** Initialize local storage, migrations, and cross-tab change notifications. */
export async function init() {
  if (initialized) return initialized;
  initialized = initialize().catch(error => { initialized = null; throw error; });
  return initialized;
}
async function initialize() {
  // Lock seeding so a new worker cannot overwrite the user's first edit.
  return navigator.locks.request('oneflow-storage', initializeLocked);
}
async function initializeLocked() {
  await ext?.local.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' });
  await ext?.sync?.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' });
  let raw = await read(), recoveryFailed = false;
  if (!raw && ext?.sync) {
    try { const { preferences } = await ext.sync.get('preferences'); if (preferences) raw = { settings: preferences }; }
    catch { /* Local-first startup remains usable if sync is unavailable. */ }
  }
  try { current = migrate(raw); }
  catch {
    try { if (ext) await ext.local.set({ oneflowRecovery: raw }); else localStorage.setItem('oneflow-recovery:oneflow', JSON.stringify(raw)); } catch { recoveryFailed = true; }
    current = defaults(); raw = undefined;
    emit('toast', 'Invalid stored data was replaced with safe defaults. A recovery copy was kept when storage allowed it.');
  }
  if (!recoveryFailed && (!raw || raw.schemaVersion !== current.schemaVersion)) { try { await write(current); } catch (error) { emit('toast', error.message); } }
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
/** In-memory customization preview; the settings engine owns its debounced durable write. */
export function previewSettings(settings) { publish({ ...get(), settings }); }
/** Read persisted state for backups. */
export async function readLatest() { return migrate(await read()); }
/** Listen for storage updates. */
export function subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }
/** Serialize edits; inbox changes may skip preference sync. */
export async function update(mutator, { sync = true } = {}) {
  const run = async () => {
    const next = migrate(await read());
    await mutator(next);
    validate(next);
    await write(next);
    publish(next);
    if (sync) scheduleSync(next.settings);
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
    } catch { emit('toast', translate('m0103')); }
  }, 1800);
}
/** Clear synced personal preferences during an explicit full reset. */
export async function clearSync() { clearTimeout(syncTimer); if (ext?.sync) await ext.sync.remove('preferences'); }
/** Session state survives worker suspension only. */
export async function sessionGet(key) { return ext?.session ? (await ext.session.get(key))[key] : undefined; }
export async function sessionSet(key, value) { if (ext?.session) await (value === null ? ext.session.remove(key) : ext.session.set({[key]:value})); }
export async function clearSession() { if (ext?.session) await ext.session.clear(); }
export async function clearRecovery() { if (ext) await ext.local.remove(['oneflowRecovery','focusWorkRecovery','notesPreferencesRecovery']); else (await import('./storage-recovery.js')).clearRecovery(); }
/** Measure local storage use. */
export async function usage() { return ext ? ext.local.getBytesInUse(null) : new Blob([JSON.stringify(get())]).size; }
/** Versioned local work data. */
export async function readWork(schema) {
  const { migrateWork } = schema || await import('./work-schema.js');
  try { return migrateWork(ext ? (await ext.local.get('focusWork')).focusWork : (await import('./storage-recovery.js')).read('focusWork')); }
  catch { emit('toast', 'Work preferences could not be read. Safe defaults were loaded.'); return migrateWork(); }
}
/** Serialize work edits. */
export async function updateWork(change, schema) {
  return navigator.locks.request('oneflow-work', async () => {
    const next = await readWork(schema); await change(next);
    (schema || await import('./work-schema.js')).validateWork(next);
    if (ext) await ext.local.set({ focusWork: next }); else localStorage.setItem('focusWork', JSON.stringify(next));
    return next;
  });
}
/** Local-only capture preferences; never sent to browser sync. */
export async function getNotesPreferences() {
  const value = ext ? (await ext.local.get('notesPreferences')).notesPreferences : (await import('./storage-recovery.js')).read('notesPreferences');
  return (await import('./notes-preferences.js')).normalize(value);
}
/** Save small capture preferences independently of the dashboard document. */
export async function setNotesPreferences(value) {
  const next = (await import('./notes-preferences.js')).normalize(value);
  if (ext) await ext.local.set({ notesPreferences: next }); else localStorage.setItem('notesPreferences', JSON.stringify(next));
}
