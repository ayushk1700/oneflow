import * as settings from '../../core/customization.js';
import * as wallpapers from '../../core/wallpapers.js';
import * as spaces from '../../core/spaces.js';
import * as layout from '../../core/personal-layout.js';
import { el } from '../../core/utils.js';
import { field, select, confirmAction } from '../../core/ui.js';
import * as weather from '../weather/index.js';

/** Extend the existing drawer and its single settings/history boundary. */
export async function mount({add,choice,range,button,groups,rows,close,status,reportError}) {
  const urls=new Set(),cleanups=[];
  const read=path=>path.split('.').reduce((v,k)=>v[k],settings.get());
  const register=(section,label,node)=>{groups.get(section).append(node);rows.push({section,label,row:node});return node;};
  // Bounded collection editors use native fields, never executable JSON or HTML.
  function collection(section,label,path,columns,make=value=>value) {
    const root=register(section,label,el('section',{class:'personal-collection'},el('h4',{},label))),list=el('div',{class:'stack'}),form=el('div',{class:'personal-row'}),inputs={};
    for(const [key,title,type='text',value=''] of columns){inputs[key]=el('input',{type,value,'aria-label':title,placeholder:title});form.append(field(title,inputs[key]));}
    const save=values=>settings.set(path,path==='background.gradient.stops'?[...values].sort((a,b)=>a.position-b.position):values);
    const draw=()=>{
      if(list.contains(document.activeElement)&&document.activeElement instanceof HTMLInputElement)return;
      list.replaceChildren();read(path).forEach((item,index)=>{
        const label=typeof item==='string'?item:columns.map(([key])=>item[key]).join(' · '),row=el('div',{class:'personal-row'});
        if(typeof item==='string')row.append(el('span',{},label));
        else for(const [key,title,type='text']of columns){
          const control=el('input',{type,value:item[key],'aria-label':title+' '+(index+1)});
          const change=()=>{try{const values=read(path);values[index]={...values[index],[key]:type==='number'?Number(control.value):control.value};settings.set(path,values);}catch(error){reportError(error);control.value=read(path)[index]?.[key]??'';}};
          control.addEventListener(type==='color'?'input':'change',change);row.append(field(title,control));
        }
        button('Remove '+label,()=>{if(path==='background.gradient.stops'&&read(path).length===2)throw new Error('Keep at least two stops. Edit a stop’s color or position instead.');save(read(path).filter((_,i)=>i!==index));},row);list.append(row);
      });
    };
    list.addEventListener('focusout',()=>queueMicrotask(()=>{if(!list.contains(document.activeElement))draw();}));
    button('Add '+label,()=>{const values=Object.fromEntries(columns.map(([key,,type])=>[key,type==='number'?Number(inputs[key].value):inputs[key].value.trim()]));save(read(path).concat(make(values)));draw();},form);
    root.append(list,form);cleanups.push(settings.subscribe(draw));draw();return root;
  }
  choice('background','Gradient type','background.gradient.type',[['linear','Linear'],['radial','Radial'],['conic','Conic']]);
  range('background','Gradient angle','background.gradient.angle',0,360);
  collection('background','Gradient stops','background.gradient.stops',[['color','Stop color','color',settings.defaults().background.gradient.stops[0].color],['position','Position (%)','number',50]],v=>v);
  for(const[key,title,min,max]of [['brightness','Brightness',40,160],['contrast','Contrast',50,150],['grain','Grain',0,40],['vignette','Vignette',0,80],['overlayOpacity','Tint strength',0,60],['parallax','Mouse parallax',0,20]])range('background',title,'background.effects.'+key,min,max);
  add('background','Overlay tint','background.effects.overlayTint','color');
  choice('background','Ambient scene','background.ambient.type',['none','rain','snow','particles','starfield'].map(v=>[v,v]));range('background','Scene intensity','background.ambient.intensity',0,100);add('background','Static performance mode','background.performance.static');
  choice('background','Favorites rotation','background.rotation.mode',['off','newtab','hourly','daily','time-of-day'].map(v=>[v,v]));
  const media=register('background','Wallpaper collection upload favorites storage quota',el('section',{class:'personal-collection'},el('h4',{},'Wallpaper collection'))),gallery=el('div',{class:'personal-gallery'}),quota=el('p',{role:'status'}),meter=el('meter',{'aria-label':'Browser storage usage',min:0,max:1,value:0});
  const file=el('input',{type:'file',accept:'image/png,image/jpeg,image/webp,image/svg+xml,video/mp4,video/webm','aria-label':'Upload wallpaper'});
  file.onchange=async()=>{try{if(file.files[0])await wallpapers.upload(file.files[0]);await drawMedia();}catch(error){status.textContent=error.message;}finally{file.value='';}};
  const url=el('input',{type:'url',placeholder:'https://…','aria-label':'Wallpaper URL'});media.append(field('Upload image or video',file,'Images up to 8 MB · SVG up to 1 MB · MP4/WebM up to 64 MB.'),field('Wallpaper URL',url));button('Cache wallpaper URL',async()=>{await wallpapers.fromURL(url.value);await drawMedia();},media);media.append(quota,meter,gallery);
  let generation=0,disposed=false;
  async function drawMedia(){const ticket=++generation;const [items,usage]=await Promise.all([wallpapers.collection(),wallpapers.quota()]);if(disposed||ticket!==generation)return;for(const value of urls)URL.revokeObjectURL(value);urls.clear();gallery.replaceChildren();quota.textContent=`${(usage.mediaBytes/1048576).toFixed(1)} MB media · ${(usage.localBytes/1048576).toFixed(1)} MB settings${usage.limit?' · '+(usage.usage/usage.limit*100).toFixed(1)+'% browser quota':''}${usage.warning?' · Storage is nearly full. Export or remove media.':''}`;meter.value=usage.limit?usage.usage/usage.limit:0;
    for(const item of items){const tile=el('article',{},el('span',{},item.name||item.id));if(item.kind==='bundled'||item.kind==='upload'){const src=item.blob?URL.createObjectURL(item.blob):new URL('../../assets/backgrounds/'+item.thumbnail,import.meta.url).href;if(item.blob)urls.add(src);tile.prepend(el('img',{src,alt:'',loading:'lazy',decoding:'async'}));}button('Use '+(item.name||item.id),()=>{const next=settings.get();Object.assign(next.background,{kind:item.kind,id:item.id,url:'',rotate:false});settings.replace(next);},tile);button('Favorite '+(item.name||item.id),()=>{const next=settings.get(),pool=next.background.rotation.pool;const found=pool.findIndex(v=>v.kind===item.kind&&v.id===item.id);if(found>=0)pool.splice(found,1);else pool.push({kind:item.kind,id:item.id,color:next.background.color});settings.replace(next);status.textContent=found>=0?'Removed from rotation.':'Added to rotation.';},tile);if(['upload','video'].includes(item.kind))button('Delete '+(item.name||item.id),()=>confirmAction(tile,'Remove this uploaded wallpaper?',async()=>{await wallpapers.remove(item.kind,item.id);await drawMedia();}),tile);gallery.append(tile);}}
  await drawMedia();
  add('layout','Use custom layout','layout.enabled');add('layout','Lock layout','layout.locked');range('layout','Grid snap (%)','layout.snap',1,10);choice('layout','Sidebar position','layout.sidebar',[['left','Left'],['right','Right']]);
  const presets=register('layout','Layout presets Minimal Focus Dashboard Zen Study Work',el('div',{class:'customization-actions'}));for(const name of ['Minimal','Focus','Dashboard','Zen','Study','Work'])button(name,()=>layout.applyPreset(layout.startingLayout(name)),presets);
  const saved=register('layout','Saved custom layouts',el('div',{class:'customization-actions'})),presetName=el('input',{maxlength:60,'aria-label':'Custom layout name'});saved.append(presetName);button('Save current layout',()=>layout.savePreset(presetName.value),saved);const savedList=el('div',{class:'stack'});saved.append(savedList);
  const drawPresets=()=>{savedList.replaceChildren();for(const preset of settings.get().layout.presets){const row=el('div',{class:'personal-row'});button('Apply '+preset.name,()=>layout.applyPreset(preset),row);button('Delete '+preset.name,()=>settings.set('layout.presets',settings.get().layout.presets.filter(p=>p.id!==preset.id)),row);savedList.append(row);}};cleanups.push(settings.subscribe(drawPresets));drawPresets();
  const prefix='widgets.preferences.';
  const pick=(widget,title,key,values)=>choice('widgets',widget+' · '+title,prefix+widget+'.'+key,values.map(v=>Array.isArray(v)?v:[v,v]));
  const flag=(widget,title,key)=>add('widgets',widget+' · '+title,prefix+widget+'.'+key);
  const input=(widget,title,key,type='text')=>add('widgets',widget+' · '+title,prefix+widget+'.'+key,type);
  const slide=(widget,title,key,min,max)=>range('widgets',widget+' · '+title,prefix+widget+'.'+key,min,max);
  pick('clock','Style','style',['digital','analog','flip','minimal','vertical','word']);flag('clock','Show seconds','seconds');pick('clock','Date format','dateFormat',['long','short','iso','none']);
  // The schema stores week start as a number; select controls normally store strings.
  const week=register('widgets','Clock week start',field('Week starts',select([[0,'Sunday'],[1,'Monday']],read(prefix+'clock.weekStart'),e=>settings.set(prefix+'clock.weekStart',Number(e.target.value)))));
  cleanups.push(settings.subscribe(()=>{const control=week.querySelector('select');if(document.activeElement!==control)control.value=read(prefix+'clock.weekStart');}));
  collection('widgets','Extra time zones',prefix+'clock.timeZones',[['name','City label'],['zone','IANA zone (e.g. Asia/Kolkata)']]);
  input('greeting','Name','name');input('greeting','Template with {name} and {timeOfDay}','template');pick('greeting','Tone','tone',['calm','warm','direct','playful']);input('greeting','Daily focus prompt','focusPrompt');
  pick('tasks','View','view',['list','kanban','matrix','today']);pick('tasks','Sort','sort',['manual','due','priority','alphabetical']);pick('tasks','Group','group',['none','list','tag','priority']);flag('tasks','Completion animation','completionAnimation');flag('tasks','Carry unfinished tasks','carryOver');
  for(const key of ['focus','short','long'])slide('timer',key+' minutes',key,1,180);slide('timer','Sessions before long break','cycles',1,12);flag('timer','Auto start focus','autoFocus');flag('timer','Auto start breaks','autoBreak');const notificationToggle=flag('timer','Notifications','notifications');notificationToggle.addEventListener('change',()=>{if(!notificationToggle.checked||!globalThis.chrome?.permissions)return;const owner=settings.get().behavior.spaceId;chrome.permissions.request({permissions:['notifications']}).then(granted=>{if(!granted&&settings.get().behavior.spaceId===owner){settings.set(prefix+'timer.notifications',false);status.textContent='System notifications were declined. Local notices remain available.';}}).catch(error=>{status.textContent=error.message;});});pick('timer','Sound','sound',['none','chime','bell','soft']);slide('timer','Volume','volume',0,100);
  const modes=register('widgets','Timer saved modes',el('div',{class:'customization-actions'}));const drawModes=()=>{modes.replaceChildren();for(const mode of read(prefix+'timer.modes'))button('Use '+mode.name,()=>{const next=settings.get();Object.assign(next.widgets.preferences.timer,{focus:mode.focus,short:mode.short,long:mode.long});settings.replace(next);},modes);};cleanups.push(settings.subscribe(drawModes));drawModes();
  collection('widgets','Custom timer modes',prefix+'timer.modes',[['name','Mode name'],['focus','Focus minutes','number',25],['short','Break minutes','number',5],['long','Long break minutes','number',15]]);
  flag('journal','Markdown preview','markdown');pick('journal','Prompt pack','promptPack',['gratitude','focus','reflection','custom']);input('journal','Reminder time','reminder','time');
  collection('widgets','Notebooks',prefix+'journal.notebooks',[['name','Notebook name']],v=>v.name);collection('widgets','Custom journal prompts',prefix+'journal.prompts',[['prompt','Prompt']],v=>v.prompt);collection('widgets','Mood tags',prefix+'journal.moodTags',[['mood','Mood']],v=>v.mood);
  pick('quotes','Rotation','rotation',['newtab','hourly','daily']);flag('quotes','Show author','author');collection('widgets','Quote categories',prefix+'quotes.categories',[['category','Category']],v=>v.category);collection('widgets','Your quotes',prefix+'quotes.custom',[['text','Quote'],['author','Author'],['category','Category']],v=>({id:crypto.randomUUID(),...v}));
  pick('links','View','view',['grid','list']);slide('links','Icon size','iconSize',16,48);input('links','Folder (All shows everything)','folder');
  pick('search','Engine','engine',['browser','google','bing','duckduckgo','custom']);input('search','Custom URL with {query}','template','url');pick('search','Position','position',['default','top','bottom']);pick('search','Style','style',['glass','minimal','outlined']);collection('widgets','Bang shortcuts',prefix+'search.bangs',[['bang','Shortcut (without !)'],['template','URL with {query}']]);
  pick('weather','Units','units',['celsius','fahrenheit']);pick('weather','Detail','detail',['simple','detailed']);button('Weather · use device location',async()=>{await weather.autoLocation();settings.set(prefix+'weather.location','auto');},groups.get('widgets'));button('Weather · choose city',async()=>{settings.set(prefix+'weather.location','manual');await close();weather.open();},groups.get('widgets'));
  const profiles=register('behavior','Spaces profiles create rename duplicate delete schedule',el('section',{class:'personal-collection'},el('h4',{},'Spaces'))),profileName=el('input',{maxlength:60,'aria-label':'Space name'}),profileList=el('div',{class:'stack'});profiles.append(field('Space name',profileName),profileList);
  button('Create empty space',async()=>{await spaces.create(profileName.value);drawProfiles();},profiles);button('Duplicate current space',async()=>{await spaces.create(profileName.value,{duplicate:true});drawProfiles();},profiles);
  function drawProfiles(){profileList.replaceChildren();for(const profile of spaces.list()){const row=el('div',{class:'personal-row'},el('span',{},profile.name));button('Switch to '+profile.name,async()=>{await close();await spaces.switchSpace(profile.id);},row);button('Rename '+profile.name,async()=>{await spaces.rename(profile.id,profileName.value);drawProfiles();},row);button('Delete '+profile.name,()=>confirmAction(row,'Delete this space and its data?',async()=>{await close();await spaces.remove(profile.id);}),row);profileList.append(row);}}
  drawProfiles();flagSpace();function flagSpace(){add('behavior','Alt Shift S switches spaces','behavior.spaceHotkey');}
  const schedule=register('behavior','Space time schedule',el('div',{class:'personal-collection'})),spaceChoice=select(spaces.list().map(p=>[p.id,p.name]),spaces.list()[0].id,()=>{}),time=el('input',{type:'time','aria-label':'Switch time'}),rules=el('div');schedule.append(field('Scheduled space',spaceChoice),field('Switch time',time),rules);const drawRules=()=>{rules.replaceChildren();read('behavior.spaceSchedule').forEach((rule,index)=>{const row=el('div',{},el('span',{},`${rule.time} · ${spaces.list().find(p=>p.id===rule.spaceId)?.name||rule.spaceId}`));button('Remove schedule '+rule.time,()=>settings.set('behavior.spaceSchedule',read('behavior.spaceSchedule').filter((_,i)=>i!==index)),row);rules.append(row);});};button('Add space schedule',()=>settings.set('behavior.spaceSchedule',read('behavior.spaceSchedule').concat({spaceId:spaceChoice.value,time:time.value})),schedule);cleanups.push(settings.subscribe(drawRules));drawRules();spaceChoice.onfocus=()=>{const selected=spaceChoice.value;spaceChoice.replaceChildren(...spaces.list().map(p=>el('option',{value:p.id},p.name)));spaceChoice.value=spaces.list().some(p=>p.id===selected)?selected:spaces.list()[0].id;};
  return ()=>{disposed=true;cleanups.forEach(fn=>fn());for(const url of urls)URL.revokeObjectURL(url);};
}
