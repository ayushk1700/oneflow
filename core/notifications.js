import { on } from './events.js';
import { get, update, subscribe as watch } from './storage.js';

const MAX_NOTIFICATIONS = 40;
let off;

/** Save a bounded, plain-text notice; stable IDs deduplicate worker retries. */
export async function record(message, kind = 'info', id = crypto.randomUUID()) {
  const text = typeof message === 'string' ? message.trim() : String(message?.message || '').trim();
  if (!text) return;
  await update(data => {
    if (data.notifications.some(item => item.id === id)) return;
    const requestedKind = message?.kind || kind;
    data.notifications.unshift({ id, message: text.slice(0, 500), kind: ['info', 'success', 'error'].includes(requestedKind) ? requestedKind : 'info', createdAt: Date.now(), read: false });
    data.notifications = data.notifications.slice(0, MAX_NOTIFICATIONS);
  }, { sync: false });
}

/** Start collecting in-app notices emitted by the shared event bus. */
export function init() { if (!off) off = on('toast', message => { record(message).catch(error => console.warn('Notification history unavailable', error.message)); }); }
/** Read the bounded local inbox. */
export function list() { return get().notifications; }
export function unreadCount() { return list().filter(record => !record.read).length; }
export function markAllRead() { return update(data => { data.notifications.forEach(item => { item.read = true; }); }, { sync: false }); }
export function clear() { return update(data => { data.notifications = []; }, { sync: false }); }
export function subscribe(callback) { let previous = JSON.stringify(list()); return watch(() => { const next = JSON.stringify(list()); if (next !== previous) { previous = next; callback(list()); } }); }
