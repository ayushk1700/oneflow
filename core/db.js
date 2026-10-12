import { t as translate } from './i18n.js';
export const STORES = ['journal', 'sessions', 'images', 'wallpapers', 'notes', 'noteMedia', 'focusSamples'];
let database;
/** Open the versioned local database. Existing stores survive upgrades. */
export function openDB() {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    const request = indexedDB.open('oneflow', 5);
    request.onupgradeneeded = () => {
      for (const name of STORES) if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: 'id' });
      for (const [store, field] of [['journal', 'date'], ['sessions', 'start']]) {
        const object = request.transaction.objectStore(store);
        if (!object.indexNames.contains(field)) object.createIndex(field, field);
      }
    };
    request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); database = null; }; resolve(request.result); };
    request.onerror = () => { database = null; reject(request.error); };
    request.onblocked = () => { database = null; reject(new Error(translate('m0017'))); };
  });
  return database;
}
async function operation(store, mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode), request = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(request?.result);
    tx.onabort = tx.onerror = () => reject(tx.error || new Error(translate('m0018')));
  });
}
/** Get one local record. */
export const getRecord = (store, id) => operation(store, 'readonly', s => s.get(id));
/** Get all records in a store. */
export const getAll = store => operation(store, 'readonly', s => s.getAll());
/** Save a record including image blobs. */
export const put = (store, value) => operation(store, 'readwrite', s => s.put(value));
/** Delete a local record. */
export const remove = (store, id) => operation(store, 'readwrite', s => s.delete(id));
/** Commit related changes together; callbacks must only enqueue IDB requests. */
export async function transaction(stores, change) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('Local save failed.'));
    try { change(name => tx.objectStore(name)); } catch (error) { tx.abort(); reject(error); }
  });
}
/** Atomically replace all IDB stores; abort preserves previous records. */
export async function replaceAll(records) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, 'readwrite');
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error(translate('m0019')));
    try { for (const name of STORES) { const s = tx.objectStore(name); s.clear(); for (const record of records[name] || []) s.put(record); } }
    catch (error) { tx.abort(); reject(error); }
  });
}
