import { t as translate } from './i18n.js';
import { activeSpaceId } from './storage.js';
import { STORES } from './db.js';
let database;
export const activeSpace = activeSpaceId;
const scopedId=(id,space=activeSpace())=>space==='default'?id:`${space}::${id}`;
const scopeOf=record=>record._space||'default';
export function logicalRecord(record){if(!record)return record;const next={...record};if(next._space){next.id=next._id;const prefix=next._space+'::';for(const key of ['noteId','taskId'])if(typeof next[key]==='string'&&next[key].startsWith(prefix))next[key]=next[key].slice(prefix.length);if(next.media)next.media=next.media.map(id=>id.startsWith(prefix)?id.slice(prefix.length):id);delete next._space;delete next._id;}return next;}
function scopedRecord(record,space=activeSpace()){return space==='default'?record:{...record,id:scopedId(record.id,space),_id:record.id,_space:space};}
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
export const getRecord = async (store, id,space=activeSpace()) => {const key=scopedId(id,space),record=await operation(store, 'readonly', s => s.get(key));return record&&scopeOf(record)===space?logicalRecord(record):undefined;};
/** Get all records in a store. */
export async function getAll(store,{allSpaces=false,space=activeSpace()}={}) {const records=await operation(store,'readonly',s=>s.getAll());return allSpaces?records:records.filter(record=>scopeOf(record)===space).map(logicalRecord);}
/** Save a record including image blobs. */
export const put = (store, value,space=activeSpace()) => {const record=scopedRecord(value,space);return operation(store, 'readwrite', s => s.put(record));};
/** Delete a local record. */
export const remove = (store, id,space=activeSpace()) => {const key=scopedId(id,space);return operation(store, 'readwrite', s => s.delete(key));};
/** Commit related changes together; callbacks must only enqueue IDB requests. */
export async function transaction(stores, change,space=activeSpace()) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('Local save failed.'));
    try {change(name => {const store=tx.objectStore(name);return {put:value=>store.put(scopedRecord(value,space)),delete:id=>store.delete(scopedId(id,space)),clear:()=>{throw new Error('Use the explicit full-data boundary to clear records.');}};}); } catch (error) { tx.abort(); reject(error); }
  });
}
/** Copy/delete only one space; one atomic transaction keeps other spaces intact. */
export async function changeSpaceRecords(source,target){const records=Object.fromEntries(await Promise.all(STORES.map(async store=>[store,await getAll(store,{allSpaces:true})])));const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORES,'readwrite');tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Space media operation failed.'));for(const name of STORES)for(const record of records[name])if(scopeOf(record)===source){if(target)tx.objectStore(name).put(scopedRecord(logicalRecord(record),target));else tx.objectStore(name).delete(record.id);}});}
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
