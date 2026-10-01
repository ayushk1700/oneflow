/** Pure timestamp-based timer transitions. No browser APIs or ticking counters. */
export const TIMER_DEFAULTS = { focus: 25, short: 5, long: 15, cycles: 4, autoFocus: false, autoBreak: false, notifications: true, chime: false };
export function freshTimer(config = TIMER_DEFAULTS) {
  return { phase: 'focus', status: 'idle', duration: config.focus * 60000, remaining: config.focus * 60000, endsAt: null, startedAt: null, observedAt: 0, elapsed: 0, cycle: 0, taskId: null, taskTitle: '', sessionId: null, revision: 0 };
}
/** Remaining active time; backward wall-clock changes are normalized by advance(). */
export function remaining(timer, now) { return timer.status === 'running' ? Math.max(0, Math.min(timer.duration, timer.endsAt - now)) : timer.remaining; }
function begin(timer, now, id) {
  timer.status = 'running'; timer.endsAt = now + timer.remaining; timer.observedAt = now;
  if (!timer.sessionId) { timer.sessionId = id; timer.startedAt = now; }
}
function record(timer, now, completed) {
  const duration = completed ? timer.duration : Math.max(0, timer.duration - remaining(timer, now));
  return timer.phase === 'focus' && timer.sessionId && duration > 0 ? { id: timer.sessionId, taskId: timer.taskId, taskTitle: timer.taskTitle, start: timer.startedAt, end: Math.max(timer.startedAt, now), duration, completed } : null;
}
function nextPhase(timer, config, now, id, auto) {
  if (timer.phase === 'focus') { timer.cycle++; timer.phase = timer.cycle % config.cycles === 0 ? 'long' : 'short'; }
  else timer.phase = 'focus';
  Object.assign(timer, { status: 'idle', duration: config[timer.phase] * 60000, remaining: config[timer.phase] * 60000, endsAt: null, startedAt: null, observedAt: now, elapsed: 0, sessionId: null });
  if (auto && (timer.phase === 'focus' ? config.autoFocus : config.autoBreak)) begin(timer, now, id);
}
/** Reconcile one expired phase. Delayed alarms never manufacture unattended sessions. */
export function advance(input, config, now, nextId) {
  const timer = structuredClone(input), records = [];
  let notice = null;
  if (timer.status === 'running') {
    if (now < timer.observedAt) timer.endsAt += now - timer.observedAt;
    timer.observedAt = now;
    if (now >= timer.endsAt) {
      const finished = record(timer, timer.endsAt, true); if (finished) records.push(finished);
      notice = { id: timer.sessionId || nextId, finishedPhase: timer.phase, at: now };
      nextPhase(timer, config, now, nextId, true);
      timer.revision++;
    }
  }
  return { timer, records, notice };
}
/** Apply an idempotent command to a current timer snapshot. */
export function command(input, config, action, now, id, payload = {}) {
  const result = advance(input, config, now, `${id}-next`), timer = result.timer;
  if (payload.expectedRevision !== undefined && payload.expectedRevision !== timer.revision) return result;
  if (action === 'start' && timer.status !== 'running') {
    if (payload.taskId && timer.status === 'idle') { timer.taskId = payload.taskId; timer.taskTitle = payload.taskTitle || ''; }
    begin(timer, now, id);
  } else if (action === 'pause' && timer.status === 'running') {
    timer.remaining = remaining(timer, now); timer.elapsed = timer.duration - timer.remaining; timer.endsAt = null; timer.status = 'paused';
  } else if (action === 'skip' || action === 'reset' || action === 'task') {
    const saved = record(timer, now, false); if (saved) result.records.push(saved);
    if (action === 'skip') nextPhase(timer, config, now, `${id}-next`, false);
    else {
      const revision = timer.revision, cycle = timer.cycle;
      Object.assign(timer, freshTimer(config), { revision, cycle });
      if (action === 'task') { timer.taskId = payload.taskId; timer.taskTitle = payload.taskTitle || ''; begin(timer, now, id); }
    }
  }
  timer.revision++; return result;
}
