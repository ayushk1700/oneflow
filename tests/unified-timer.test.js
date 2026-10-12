import test from 'node:test';
import assert from 'node:assert/strict';
import {command, freshTimer, TIMER_DEFAULTS} from '../core/timer-logic.js';
test('chosen focus duration starts one linked session',()=>{
  const result=command(freshTimer(),TIMER_DEFAULTS,'start',1000,'one',{taskId:'a',taskTitle:'Outline',focusMinutes:17});
  assert.equal(result.timer.duration,17*60000);assert.equal(result.timer.endsAt,1000+17*60000);assert.equal(result.timer.taskId,'a');assert.equal(result.timer.sessionId,'one');
});
test('resume preserves the session identity and duration despite a new duration payload',()=>{
  const start=command(freshTimer(),TIMER_DEFAULTS,'start',1000,'one',{focusMinutes:17}).timer;
  const paused=command(start,TIMER_DEFAULTS,'pause',2000,'unused').timer;
  const resumed=command(paused,TIMER_DEFAULTS,'start',3000,'two',{focusMinutes:40}).timer;
  assert.equal(resumed.duration,17*60000);assert.equal(resumed.sessionId,'one');assert.equal(resumed.remaining,17*60000-1000);
});
test('invalid custom durations cannot start or alter a session',()=>{
  for(const focusMinutes of [0,181,1.5,NaN])assert.throws(()=>command(freshTimer(),TIMER_DEFAULTS,'start',1000,'one',{focusMinutes}));
});

test('phase selection prepares an idle break without recording focus time', () => {
  const result = command(freshTimer(), TIMER_DEFAULTS, 'phase', 1000, 'one', { phase: 'long' });
  assert.equal(result.timer.phase, 'long');
  assert.equal(result.timer.remaining, 15 * 60000);
  assert.equal(result.timer.status, 'idle');
  assert.equal(result.timer.sessionId, null);
  assert.deepEqual(result.records, []);
  const focus = command(result.timer, TIMER_DEFAULTS, 'phase', 1100, 'two', { phase: 'focus' });
  assert.equal(focus.timer.remaining, 25 * 60000);
});

test('phase selection cannot interrupt running or paused sessions or apply stale commands', () => {
  const running = command(freshTimer(), TIMER_DEFAULTS, 'start', 1000, 'one').timer;
  const paused = command(running, TIMER_DEFAULTS, 'pause', 2000, 'two').timer;
  for (const timer of [running, paused]) {
    const result = command(timer, TIMER_DEFAULTS, 'phase', 2500, 'three', { phase: 'short' });
    assert.equal(result.timer.phase, 'focus');
    assert.equal(result.timer.sessionId, 'one');
    assert.equal(result.timer.status, timer.status);
    assert.equal(result.timer.revision, timer.revision);
    assert.deepEqual(result.records, []);
  }
  const stale = command(freshTimer(), TIMER_DEFAULTS, 'phase', 1000, 'one', { phase: 'long', expectedRevision: 3 });
  assert.equal(stale.timer.phase, 'focus');
  assert.throws(() => command(freshTimer(), TIMER_DEFAULTS, 'phase', 1000, 'one', { phase: 'invalid' }));
});
