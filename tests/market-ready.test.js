import test from 'node:test';
import assert from 'node:assert/strict';
import { searchWeb } from '../core/search.js';
import { defaults, migrate, validate, SCHEMA_VERSION } from '../core/schema.js';
import { command, advance, freshTimer, TIMER_DEFAULTS } from '../core/timer-logic.js';
import { publicURL } from '../core/publisher.js';

test('search delegates only the explicit query to the browser default provider', async () => {
  const calls = [], api = { search: { query: async value => calls.push(value) } };
  await searchWeb('  study notes  ', 'NEW_TAB', api);
  assert.deepEqual(calls, [{ text: 'study notes', disposition: 'NEW_TAB' }]);
  await assert.rejects(searchWeb('  ', 'CURRENT_TAB', api), /Enter/);
  await assert.rejects(searchWeb('x'.repeat(1001), 'CURRENT_TAB', api), /1,000/);
  await assert.rejects(searchWeb('query', 'CURRENT_TAB', {}), /installed extension/);
  await assert.rejects(searchWeb('query', 'CURRENT_TAB', { search: { query: async () => { throw new Error('Provider unavailable'); } } }), /Provider unavailable/);
  assert.equal(calls.length, 1);
});

test('schema 4 upgrades search without losing tasks, session or preferences', () => {
  const old = defaults(); old.schemaVersion = 4; old.settings.engine = 'bing'; old.settings.name = 'Sam';
  delete old.lastFocusSession;
  old.tasks.push({ id: 'task', listId: 'inbox', text: 'Keep me', completed: false });
  old.timer = command(freshTimer(), TIMER_DEFAULTS, 'start', 1000, 'session', { taskId: 'task' }).timer;
  const next = migrate(old);
  assert.equal(next.schemaVersion, SCHEMA_VERSION); assert.equal(next.settings.engine, 'browser');
  assert.equal(next.settings.name, 'Sam'); assert.deepEqual(next.tasks, old.tasks); assert.deepEqual(next.timer, old.timer);
  assert.equal(next.lastFocusSession, null);
  assert.throws(() => migrate({ schemaVersion: SCHEMA_VERSION + 1 }));
  next.lastFocusSession = { id: 'broken' }; assert.throws(() => validate(next));
});

test('continue from a break retains the task and creates exactly one new focus session', () => {
  const start = command(freshTimer(), TIMER_DEFAULTS, 'start', 1000, 'first', { taskId: 'biology', taskTitle: 'Biology' }).timer;
  const end = advance(start, TIMER_DEFAULTS, start.endsAt, 'break');
  assert.equal(end.records.length, 1);
  const payload = { expectedRevision: end.timer.revision };
  const next = command(end.timer, TIMER_DEFAULTS, 'continue', start.endsAt + 500, 'second', payload);
  assert.equal(next.timer.phase, 'focus'); assert.equal(next.timer.status, 'running');
  assert.equal(next.timer.taskId, 'biology'); assert.equal(next.timer.taskTitle, 'Biology'); assert.equal(next.timer.sessionId, 'second');
  assert.equal(next.records.length, 0);
  const duplicate = command(next.timer, TIMER_DEFAULTS, 'continue', start.endsAt + 600, 'third', payload);
  assert.deepEqual(duplicate.timer, { ...next.timer, observedAt: start.endsAt + 600 });
  assert.equal(duplicate.records.length, 0);
});

test('skipping a completed break retains the task for the next start', () => {
  const start = command(freshTimer(), TIMER_DEFAULTS, 'start', 1000, 'one', { taskId: 'a', taskTitle: 'A' }).timer;
  const end = advance(start, TIMER_DEFAULTS, start.endsAt, 'break').timer;
  const ready = command(end, TIMER_DEFAULTS, 'skip', start.endsAt + 1000, 'next').timer;
  assert.equal(ready.phase, 'focus'); assert.equal(ready.status, 'idle'); assert.equal(ready.taskId, 'a');
});

test('publisher links never accept executable URLs or embedded credentials', () => {
  for (const value of ['', 'javascript:alert(1)', 'http://example.com', 'https://user:secret@example.com']) assert.equal(publicURL(value), null);
  assert.equal(publicURL('https://example.com/support'), 'https://example.com/support');
});
