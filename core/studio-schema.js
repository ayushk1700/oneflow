export const ELEMENTS=['clock','greeting','focus','search','quotes','weather','links','countdowns'];
export const DOCK_TOOLS=['journal','workspace','sounds','music','stats'];
export const FONT_NAMES=['sans','serif','mono','rounded'];
export function studioDefaults(){return {
 enabled:false,
 type:Object.fromEntries(['clock','greeting','timer','journal'].map(id=>[id,{font:'sans',size:{clock:128,greeting:24,timer:160,journal:18}[id],weight:400,spacing:0,color:'auto',align:'center'}])),
 surfaces:{blur:24,tint:'#1c2522',radius:20,border:16,shadow:50},
 layouts:{desktop:{},mobile:{},snap:5},
 wallpaper:{x:50,y:50,rate:1,minutes:30,shuffle:false,playlist:[]},
 dock:{order:[...DOCK_TOOLS],hidden:[],position:'center',labels:false,autoHide:false},
 focus:{style:'digits',taskPosition:'above',compact:false,hideQuotes:true,hideWeather:true},
 interaction:{keys:{task:'n',flow:'f',search:'/',timer:'Space'},sound:'chime',volume:50,duration:200,celebration:'text'},
 access:{profile:'custom',largeControls:false,reduceTransparency:false,keyboard:false},
 journal:{paper:'plain',templates:[{id:'daily',name:'Daily reflection',text:'Today I am grateful for…\n\nOne small win…\n\nTomorrow I will…'}]},
 soundscapes:[],phaseSounds:{focus:'',break:'',fade:2},
 automation:{enabled:false,pausedUntil:0,rules:[],lastRuns:{},latitude:0,longitude:0}
};}
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const num=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
const str=(v,n)=>typeof v==='string'&&v.length<=n;
const color=v=>typeof v==='string'&&/^#[a-f\d]{6}$/i.test(v);
const choice=(v,values)=>values.includes(v);
const bool=v=>typeof v==='boolean';
export function mergeStudio(raw){const base=studioDefaults();if(raw===undefined)return base;if(!obj(raw))throw new Error('Invalid customization settings.');for(const key of Object.keys(base))if(key in raw && raw[key] !== undefined)base[key]=obj(base[key])&&obj(raw[key])?{...base[key],...raw[key]}:raw[key];for(const id of ['clock','greeting','timer','journal'])base.type[id]={...studioDefaults().type[id],...raw.type?.[id]};return base;}
/** Validate customization, including presets and scene snapshots, before persistence. */
export function validateStudio(s){
 const fail=()=>{throw new Error('Invalid customization settings.');};
 if(!obj(s)||!bool(s.enabled)||!obj(s.type))fail();
 for(const id of ['clock','greeting','timer','journal']){const t=s.type[id];if(!t||!choice(t.font,FONT_NAMES)||!num(t.size,id==='journal'?14:16,id==='journal'?32:240)||!num(t.weight,300,900)||!num(t.spacing,-5,12)||(!color(t.color)&&t.color!=='auto')||!choice(t.align,['left','center','right']))fail();}
 const p=s.surfaces;if(!p||!num(p.blur,0,40)||!color(p.tint)||!num(p.radius,0,36)||!num(p.border,0,80)||!num(p.shadow,0,90))fail();
 if(!obj(s.layouts)||!num(s.layouts.snap,1,20))fail();for(const device of ['desktop','mobile']){const layout=s.layouts[device];if(!obj(layout)||Object.keys(layout).some(id=>!ELEMENTS.includes(id)))fail();for(const cell of Object.values(layout))if(!obj(cell)||!num(cell.x,0,95)||!num(cell.y,0,90)||!num(cell.w,10,100)||cell.x+cell.w>100.01||!num(cell.scale,.5,1.5)||!bool(cell.locked)||!bool(cell.hidden))fail();}
 const w=s.wallpaper;if(!w||!num(w.x,0,100)||!num(w.y,0,100)||!num(w.rate,.25,2)||!num(w.minutes,1,1440)||!bool(w.shuffle)||!Array.isArray(w.playlist)||w.playlist.length>30)fail();for(const b of w.playlist)if(!obj(b)||!choice(b.kind,['bundled','upload','video','local-video','animated','solid','gradient'])||!str(b.id,100)||!color(b.color)||!num(b.blur,0,20)||!bool(b.rotate))fail();
 const d=s.dock;if(!d||!Array.isArray(d.order)||d.order.length!==DOCK_TOOLS.length||new Set(d.order).size!==DOCK_TOOLS.length||d.order.some(id=>!DOCK_TOOLS.includes(id))||!Array.isArray(d.hidden)||new Set(d.hidden).size!==d.hidden.length||d.hidden.some(id=>!DOCK_TOOLS.includes(id))||!choice(d.position,['left','right','center'])||!bool(d.labels)||!bool(d.autoHide))fail();
 const f=s.focus;if(!f||!choice(f.style,['digits','ring','bar'])||!choice(f.taskPosition,['above','below'])||['compact','hideQuotes','hideWeather'].some(k=>!bool(f[k])))fail();
 const i=s.interaction;if(!i||!obj(i.keys)||!choice(i.sound,['chime','bell','soft','none'])||!num(i.volume,0,100)||!num(i.duration,0,500)||!choice(i.celebration,['off','text','sparkles']))fail();const keys=Object.values(i.keys);if(['task','flow','search','timer'].some(k=>!choice(i.keys[k],['Space','/','n','f','t','s','p','j','w','g']))||new Set(keys).size!==4)fail();
 const a=s.access;if(!a||!choice(a.profile,['custom','comfortable','contrast','calm','keyboard'])||['largeControls','reduceTransparency','keyboard'].some(k=>!bool(a[k])))fail();
 const j=s.journal;if(!j||!choice(j.paper,['plain','ruled','dots'])||!Array.isArray(j.templates)||j.templates.length>20||new Set(j.templates.map(t=>t.id)).size!==j.templates.length||j.templates.some(t=>!str(t.id,100)||!str(t.name,80)||!t.name.trim()||!str(t.text,2000)))fail();
 if(!Array.isArray(s.soundscapes)||s.soundscapes.length>20||new Set(s.soundscapes.map(m=>m.id)).size!==s.soundscapes.length)fail();for(const m of s.soundscapes)if(!str(m.id,100)||!str(m.name,80)||!m.name.trim()||!num(m.master,0,1)||!obj(m.volumes)||['rain','cafe','fireplace','forest','ocean','white','brown'].some(k=>!num(m.volumes[k],0,1)))fail();
 if(!s.phaseSounds||!str(s.phaseSounds.focus,100)||!str(s.phaseSounds.break,100)||!num(s.phaseSounds.fade,0,10))fail();
 const auto=s.automation;if(!auto||!bool(auto.enabled)||!num(auto.pausedUntil,0,9e15)||!num(auto.latitude,-90,90)||!num(auto.longitude,-180,180)||!Array.isArray(auto.rules)||auto.rules.length>20||new Set(auto.rules.map(r=>r.id)).size!==auto.rules.length||!obj(auto.lastRuns)||Object.keys(auto.lastRuns).length>20||Object.values(auto.lastRuns).some(v=>!str(v,160)))fail();for(const r of auto.rules)if(!str(r.id,100)||!str(r.sceneId,100)||!choice(r.trigger,['time','sunrise','sunset','phase','weekday'])||!/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time)||!choice(r.phase,['focus','break'])||!Array.isArray(r.days)||!r.days.length||r.days.some(d=>!Number.isInteger(d)||!num(d,0,6)))fail();return s;
}


