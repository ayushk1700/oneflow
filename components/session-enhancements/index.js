import { get, update, readWork } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { act, field, closePanel, isPanel } from '../../core/ui.js';
import { recoveryPoint } from '../../core/work-context.js';
import { timerCommand } from '../../core/timer-client.js';
import { emit } from '../../core/events.js';
import { render as breakActivity } from '../break/index.js';

/** Keep session follow-up outside the initial script graph. */
export function summary(root,last,{recorded=true}={}){
  const linked=get().tasks.find(x=>x.id===last.taskId),next=el('textarea',{rows:2,maxlength:2000,'aria-label':'Next step after this session',placeholder:'What is the smallest useful next action?'});
  const duration = last.duration < 60000 ? 'Less than a minute' : `${Math.floor(last.duration/60000)} min`;
  root.append(el('p',{class:'muted'},`${recorded ? 'Saved' : 'In progress'} · ${duration} · ${last.taskTitle || 'Your focus'}`));
  const options = el('div',{class:'stack'});
  root.append(el('details',{},el('summary',{},'Next steps & reflection'),options));
  root = options;
  root.append(field('What comes next?',next));
  const save=async()=>{if(next.value.trim())await recoveryPoint(next.value,'intentional pause',false);};
  root.append(el('button',{type:'button',onclick:act(async()=>{await save();emit('toast','Next step saved.');})},'Save next step'));
  const choices=el('div',{class:'row wrap'});
  for(const [label,id]of [['Reflect','reflection'],['Save capsule','capsules']])choices.append(el('button',{type:'button',disabled:id==='reflection'&&!recorded,title:id==='reflection'&&!recorded?'End the session before reflecting on its recorded result.':undefined,onclick:act(async()=>{await save();await(await import('../../core/features.js')).openFeature(id);})},label));
  choices.prepend(el('button',{type:'button',onclick:act(async()=>{if(!recorded&&get().timer.phase==='focus'&&get().timer.status!=='idle'){if(isPanel('flow-summary'))closePanel();emit('dashboard:view','focus');return;}if(get().timer.phase!=='focus'){await save();await timerCommand('continue');return;}if(get().timer.status!=='idle'||get().timer.sessionId)throw Error('Finish your current interval before continuing.');await save();await timerCommand('start',{taskId:linked&&!linked.completed?linked.id:null,taskTitle:next.value.trim().slice(0,240)||last.taskTitle,focusMinutes:get().timerConfig.focus});})},'Continue'));
  if(linked&&!linked.completed)choices.append(el('button',{type:'button',onclick:act(async()=>{await update(d=>{const task=d.tasks.find(x=>x.id===linked.id);if(task){task.completed=true;task.completedAt=Date.now();}});})},'Mark task complete'));
  root.append(choices);
  readWork().then(w=>{if(next.isConnected&&document.activeElement!==next&&!next.value)next.value=w.recovery?.next||'';}).catch(e=>emit('error',e));
}

/** Attach a stable next-action readout or one quiet recovery activity to this session. */
export async function decorate(root,timer,fullscreen){
  if(timer.phase!=='focus'){
    const activity=el('section',{class:'break-recovery'},el('h3',{},'A little room to recover'),breakActivity(timer.cycle));root.append(activity);
    if(!root.querySelector('button[data-return-work]'))root.querySelector('.session-actions')?.append(el('button',{'data-return-work':'',type:'button',onclick:act(async()=>{await timerCommand('continue');emit('dashboard:view','focus');})},'Return to work'));
    return;
  }
  if(!fullscreen)return;
  const next=el('p',{class:'session-next','aria-label':'Current next action'},'Choose one small action and stay with it.');root.querySelector('.session-countdown')?.after(next);
  const work=await readWork();if(!next.isConnected)return;
  const task=get().tasks.find(t=>t.id===timer.taskId),entry=task?.journey?.kind==='firststep'?work.journeys.firstSteps.find(x=>x.id===task.journey.id):null;
  next.textContent=`Next: ${work.recovery?.taskId===timer.taskId&&work.recovery?.next?work.recovery.next:entry?.action||task?.text||timer.taskTitle||'Choose one small action.'}`;
}
