import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, migrate } from '../core/schema.js';

function legacy() {
  const value = defaults(); value.schemaVersion = 7;
  value.settings.accent = '#7845df';
  Object.assign(value.settings.appearance, { clockSize:150, clockWeight:750 });
  value.tasks.push({ id:'keep', text:'Keep my task', listId:'inbox', completed:false });
  Object.assign(value.timer, { status:'running', sessionId:'keep', startedAt:10, endsAt:1000 });
  value.drafts['task:daily-2026-10-09'] = 'Keep my draft';
  return value;
}
test('stock appearance migration is idempotent and preserves records and active deadlines', () => {
  const old = legacy(), result = migrate(old);
  assert.equal(result.settings.accent, '#c9d9b5');
  assert.equal(result.settings.appearance.clockWeight, 400);
  assert.equal(result.settings.appearance.clockSize, 128);
  for (const key of ['timer','tasks','drafts','audio','layout','scenes']) assert.deepEqual(result[key],old[key]);
  assert.deepEqual(migrate(result), result);
  assert.equal(old.settings.accent,'#7845df');
});
test('custom accent, typography and enabled studio opt out of the stock migration', () => {
  for (const change of [s => s.accent='#ffccaa', s => s.appearance.clockSize=180, s => s.appearance.clockWeight=500, s => s.studio.enabled=true]) {
    const old = legacy(); change(old.settings);
    assert.deepEqual(migrate(old).settings, old.settings);
  }
});
