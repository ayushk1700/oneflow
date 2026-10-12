import { t as translate } from '../../core/i18n.js';
import { get } from '../../core/storage.js';
import { remaining } from '../../core/timer-logic.js';
import { timerCommand } from '../../core/timer-client.js';
import { el } from '../../core/utils.js';
import { watch } from '../../core/ui.js';
import { emit, on } from '../../core/events.js';
let unsubscribe, offOpen, interval, syncing = false;
export const timeText = ms => { const seconds = Math.ceil(ms / 1000); return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; };
/** Reconcile deadlines; the shared session view owns all countdown controls. */
export function render() {
  const timer = get().timer;
  if (timer.status === 'running' && remaining(timer, Date.now()) === 0 && !syncing) {
    syncing = true; timerCommand('tick').catch(error => emit('error', error)).finally(() => { syncing = false; });
  }
}
export function open() {
  emit('settings:open', 'focus');
}
export function init() { render(); unsubscribe = watch(d => d.timer, render); offOpen = on('timer:open', open); interval = setInterval(render, 1000); timerCommand('tick').catch(error => emit('error', error)); }
export function destroy() { unsubscribe?.(); offOpen?.(); clearInterval(interval);  }
