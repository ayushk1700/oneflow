import * as db from './db.js';
import * as storage from './storage.js';
import { validateNote, validateNoteMedia, noteURL } from './notes-schema.js';
import { checklistItems } from '../components/notes/checklist.js';
const lock = job => navigator.locks.request('oneflow-backup', job);
const changed = () => { const channel = new BroadcastChannel('oneflow-notes'); channel.postMessage('changed'); channel.close(); };
/** Idempotently copy legacy notes; keep the source until the committed copy exists. */
export async function migrateNotes() {
  await storage.init();
  await lock(async () => {
    const legacy = (await storage.readLatest()).notes;
    for (const old of legacy) if (!await db.getRecord('notes', old.id)) {
      const items = checklistItems(old.text);
      await db.put('notes', makeNote({ ...old, kind: items ? 'checklist' : 'note', items: items || [], createdAt: old.updatedAt }));
    }
    if (legacy.length) await storage.update(d => { d.notes = d.notes.filter(n => !legacy.some(old => old.id === n.id && old.updatedAt === n.updatedAt)); }, { sync: false });
  });
}
/** Construct an offline note with a versioned, validated shape. */
export function makeNote(value = {}) {
  return validateNote({ schemaVersion: 1, id: crypto.randomUUID(), title: '', text: '', kind: 'note', state: 'active', pinned: false,
    labels: [], items: [], media: [], url: '', reminderAt: null, revision: 1, createdAt: Date.now(), updatedAt: Date.now(), ...value });
}
export const listNotes = () => db.getAll('notes');
export const getNote = id => db.getRecord('notes', id);
export const getMedia = id => db.getRecord('noteMedia', id);
/** Optimistic revisions prevent a stale editor from overwriting another window. */
export async function saveNote(note, attachments = []) {
  let reschedule = false;
  const saved = await lock(async () => {
    const old = await getNote(note.id);
    if (old && old.revision !== note.revision) throw new Error('This note changed in another window. Copy your text, then reload the note.');
    if (!old && note.revision !== 1) throw new Error('This note was deleted in another window. Copy your text before leaving.');
    if (!old && (await listNotes()).length >= 10000) throw new Error('Your notes collection is full. Export or remove a note.');
    attachments.forEach(validateNoteMedia);
    const next = validateNote({ ...structuredClone(note), revision: old ? old.revision + 1 : 1, updatedAt: Date.now() });
    reschedule = old?.reminderAt !== next.reminderAt || old?.state !== next.state;
    if (attachments.some(m => m.noteId !== next.id || !next.media.includes(m.id))) throw new Error('Attachment does not belong to this note.');
    for (const id of next.media) if (!attachments.some(m => m.id === id) && (await getMedia(id))?.noteId !== next.id) throw new Error('Missing note attachment.');
    await db.transaction(['notes', 'noteMedia'], store => {
      store('notes').put(next);
      for (const media of attachments) store('noteMedia').put(media);
      for (const id of old?.media || []) if (!next.media.includes(id)) store('noteMedia').delete(id);
    });
    return next;
  });
  changed();
  if (reschedule && globalThis.chrome?.runtime?.id) chrome.runtime.sendMessage({ target: 'notes-worker', type: 'schedule' }).catch(() => {});
  return saved;
}
/** Only explicitly trashed records can be permanently deleted, with their media. */
export async function deleteNote(note) {
  await lock(async () => {
    const latest = await getNote(note.id);
    if (!latest || latest.state !== 'trash' || latest.revision !== note.revision) throw new Error('Reload this note before deleting it.');
    await db.transaction(['notes', 'noteMedia'], store => { store('notes').delete(note.id); latest.media.forEach(id => store('noteMedia').delete(id)); });
  });
  changed();
  if (globalThis.chrome?.runtime?.id) chrome.runtime.sendMessage({ target: 'notes-worker', type: 'schedule' }).catch(() => {});
}
/** Capture only text and an explicitly selected page/link URL. No page markup. */
export async function captureNote({ title = '', text = '', url = '' }) {
  await migrateNotes();
  return saveNote(makeNote({ title: title.slice(0, 120), text: text.slice(0, 50000), url: noteURL(url).slice(0, 4096) }));
}
/** Add one linked inbox task. Repeated clicks do not duplicate it. */
export async function sendToTasks(note) {
  await storage.init();
  await storage.update(d => {
    const id = `note-${note.id}`;
    if (!d.tasks.some(t => t.id === id)) d.tasks.push({ id, text: (note.title || note.text || 'Untitled note').slice(0, 240), listId: 'inbox', completed: false, createdAt: Date.now() });
  });
}
