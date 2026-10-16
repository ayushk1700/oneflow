import './power-i18n.js';
import * as settings from './customization.js';
import {init as initTokens} from './customization-runtime.js';
import * as storage from './storage.js';
import {sanitizeCSS} from './power-css.js';
import {hotkeyMatches} from './power-hotkeys.js';
import {el,inputActive} from './utils.js';
import {emit,on} from './events.js';
import {setLanguage} from './i18n.js';
import {openFeature,destroyFeature} from './features.js';
import {timerCommand,backgroundSync} from './timer-client.js';
import {setView} from './dashboard-view.js';
import {icon} from './ui.js';
let off,dataOff,heartbeat,observer,style,recovery,tabId,previousSpace,cssKey='',iconPack='',keysAttached=false;const events=[];
const fonts={system:'var(--font-system)',atkinson:'var(--font-atkinson)',opendyslexic:'var(--font-opendyslexic)',mono:'var(--font-mono)'};
function apply(){const value=settings.get();if(!value)return;const css=value.theme.customCSS,key=JSON.stringify(css);if(key!==cssKey){cssKey=key;if(!style){style=new CSSStyleSheet();document.adoptedStyleSheets=[...document.adoptedStyleSheets,style];}try{style.replaceSync(css.enabled?sanitizeCSS(css.text):'');}catch(error){style.replaceSync('');emit('toast',error.message);}}
 if(!recovery){recovery=el('button',{type:'button',class:'power-css-recovery',onclick:()=>{style.replaceSync('');settings.set('theme.customCSS.enabled',false);}},'Disable custom CSS');document.querySelector('.topbar').append(recovery);}recovery.hidden=!css.enabled;
 document.documentElement.dataset.iconPack=value.theme.iconPack;if(iconPack!==value.theme.iconPack){iconPack=value.theme.iconPack;for(const node of document.querySelectorAll('[data-power-icon]'))node.replaceWith(icon(node.dataset.powerIcon));}setLanguage(value.behavior.language);document.documentElement.dir=value.behavior.direction==='auto'?'ltr':value.behavior.direction;
 for(const[id,font]of Object.entries(value.theme.widgetFonts)){const selectors=['#'+id,`[data-layout-widget="${id}"]`,`#panel-body[data-widget="${id}"]`,...(id==='greeting'?['.greeting','.personal-greeting']:[])];for(const node of document.querySelectorAll(selectors.join(','))){if(font==='inherit'){node.removeAttribute('data-power-font');node.style.removeProperty('--widget-font');}else{node.dataset.powerFont=font;node.style.setProperty('--widget-font',fonts[font]);}}}
 if(!value.behavior.privacy.music)destroyFeature('music');
 const active=storage.activeSpaceId();if(previousSpace&&previousSpace!==active){emit('space:switched',active);emit('spaces:changed');}previousSpace=active;
}
async function lease(){if(!globalThis.chrome?.tabs||tabId===undefined)return;await storage.sessionSet('power-editor-'+tabId,{at:Date.now(),busy:Boolean(document.querySelector('dialog[open]'))});}
async function requestRules(tabOpened=false){if(!globalThis.chrome?.runtime?.id)return;const result=await chrome.runtime.sendMessage({target:'worker',type:'rules',tabOpened});if(!result?.ok)throw new Error(result?.error||'Automation could not refresh.');}
function keys(event){if(event.defaultPrevented||event.repeat||event.isComposing)return;const value=settings.get(),bindings=value.behavior.hotkeys,modal=document.querySelector('dialog[open]'),action=Object.keys(bindings).find(action=>hotkeyMatches(event,bindings[action]));if(!action||action==='space'&&!value.behavior.spaceHotkey)return;if(action!=='commands'&&(inputActive(event.target)||modal))return;if(action==='timer'&&event.target.closest('button,a,summary,input,[role=button]'))return;event.preventDefault();
 const run=async()=>{if(action==='commands'){if(modal?.classList.contains('customization-drawer')){modal.dispatchEvent(new Event('cancel',{cancelable:true}));}await openFeature('commands');}else if(action==='settings')await(await import('../components/customization/index.js')).open();else if(action==='search'){setView('home');document.querySelector('#web-search')?.focus();}else if(action==='task')emit('task:new');else if(action==='flow')emit('flow:enter');else if(action==='timer')await timerCommand(storage.get().timer.status==='running'?'pause':'start');else{const spaces=await import('./spaces.js'),items=spaces.list(),index=items.findIndex(item=>item.id===storage.activeSpaceId());await spaces.switchSpace(items[(index+1)%items.length].id);}};run().catch(error=>emit('error',error));
}
/** Lazy Stage 3 setup; shared preferences remain owned by the existing engine. */
export async function init(){if(off)return;await initTokens();previousSpace=storage.activeSpaceId();off=settings.subscribe(apply);dataOff=storage.subscribe(apply);events.push(on('commands:open',()=>openFeature('commands').catch(error=>emit('error',error))),on('panel:open',()=>{apply();lease().catch(error=>emit('error',error));}),on('panel:closed',()=>lease().catch(error=>emit('error',error))));apply();if(!keysAttached){document.addEventListener('keydown',keys,true);keysAttached=true;}
 if(globalThis.chrome?.tabs){tabId=(await chrome.tabs.getCurrent())?.id;heartbeat=setInterval(()=>lease().catch(error=>emit('error',error)),30000);observer=new MutationObserver(()=>lease().catch(error=>emit('error',error)));observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});await lease();await requestRules(true);}
 const prefs=settings.get().widgets.preferences.sounds;if(prefs.autoplay&&Object.values(prefs.volumes).some(volume=>volume>0)&&!storage.get().audio.playing){await storage.update(document=>{document.audio.playing=true;document.audio.sleepAt=prefs.fadeMinutes?Date.now()+prefs.fadeMinutes*60000:null;},{sync:false});try{await backgroundSync();}catch(error){await storage.update(document=>{document.audio.playing=false;},{sync:false});emit('toast','Autoplay was unavailable. Start your mix from Sounds.');}}
 addEventListener('pagehide',()=>{if(tabId!==undefined)storage.sessionSet('power-editor-'+tabId,null).catch(()=>{});},{once:true});
}
export function destroy(){off?.();dataOff?.();off=dataOff=null;events.splice(0).forEach(cleanup=>cleanup());clearInterval(heartbeat);observer?.disconnect();document.removeEventListener('keydown',keys,true);keysAttached=false;document.adoptedStyleSheets=document.adoptedStyleSheets.filter(sheet=>sheet!==style);recovery?.remove();style=recovery=null;}
