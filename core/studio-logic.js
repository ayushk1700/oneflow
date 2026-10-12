import { dayKey } from './utils.js';
/** Sunrise/sunset UTC from a local calendar date; null in polar day/night. */
export function solarTime(date,latitude,longitude,sunset=false){
 const rad=Math.PI/180,day=new Date(date.getFullYear(),date.getMonth(),date.getDate()),n=Math.round((Date.UTC(day.getFullYear(),day.getMonth(),day.getDate())-Date.UTC(day.getFullYear(),0,0))/86400000),lng=longitude/15,t=n+((sunset?18:6)-lng)/24;
 const m=.9856*t-3.289,l=(m+1.916*Math.sin(m*rad)+.020*Math.sin(2*m*rad)+282.634+360)%360;
 let ra=Math.atan(.91764*Math.tan(l*rad))/rad;ra=(ra+360)%360;ra+=(Math.floor(l/90)*90-Math.floor(ra/90)*90);ra/=15;
 const sinDec=.39782*Math.sin(l*rad),cosDec=Math.cos(Math.asin(sinDec)),cosH=(Math.cos(90.833*rad)-sinDec*Math.sin(latitude*rad))/(cosDec*Math.cos(latitude*rad));if(cosH>1||cosH< -1)return null;
 const h=(sunset?Math.acos(cosH)/rad:360-Math.acos(cosH)/rad)/15,utc=(h+ra-.06571*t-6.622-lng+24)%24;
 let result=new Date(Date.UTC(day.getFullYear(),day.getMonth(),day.getDate())+utc*3600000);
 // Choose the UTC candidate that falls on the requested local day.
 if(dayKey(result)!==dayKey(day))result=new Date(result.getTime()+(dayKey(result)<dayKey(day)?86400000:-86400000));return result;
}
/** A deterministic due key prevents repeated scene application across alarm ticks. */
export function dueRule(rule,automation,timer,now=new Date()){
 if(!rule.days.includes(now.getDay()))return null;
 if(rule.trigger==='phase'){const phase=timer.phase==='focus'?'focus':'break',id=timer.sessionId || (phase==='break'?`break-${timer.cycle}`:null);return id&&phase===rule.phase?`${dayKey(now)}:${id}:${timer.phase}`:null;}
 let time;if(rule.trigger==='sunrise'||rule.trigger==='sunset')time=solarTime(now,automation.latitude,automation.longitude,rule.trigger==='sunset');else{time=new Date(now);const [h,m]=rule.time.split(':').map(Number);time.setHours(h,m,0,0);}return time&&now>=time?dayKey(now):null;
}
/** Stable shuffled order without storing wall-clock timer counters. */
export function playlistIndex(length,minutes,shuffle,now=Date.now()){
 if(!length)return -1;const slot=Math.floor(now/(minutes*60000));if(!shuffle)return slot%length;const round=Math.floor(slot/length),order=Array.from({length},(_,i)=>i);let seed=(round^0x71e3)>>>0;for(let i=length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}return order[slot%length];
}
