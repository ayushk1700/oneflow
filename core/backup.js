import { t as translate } from './i18n.js';
import * as storage from './storage.js';
import * as db from './db.js';
import { logicalRecord } from './database-store.js';
import { migrate, defaults, SCHEMA_VERSION } from './schema.js';
import { validateJournal, validateSession } from './stage2-schema.js';
import { remaining } from './timer-logic.js';
import { validateNote, validateNoteMedia } from './notes-schema.js';
import { migrateWork, validateSample, workDefaults } from './work-schema.js';
import { checkBackupSize, MAX_BACKUP_BYTES } from './backup-limits.js';
import { decodeRaster, validateVideo, validateAttachment,MAX_VIDEO_BYTES } from './media-validation.js';
const MAX_IMAGE = 8 * 1024 * 1024;
function portableRecord(record){if(!record._space)return record;const next={...record},prefix=record._space+'::';for(const key of ['noteId','taskId'])if(typeof next[key]==='string'&&!next[key].startsWith(prefix))next[key]=prefix+next[key];if(next.media)next.media=next.media.map(id=>id.startsWith(prefix)?id:prefix+id);return next;}
const dataURL = blob => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
/** Snapshot all extension data, including uploaded image blobs. */
export async function exportData({ includeKeys = false } = {}) {
  return navigator.locks.request('oneflow-timer', () => navigator.locks.request('oneflow-backup', async () => {
    const records = Object.fromEntries(await Promise.all(db.STORES.map(async key => [key, (await db.getAll(key,{allSpaces:true})).map(portableRecord)])));
    if (records.images.length > 300 || records.wallpapers.length > 100 || records.notes.length > 100000 || records.focusSamples.length > 5000) throw new Error('Collection exceeds the supported backup limits.');
    // Stop before allocating base64 copies of a media collection that cannot fit.
    let mediaBytes = 0;
    for (const key of ['images', 'wallpapers', 'noteMedia']) for (const record of records[key]) mediaBytes += Math.ceil(record.blob.size / 3) * 4 + 100;
    if (mediaBytes > MAX_BACKUP_BYTES) throw new Error('Attachments exceed the 128 MB backup limit. Export fewer attachments before trying again.');
    records.journal.forEach(record=>validateJournal(logicalRecord(record))); records.sessions.forEach(record=>validateSession(logicalRecord(record))); records.notes.forEach(record=>validateNote(logicalRecord(record))); records.focusSamples.forEach(record=>validateSample(logicalRecord(record)));
    for (const { blob } of records.images) { const bitmap = await decodeRaster(blob); bitmap.close(); }
    for (const { blob } of records.wallpapers) await validateVideo(blob);
    for (const media of records.noteMedia) { validateNoteMedia(logicalRecord(media)); await validateAttachment(media.blob); }
    records.images = await Promise.all(records.images.map(async ({ blob, ...record }) => ({ ...record, data: await dataURL(blob) })));
    records.wallpapers = await Promise.all(records.wallpapers.map(async ({ blob, ...record }) => ({ ...record, data: await dataURL(blob) })));
    records.noteMedia = await Promise.all(records.noteMedia.map(async ({ blob, ...record }) => ({ ...record, data: await dataURL(blob) })));
    const local = await storage.readLatest();
    if (!includeKeys) {
      local.integrations.unsplashKey = ''; local.integrations.pexelsKey = '';
      delete local.music.youtubeKey; local.ai.key = '';
      for(const profile of local.spaces?.profiles||[])if(profile.snapshot){profile.snapshot.integrations.unsplashKey='';profile.snapshot.integrations.pexelsKey='';delete profile.snapshot.music.youtubeKey;profile.snapshot.ai.key='';}
    }
    if (local.timer.status === 'running') { local.timer.remaining = remaining(local.timer, Date.now()); local.timer.status = 'paused'; local.timer.endsAt = null; }
    local.audio.playing = false; local.audio.sleepAt = null;
    local.flow = { active: false, block: false, startedAt: 0, snapshot: null }; local.blocker.overrides = []; local.ai.enabled = false;
    const work = await storage.readWork(); work.active=null;
    const result = { app: translate('m0630'), schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), local, database: records, work, notesPreferences: await storage.getNotesPreferences() };
    checkBackupSize(JSON.stringify(result));
    return result;
  }));
}
/** Validate an entire backup before touching either storage backend. */
export async function parseBackup(text) {
  checkBackupSize(text);
  const input = JSON.parse(text, (key, value) => {
    if (['__proto__','constructor','prototype'].includes(key)) throw new Error(translate('m0681'));
    return value;
  });
  if (input?.app !== translate('m0630') || !Number.isInteger(input.schemaVersion) || input.schemaVersion < 1 || input.schemaVersion > SCHEMA_VERSION || !input.database || !input.local || typeof input.local !== 'object') throw new Error(translate('m0003'));
  const local = migrate(input.local), records = {};
  const customization=await import('./customization.js');await customization.init();
  if(local.settings.customization)local.settings.customization=(await import('./customization-schema.js')).migrateSettings(local.settings.customization,customization.defaults());
  if(local.spaces)(await import('./spaces.js')).validateRegistry(local.spaces);
  for (const key of db.STORES) {
    const rows = ['notes', 'noteMedia', 'focusSamples'].includes(key) || key === 'wallpapers' && input.schemaVersion < 6 ? input.database[key] || [] : input.database[key];
    if (!Array.isArray(rows) || rows.length > 100000 || rows.some(x => !x || typeof x.id !== 'string' || x.id.length > (x._space?142:100))) throw new Error(translate('m0004', {p0: key}));
    if (new Set(rows.map(x => x.id)).size !== rows.length) throw new Error(translate('m0005', {p0: key}));
    records[key] = rows;
    for(const row of rows)if(row._space!==undefined&&(typeof row._space!=='string'||row._space==='default'||typeof row._id!=='string'||!row._id||row._id.length>100||!local.spaces?.profiles.some(p=>p.id===row._space)||!row.id.startsWith(row._space+'::')||row._id!==row.id.slice(row._space.length+2)))throw new Error('Invalid space record ownership.');
  }
  if (records.notes.length > 100000 || records.images.length > 300 || records.wallpapers.length > 100) throw new Error('Backup exceeds the local collection limits.');
  records.journal.forEach(validateJournal); records.sessions.forEach(validateSession);
  if(records.focusSamples.length>5000)throw new Error('Focus DNA backup exceeds 500 observations per space.');
  records.focusSamples.forEach(validateSample);
  const work=migrateWork(input.work);work.active=null;
  records.notes.forEach(validateNote);
  const attachmentRows = [];
  for (const { data, ...record } of records.noteMedia) {
    if (typeof data !== 'string' || !/^data:(image\/(png|jpeg|webp)|audio\/(webm|ogg|mp4)(;codecs=[\w,-]+)?);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error('Invalid note attachment backup.');
    const [meta, encoded] = data.split(',');
    if (encoded.length > Math.ceil(MAX_IMAGE / 3) * 4) throw new Error('Note attachment exceeds 8 MB.');
    const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const media = { ...record, blob: new Blob([bytes], { type: meta.slice(5, meta.lastIndexOf(';base64')) }) };validateNoteMedia(logicalRecord(media));
    await validateAttachment(media.blob); attachmentRows.push(media);
  }
  records.noteMedia = attachmentRows;
  const mediaById = new Map(records.noteMedia.map(m => [m.id, m]));
  const noteById = new Map(records.notes.map(n => [n.id, n]));
  for (const note of records.notes) for (const id of note.media) if (mediaById.get(id)?.noteId !== note.id || mediaById.get(id)?._space!==note._space) throw new Error('Missing note attachment in backup.');
  if (records.noteMedia.some(m => !noteById.get(m.noteId)?.media.includes(m.id))) throw new Error('Orphan note attachment in backup.');
  const images = [];
  for (const { data, ...record } of records.images) {
    if (typeof data !== 'string' || !/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error(translate('m0006'));
    const [meta, encoded] = data.split(',');
    if (encoded.length > Math.ceil(MAX_IMAGE / 3) * 4) throw new Error('Image exceeds 8 MB.');
    const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    if (bytes.length > MAX_IMAGE) throw new Error(translate('m0007'));
    const blob = new Blob([bytes], { type: meta.slice(5, meta.indexOf(';')) });
    const bitmap = await decodeRaster(blob); bitmap.close();
    images.push({ ...record, blob });
  }
  records.images = images;
  if (local.settings.background.kind === 'upload' && !records.images.some(x => (x._id||x.id) === local.settings.background.id && (x._space||'default')===(local.spaces?.activeId||'default'))) throw new Error(translate('m0008'));
  const wallpapers = [];
  for (const { data, ...record } of records.wallpapers) {
    if (typeof data !== 'string' || !/^data:video\/(mp4|webm);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error('Invalid live wallpaper backup.');
    const [meta, encoded] = data.split(',');
    if (encoded.length > Math.ceil(MAX_VIDEO_BYTES / 3) * 4) throw new Error('Live wallpaper exceeds 64 MB.');
    const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    if (bytes.length > MAX_VIDEO_BYTES) throw new Error('Live wallpaper exceeds 64 MB.');
    const blob = new Blob([bytes], { type: meta.slice(5, meta.indexOf(';')) });
    await validateVideo(blob); wallpapers.push({ ...record, blob });
  }
  records.wallpapers = wallpapers;
  if (local.settings.background.kind === 'video' && !records.wallpapers.some(x => (x._id||x.id) === local.settings.background.id && (x._space||'default')===(local.spaces?.activeId||'default'))) throw new Error('Selected live wallpaper is missing from the backup.');
  if (local.timer.status === 'running') { local.timer.remaining = remaining(local.timer, Date.parse(input.exportedAt) || Date.now()); local.timer.status = 'paused'; local.timer.endsAt = null; }
  local.audio.playing = false; local.audio.sleepAt = null; local.timerNotice = null;
  local.flow = { active: false, block: false, startedAt: 0, snapshot: null }; local.blocker.overrides = []; local.ai.enabled = false;
  return { local, records, work, notesPreferences: input.notesPreferences };
}
/** Restore with rollback if the second storage backend fails. */
export async function importData(prepared) {
  await navigator.locks.request('oneflow-timer', () => navigator.locks.request('oneflow-backup', async () => {
    const previous = Object.fromEntries(await Promise.all(db.STORES.map(async key => [key, await db.getAll(key,{allSpaces:true})])));
    const previousWork=await storage.readWork(), previousLocal=await storage.readLatest(), previousPreferences=await storage.getNotesPreferences();
    const previousGeneration = await storage.sessionGet('data-generation');
    if (prepared.clearSession) await storage.clearSession();
    await storage.sessionSet('data-generation', crypto.randomUUID());
    const replaceWork = value => storage.updateWork(w => { for (const key of Object.keys(w)) delete w[key]; Object.assign(w, value); });
    try { await db.replaceAll(prepared.records);await replaceWork(prepared.work || workDefaults());await storage.replace(prepared.local);await storage.setNotesPreferences(prepared.notesPreferences || {}); }
    catch (error) { await db.replaceAll(previous);await replaceWork(previousWork);await storage.replace(previousLocal);await storage.setNotesPreferences(previousPreferences);await storage.sessionSet('data-generation', previousGeneration || null);throw error; }
  }));
  const channel = new BroadcastChannel('oneflow-notes'); channel.postMessage('replaced'); channel.close();
  if (globalThis.chrome?.runtime?.id) await chrome.runtime.sendMessage({ target: 'notes-worker', type: 'schedule' });
  if (globalThis.chrome?.runtime?.id) await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
}
/** Reset both storage backends and browser-synced preferences. */
export async function resetData() {
  await importData({ local: defaults(), records: {}, clearSession: true });
  await storage.clearSync();
  await storage.setNotesPreferences({});
  await storage.clearRecovery();
  if (!globalThis.chrome?.runtime?.id) (await import('./storage-recovery.js')).clearRecovery();
  if (globalThis.chrome?.permissions) {
    const grants = await chrome.permissions.getAll();
    if (grants.permissions.includes('contextMenus')) await chrome.contextMenus.removeAll();
    if (grants.permissions.includes('notifications') && chrome.notifications) {
      for (const id of Object.keys(await chrome.notifications.getAll())) await chrome.notifications.clear(id);
    }
    const permissions = grants.permissions.filter(name => ['tabs', 'contextMenus', 'notifications'].includes(name));
    if (permissions.length || grants.origins?.length) {
      if (!await chrome.permissions.remove({ permissions, origins: grants.origins || [] })) throw new Error('Data was deleted, but some optional access could not be removed. Review extension permissions in browser settings.');
    }
  }
}
/** Decode and recompress uploads to safe, reasonably sized raster images. */
export async function prepareImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE) throw new Error(translate('m0009'));
  const bitmap = await decodeRaster(file);
  const scale = Math.min(1, 2400 / bitmap.width, 1600 / bitmap.height);
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error(translate('m0010'))), 'image/webp', .85));
}
