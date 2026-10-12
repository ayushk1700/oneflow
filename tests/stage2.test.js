import test from 'node:test';
import assert from 'node:assert/strict';
import { freshTimer, command, advance, remaining, TIMER_DEFAULTS } from '../core/timer-logic.js';
import { streak, aggregate, shiftDay, daysUntil } from '../core/stats-logic.js';
import { defaults, migrate, validate, SCHEMA_VERSION } from '../core/schema.js';
const c = { ...TIMER_DEFAULTS, focus: 1, short: 1, long: 2, cycles: 2 };
const start = (now = 1000) => command(freshTimer(c), c, 'start', now, 'session-a').timer;
test('remaining time comes from deadlines', () => { const t=start(); assert.equal(remaining(t,31000),30000); assert.equal(remaining(t,70000),0); });
test('pause/resume excludes paused duration', () => {
 const paused=command(start(),c,'pause',21000,'pause').timer;assert.equal(paused.remaining,40000);
 const resumed=command(paused,c,'start',121000,'resume').timer;assert.equal(resumed.endsAt,161000);assert.equal(resumed.sessionId,'session-a');
 const done=advance(resumed,c,161000,'next');assert.equal(done.records[0].duration,60000);assert.equal(done.records[0].completed,true);
});
test('sleep/wake finishes once without manufacturing sessions', () => {
 const config={...c,autoBreak:true,autoFocus:true},r=advance(start(),config,86401000,'next');
 assert.equal(r.records.length,1);assert.equal(r.timer.phase,'short');assert.equal(r.timer.endsAt,86461000);assert.equal(advance(r.timer,config,86401000,'again').records.length,0);
});
test('serialized worker state reconstructs identical transitions',()=>assert.deepEqual(advance(JSON.parse(JSON.stringify(start())),c,61000,'next'),advance(start(),c,61000,'next')));
test('backward clock changes preserve remaining time',()=>{let t=advance(start(100000),c,110000,'next').timer;t=advance(t,c,10000,'next').timer;assert.equal(remaining(t,10000),50000);});
test('forward clock changes count as elapsed time once',()=>{const r=advance(start(),c,1e9,'next');assert.equal(r.records.length,1);assert.equal(r.timer.status,'idle');});
test('stale multi-tab commands cannot start duplicate sessions',()=>{const t=start(),r=command(t,c,'start',1000,'second',{expectedRevision:0});assert.equal(r.timer.sessionId,'session-a');assert.equal(r.timer.revision,t.revision);});
test('skip logs only elapsed focus and marks it incomplete',()=>{const r=command(start(),c,'skip',11000,'skip');assert.equal(r.records[0].duration,10000);assert.equal(r.records[0].completed,false);assert.equal(r.timer.phase,'short');});
test('resetting idle produces no session',()=>assert.equal(command(freshTimer(c),c,'reset',1000,'reset').records.length,0));
test('configured cycles select long breaks',()=>{let t=advance(start(),c,61000,'break').timer;t=command(t,c,'skip',62000,'skip').timer;t=command(t,c,'start',63000,'second').timer;const r=advance(t,c,123000,'long');assert.equal(r.timer.phase,'long');assert.equal(r.timer.remaining,120000);});
test('task switching logs old partial session and links new task',()=>{const t=command(freshTimer(c),c,'task',1000,'first',{taskId:'a',taskTitle:'Write'}).timer;const r=command(t,c,'task',31000,'second',{taskId:'b',taskTitle:'Read'});assert.equal(r.records[0].taskId,'a');assert.equal(r.records[0].duration,30000);assert.equal(r.timer.taskId,'b');});

test('daily focus titles are recorded without fabricating a task and cannot relabel a paused session', () => {
 const started = command(freshTimer(c), c, 'start', 1000, 'daily', { taskTitle: 'Write one page' }).timer;
 assert.equal(started.taskId, null);
 assert.equal(started.taskTitle, 'Write one page');
 const paused = command(started, c, 'pause', 11000, 'pause').timer;
 const resumed = command(paused, c, 'start', 12000, 'resume', { taskTitle: 'A different focus' }).timer;
 const result = advance(resumed, c, 62000, 'next');
 assert.equal(result.records[0].taskTitle, 'Write one page');
 assert.equal(result.records[0].taskId, null);
 assert.equal(result.records[0].duration, 60000);
});
test('streaks handle yesterday, duplicate dates and gaps',()=>{assert.equal(streak(['2026-09-29','2026-09-30','2026-09-30'],'2026-10-01'),2);assert.equal(streak(['2026-09-28'],'2026-10-01'),0);assert.equal(streak(['2026-09-30','2026-10-01'],'2026-10-01'),2);});
test('calendar dates cross month and year boundaries',()=>{assert.equal(shiftDay('2026-01-01',-1),'2025-12-31');assert.equal(daysUntil('2026-10-03','2026-10-01'),2);assert.equal(daysUntil('2026-09-30','2026-10-01'),-1);});
test('stats agree with raw durations, completions, hours and mood',()=>{const now=new Date(2026,9,1,14),at=(day,hour)=>new Date(2026,9,day,hour).getTime();const rows=[{start:at(1,10),duration:25*60000,completed:true},{start:at(1,10),duration:10*60000,completed:false},{start:at(-10,8),duration:1e6,completed:true}];const s=aggregate(rows,[{completed:true,completedAt:at(1,11)},{completed:true}],[{at:at(1,12),value:4}],'day',now);assert.equal(s.total,35*60000);assert.equal(s.sessions,2);assert.equal(s.completedSessions,1);assert.equal(s.completedTasks,1);assert.equal(s.bestHour,10);assert.equal(s.moods.length,1);assert.equal(s.minutes.reduce((a,b)=>a+b,0),35);});
test('schema one migration preserves data and seeds new state',()=>{const old={schemaVersion:1,settings:{name:'Alex'},tasks:[{id:'t',text:'Keep me',listId:'inbox',completed:true}],favorites:['oneflow-1']};const d=migrate(old);assert.equal(d.schemaVersion,SCHEMA_VERSION);assert.equal(d.tasks[0].text,'Keep me');assert.equal(d.timer.status,'idle');assert.deepEqual(d.favorites,old.favorites);assert.equal(d.settings.widgets.timer,true);});
test('invalid new settings and records are rejected',()=>{const changes=[d=>d.timerConfig.focus=0,d=>d.audio.master=2,d=>d.habits=[{id:'h',name:'Read',dates:['invalid'],reminder:''}],d=>d.countdowns=[{id:'c',label:'Bad',date:'2026-02-30',pinned:false}],d=>d.notes=[{id:'n',title:'Title',text:42,updatedAt:1}],d=>d.moods=[{id:'m',at:1,value:7}]];for(const change of changes){const d=defaults();change(d);assert.throws(()=>validate(d));}});

