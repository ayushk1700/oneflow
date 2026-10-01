import * as storage from './storage.js';
import * as db from './db.js';
import { migrate, defaults } from './schema.js';
import { validateJournal, validateSession } from './stage2-schema.js';
import { remaining } from './timer-logic.js';
const MAX_BYTES = 40 * 1024 * 1024;
const MAX_IMAGE = 8 * 1024 * 1024;
const dataURL = blob => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
/** Snapshot all extension data, including uploaded image blobs. */
export async function exportData() {
  return navigator.locks.request('oneflow-timer', () => navigator.locks.request('oneflow-backup', async () => {
    const records = Object.fromEntries(await Promise.all(db.STORES.map(async key => [key, await db.getAll(key)])));
    records.images = await Promise.all(records.images.map(async ({ blob, ...record }) => ({ ...record, data: await dataURL(blob) })));
    const local = await storage.readLatest();
    if (local.timer.status === 'running') { local.timer.remaining = remaining(local.timer, Date.now()); local.timer.status = 'paused'; local.timer.endsAt = null; }
    local.audio.playing = false; local.audio.sleepAt = null;
    return { app: 'ONEFLOW', schemaVersion: 2, exportedAt: new Date().toISOString(), local, database: records };
  }));
}
/** Validate an entire backup before touching either storage backend. */
export async function parseBackup(text) {
  if (new Blob([text]).size > MAX_BYTES) throw new Error('Backup is too large (40 MB maximum).');
  const input = JSON.parse(text);
  if (input?.app !== 'ONEFLOW' || ![1,2].includes(input.schemaVersion) || !input.database || !input.local || typeof input.local !== 'object') throw new Error('Choose a ONEFLOW Stage 1 or Stage 2 backup.');
  const local = migrate(input.local), records = {};
  for (const key of db.STORES) {
    const rows = input.database[key];
    if (!Array.isArray(rows) || rows.length > 100000 || rows.some(x => !x || typeof x.id !== 'string' || x.id.length > 100)) throw new Error(`Invalid ${key} records.`);
    if (new Set(rows.map(x => x.id)).size !== rows.length) throw new Error(`Duplicate ${key} IDs.`);
    records[key] = rows;
  }
  records.journal.forEach(validateJournal); records.sessions.forEach(validateSession);
  records.images = await Promise.all(records.images.map(async ({ data, ...record }) => {
    if (typeof data !== 'string' || !/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error('Unsupported image in backup.');
    const [meta, encoded] = data.split(','), bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    if (bytes.length > MAX_IMAGE) throw new Error('An image exceeds the 8 MB limit.');
    const blob = new Blob([bytes], { type: meta.slice(5, meta.indexOf(';')) });
    const bitmap = await createImageBitmap(blob); bitmap.close();
    return { ...record, blob };
  }));
  if (local.settings.background.kind === 'upload' && !records.images.some(x => x.id === local.settings.background.id)) throw new Error('The selected background is missing from this backup.');
  if (local.timer.status === 'running') { local.timer.remaining = remaining(local.timer, Date.parse(input.exportedAt) || Date.now()); local.timer.status = 'paused'; local.timer.endsAt = null; }
  local.audio.playing = false; local.audio.sleepAt = null; local.timerNotice = null;
  return { local, records };
}
/** Restore with rollback if the second storage backend fails. */
export async function importData(prepared) {
  await navigator.locks.request('oneflow-timer', () => navigator.locks.request('oneflow-backup', async () => {
    const previous = Object.fromEntries(await Promise.all(db.STORES.map(async key => [key, await db.getAll(key)])));
    await db.replaceAll(prepared.records);
    try { await storage.replace(prepared.local); }
    catch (error) { await db.replaceAll(previous); throw error; }
  }));
  if (globalThis.chrome?.runtime?.id) await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
}
/** Reset both storage backends and browser-synced preferences. */
export async function resetData() {
  await importData({ local: defaults(), records: {} });
  await storage.clearSync();
}
/** Decode and recompress uploads to safe, reasonably sized raster images. */
export async function prepareImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE) throw new Error('Choose a PNG, JPEG, or WebP image under 8 MB.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / bitmap.width, 1600 / bitmap.height);
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image could not be processed.')), 'image/webp', .85));
}
