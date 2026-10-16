import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { migrateSettings,validateSettings } from '../core/customization-schema.js';
import { parseQuickTask,nextOccurrence,completeTask } from '../core/task-personalization.js';
import { searchDestination } from '../core/personal-search.js';
const defaults=JSON.parse(fs.readFileSync('data/customization-defaults.json','utf8'));
test('the shipped Stage 1 object migrates without losing customization',()=>{
 const original=JSON.parse(fs.readFileSync('tests/fixtures/customization-v1.json','utf8'));original.theme.accent='#b4c9ee';original.widgets.notes=false;original.layout.density='compact';
 const next=migrateSettings(original,defaults);assert.equal(next.schemaVersion,5);assert.equal(next.theme.accent,original.theme.accent);assert.equal(next.widgets.notes,false);assert.equal(next.layout.density,'compact');assert.deepEqual(next.theme.typography,original.theme.typography);assert.deepEqual(next.background.gradient,defaults.background.gradient);assert.deepEqual(migrateSettings(next,defaults),next);
});
test('Stage 2 import validates nested collections, URL templates and geometry',()=>{
 for(const mutate of [v=>v.background.url=0,v=>v.background.gradient.stops[0].script='bad',v=>v.layout.desktop.clock={x:95,y:0,w:20,h:20},v=>v.widgets.preferences.clock.timeZones=[{name:'bad',zone:'not/a/zone'}],v=>v.widgets.preferences.search.template='javascript:alert({query})',v=>v.background.rotation.pool=[{kind:'upload',id:'x',color:'#ffffff',extra:true}],v=>v.widgets.preferences.journal.notebooks=[]]){const value=structuredClone(defaults);mutate(value);assert.throws(()=>validateSettings(value,defaults));}
});
test('quick-add markers stay bounded and invalid dates fail',()=>{const task=parseQuickTask('buy milk #home !high tomorrow @weekly',new Date(2026,9,14));assert.equal(task.text,'buy milk');assert.equal(task.dueDate,'2026-10-15');assert.deepEqual(task.tags,['home']);assert.equal(task.priority,'high');assert.equal(task.recurrence.frequency,'weekly');assert.throws(()=>parseQuickTask('bad due:2026-02-30'));assert.throws(()=>parseQuickTask('#home !high'));});
test('recurrence clamps month ends and creates one next occurrence',()=>{assert.equal(nextOccurrence('2026-01-31',{frequency:'monthly',interval:1}),'2026-02-28');const doc={tasks:[{id:'one',text:'Review',dueDate:'2026-10-14',completed:false,recurrence:{frequency:'weekly',interval:1},subtasks:[{id:'a',text:'Read',completed:true}]}]};completeTask(doc,'one',true);completeTask(doc,'one',true);assert.equal(doc.tasks.length,2);assert.equal(doc.tasks[1].dueDate,'2026-10-21');assert.equal(doc.tasks[1].subtasks[0].completed,false);});
test('search encodes user input and validates bang destinations',()=>{const prefs=structuredClone(defaults.widgets.preferences.search);prefs.engine='custom';prefs.template='https://example.com/?q={query}';const destination=searchDestination('<script>&x=1',prefs);assert.equal(new URL(destination).searchParams.get('q'),'<script>&x=1');assert.match(searchDestination('!ddg quiet work',prefs),/^https:\/\/duckduckgo.com/);});
