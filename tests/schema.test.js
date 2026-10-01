import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, migrate, validate, safeURL } from '../core/schema.js';
import { dayKey } from '../core/utils.js';
test('defaults are independent and pass validation', () => { const a = defaults(), b = defaults(); a.settings.name = 'Other'; assert.equal(b.settings.name,''); assert.equal(validate(b),b); });
test('schema zero migration preserves tasks and fills missing settings', () => {
  const result = migrate({ schemaVersion:0, settings:{name:'Ada'}, tasks:[{id:'a',text:'Write',listId:'inbox',completed:false}] });
  assert.equal(result.schemaVersion,2); assert.equal(result.tasks[0].text,'Write'); assert.equal(result.settings.name,'Ada'); assert.equal(result.settings.widgets.weather,true);
});
test('reject future versions without destructive downgrade', () => assert.throws(()=>migrate({schemaVersion:3}),/newer/));
test('reject executable or credentialed links', () => { for (const url of ['javascript:alert(1)','data:text/html,x','file:///C:/','https://user:password@example.com']) assert.equal(safeURL(url),null); assert.equal(safeURL('https://example.com'),'https://example.com/'); });
test('reject malformed settings, orphan tasks, duplicate ids and invalid weather', () => {
  const invalid = [d=>d.settings.background.blur=99,d=>d.settings.accent='red',d=>d.settings.widgets.tasks='yes',d=>d.tasks.push({id:'a',text:'a',completed:false,listId:'missing'}),d=>d.lists.push({...d.lists[0]}),d=>d.weather.location={name:'a',latitude:100,longitude:0}];
  for(const edit of invalid){const d=defaults();edit(d);assert.throws(()=>validate(d));}
});
test('daily key uses the local calendar date', () => assert.equal(dayKey(new Date(2026,0,2,0,3)),'2026-01-02'));
test('untrusted text remains plain data, never stripped or evaluated', () => {const d=defaults();d.focus.text='<img src=x onerror=alert(1)>'; assert.equal(validate(d).focus.text,d.focus.text);});
