import { t as translate } from './i18n.js';
import * as storage from './storage.js';
import * as db from './db.js';
import { migrate, defaults, SCHEMA_VERSION } from './schema.js';
import { validateJournal, validateSession } from './stage2-schema.js';
import { remaining } from './timer-logic.js';
import { validateNote, validateNoteMedia } from './notes-schema.js';
import { migrateWork, validateSample, workDefaults } from './work-schema.js';
const MAX_BYTES = 128 * 1024 * 1024;
const MAX_IMAGE = 8 * 1024 * 1024;
const dataURL = blob => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
/** Snapshot all extension data, including uploaded image blobs. */
export async function exportData() {
  return navigator.locks.request('oneflow-timer', () => navigator.locks.request('oneflow-backup', async () => {
    const records = Object.fromEntries(await Promise.all(db.STORES.map(async key => [key, await db.getAll(key)])));
    records.images = await Promise.all(records.images.map(async ({ blob, ...record }) => ({ ...record, data: await dataURL(blob) })));
    records.wallpapers = await Promise.all(records.wallpapers.map(async ({ blob, ...record }) => ({ ...record, data: await dataURL(blob) })));
    records.noteMedia = await Promise.all(records.noteMedia.map(async ({ blob, ...record }) => ({ ...record, data: await dataURL(blob) })));
    const local = await storage.readLatest();
    if (local.timer.status === 'running') { local.timer.remaining = remaining(local.timer, Date.now()); local.timer.status = 'paused'; local.timer.endsAt = null; }
    local.audio.playing = false; local.audio.sleepAt = null;
    local.flow = { active: false, block: false, startedAt: 0, snapshot: null }; local.blocker.overrides = []; local.ai.enabled = false;
    const work = await storage.readWork(); work.active=null;
    return { app: translate('m0630'), schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), local, database: records, work, notesPreferences: await storage.getNotesPreferences() };
  }));
}
/** Validate an entire backup before touching either storage backend. */
export async function parseBackup(text) {
  if (new Blob([text]).size > MAX_BYTES) throw new Error(translate('m0002'));
  const input = JSON.parse(text, (key, value) => {
    if (['__proto__','constructor','prototype'].includes(key)) throw new Error(translate('m0681'));
    return value;
  });
  if (input?.app !== translate('m0630') || !Number.isInteger(input.schemaVersion) || input.schemaVersion < 1 || input.schemaVersion > SCHEMA_VERSION || !input.database || !input.local || typeof input.local !== 'object') throw new Error(translate('m0003'));
  const local = migrate(input.local), records = {};
  for (const key of db.STORES) {
    const rows = ['notes', 'noteMedia', 'focusSamples'].includes(key) || key === 'wallpapers' && input.schemaVersion < 6 ? input.database[key] || [] : input.database[key];
    if (!Array.isArray(rows) || rows.length > 100000 || rows.some(x => !x || typeof x.id !== 'string' || x.id.length > 100)) throw new Error(translate('m0004', {p0: key}));
    if (new Set(rows.map(x => x.id)).size !== rows.length) throw new Error(translate('m0005', {p0: key}));
    records[key] = rows;
  }
  records.journal.forEach(validateJournal); records.sessions.forEach(validateSession);
  if(records.focusSamples.length>500)throw new Error('Focus DNA backup exceeds 500 observations.');
  records.focusSamples.forEach(validateSample);
  const work=migrateWork(input.work);work.active=null;
  records.notes.forEach(validateNote);
  records.noteMedia = records.noteMedia.map(({ data, ...record }) => {
    if (typeof data !== 'string' || !/^data:(image\/(png|jpeg|webp)|audio\/(webm|ogg|mp4)(;codecs=[\w,-]+)?);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error('Invalid note attachment backup.');
    const [meta, encoded] = data.split(','), bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    return validateNoteMedia({ ...record, blob: new Blob([bytes], { type: meta.slice(5, meta.lastIndexOf(';base64')) }) });
  });
  for (const note of records.notes) for (const id of note.media) if (!records.noteMedia.some(m => m.id === id && m.noteId === note.id)) throw new Error('Missing note attachment in backup.');
  if (records.noteMedia.some(m => !records.notes.some(n => n.id === m.noteId && n.media.includes(m.id)))) throw new Error('Orphan note attachment in backup.');
  records.images = await Promise.all(records.images.map(async ({ data, ...record }) => {
    if (typeof data !== 'string' || !/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error(translate('m0006'));
    const [meta, encoded] = data.split(','), bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    if (bytes.length > MAX_IMAGE) throw new Error(translate('m0007'));
    const blob = new Blob([bytes], { type: meta.slice(5, meta.indexOf(';')) });
    const bitmap = await createImageBitmap(blob); bitmap.close();
    return { ...record, blob };
  }));
  if (local.settings.background.kind === 'upload' && !records.images.some(x => x.id === local.settings.background.id)) throw new Error(translate('m0008'));
  records.wallpapers = records.wallpapers.map(({ data, ...record }) => {
    if (typeof data !== 'string' || !/^data:video\/(mp4|webm);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error('Invalid live wallpaper backup.');
    const [meta, encoded] = data.split(','), bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    if (bytes.length > 16 * 1024 * 1024) throw new Error('Live wallpaper exceeds 16 MB.');
    return { ...record, blob: new Blob([bytes], { type: meta.slice(5, meta.indexOf(';')) }) };
  });
  if (local.settings.background.kind === 'video' && !records.wallpapers.some(x => x.id === local.settings.background.id)) throw new Error('Selected live wallpaper is missing from the backup.');
  if (local.timer.status === 'running') { local.timer.remaining = remaining(local.timer, Date.parse(input.exportedAt) || Date.now()); local.timer.status = 'paused'; local.timer.endsAt = null; }
  local.audio.playing = false; local.audio.sleepAt = null; local.timerNotice = null;
  local.flow = { active: false, block: false, startedAt: 0, snapshot: null }; local.blocker.overrides = []; local.ai.enabled = false;
  return { local, records, work, notesPreferences: input.notesPreferences };
}
/** Restore with rollback if the second storage backend fails. */
export async function importData(prepared) {
  await navigator.locks.request('oneflow-timer', () => navigator.locks.request('oneflow-backup', async () => {
    const previous = Object.fromEntries(await Promise.all(db.STORES.map(async key => [key, await db.getAll(key)])));
    const previousWork=await storage.readWork(), previousLocal=await storage.readLatest();
    await db.replaceAll(prepared.records);
    try { await storage.updateWork(w=>{Object.assign(w,prepared.work || workDefaults());});await storage.replace(prepared.local); }
    catch (error) { await db.replaceAll(previous);await storage.updateWork(w=>{Object.assign(w,previousWork);});await storage.replace(previousLocal);throw error; }
  }));
  if (prepared.notesPreferences) await storage.setNotesPreferences(prepared.notesPreferences);
  const channel = new BroadcastChannel('oneflow-notes'); channel.postMessage('changed'); channel.close();
  if (globalThis.chrome?.runtime?.id) await chrome.runtime.sendMessage({ target: 'notes-worker', type: 'schedule' });
  if (globalThis.chrome?.runtime?.id) await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
}
/** Reset both storage backends and browser-synced preferences. */
export async function resetData() {
  await importData({ local: defaults(), records: {} });
  await storage.clearSync();
  await storage.setNotesPreferences({});
}
/** Decode and recompress uploads to safe, reasonably sized raster images. */
export async function prepareImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE) throw new Error(translate('m0009'));
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / bitmap.width, 1600 / bitmap.height);
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error(translate('m0010'))), 'image/webp', .85));
}
