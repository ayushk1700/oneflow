import {get,update} from '../../core/storage.js';
import '../../core/power-i18n.js';
import {t} from '../../core/i18n.js';
import * as settings from '../../core/customization.js';
import {el} from '../../core/utils.js';
import {openPanel,closePanel,field,select,act,isPanel} from '../../core/ui.js';
import {PACKS} from '../../core/preset-packs.js';
import {applyPreset,startingLayout} from '../../core/personal-layout.js';
let active=false,busy=false;
/** Five reversible, skippable choices generate preferences without starting work. */
export async function render(){await settings.init();if(busy)return;let step=0;
 const value=settings.get(),purpose=select(Object.entries(PACKS).map(([name,pack])=>[pack.purpose,name]),value.behavior.onboarding.purpose,()=>{}),vibe=select([['calm','Calm'],['cozy','Cozy'],['forest','Forest'],['paper','Paper']],value.behavior.onboarding.vibe,()=>{}),layout=select(['Minimal','Focus','Dashboard','Zen','Study','Work'].map(name=>[name,name]),'Minimal',()=>{}),accent=el('input',{type:'color',value:value.theme.accent,'aria-label':'Setup accent color'}),name=el('input',{maxlength:80,value:value.widgets.preferences.greeting.name,'aria-label':'Your name',autocomplete:'given-name'});
 const pages=[el('section',{class:'stack'},el('h3',{},t('What brings you here?')),field('Purpose',purpose)),el('section',{class:'stack'},el('h3',{},t('Choose your atmosphere')),field('Vibe',vibe)),el('section',{class:'stack'},el('h3',{},t('Make room for your tools')),field('Starting layout',layout)),el('section',{class:'stack'},el('h3',{},t('Choose one accent')),field('Accent color',accent)),el('section',{class:'stack'},el('h3',{},t('Make this space yours')),field('What should we call you?',name),el('p',{class:'muted'},'Optional. Your name stays local unless you enable small-preference sync.'))];
 purpose.onchange=()=>{const pack=Object.values(PACKS).find(pack=>pack.purpose===purpose.value);vibe.value=pack.vibe;layout.value=pack.layout;};
 const progress=el('p',{class:'onboarding-progress',role:'status'}),status=el('p',{role:'status'}),back=el('button',{type:'button',onclick:()=>show(step-1)},t('Back')),next=el('button',{type:'button',class:'primary',onclick:()=>show(step+1)},t('Continue')),finish=el('button',{type:'submit',class:'primary'},t('Finish setup'));
 async function save(keep){if(busy)return;busy=true;controls.querySelectorAll('button').forEach(button=>button.disabled=true);try{if(keep){const pack=Object.values(PACKS).find(pack=>pack.purpose===purpose.value),next=settings.get();next.behavior.onboarding={purpose:purpose.value,vibe:vibe.value};next.theme.accent=accent.value;next.widgets.preferences.greeting.name=name.value.trim();next.widgets.preferences.timer.focus=pack.focus;Object.assign(next.background,{kind:'bundled',id:({calm:'alpine',cozy:'cozy',forest:'summit',paper:'minimal'})[vibe.value],rotate:false});settings.replace(next);applyPreset(startingLayout(layout.value));await settings.flush();}await update(document=>{document.settings.onboarding=true;},{sync:false});active=false;if(isPanel('onboarding'))closePanel();}catch(error){status.textContent=error.message+' Your entered choices are kept.';}finally{busy=false;controls.querySelectorAll('button').forEach(button=>button.disabled=false);}}
 const controls=el('div',{class:'row wrap'},back,next,finish,el('button',{type:'button',onclick:()=>show(step+1)},t('Skip this step')),el('button',{type:'button',onclick:act(()=>save(false))},t('Skip for now'))),form=el('form',{class:'stack onboarding',onsubmit:act(event=>{event.preventDefault();return save(true);})},progress,...pages,controls,status,el('small',{class:'muted'},'Works offline · No account · No tracking'));
 function show(index){step=Math.min(4,Math.max(0,index));pages.forEach((page,index)=>page.hidden=index!==step);back.hidden=step===0;next.hidden=step===4;finish.hidden=step!==4;progress.textContent=`Step ${step+1} of 5 · ${['Purpose','Vibe','Layout','Accent','Name'][step]}`;pages[step].querySelector('input,select')?.focus();}
 active=true;openPanel('Set up ONEFLOW','onboarding',form,()=>{active=false;if(!busy)update(document=>{document.settings.onboarding=true;},{sync:false}).catch(()=>{});});show(0);
}
export function init(){if(!get().settings.onboarding)return render();}
export function destroy(){active=false;}
