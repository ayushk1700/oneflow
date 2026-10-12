import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, migrate, validate, safeURL, SCHEMA_VERSION } from '../core/schema.js';
import { dayKey } from '../core/utils.js';
test('defaults are independent and pass validation', () => { const a = defaults(), b = defaults(); a.settings.name = 'Other'; assert.equal(b.settings.name,''); assert.equal(validate(b),b); });
test('schema zero migration preserves tasks and fills missing settings', () => {
  const result = migrate({ schemaVersion:0, settings:{name:'Ada'}, tasks:[{id:'a',text:'Write',listId:'inbox',completed:false}] });
  assert.equal(result.schemaVersion,SCHEMA_VERSION); assert.equal(result.tasks[0].text,'Write'); assert.equal(result.settings.name,'Ada'); assert.equal(result.settings.widgets.weather,true);
});
test('reject future versions without destructive downgrade', () => assert.throws(()=>migrate({schemaVersion:SCHEMA_VERSION+1}),/newer/));
test('schema five gains isolated preferences without changing tasks or the active timer', () => {
  const old = defaults(); old.schemaVersion = 5; delete old.settings.appearance; delete old.settings.journal;
  old.settings.name = 'Alex'; old.tasks.push({ id:'a',text:'Keep this task',completed:false,listId:'inbox' });
  const upgraded = migrate(old);
  assert.equal(upgraded.schemaVersion,SCHEMA_VERSION); assert.deepEqual(upgraded.tasks,old.tasks); assert.deepEqual(upgraded.timer,old.timer);
  assert.equal(upgraded.settings.journal.autosave,true); assert.equal(upgraded.settings.appearance.defaultView,'home');
});
test('invalid appearance, journal and wallpaper values fail before import', () => {
  for (const edit of [d => d.settings.appearance.overlay = 0,d => d.settings.appearance.panelOpacity = 0,d => d.settings.journal.fontSize = 200,d => d.settings.journal.autosave = 'yes',d => d.settings.background.kind = 'remote-script']) {
    const doc = defaults(); edit(doc); assert.throws(() => validate(doc));
  }
});
test('reject executable or credentialed links', () => { for (const url of ['javascript:alert(1)','data:text/html,x','file:///C:/','https://user:password@example.com']) assert.equal(safeURL(url),null); assert.equal(safeURL('https://example.com'),'https://example.com/'); });
test('reject malformed settings, orphan tasks, duplicate ids and invalid weather', () => {
  const invalid = [d=>d.settings.background.blur=99,d=>d.settings.accent='red',d=>d.settings.widgets.tasks='yes',d=>d.tasks.push({id:'a',text:'a',completed:false,listId:'missing'}),d=>d.lists.push({...d.lists[0]}),d=>d.weather.location={name:'a',latitude:100,longitude:0}];
  for(const edit of invalid){const d=defaults();edit(d);assert.throws(()=>validate(d));}
});
test('daily key uses the local calendar date', () => assert.equal(dayKey(new Date(2026,0,2,0,3)),'2026-01-02'));
test('untrusted text remains plain data, never stripped or evaluated', () => {const d=defaults();d.focus.text='<img src=x onerror=alert(1)>'; assert.equal(validate(d).focus.text,d.focus.text);});

test('schema eight adds a local inbox without changing existing data', () => {
  const old = defaults(); old.schemaVersion = 8; delete old.notifications;
  old.tasks.push({id:'keep',text:'Keep this task',listId:'inbox',completed:false});
  const upgraded = migrate(old);
  assert.deepEqual(upgraded.notifications, []);
  assert.deepEqual(upgraded.tasks, old.tasks);
  assert.deepEqual(upgraded.timer, old.timer);
});
test('notification validation bounds history and rejects malformed records', () => {
  const notice = {id:'notice',message:'Saved',kind:'info',createdAt:1,read:false};
  const good = defaults(); good.notifications.push(notice); assert.equal(validate(good), good);
  for (const edit of [d => d.notifications = Array.from({length:41}, () => notice), d => d.notifications[0].kind = 'other', d => d.notifications[0].message = 'x'.repeat(501), d => d.notifications[0].read = 'yes']) {
    const data = defaults(); data.notifications.push({...notice}); edit(data); assert.throws(() => validate(data));
  }
});
