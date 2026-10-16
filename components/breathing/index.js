import {el} from '../../core/utils.js';
import '../../core/power-i18n.js';
import {t} from '../../core/i18n.js';
import {openPanel,field,select} from '../../core/ui.js';
import * as settings from '../../core/customization.js';
import {breathingPhase} from '../../core/breathing-logic.js';
let interval,visibility,off;
/** An optional local guide; hidden tabs and Stop freeze the current phase. */
export async function open(){await settings.init();let elapsed=0,last=performance.now(),running=false,lastLabel='';const status=el('p',{role:'status','aria-live':'polite'}),orb=el('div',{class:'power-breath-orb','aria-hidden':'true'}),progress=el('progress',{max:1,value:0,'aria-label':'Breathing cycle progress'}),pattern=select([['box','Box · 4 / 4 / 4 / 4'],['478','4 / 7 / 8']],settings.get().widgets.preferences.breathing.pattern,event=>{settings.set('widgets.preferences.breathing.pattern',event.target.value);elapsed=0;draw();}),button=el('button',{type:'button',class:'primary',onclick:()=>{running=!running;last=performance.now();button.textContent=running?'Pause breathing':'Start breathing';draw();}},t('Start breathing'));
 function draw(){const prefs=settings.get().widgets.preferences.breathing,phase=breathingPhase(prefs.pattern,elapsed);if(phase.cycle>=prefs.cycles){running=false;elapsed=0;button.textContent='Start breathing';status.textContent='Complete. Return when you want another pause.';orb.dataset.phase='rest';return;}const text=running?`${phase.phase.label} · cycle ${phase.cycle+1} of ${prefs.cycles}`:'A quiet moment. Start when ready.';if(text!==lastLabel){status.textContent=text;lastLabel=text;}orb.dataset.phase=phase.index===0?'in':phase.phase.label==='Breathe out'?'out':'hold';orb.style.setProperty('--breath-duration',phase.phase.seconds+'s');progress.value=(elapsed%phase.duration)/phase.duration;}
 interval=setInterval(()=>{const now=performance.now();if(running&&!document.hidden)elapsed+=(now-last)/1000;last=now;draw();},250);visibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',visibility);off=settings.subscribe(draw);const content=el('div',{class:'stack power-breathing'},field('Breathing pattern',pattern),orb,status,progress,button,el('small',{class:'muted'},'Choose a pace that feels comfortable. Stop or pause at any time.'));openPanel('Breathing','breathing',content,destroy);draw();button.focus();}
export function init(){}
export const render=open;
export function destroy(){clearInterval(interval);off?.();off=null;document.removeEventListener('visibilitychange',visibility);}
