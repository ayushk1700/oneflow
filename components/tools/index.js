import { get } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { openPanel, act, icon, panelRequest } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { openFeature } from '../../core/features.js';
import { preferences,remember,favorite } from '../../core/tool-preferences.js';
const groups = [
 ['Workspaces', [['firststep','First Step Mode','play','Begin with one tiny action.'],['recall','Recall Rooms','bookmark','Learn and revisit concepts.'],['garden','Idea Garden','sun','Capture, connect and grow ideas.'],['proof','Proof of Work','clock','Approve a private project report.'],['energyweather','Energy Weather','sun','Check energy and recovery.'],['afterglow','Afterglow','list-todo','Turn meetings into next actions.'],['career','Career Sprint','list-todo','Prepare and follow up consistently.'],['quietweb','Quiet Web','layout-grid','Organize tabs with a return path.'],['skills','Skill Loops','bookmark','Practice with evidence and reviews.']]],
 ['Work context', [['capsules','Focus Capsules','bookmark','Save and return to your work.'],['recovery','Focus Recovery','clock','Leave a next action; return gently.'],['compiler','Next-Step Compiler','list-todo','Turn a brief into editable actions.'],['dna','Local Focus DNA','sun','Find patterns privately, with explanations.'],['energy','Energy Planner','layout-grid','Fit tasks to your energy pattern.']]],
 ['Focus', [['sounds','Sounds','audio-lines','Layer a soundscape.'],['scenes','Scenes','image','Save a complete atmosphere.'],['stats','Stats','clock','Your recorded focus progress.']]],
 ['Plan', [['queue','Priorities','list-todo','Plan three important next steps.'],['notes','Notes','pencil','Notes, tasks and habits in one place.'],['countdowns','Countdowns','clock','Upcoming milestones.'],['commands','Find an action','search','Search tools and tasks.'],['blocker','Website blocking','sliders-horizontal','Optional focus boundaries.']]],
 ['Recharge', [['journal','Journal','bookmark','Write and revisit reflections.'],['rituals','Daily check-in','sun','Set an intention.'],['reflection','Session reflection','bookmark','Reflect on a session.'],['mood','Mood','heart','Check in with yourself.'],['notifications','Notifications','bell','Review confirmations and reminders.'],['music','Music','play','Your music services.'],['suggestions','Suggestions','sun','Ideas for your next step.']]],
 ['Personalize', [['customizer','Customize','sliders-horizontal','Design your whole workspace.'],['websearch','Web search','search','Use your default search provider.'],['dictionary','Dictionary','bookmark','Words and definitions.'],['layout','Layout','layout-grid','Design desktop and mobile arrangements.'],['support','Help & feedback','bookmark','Local help and diagnostics.']]]
];
/** Render a searchable local launcher with explicit favorites and recent choices. @returns {Promise<void>} */
export async function open() {
 const current=panelRequest(),prefs=await preferences();if(!current())return;
 const root=el('div',{class:'stack tool-directory'}),results=el('div',{class:'stack'}),search=el('input',{type:'search','aria-label':'Search all tools',placeholder:'Find a tool or workspace…',autocomplete:'off'}),status=el('p',{class:'muted',role:'status'});
 root.append(el('div',{class:'tool-directory-search'},search),results,status);
 const enabled=groups.flatMap(([,items])=>items).filter(([id])=>id==='notes'?['notes','tasks','habits'].some(k=>get().settings.widgets[k]):!(id in get().settings.widgets)||get().settings.widgets[id]);
 function card([id,label,glyph,description]){
   const launch=el('button',{type:'button',class:'day-card','aria-label':label,onclick:act(async()=>{await remember(id);if(id==='tasks')emit('task:new');else await openFeature(id);})},icon(glyph),el('strong',{},label),el('small',{},description));
   const star=el('button',{type:'button',class:'tool-favorite icon-button','data-favorite':id,'aria-label':`Favorite ${label}`,'aria-pressed':String(prefs.favorites.includes(id)),onclick:act(async()=>{await favorite(id);const latest=await preferences();prefs.favorites=latest.favorites;draw();results.querySelector(`[data-favorite="${id}"]`)?.focus();})},icon('bookmark',16));
   return el('div',{class:'tool-card-wrap'},launch,star);
 }
 function group(title,items){if(!items.length)return;results.append(el('section',{class:'tool-group stack'},el('h3',{},title),el('div',{class:'day-grid'},...items.map(card))));}
 function draw(){results.replaceChildren();const query=search.value.trim().toLowerCase(),matches=enabled.filter(item=>item.join(' ').toLowerCase().includes(query));
   if(query)group('Search results',matches);
   else {const favorites=matches.filter(([id])=>prefs.favorites.includes(id)),recent=prefs.recent.map(id=>matches.find(x=>x[0]===id)).filter(Boolean).filter(([id])=>!prefs.favorites.includes(id));group('Favorites',favorites);group('Recent',recent);const featured=new Set([...favorites,...recent].map(x=>x[0]));for(const [title,items] of groups)group(title,items.filter(item=>matches.includes(item)&&!featured.has(item[0])));}
   status.textContent=matches.length?`${matches.length} tools available. Bookmark a tool to keep it in Favorites.`:'No matching tools. Try “study”, “sound” or “capsule”.';
 }
 search.oninput=draw;draw();root.append(el('button',{type:'button',onclick:()=>emit('settings:open','appearance')},'Settings'));openPanel('Tools','day',root);
}
export const render=open;
export function init(){}
export function destroy(){}
