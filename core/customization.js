import * as storage from './storage.js';
import { emit } from './events.js';
import { validateSettings, migrateSettings, resolveTheme } from './customization-schema.js';
let base, current, saved, initialized, timer, writing, applying = false, pending = false, undoStack = [], redoStack = [], lastPath, lastEdit = 0;
const listeners = new Set();
const publish = () => listeners.forEach(callback => callback(get()));
async function loadDefaults() {
  const response = await fetch(new URL('../data/customization-defaults.json', import.meta.url));
  if (!response.ok) throw new Error('Local customization defaults could not be loaded.');
  return response.json();
}
function fromExisting(settings) {
  const next = structuredClone(base);
  next.theme.mode = settings.theme; next.theme.accent = settings.accent;
  next.theme.typography.family = settings.font === 'mono' ? 'mono' : 'system';
  next.background = structuredClone(settings.background); next.widgets = structuredClone(settings.widgets);
  next.behavior.clock24 = settings.clock24; next.behavior.startupView = settings.appearance.defaultView;
  next.accessibility.reduceMotion = settings.reducedMotion; next.accessibility.highContrast = settings.contrast === 'strong';
  return next;
}
/** Adapt the canonical object to existing widget APIs without replacing personal records. */
export function legacySettings(settings, value = current) {
  const next = structuredClone(settings);
  next.customization = structuredClone(value);
  next.theme = value.theme.mode === 'scheduled' ? resolveTheme(value.theme, false) : value.theme.mode;
  next.accent = value.theme.accent; next.background = structuredClone(value.background);
  next.widgets = Object.fromEntries(Object.entries(value.widgets).map(([key, enabled]) => [key, value.behavior.zen ? key === 'clock' : enabled]));
  next.clock24 = value.behavior.clock24; next.appearance.defaultView = value.behavior.startupView;
  next.appearance.panelOpacity = value.theme.glass.opacity;
  next.reducedMotion = value.accessibility.reduceMotion; next.contrast = value.accessibility.highContrast ? 'strong' : 'normal';
  return next;
}
function preview() {
  applying = true;
  storage.previewSettings(legacySettings(storage.get().settings));
  applying = false; publish();
}
/** Load one versioned object. Invalid customization falls back without deleting other data. */
export async function init() {
  if (initialized) return initialized;
  initialized = (async () => {
    await storage.init(); base = await loadDefaults();
    const settings = storage.get().settings;
    try { current = settings.customization ? migrateSettings(settings.customization, base) : fromExisting(settings); }
    catch { current = fromExisting(settings); emit('toast', 'Invalid customization was replaced with safe defaults. Your other records were kept.'); pending = true; }
    saved = structuredClone(current);
    storage.subscribe(data => {
      if (applying || pending) return;
      try {
        const incoming = data.settings.customization ? migrateSettings(data.settings.customization, base) : fromExisting(data.settings);
        // Legacy controls remain supported and feed back into the same canonical settings.
        incoming.background = structuredClone(data.settings.background);
        if (!incoming.behavior.zen) incoming.widgets = structuredClone(data.settings.widgets);
        if (incoming.theme.mode !== 'scheduled') incoming.theme.mode = data.settings.theme;
        incoming.theme.accent = data.settings.accent; incoming.behavior.clock24 = data.settings.clock24;
        incoming.accessibility.reduceMotion = data.settings.reducedMotion; incoming.accessibility.highContrast = data.settings.contrast === 'strong';
        if (JSON.stringify(incoming) !== JSON.stringify(current)) commit(incoming, false);
      } catch { emit('toast', 'A customization update was invalid. Your current view was kept.'); }
    });
    if (pending) await flush();
    return get();
  })().catch(error => { initialized = null; throw error; });
  return initialized;
}
export function get() { return structuredClone(current); }
export function defaults() { return structuredClone(base); }
export function subscribe(callback) { listeners.add(callback); return () => listeners.delete(callback); }
function commit(value, history = true, path = '') {
  validateSettings(value, base);
  if (JSON.stringify(value) === JSON.stringify(current)) return;
  if (history) {
    if (!path || path !== lastPath || Date.now() - lastEdit > 500) undoStack.push(get());
    if (undoStack.length > 60) undoStack.shift(); redoStack = []; lastPath = path; lastEdit = Date.now();
  }
  current = structuredClone(value); pending = true; preview(); clearTimeout(timer);
  timer = setTimeout(() => flush().catch(error => emit('error', error)), 250);
}
/** Change only a validated path and immediately notify the UI. */
export function set(path, value) {
  const next = get(), parts = path.split('.'), key = parts.pop();
  let target = next;
  for (const part of parts) { if (!Object.hasOwn(target, part) || !target[part] || typeof target[part] !== 'object') throw new Error('Unknown settings path.'); target = target[part]; }
  if (!Object.hasOwn(target, key)) throw new Error('Unknown settings path.');
  target[key] = structuredClone(value); commit(next, true, path);
}
export function replace(value) { commit(migrateSettings(value, base)); }
export function reset(section) { const next = get(); if (section) { if (!Object.hasOwn(base, section) || section === 'schemaVersion') throw new Error('Unknown settings section.'); next[section] = structuredClone(base[section]); } else Object.assign(next, defaults()); commit(next); }
export function undo() { if (!undoStack.length) return; redoStack.push(get()); commit(undoStack.pop(), false); lastPath = null; }
export function redo() { if (!redoStack.length) return; undoStack.push(get()); commit(redoStack.pop(), false); lastPath = null; }
export const history = () => ({ undo: undoStack.length > 0, redo: redoStack.length > 0 });
export const isSaving = () => pending || Boolean(writing);
/** Flush a debounced change before close/import/export; write failures retain the draft. */
export async function flush() {
  clearTimeout(timer);
  if (writing) { await writing; return flush(); }
  if (!pending) return;
  const snapshot = get();
  writing = storage.update(document => { document.settings = legacySettings(document.settings, snapshot); }, { sync: false });
  try { await writing; saved = snapshot; if (JSON.stringify(current) === JSON.stringify(snapshot)) pending = false; }
  catch (error) { emit('toast', 'Settings could not be saved. Keep this tab open and retry.'); throw error; }
  finally { writing = null; publish(); }
}
export function importJSON(text) {
  if (new Blob([text]).size > 64 * 1024) throw new Error('Settings file must be no larger than 64 KB.');
  let value;
  try { value = JSON.parse(text); } catch { throw new Error('Settings file is not valid JSON.'); }
  replace(value);
}
export function exportJSON() { return JSON.stringify(get(), null, 2); }
