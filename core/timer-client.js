import { t as translate } from './i18n.js';
import { get } from './storage.js';
/** All tabs command the same background owner; preview has a local equivalent. */
export async function timerCommand(action, payload = {}) {
  if (!['tick','start','pause','skip','reset','task','continue','phase','restore'].includes(action)) throw new Error(translate('m0119'));
  const request = { target: 'worker', type: 'timer', action, payload: { expectedRevision: get().timer.revision, ...payload } };
  if (globalThis.chrome?.runtime?.id) {
    const response = await chrome.runtime.sendMessage(request);
    if (!response?.ok) throw new Error(response?.error || translate('m0120'));
    return response;
  }
  const { runTimer } = await import('./timer-engine.js');
  return runTimer(action, request.payload);
}
/** Reconfigure background alarms/audio after persisted preference edits. */
export async function backgroundSync() {
  if (globalThis.chrome?.runtime?.id) {
    const result = await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
    if (!result?.ok) throw new Error(result?.error || translate('m0121'));
  }
}
