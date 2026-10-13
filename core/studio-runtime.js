import { get, subscribe } from './storage.js';
import { remaining } from './timer-logic.js';
import { el } from './utils.js';
import { emit } from './events.js';
const fonts={sans:'var(--font-ui)',serif:'var(--font-ui)',mono:'var(--font-mono)',rounded:'var(--font-ui)'};
const selectors={clock:'.clock-time',greeting:'.greeting',timer:'.session-countdown,.session-preview',journal:'.journal-writing'};
const nodes={clock:'#clock',greeting:'.greeting',focus:'#focus',search:'#search',quotes:'#quotes',weather:'#weather',links:'#links',countdowns:'#countdowns'};
let draft,draftDevice,off,observer,tick,completeId,frame,schedule;
const originals=new Map();
const floating = new Map();
function restoreFloating(id) {
 const entry = floating.get(id); if (!entry) return;
 entry.marker.replaceWith(entry.node); delete entry.node.dataset.studioFloating; floating.delete(id);
}
// Explicit saved canvas placements opt out of the default Home disclosure.
function placeFloating(id, node, cell) {
 if (cell && !cell.hidden && node.closest('#home-menu')) {
  const marker = document.createComment('Studio placement'); node.before(marker);
  floating.set(id,{node,marker}); document.body.append(node); node.dataset.studioFloating='true';
 } else if (!cell || cell.hidden) restoreFloating(id);
}
function setStyle(node,key,value){if(!originals.has(node))originals.set(node,node.getAttribute('style'));if(key.startsWith('--'))node.style.setProperty(key,value);else node.style[key]=value;}
function clearStyles(){for(const [node,style] of originals){if(style===null)node.removeAttribute('style');else node.style.cssText=style;}originals.clear();}
/** Apply local preview or saved settings without rewriting records or restarting timers. */
export function apply(settings=get().settings){
 if (!settings.studio?.enabled) for (const id of [...floating.keys()]) restoreFloating(id);
 clearStyles();const s=settings.studio,root=document.documentElement;root.style.setProperty('--roundness',s?.enabled?Math.round(s.surfaces.radius/4)*4/24:1);root.style.setProperty('--animation-level',s?.enabled?s.interaction.duration/200:1);if(!s?.enabled){delete root.dataset.studio;for(const key of ['dockPosition','dockLabels','dockHide','focusStyle','taskPosition','focusCompact','largeControls','reduceTransparency','keyboardProfile','paper'])delete root.dataset[key];document.querySelectorAll('[data-studio-hidden]').forEach(n=>{delete n.dataset.studioHidden;});document.querySelector('.studio-ring')?.remove();const journal=document.querySelector('.journal-workspace');if(journal){delete journal.dataset.paper;journal.dataset.journalTheme=settings.journal.theme==='auto'?root.dataset.theme:settings.journal.theme;}document.querySelector('.journal-templates')?.remove();return;}
 root.dataset.studio='true';
 for(const [key,value] of Object.entries({'studio-radius':s.surfaces.radius+'px','studio-blur':s.surfaces.blur+'px','studio-tint':s.surfaces.tint,'studio-border':s.surfaces.border/100,'studio-shadow':s.surfaces.shadow/100,'studio-motion':s.interaction.duration+'ms'}))root.style.setProperty('--'+key,value);
 for(const [id,selector] of Object.entries(selectors))for(const node of document.querySelectorAll(selector)){const t=s.type[id];setStyle(node,'fontFamily',fonts[t.font]);setStyle(node,'fontSize',(innerWidth<=700&&['clock','timer'].includes(id)?Math.min(t.size,innerWidth*.26):t.size)+'px');setStyle(node,'fontWeight',String(t.weight));setStyle(node,'letterSpacing',t.spacing+'px');setStyle(node,'textAlign',t.align);if(id!=='journal'&&t.color!=='auto')setStyle(node,'color',t.color);}
 const device=draftDevice || (innerWidth<=700?'mobile':'desktop'),layout=s.layouts[device];
 for(const [id,selector] of Object.entries(nodes)){const node=document.querySelector(selector);if(!node)continue;const cell=layout[id];placeFloating(id,node,cell);if(cell){if(cell.hidden)node.dataset.studioHidden='true';else delete node.dataset.studioHidden;setStyle(node,'position','fixed');setStyle(node,'left',cell.x+'%');setStyle(node,'top',cell.y+'%');setStyle(node,'width',cell.w+'vw');setStyle(node,'maxWidth',cell.w+'vw');setStyle(node,'margin','0');setStyle(node,'zIndex','2');setStyle(node,'zoom',String(cell.scale));}else delete node.dataset.studioHidden;}
 const dock=document.querySelector('#dock');for(const button of dock?.children||[]){setStyle(button,'order',String(s.dock.order.indexOf(button.dataset.tool)));button.dataset.studioHidden=String(s.dock.hidden.includes(button.dataset.tool));}
 root.dataset.dockPosition=s.dock.position;root.dataset.dockLabels=String(s.dock.labels);root.dataset.dockHide=String(s.dock.autoHide);
 root.dataset.focusStyle=s.focus.style;root.dataset.taskPosition=s.focus.taskPosition;root.dataset.focusCompact=String(s.focus.compact);root.dataset.largeControls=String(s.access.largeControls);root.dataset.reduceTransparency=String(s.access.reduceTransparency);root.dataset.keyboardProfile=String(s.access.keyboard);
 root.dataset.paper=s.journal.paper;
 if(root.dataset.view==='focus'){if(s.focus.hideQuotes)document.querySelector('#quotes')?.setAttribute('data-studio-hidden','true');if(s.focus.hideWeather)document.querySelector('#weather')?.setAttribute('data-studio-hidden','true');}
 const background=document.querySelector('#landscape');for(const node of [background,...document.querySelectorAll('.landscape-image,.landscape-preview,.live-wallpaper')])if(node){setStyle(node,'backgroundPosition',`${s.wallpaper.x}% ${s.wallpaper.y}%`);setStyle(node,'objectPosition',`${s.wallpaper.x}% ${s.wallpaper.y}%`);}const video=document.querySelector('.live-wallpaper');if(video)video.playbackRate=s.wallpaper.rate;
 const session=document.querySelector('#focus .unified-session');if(session&&s.focus.style==='ring'&&!session.querySelector('.studio-ring'))session.append(el('div',{class:'studio-ring','aria-hidden':'true'}));if(s.focus.style!=='ring')session?.querySelector('.studio-ring')?.remove();progress();
 const workspace=document.querySelector('.journal-workspace');if(workspace){workspace.dataset.journalTheme=settings.journal.theme==='auto'?root.dataset.theme:settings.journal.theme;setStyle(workspace,'--journal-width',settings.journal.width+'px');workspace.dataset.paper=s.journal.paper;}
}
function progress(){const t=get().timer,p=t.duration?1-remaining(t,Date.now())/t.duration:0;document.documentElement.style.setProperty('--studio-progress',Math.max(0,Math.min(1,p))*100+'%');document.querySelector('.studio-ring')?.style.setProperty('--progress',Math.max(0,Math.min(1,p))*100+'%');}
export function preview(settings,device){draft=settings;draftDevice=device;apply(settings);}
export function endPreview(){draft=null;draftDevice=null;apply();}
/** Observe newly rendered widgets, not every attribute mutation. */
export function init(){if(off)return;completeId=get().lastFocusSession?.id;schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>apply(draft||get().settings));};off=subscribe(data=>{schedule();const id=data.lastFocusSession?.id;if(id&&id!==completeId&&data.lastFocusSession.completed){const mode=data.settings.studio.interaction.celebration;if(mode!=='off')emit('toast','Session complete. One good step forward.');if(mode==='sparkles'&&!data.settings.reducedMotion&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const burst=el('div',{class:'studio-celebration','aria-hidden':'true'},...Array.from({length:16},(_,i)=>el('span',{},i%2?'✦':'·')));burst.querySelectorAll('span').forEach((n,i)=>{n.style.setProperty('--angle',i*22.5+'deg');});document.body.append(burst);setTimeout(()=>burst.remove(),1500);}}completeId=id;});observer=new MutationObserver(schedule);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-view']});observer.observe(document.querySelector('#main'),{childList:true,subtree:true});observer.observe(document.querySelector('#panel-body'),{childList:true,subtree:true});addEventListener('resize',schedule);document.querySelector('#view-switcher')?.addEventListener('click',schedule);tick=setInterval(progress,1000);apply();}
export function destroy(){removeEventListener('resize',schedule);document.querySelector('#view-switcher')?.removeEventListener('click',schedule);cancelAnimationFrame(frame);off?.();off=null;observer?.disconnect();clearInterval(tick);draft=null;clearStyles();for(const id of [...floating.keys()])restoreFloating(id);}



