import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,migrate,validate,SCHEMA_VERSION} from '../core/schema.js';
import {studioDefaults,validateStudio} from '../core/studio-schema.js';
import {dueRule,solarTime,playlistIndex} from '../core/studio-logic.js';
import {snapshot,applySnapshot} from '../core/scenes.js';
test('schema six migration preserves records, deadlines and appearance choices',()=>{const old=defaults();old.schemaVersion=6;old.settings.appearance.clockSize=190;delete old.settings.studio;old.timer.status='running';old.timer.startedAt=10;old.timer.endsAt=500;old.timer.sessionId='same';const value=migrate(old);assert.deepEqual(value.timer,old.timer);assert.equal(value.settings.studio.type.clock.size,190);assert.equal(value.settings.studio.enabled,false);assert.equal(value.schemaVersion,SCHEMA_VERSION);});
test('unsafe imported typography/layout/media/shortcuts/rules are rejected',()=>{for(const edit of [s=>s.type.clock.font='url(evil)',s=>s.type.clock.size=999,s=>s.layouts.desktop.clock={x:90,y:0,w:50,scale:1,locked:false,hidden:false},s=>s.dock.order=['journal'],s=>s.interaction.keys.task=s.interaction.keys.search,s=>s.wallpaper.rate=8,s=>s.automation.rules=[{id:'r',sceneId:'deep-work',trigger:'eval',time:'09:00',phase:'focus',days:[1]}]]){const s=studioDefaults();edit(s);assert.throws(()=>validateStudio(s));}});
test('scene snapshots contain design settings but preserve automation and active timer',()=>{const d=defaults();d.settings.studio.type.clock.font='mono';const value=snapshot(d);d.settings.studio.type.clock.font='serif';d.settings.studio.automation.enabled=true;d.timer.status='running';d.timer.sessionId='keep';d.timer.startedAt=100;d.timer.endsAt=900;const timer=structuredClone(d.timer);applySnapshot(d,value);assert.equal(d.settings.studio.type.clock.font,'mono');assert.equal(d.settings.studio.automation.enabled,true);assert.deepEqual(d.timer,timer);validate(d);});
test('wallpaper shuffle produces each entry once per round and respects interval',()=>{for(let round=0;round<3;round++){const results=Array.from({length:6},(_,i)=>playlistIndex(6,1,true,(round*6+i)*60000));assert.equal(new Set(results).size,6);}assert.equal(playlistIndex(2,30,false,0),0);assert.equal(playlistIndex(2,30,false,1800000),1);});
test('solar schedule handles equator and polar night without external APIs',()=>{const day=new Date(2026,2,20),rise=solarTime(day,0,0),set=solarTime(day,0,0,true);assert(rise);assert(set);assert(Math.abs((set-rise)/3600000-12)<.5);assert.equal(solarTime(new Date(2026,11,21),89,0),null);});
test('automatic rules honor weekdays and use stable phase keys',()=>{const now=new Date(2026,9,6,10,0),automation=studioDefaults().automation,rule={id:'r',sceneId:'deep-work',trigger:'time',time:'09:00',phase:'focus',days:[now.getDay()]};assert(dueRule(rule,automation,defaults().timer,now));rule.days=[(now.getDay()+1)%7];assert.equal(dueRule(rule,automation,defaults().timer,now),null);rule.days=[now.getDay()];rule.trigger='phase';rule.phase='break';const timer={...defaults().timer,phase:'short',cycle:2};assert.equal(dueRule(rule,automation,timer,now),dueRule(rule,automation,{...timer,observedAt:999},now));});

test('phase rule markers accept full session UUIDs and reject duplicate rules',()=>{
 const s=studioDefaults(),now=new Date(),timer={...defaults().timer,sessionId:'12345678-1234-1234-1234-123456789012'};
 const rule={id:'phase',sceneId:'deep-work',trigger:'phase',phase:'focus',time:'09:00',days:[now.getDay()]};
 s.automation.rules=[rule];s.automation.lastRuns.phase=dueRule(rule,s.automation,timer,now);validateStudio(s);
 s.automation.rules.push({...rule});assert.throws(()=>validateStudio(s));
});
