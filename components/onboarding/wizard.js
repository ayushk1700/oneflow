import { get, update } from '../../core/storage.js';
import { el, uid, dayKey } from '../../core/utils.js';
import { openPanel, closePanel, field, act, isPanel } from '../../core/ui.js';
import { sceneById, applySnapshot } from '../../core/scenes.js';
import { timerCommand } from '../../core/timer-client.js';
let active=false,busy=false;

/** Three independent, skippable steps preserve drafts until explicit completion. */
export function render(){
  const taskId=uid(),name=el('input',{maxlength:80,value:get().settings.name,'aria-label':'Your name',autocomplete:'given-name'}),task=el('input',{maxlength:240,required:true,'aria-label':'Your first task',placeholder:'Revise one biology chapter'}),choices=el('fieldset',{class:'onboarding-scenes'},el('legend',{},'Choose your atmosphere'));
  for(const [id,label,image,hint]of [['study-cafe','Study café','cozy','25 minutes · a warm place to begin'],['deep-work','Deep work','alpine','50 minutes · room to concentrate'],['minimal','Keep it simple','minimal','25 minutes · a quiet canvas']])choices.append(el('label',{class:'onboarding-scene'},el('input',{type:'radio',name:'first-scene',value:id,checked:id==='study-cafe'}),el('img',{src:`../wallpaper/${image}-thumb.webp`,alt:'',width:180,height:90}),el('strong',{},label),el('small',{},hint)));
  const pages=[el('section',{class:'stack'},el('h3',{},'Make this space yours'),field('What should we call you?',name),el('p',{class:'muted'},'Optional. Your name stays on this device.')),el('section',{class:'stack'},el('h3',{},'Choose somewhere to begin'),choices,el('p',{class:'muted'},'Scenery never starts sound.')),el('section',{class:'stack'},el('h3',{},'Begin with one small task'),field('What will you work on?',task),el('p',{class:'muted'},'Start when you are ready. You can pause or change your next session later.'))];
  let step=0,personalize=true,atmosphere=true;
  const progress=el('p',{role:'status',class:'onboarding-progress'}),status=el('p',{role:'status',class:'muted'}),back=el('button',{type:'button',onclick:()=>show(step-1)},'Back'),next=el('button',{type:'button',class:'primary',onclick:()=>{if(step===0)personalize=true;if(step===1)atmosphere=true;show(step+1);}},'Continue'),start=el('button',{type:'submit',class:'primary'},'Start my first session');
  const finish=async(run,keepChoices=true)=>{
    if(busy)return;const title=task.value.trim();if(run&&!title){task.setCustomValidity('Write one small task to begin.');task.reportValidity();return;}busy=true;for(const b of controls.querySelectorAll('button'))b.disabled=true;status.textContent=run?'Preparing your session…':'Saving your choices…';
    try{
      const sceneId=choices.querySelector('input:checked').value,value=keepChoices&&atmosphere?await sceneById(sceneId):null;if(!active)return;
      await update(d=>{
        if(run&&(d.timer.sessionId||d.timer.phase!=='focus'||d.timer.status!=='idle'))throw Error('A session is already active. Skip setup to return to it.');
        const widgets={...d.settings.widgets,focus:true,timer:true,tasks:true,sounds:true};
        if(value){applySnapshot(d,value);d.sceneId=sceneId;d.settings.widgets=widgets;d.audio.playing=false;}
        if(keepChoices&&personalize)d.settings.name=name.value.trim();
        if(run){d.timerConfig.autoFocus=d.timerConfig.autoBreak=false;const existing=d.tasks.find(t=>t.id===taskId);if(existing)existing.text=title;else d.tasks.push({id:taskId,text:title,listId:d.lists[0].id,completed:false});d.focus={date:dayKey(),text:title,completed:false};}
      });
      if(run)await timerCommand('start',{taskId,taskTitle:title});await update(d=>{d.settings.onboarding=true;});active=false;if(isPanel('onboarding'))closePanel();
    }catch(error){status.textContent=error.message+' Your entered choices are kept; retry or skip.';}finally{busy=false;for(const b of controls.querySelectorAll('button'))b.disabled=false;}
  };
  const skipStep=el('button',{type:'button',onclick:act(async()=>{if(step===0)personalize=false;if(step===1)atmosphere=false;if(step===2)await finish(false);else show(step+1);})},'Skip this step'),skip=el('button',{type:'button',onclick:act(()=>finish(false,false))},'Skip for now'),controls=el('div',{class:'row wrap'},back,next,start,skipStep,skip);
  const form=el('form',{class:'stack onboarding',onsubmit:act(e=>{e.preventDefault();return finish(true);})},progress,...pages,controls,status,el('small',{class:'muted'},'Works offline · No account · No tracking'));
  function show(index){step=Math.max(0,Math.min(2,index));pages.forEach((p,i)=>{p.hidden=i!==step;});progress.textContent=`Step ${step+1} of 3 · ${['Personalize','Atmosphere','Start'][step]}`;back.hidden=step===0;next.hidden=step===2;start.hidden=step!==2;(step===0?name:step===1?choices.querySelector('input:checked'):task).focus();}
  task.oninput=()=>task.setCustomValidity('');active=true;openPanel('Your first focus session','onboarding',form,()=>{active=false;if(!busy)update(d=>{d.settings.onboarding=true;}).catch(()=>{});});show(0);
}
export function init(){if(!get().settings.onboarding)render();}
export function destroy(){active=false;}
