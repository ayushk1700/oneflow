import { get } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { openPanel, act, icon, panelRequest } from '../../core/ui.js';
import { groups, tools, toolEnabled, matchesTool, launchTool, openSettings } from '../../core/tool-catalog.js';
import { preferences,favorite } from '../../core/tool-preferences.js';
/** Render a searchable local launcher with explicit favorites and recent choices. @returns {Promise<void>} */
export async function open() {
 const current=panelRequest(),prefs=await preferences();if(!current())return;
 const root=el('div',{class:'stack tool-directory'}),results=el('div',{class:'stack'}),search=el('input',{type:'search','aria-label':'Search all tools',placeholder:'Find a tool or workspace…',autocomplete:'off'}),status=el('p',{class:'muted',role:'status'});
 root.append(el('div',{class:'tool-directory-search'},search),results,status);
 const enabled=tools.filter(([id])=>toolEnabled(id));
 function card([id,label,glyph,description]){
   const launch=el('button',{type:'button',class:'day-card','aria-label':label,onclick:act(()=>launchTool(id))},icon(glyph),el('strong',{},label),el('small',{},description));
   const star=el('button',{type:'button',class:'tool-favorite icon-button','data-favorite':id,'aria-label':`Favorite ${label}`,'aria-pressed':String(prefs.favorites.includes(id)),onclick:act(async()=>{await favorite(id);const latest=await preferences();prefs.favorites=latest.favorites;draw();results.querySelector(`[data-favorite="${id}"]`)?.focus();})},icon('bookmark',16));
   return el('div',{class:'tool-card-wrap'},launch,star);
 }
 function group(title,items){if(!items.length)return;results.append(el('section',{class:'tool-group stack'},el('h3',{},title),el('div',{class:'day-grid'},...items.map(card))));}
 function draw(){results.replaceChildren();const query=search.value.trim().toLowerCase(),matches=enabled.filter(item=>matchesTool(item,query));
   if(query)group('Search results',matches);
   else {const favorites=matches.filter(([id])=>prefs.favorites.includes(id)),recent=prefs.recent.map(id=>matches.find(x=>x[0]===id)).filter(Boolean).filter(([id])=>!prefs.favorites.includes(id));group('Favorites',favorites);group('Recent',recent);const featured=new Set([...favorites,...recent].map(x=>x[0]));for(const [title,items] of groups)group(title,items.filter(item=>matches.includes(item)&&!featured.has(item[0])));}
   status.textContent=matches.length?`${matches.length} tools available. Bookmark a tool to keep it in Favorites.`:'No matching tools. Try “study”, “sound” or “capsule”.';
 }
 search.oninput=draw;draw();root.append(el('button',{type:'button',onclick:()=>openSettings()},'Settings'));openPanel('All tools','day',root);
}
export const render=open;
export function init(){}
export function destroy(){}
