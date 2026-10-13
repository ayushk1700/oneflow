import { get, update } from '../../core/storage.js';
import { compileSteps } from '../../core/work-logic.js';
import { timerCommand } from '../../core/timer-client.js';
import { makeNote, saveNote } from '../../core/notes.js';
import { updateWork } from '../../core/storage.js';
import { select, closePanel } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { updateJournal } from '../../core/journal.js';
import { dayKey } from '../../core/utils.js';
import { shell, el, field, action, section, message, saving } from '../workbench/shared.js';
let draft='';
/** Deterministic breakdowns remain editable before creating linked work. */
export function open(){
  const {root}=shell('compiler','Next-Step Compiler','Turn a messy brief into a clear outcome and a first action. Suggestions are generated offline and remain editable.');
  const input=el('textarea',{rows:6,maxlength:10000,placeholder:'Prepare presentation about coastal ecosystems',oninput:e=>{draft=e.target.value;}},draft),result=el('div',{class:'stack'});
  const suggest=action('Suggest next steps',()=>{const proposal=compileSteps(input.value,get().timerConfig.focus);draw(result,proposal);suggest.classList.remove('primary');},true);
  const capture=el('details',{open:''},el('summary',{},'Your brief'),section('What needs to happen?',field('Brief or idea',input),suggest));
  suggest.addEventListener('click',()=>{capture.open=false;result.querySelector('input')?.focus();});
  root.append(capture,result);
}
function draw(root,proposal){
  const outcome=el('input',{value:proposal.outcome,maxlength:200}), rows=proposal.steps.map(s=>({text:el('input',{value:s.text,maxlength:240}),minutes:el('input',{type:'number',min:1,max:180,value:s.minutes}),energy:select([['deep','Deep work'],['normal','Normal work'],['light','Light work']],s.energy,()=>{})}));
  root.replaceChildren(section('Your action plan',field('Outcome',outcome)),message(`Suggested effort: ${proposal.minutes} minutes across ${proposal.blocks} focus blocks. Review these estimates.`));
  rows.forEach((r,i)=>{const content=section(i===0?'Start here':`Next action ${i+1}`,field('Action',r.text),el('div',{class:'work-columns'},field('Minutes',r.minutes),field('Energy needed',r.energy)));root.append(i===0?content:el('details',{},el('summary',{},`${i+1}. ${proposal.steps[i].text}`),content));});
  const save=action('Add actions to Tasks',()=>{},true),start=action('Add and start first action',()=>{});
  const commit=async(run)=>{
    const steps=rows.map(r=>({text:r.text.value.trim(),effort:Number(r.minutes.value),energy:r.energy.value}));
    if(!outcome.value.trim()||steps.some(s=>!s.text||!Number.isInteger(s.effort)||s.effort<1||s.effort>180))throw new Error('Give each action a name and a whole-minute estimate between 1 and 180.');
    if(run && get().timer.status!=='idle')throw new Error('Finish your current interval before starting this action. You can add tasks now.');
    const tasks=steps.map(s=>({id:crypto.randomUUID(),...s,outcome:outcome.value.trim(),sceneId:get().sceneId,listId:'inbox',completed:false,createdAt:Date.now()}));
    await update(d=> {d.tasks.push(...tasks);});
    added=true;
    save.disabled=start.disabled=true;
    await updateWork(w=>{w.recovery={id:crypto.randomUUID(),taskId:tasks[0].id,taskTitle:outcome.value.trim().slice(0,240),next:tasks[0].text,reason:'intentional pause',at:Date.now(),interruptions:0};});
    emit('toast',`${tasks.length} actions added to Tasks.`);
    if(run){if(get().timer.phase!=='focus')await timerCommand('phase',{phase:'focus'});await timerCommand('start',{taskId:tasks[0].id,focusMinutes:Math.min(tasks[0].effort,get().timerConfig.focus)});closePanel();emit('dashboard:view','focus');}
  };
  // Use one gate for both submit choices; duplicate clicks never duplicate tasks.
  let busy=false,added=false;
  for(const [control,run] of [[save,false],[start,true]])control.addEventListener('click',async()=>{if(busy||added)return;busy=true;save.disabled=start.disabled=true;try{await commit(run);added=true;}catch(error){emit('error',error);}finally{busy=false;save.disabled=start.disabled=added;}});
  const exports=el('details',{},el('summary',{},'Keep a copy'));
  root.append(el('div',{class:'work-actions'},save,start),message(`Actions retain your selected Scene (${get().sceneId}). Save a Focus Capsule to return to the full environment.`),exports);exports.append(saving(action('Save brief as a note',()=>{}),async()=>{await saveNote(makeNote({title:outcome.value.slice(0,120),text:draft}));emit('toast','Brief saved to Notes.');}),saving(action('Save outline to today’s journal',()=>{}),async()=>{
    const line=[outcome.value,...rows.map((r,i)=>`${i+1}. ${r.text.value} (${r.minutes.value} min)`)].join('\n');
    await updateJournal(dayKey(),old=>({text:[old?.text,line].filter(Boolean).join('\n\n')}));emit('toast','Outline added to today’s journal.');
  }));
}
export function init(){}
export const render=open;
export function destroy(){draft='';}
