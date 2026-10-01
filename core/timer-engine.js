import * as storage from './storage.js';
import { put } from './db.js';
import { command, advance } from './timer-logic.js';
/** Persist state plus an outbox, then idempotently materialize focus records. */
export async function runTimer(action = 'tick', payload = {}) {
  return navigator.locks.request('oneflow-timer', async () => {
    await storage.init();
    const now = Date.now(), id = crypto.randomUUID();
    await storage.update(d => {
      if (action === 'task') { const task = d.tasks.find(t => t.id === payload.taskId); if (!task) throw new Error('This task no longer exists.'); payload = { ...payload, taskTitle: task.text }; }
      const next = action === 'tick' ? advance(d.timer, d.timerConfig, now, id) : command(d.timer, d.timerConfig, action, now, id, payload);
      d.timer = next.timer; d.sessionOutbox.push(...next.records); if (next.notice) d.timerNotice = next.notice;
    });
    const pending = storage.get().sessionOutbox;
    for (const session of pending) await put('sessions', session);
    if (pending.length) await storage.update(d => { const ids = new Set(pending.map(s => s.id)); d.sessionOutbox = d.sessionOutbox.filter(s => !ids.has(s.id)); });
    return storage.get();
  });
}
