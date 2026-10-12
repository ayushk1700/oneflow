import { t as translate } from './i18n.js';
const listeners = new Map();
/** Subscribe to an application event. Returns an unsubscribe function. */
export function on(type, callback) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(callback);
  return () => listeners.get(type)?.delete(callback);
}
/** Publish an event without coupling widget DOM trees. */
export function emit(type, detail) {
  for (const callback of listeners.get(type) || []) {
    try { callback(detail); } catch (error) { console.error(translate('m0020'), type, error); }
  }
}
