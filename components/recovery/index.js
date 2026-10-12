import { get, readWork, updateWork } from '../../core/storage.js';
import { recoveryPoint, reenter } from '../../core/work-context.js';
import { REASONS } from '../../core/work-schema.js';
import { select, closePanel } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { shell, el, field, action, section, message, saving, confirmAction } from '../workbench/shared.js';
/** Recovery is a user-controlled checkpoint, without scoring interruptions. */
export async function open(){
  const {root,current}=shell('recovery','Focus Recovery','Interrupted work is still useful work. Leave one next action so returning is easier.');
  const w=await readWork();if(!current())return;
  const r=w.recovery,t=get().timer;
  const context=section(r?.taskTitle || t.taskTitle || get().focus.text || 'Your next focus',message(r?`Stopped ${new Date(r.at).toLocaleString()}${r.reason?` · ${r.reason}`:''}.`:'No saved recovery point. Leave a small next action for your current task.'));root.append(context);
  const next=el('textarea',{rows:3,maxlength:2000,placeholder:'Compare the two sources, then write one conclusion.'},r?.next || (t.taskTitle?`Return to ${t.taskTitle} and choose one small next action.`:''));
  const reason=select([['','Choose a reason (optional)'],...REASONS.map(x=>[x,x])],r?.reason || '',()=>{});
  const pause=el('input',{type:'checkbox',checked:t.status==='running'});
  const editor=el('details',{open:r?undefined:''},el('summary',{},r?'Edit your return plan':'Leave a return plan'),section('Make returning easier',field('Next action / resume note',next),field('What got in the way?',reason),el('label',{class:'toggle-row'},'Pause the running timer when saving',pause)));
  editor.append(saving(action('Save recovery point',()=>{},!r),async()=>{await recoveryPoint(next.value,reason.value,pause.checked);emit('toast','Recovery point saved.');await open();}));root.append(editor);
  if(r){
    const start=async()=>{const now=get().timer;if(now.status!=='running')await reenter(now.status==='paused'&&now.sessionId?null:10);closePanel();emit('dashboard:view','focus');};
    const activePaused=t.status==='paused'&&t.sessionId;
    context.append(el('p',{class:'review-question'},r.next||'Choose one small next action.'),saving(action(t.status==='running'?'Return to current session':activePaused?'Resume the same session':'Continue for 10 minutes',()=>{},true),start));
    editor.append(action('Forget recovery point',()=>confirmAction(root,'Delete this resume note?',async()=>{await updateWork(w=>{w.recovery=null;});await open();})));
  }
  root.append(el('details',{},el('summary',{},'Recovery preferences'),el('label',{class:'toggle-row'},'Offer recovery when leaving or pausing a session',el('input',{type:'checkbox',checked:w.recoveryEnabled,onchange:async e=>{try{await updateWork(w=>{w.recoveryEnabled=e.target.checked;if(!w.recoveryEnabled)w.recovery=null;});await open();}catch(error){emit('error',error);}}})),message('Tab switching is only counted if enabled in Focus DNA. Working in another tab is not treated as failure.')));
}
export function init(){}
export const render=open;
export function destroy(){}
