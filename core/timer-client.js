import { t as translate } from './i18n.js';
import { get } from './storage.js';
import {loadModule} from './module-registry.js';
import { emit } from './events.js';
/** All tabs command the same background owner; preview has a local equivalent. */
export async function timerCommand(action, payload = {}) {
  if (!['tick','start','pause','skip','reset','task','continue','phase','restore'].includes(action)) throw new Error(translate('m0119'));
  const request = { target: 'worker', type: 'timer', action, payload: { expectedRevision: get().timer.revision, ...payload } };
  let response;
  if (globalThis.chrome?.runtime?.id) {
    response = await chrome.runtime.sendMessage(request);
    if (!response?.ok) throw new Error(response?.error || translate('m0120'));
  } else {
    const { runTimer } = await loadModule('timer-engine');
    response = await runTimer(action, request.payload);
  }
  if (['start', 'task', 'continue'].includes(action) && response.timer?.phase === 'focus' && response.timer.status === 'running') emit('session:started');
  return response;
}
/** Reconfigure background alarms/audio after persisted preference edits. */
export async function backgroundSync() {
  if (globalThis.chrome?.runtime?.id) {
    const result = await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
    if (!result?.ok) throw new Error(result?.error || translate('m0121'));
  }
}
