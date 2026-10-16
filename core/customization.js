import * as storage from './storage.js';
import { emit } from './events.js';
import { validateSettings, migrateSettings, SETTINGS_VERSION } from './customization-schema.js';
import {normalizeHotkey} from './power-hotkeys.js';
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
  next.theme.mode = settings.theme==='light'?'light':'dark'; next.theme.accent = settings.accent;
  next.theme.typography.family = settings.font === 'mono' ? 'mono' : 'system';
  Object.assign(next.background,structuredClone(settings.background)); Object.assign(next.widgets,structuredClone(settings.widgets));
  next.widgets.preferences.greeting.name=settings.name;
  next.widgets.preferences.weather.units=settings.units;
  const config=storage.get().timerConfig;
  for(const key of ['focus','short','long','cycles','autoFocus','autoBreak','notifications'])next.widgets.preferences.timer[key]=config[key];
  next.widgets.preferences.timer.sound=config.chime?settings.studio.interaction.sound:'none';
  next.widgets.preferences.timer.volume=settings.studio.interaction.volume;
  next.behavior.clock24 = settings.clock24; next.behavior.startupView = settings.appearance.defaultView;
  next.behavior.spaceId=storage.activeSpaceId();
  next.behavior.language=settings.language;
  for(const[action,binding]of Object.entries(settings.studio.interaction.keys))next.behavior.hotkeys[action]=normalizeHotkey(binding);
  if(Object.values(next.behavior.hotkeys).filter(key=>key==='S').length>1)next.behavior.hotkeys.settings='Alt+Shift+P';
  next.widgets.preferences.sounds.master=storage.get().audio.master;next.widgets.preferences.sounds.volumes=storage.get().audio.volumes;next.widgets.preferences.sounds.mixes=structuredClone(settings.studio.soundscapes);
  next.accessibility.reduceMotion = settings.reducedMotion; next.accessibility.highContrast = settings.contrast === 'strong';
  return next;
}
/** Adapt the canonical object to existing widget APIs without replacing personal records. */
export function legacySettings(settings, value = current) {
  const next = structuredClone(settings);
  next.customization = structuredClone(value);
  next.theme = value.theme.mode;
  next.accent = value.theme.accent; next.background = legacyBackground(value.background);
  next.widgets = Object.fromEntries(Object.entries(value.widgets).filter(([,enabled])=>typeof enabled==='boolean').map(([key, enabled]) => [key, value.behavior.zen ? key === 'clock' : enabled]));
  next.name=value.widgets.preferences.greeting.name;next.units=value.widgets.preferences.weather.units;
  next.studio.interaction.sound=value.widgets.preferences.timer.sound;next.studio.interaction.volume=value.widgets.preferences.timer.volume;
  next.clock24 = value.behavior.clock24; next.appearance.defaultView = value.behavior.startupView;
  next.appearance.panelOpacity = value.theme.glass.opacity;
  next.reducedMotion = value.accessibility.reduceMotion; next.contrast = value.accessibility.highContrast ? 'strong' : 'normal';
  next.language=value.behavior.language;next.studio.soundscapes=structuredClone(value.widgets.preferences.sounds.mixes);
  next.journal.theme='auto';
  return next;
}
function legacyBackground(value){return {kind:value.kind==='url'?'upload':value.kind==='animated-gradient'?'gradient':value.kind,id:value.id,color:value.color,blur:value.blur,rotate:value.rotate};}
function timerPreferences(document,value=current){const prefs=value.widgets.preferences.timer,config={...document.timerConfig};for(const key of ['focus','short','long','cycles','autoFocus','autoBreak','notifications'])config[key]=prefs[key];config.chime=prefs.sound!=='none';return config;}
function preview() {
  applying = true;
  storage.previewSettings(legacySettings(storage.get().settings),{timerConfig:timerPreferences(storage.get())});
  applying = false; publish();
}
/** Load one versioned object. Invalid customization falls back without deleting other data. */
export async function init() {
  if (initialized) return initialized;
  initialized = (async () => {
    await storage.init(); base = await loadDefaults();
    const settings = storage.get().settings;
    try { current = settings.customization ? migrateSettings(settings.customization, base) : fromExisting(settings); pending=!settings.customization||settings.customization.schemaVersion!==SETTINGS_VERSION; }
    catch { current = fromExisting(settings); emit('toast', 'Invalid customization was replaced with safe defaults. Your other records were kept.'); pending = true; }
    saved = structuredClone(current);
    if(current.behavior.spaceId!==storage.activeSpaceId()){current.behavior.spaceId=storage.activeSpaceId();pending=true;}
    if(pending&&settings.customization?.schemaVersion===1)current.widgets.preferences=fromExisting(settings).widgets.preferences;
    if(!settings.customization||settings.customization.schemaVersion<3){const legacy=fromExisting(settings);current.widgets.preferences.sounds=legacy.widgets.preferences.sounds;current.behavior.language=settings.language;current.behavior.hotkeys=legacy.behavior.hotkeys;}
    storage.subscribe(data => {
      if (applying || pending) return;
      try {
        const incoming = data.settings.customization ? migrateSettings(data.settings.customization, base) : fromExisting(data.settings);
        // Legacy controls remain supported and feed back into the same canonical settings.
        if(JSON.stringify(legacyBackground(incoming.background))!==JSON.stringify(data.settings.background))Object.assign(incoming.background,structuredClone(data.settings.background));
        if (!incoming.behavior.zen) for(const[key,enabled]of Object.entries(data.settings.widgets))if(typeof enabled==='boolean')incoming.widgets[key]=enabled;
        incoming.theme.mode = data.settings.theme==='light'?'light':'dark';
        incoming.theme.accent = data.settings.accent; incoming.behavior.clock24 = data.settings.clock24;
        incoming.widgets.preferences.greeting.name=data.settings.name;incoming.widgets.preferences.weather.units=data.settings.units;
        for(const key of ['focus','short','long','cycles','autoFocus','autoBreak','notifications'])incoming.widgets.preferences.timer[key]=data.timerConfig[key];
        incoming.widgets.preferences.sounds.master=data.audio.master;incoming.widgets.preferences.sounds.volumes=structuredClone(data.audio.volumes);incoming.widgets.preferences.sounds.mixes=structuredClone(data.settings.studio.soundscapes);incoming.behavior.language=data.settings.language;
        incoming.accessibility.reduceMotion = data.settings.reducedMotion; incoming.accessibility.highContrast = data.settings.contrast === 'strong';
        if (JSON.stringify(incoming) !== JSON.stringify(current)) {if(incoming.behavior.spaceId!==current.behavior.spaceId){undoStack=[];redoStack=[];}commit(incoming, false);}
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
export function reset(section) { const next = get(),spaceId=next.behavior.spaceId; if (section) { if (!Object.hasOwn(base, section) || section === 'schemaVersion') throw new Error('Unknown settings section.'); next[section] = structuredClone(base[section]); } else Object.assign(next, defaults()); next.behavior.spaceId=spaceId;commit(next); }
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
  // Finish the durable write before reconfiguring the worker: it may need the
  // backup lock already held by a wallpaper upload or a space switch.
  writing = (async()=>{await storage.update(document => { document.settings = legacySettings(document.settings, snapshot); document.timerConfig=timerPreferences(document,snapshot);document.audio.master=snapshot.widgets.preferences.sounds.master;document.audio.volumes=structuredClone(snapshot.widgets.preferences.sounds.volumes);document.backup.reminderDays=snapshot.behavior.backupReminderDays; }, { sync: true });if(saved?.behavior.privacy.sync&&!snapshot.behavior.privacy.sync)await storage.clearSync().catch(error=>emit('error',error));saved=snapshot;if(JSON.stringify(current)===JSON.stringify(snapshot))pending=false;})();
  try { await writing; }
  catch (error) { emit('toast', 'Settings could not be saved. Keep this tab open and retry.'); throw error; }
  finally { writing = null; publish(); }
  if(globalThis.chrome?.runtime)import('./timer-client.js').then(module=>module.backgroundSync()).catch(error=>{emit('error',error);emit('toast','Settings were saved, but background services could not refresh. Reopen ONEFLOW to retry.');});
}
export function importJSON(text) {
  if (new Blob([text]).size > 512 * 1024) throw new Error('Settings file must be no larger than 512 KB.');
  let value;
  try { value = JSON.parse(text); } catch { throw new Error('Settings file is not valid JSON.'); }
  const migrated=migrateSettings(value,base),ids=storage.get().spaces?.profiles?.map(profile=>profile.id)||['default'];
  if(migrated.behavior.spaceSchedule.some(rule=>!ids.includes(rule.spaceId)))throw new Error('Imported schedules refer to missing spaces. Remove those schedules or restore a full backup.');
  if(migrated.behavior.automation.rules.some(rule=>rule.conditions.spaceId&&!ids.includes(rule.conditions.spaceId)||rule.actions.some(action=>action.type==='space'&&!ids.includes(action.value))))throw new Error('Imported rules refer to missing spaces. Remove those rules or restore a full backup.');
  migrated.behavior.spaceId=current.behavior.spaceId;replace(migrated);
}
export function exportJSON() { return JSON.stringify(get(), null, 2); }
