import { get, update, readWork, updateWork } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { buildEnergyPlan } from '../../core/work-logic.js';
import { select, closePanel } from '../../core/ui.js';
import { timerCommand } from '../../core/timer-client.js';
import { emit } from '../../core/events.js';
import { dayKey } from '../../core/utils.js';
import { shell, el, field, action, section, message, time, confirmAction, saving } from '../workbench/shared.js';
import { tabs, library } from '../panel-design/index.js';
const labels={deep:'Deep work',normal:'Normal work',light:'Light work',recovery:'Recovery'};
const choices=Object.entries(labels);
const toMinutes=value=>{const [h,m]=value.split(':').map(Number);return h*60+m;};
/** Manual energy blocks work offline, without calendars or assumed schedules. */
export async function open(){
  const {root,current}=shell('energy','Energy-Based Day Planner','Match demanding tasks to your stronger hours. Recovery blocks are reserved and never receive tasks. The plan is a suggestion, not a restriction.');
  const [w,samples]=await Promise.all([readWork(),getAll('focusSamples')]);if(!current())return;
  const pattern=el('div',{class:'stack'}),today=el('div',{class:'stack'}),efforts=el('div',{class:'stack'});tabs(root,[{label:'Today',content:today},{label:'Task effort',content:efforts},{label:'Energy pattern',content:pattern}],'energy');
  if(!w.blocks.length)today.append(message('Set your Energy pattern, review Task effort, then plan today.'));
  const start=el('input',{type:'time',value:'09:00'}),end=el('input',{type:'time',value:'10:30'}),energy=select(choices,'deep',()=>{});
  pattern.append(section('Your daily energy pattern',el('div',{class:'work-columns'},field('From',start),field('Until',end),field('Energy',energy)),action('Add energy block',async()=>{const a=toMinutes(start.value),b=toMinutes(end.value);if(!Number.isInteger(a)||!Number.isInteger(b)||b<=a)throw new Error('Choose an end time after the start, within the same day.');await updateWork(w=>{w.blocks.push({id:crypto.randomUUID(),start:a,end:b,energy:energy.value});w.plan={date:'',assignments:[]};});await open();})));
  for(const b of [...w.blocks].sort((a,b)=>a.start-b.start))pattern.append(el('div',{class:'work-row'},el('span',{},`${time(b.start)}–${time(b.end)} · ${labels[b.energy]}`),action('Remove block',()=>confirmAction(root,'Remove this energy block and clear its plan?',async()=>{await updateWork(w=>{w.blocks=w.blocks.filter(x=>x.id!==b.id);w.plan={date:'',assignments:[]};});await open();}))));
  if(!w.blocks.length)pattern.append(message('Add your stronger, lighter and recovery periods first.'));
  const tasks=get().tasks.filter(t=>!t.completed).slice(0,100),taskSection=section('Task effort');efforts.append(taskSection);const collection=tasks.length?library(taskSection,{name:'effort',heading:'Tasks'}):null;
  if(!tasks.length)taskSection.append(message('Add tasks in Notes or the Next-Step Compiler to plan your day.'));
  for(const t of tasks){
    const effort=el('input',{type:'number',min:1,max:180,value:t.effort||25}),level=select(choices.filter(([k])=>k!=='recovery'),t.energy||'normal',()=>{});
    collection.add({id:t.id,title:t.text,summary:`${t.effort||25} min · ${labels[t.energy||'normal']}`,detail:section(t.text,el('div',{class:'work-columns'},field('Estimated minutes',effort),field('Energy needed',level)),action('Save effort',async()=>{const minutes=Number(effort.value);if(!Number.isInteger(minutes)||minutes<1||minutes>180)throw new Error('Use 1–180 whole minutes.');await update(d=>{const item=d.tasks.find(x=>x.id===t.id);if(!item)throw new Error('Task deleted in another window.');item.effort=minutes;item.energy=level.value;});emit('toast','Task effort saved.');}))});
  }
  today.append(action('Plan today',async()=>{const latest=await readWork();const proposal=buildEnergyPlan(get().tasks.filter(t=>!t.completed).slice(0,100),latest.blocks);await updateWork(w=>{w.plan={date:dayKey(),assignments:proposal.assignments};});await open();emit('toast',`${proposal.assignments.length} tasks placed; ${proposal.unplaced.length} need another suitable block.`);},true));
  const schedule=section('Today’s plan'),timeline=el('div',{class:'energy-timeline','aria-label':'Energy block timeline'}),tray=section('Unplaced tasks');today.append(timeline,schedule,tray);for(const block of [...w.blocks].sort((a,b)=>a.start-b.start)){const row=section(`${time(block.start)}–${time(block.end)}`,el('strong',{},labels[block.energy]),message(block.energy==='recovery'?'Protected recovery · no task assignments.':'Suitable work is placed here when you plan today.'));row.dataset.energy=block.energy;timeline.append(row);if(w.plan.date===dayKey())for(const a of w.plan.assignments.filter(a=>a.blockId===block.id)){const task=get().tasks.find(t=>t.id===a.taskId&&!t.completed);if(task)row.append(message(`${time(a.start)} · ${task.text} · ${a.minutes} min`));}}
  if(w.plan.date!==dayKey()||!w.plan.assignments.length)schedule.append(message('No plan for today yet. Tasks that do not fit stay unplaced; recovery time remains free.'));
  else for(const a of [...w.plan.assignments].sort((a,b)=>a.start-b.start)){
    const task=get().tasks.find(t=>t.id===a.taskId);if(!task||task.completed)continue;
    schedule.append(el('div',{class:'work-row'},el('span',{},`${time(a.start)}–${time(a.start+a.minutes)} · ${task.text}`),saving(action('Start planned task',()=>{}),async()=>{if(get().timer.status!=='idle')throw new Error('Finish or reset the current interval first.');if(get().timer.phase!=='focus')await timerCommand('phase',{phase:'focus'});await timerCommand('start',{taskId:task.id,focusMinutes:a.minutes});closePanel();emit('dashboard:view','focus');})));
  }
  const assigned=new Set(w.plan.date===dayKey()?w.plan.assignments.map(a=>a.taskId):[]);
  const unplaced=tasks.filter(t=>!assigned.has(t.id));if(unplaced.length)for(const task of unplaced)tray.append(el('div',{class:'work-row'},el('span',{},task.text),message(`${task.effort||25} min · ${labels[task.energy||'normal']}`)));else tray.append(message('All current tasks are placed. Recovery stays free.'));
  const late=samples.filter(s=>s.hour>=16&&s.energy==='deep'),early=samples.filter(s=>s.hour<12&&s.energy==='deep');
  if(late.length>=3&&early.length>=3&&late.filter(s=>s.completed).length/late.length+.2<early.filter(s=>s.completed).length/early.length)today.append(section('A pattern to consider',message(`Completion was lower across ${late.length} late-day sessions than ${early.length} morning sessions. Try moving demanding work earlier if that fits your day. This is an association from local observations.`)));
  pattern.append(action('Clear energy pattern and plan',()=>confirmAction(root,'Delete your energy blocks and today’s plan?',async()=>{await updateWork(w=>{w.blocks=[];w.plan={date:'',assignments:[]};});await open();})));
}
export function init(){}
export const render=open;
export function destroy(){}
