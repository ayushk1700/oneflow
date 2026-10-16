import * as settings from '../../core/customization.js';
import '../../core/power-i18n.js';
import {t} from '../../core/i18n.js';
import * as runtime from '../../core/customization-runtime.js';
import { el, download } from '../../core/utils.js';
import { field, select, closePanel, confirmAction } from '../../core/ui.js';
import { backgroundCatalog } from '../../core/background-presentation.js';
import { openFeature } from '../../core/features.js';
let drawer, off, opening;
const sections = [['theme','Appearance'],['background','Background'],['ambient','Ambient'],['layout','Layout'],['widgets','Widgets'],['behavior','Behavior'],['accessibility','Accessibility'],['data','Data']];
/** Stage 1 drawer: immediate preview and debounced persistence, with reversible session edits. */
export function open(initial = 'theme') {
  if (opening) return opening;
  opening = build(initial).catch(error => { off?.(); off=null; drawer?.remove(); drawer=null; throw error; }).finally(() => { opening=null; });
  return opening;
}
async function build(initial) {
  if (drawer) { drawer.querySelector('[type=search]').focus(); return; }
  closePanel(); await runtime.init();
  const baseline = settings.get(), rows = [], controls = new Map(); let failure = ''; let category = sections.some(([id]) => id === initial) ? initial : 'theme';
  const status = el('p', { class:'customization-status', role:'status', 'aria-live':'polite' }, 'Changes save automatically.');
  drawer = el('dialog', { class:'customization-drawer', 'aria-labelledby':'customization-title' });
  const head = el('header', { class:'customization-head' }, el('h2', { id:'customization-title' }, 'Personalize ONEFLOW'));
  const button = (label, action, parent = head) => {
    const node = el('button', { type:'button', onclick:async () => { try { failure=''; await action(); status.textContent='Changes save automatically.'; } catch(error) { failure=error.message; status.textContent=failure; } } }, t(label));
    parent.append(node); return node;
  };
  const search = el('input', { class:'customization-search', type:'search', placeholder:'Find a setting…', 'aria-label':'Search settings' });
  const nav = el('nav', { class:'customization-nav', 'aria-label':'Customization sections' }), body = el('div', { class:'customization-body' });
  const actions = el('div', { class:'customization-actions' });
  const undo = button('Undo', settings.undo, actions), redo = button('Redo', settings.redo, actions);
  button('Revert all changes', () => settings.replace(baseline), actions);
  button('Retry save', settings.flush, actions);
  button('Close', close);
  drawer.append(head, search, nav, actions, status, body);
  const groups = new Map();
  for (const [id,label] of sections) {
    const group = el('section', { class:'customization-section', 'aria-label':label }, el('h3', {}, label)); groups.set(id,group); body.append(group);
    const link = button(label, () => { category=id; search.value=''; filter(); }, nav); link.dataset.section=id;
    if (id !== 'data') button('Reset '+label, () => id==='ambient'?settings.set('widgets.preferences.ambient',settings.defaults().widgets.preferences.ambient):settings.reset(id), group);
  }
  const value = path => path.split('.').reduce((v,key) => v[key],settings.get());
  function add(section, label, path, type = 'checkbox', options = {}) {
    const node = type === 'select' ? select(options.options, value(path), () => {}) : el('input', { type, ...options });
    if (type !== 'select') node[type === 'checkbox' ? 'checked' : 'value'] = value(path);
    const output = type === 'range' ? el('output', { class:'customization-value' }, String(value(path))) : null;
    const row = field(label,node); if(output)row.append(output); groups.get(section).append(row); rows.push({section,label,row}); controls.set(path,{node,output,type});
    const change = () => {
      try {
        const next = type === 'checkbox' ? node.checked : type === 'range' || type === 'number' ? Number(node.value) : node.value;
        failure=''; settings.set(path,next); if(output)output.textContent=String(next); status.textContent='Saving changes…';
      } catch(error) { failure=error.message; status.textContent=failure; node[type==='checkbox'?'checked':'value']=value(path); }
    };
    node.addEventListener(['range','color'].includes(type)?'input':'change',change);
    return node;
  }
  const range = (section,label,path,min,max,step=1) => add(section,label,path,'range',{min,max,step});
  const choice = (section,label,path,options) => add(section,label,path,'select',{options});
  choice('theme','Theme mode','theme.mode',[['dark','Dark'],['light','Light']]);
  add('theme','Accent color','theme.accent','color');
  range('theme','Glass blur','theme.glass.blur',0,40);range('theme','Glass opacity','theme.glass.opacity',80,100);range('theme','Glass border','theme.glass.border',0,80);range('theme','Glass shadow','theme.glass.shadow',0,90);
  range('theme','Corner radius','theme.shape.radius',0,36);range('theme','Border thickness','theme.shape.borderThickness',0,3,.5);
  choice('theme','Font family','theme.typography.family',[['system','System sans'],['atkinson','Atkinson Hyperlegible · bundled'],['opendyslexic','OpenDyslexic · bundled'],['mono','System monospace']]);
  range('theme','Text size scale','theme.typography.scale',.85,1.5,.05);range('theme','Font weight','theme.typography.weight',300,700,100);range('theme','Line height','theme.typography.lineHeight',1.3,2,.1);
  choice('background','Background type','background.kind',[['bundled','Local wallpaper'],['solid','Solid color'],['gradient','Gradient'],['animated-gradient','Animated gradient'],['animated','Animated atmosphere'],['upload','Uploaded photo'],['video','Saved video'],['local-video','Local video']]);
  const backgrounds=await backgroundCatalog();choice('background','Wallpaper','background.id',backgrounds.map(item=>[item.id,item.name]));
  const atmospheres=el('div',{class:'customization-actions'});groups.get('background').append(atmospheres);
  for(const[id,label]of [['aurora','Aurora glow'],['dusk','Rose dusk'],['ocean','Ocean drift'],['ember','Warm embers']])button(label,()=>{const next=settings.get();Object.assign(next.background,{kind:'animated',id,rotate:false});settings.replace(next);},atmospheres);
  add('background','Background color','background.color','color');range('background','Background blur','background.blur',0,20);add('background','Rotate local wallpapers','background.rotate');
  button('Upload photo or video',async()=>{await close();const {emit}=await import('../../core/events.js');emit('settings:open','backgrounds');},groups.get('background'));
  choice('layout','Density','layout.density',[['compact','Compact'],['comfortable','Comfortable'],['spacious','Spacious']]);
  button('Arrange dashboard',async()=>{await close();await (await import('../layout-editor/index.js')).open();},groups.get('layout'));
  for(const [key,value] of Object.entries(settings.get().widgets))if(typeof value==='boolean')add('widgets',key[0].toUpperCase()+key.slice(1),'widgets.'+key);
  add('ambient','Show clock in Ambient','widgets.preferences.ambient.clock');
  groups.get('ambient').append(el('p',{},'Ambient keeps only Home, the immersive icon and your optional clock. Use the immersive icon to enter fullscreen; Escape exits fullscreen. Sounds and focus sessions keep running.'));
  add('behavior','Zen mode · clock only','behavior.zen');add('behavior','24-hour clock','behavior.clock24');
  choice('behavior','Startup view','behavior.startupView',[['home','Home'],['focus','Focus'],['ambient','Ambient']]);
  add('accessibility','High contrast','accessibility.highContrast');add('accessibility','Reduce motion','accessibility.reduceMotion');add('accessibility','Large text','accessibility.largeText');add('accessibility','Dyslexia-friendly font','accessibility.dyslexia');
  groups.get('accessibility').append(el('p',{},'OpenDyslexic is bundled locally. Choose the font that feels easiest to read; individual preferences vary.'));
  const data=groups.get('data');button('Export settings',async()=>{await settings.flush();download(new Blob([settings.exportJSON()],{type:'application/json'}),'oneflow-settings.json');},data);
  const file=el('input',{type:'file',accept:'.json,application/json','aria-label':'Import settings JSON',onchange:async()=>{try{const selected=file.files[0];file.value='';if(!selected)return;if(selected.size>512*1024)throw new Error('Settings file must be no larger than 512 KB.');failure=''; settings.importJSON(await selected.text());await settings.flush();status.textContent='Settings imported and saved.';}catch(error){failure=error.message; status.textContent=failure;}}});data.append(field('Import settings JSON',file));
  button('Reset all settings',()=>confirmAction(data,'Reset all customization settings? Your tasks, notes and media will remain.',()=>settings.reset()),data);
  button('Clear all data',()=>confirmAction(data,'Delete all ONEFLOW data, media and optional access? Download a backup first. This cannot be undone.',async()=>{await settings.flush();await(await import('../../core/backup.js')).resetData();location.reload();}),data);
  const personalization=await (await import('./personalization.js')).mount({add,choice,range,button,groups,rows,close,status,reportError:error=>{failure=error.message;status.textContent=failure;}});
  const power=(await import('./power.js')).mount({add,choice,range,button,groups,rows,close,status});
  const empty=el('p',{role:'status'},'No matching settings.');body.append(empty);
  function filter(){const term=search.value.trim().toLowerCase();let count=0;for(const[id,group]of groups){group.hidden=term?!rows.some(row=>row.section===id&&row.label.toLowerCase().includes(term)):id!==category;}for(const row of rows){row.row.hidden=!!term&&!row.label.toLowerCase().includes(term);if(!row.row.hidden&&!groups.get(row.section).hidden)count++;}for(const link of nav.children)link.setAttribute('aria-current',String(link.dataset.section===category&&!term));empty.hidden=!term||count>0;}
  function refresh(){for(const[path,{node,type,output}]of controls){if(document.activeElement!==node)node[type==='checkbox'?'checked':'value']=value(path);if(output)output.textContent=String(value(path));}const history=settings.history();undo.disabled=!history.undo;redo.disabled=!history.redo;filter();if(!settings.isSaving()&&!failure)status.textContent='Saved on this device.';}
  const origin=document.activeElement,modal=drawer;off=settings.subscribe(refresh);search.oninput=filter;
  function cleanup(){if(drawer!==modal)return;try{off?.();personalization?.();power?.();}finally{off=null;modal.remove();drawer=null;(origin?.isConnected&&origin.getClientRects().length?origin:document.querySelector('#home-menu > summary'))?.focus();}}
  drawer.addEventListener('close',cleanup);
  drawer.addEventListener('cancel',event=>{event.preventDefault();close().catch(error=>{failure=error.message; status.textContent=failure;});});
  function close(){modal.close();cleanup();settings.flush().catch(error=>{import('../../core/events.js').then(({emit})=>emit('toast','Your settings draft is kept. Reopen Personalize and retry saving: '+error.message));});return Promise.resolve();}
  document.body.append(drawer);drawer.showModal();refresh();search.focus();
}
export function init() { return runtime.init(); }
export function render(){return open();}
export function destroy(){off?.();off=null;drawer?.close();}
