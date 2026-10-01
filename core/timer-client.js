import { get } from './storage.js';
/** All tabs command the same background owner; preview has a local equivalent. */
export async function timerCommand(action, payload = {}) {
  if (!['tick','start','pause','skip','reset','task'].includes(action)) throw new Error('Unknown timer action.');
  const request = { target: 'worker', type: 'timer', action, payload: { expectedRevision: get().timer.revision, ...payload } };
  if (globalThis.chrome?.runtime?.id) {
    const response = await chrome.runtime.sendMessage(request);
    if (!response?.ok) throw new Error(response?.error || 'The background timer is unavailable. Reload the extension.');
    return response;
  }
  const { runTimer } = await import('./timer-engine.js');
  return runTimer(action, request.payload);
}
/** Reconfigure background alarms/audio after persisted preference edits. */
export async function backgroundSync() {
  if (globalThis.chrome?.runtime?.id) {
    const result = await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
    if (!result?.ok) throw new Error(result?.error || 'Background update failed.');
  }
}
