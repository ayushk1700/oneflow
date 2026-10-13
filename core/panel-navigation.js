import { el } from './utils.js';
import { act, icon } from './ui.js';
import { groups, toolEnabled, matchesTool, launchTool, openSettings } from './tool-catalog.js';
/** Keep cross-tool navigation quiet without changing the shared dialog lifecycle.
 * @param {HTMLElement} nav @param {Array} items @param {string} active */
export function draw(nav,items,active){
  const menu=el('details',{class:'panel-switcher'},el('summary',{},icon('layout-grid',18),'Switch tool'));
  const choices=el('div',{class:'panel-switcher-options'});
  const search=el('input',{type:'search','aria-label':'Search switch tools',placeholder:'Find a tool…'}),results=el('div'),status=el('p',{class:'muted',role:'status'});
  function choice(id,label,glyph,open) {
    return el('button',{type:'button',class:'panel-nav-button','data-tool':id,'aria-current':active===id?'page':'false',onclick:act(()=>{menu.open=false;return open();})},icon(glyph),label);
  }
  function drawChoices(){
    results.replaceChildren();let count=0;
    for(const [label,tools] of groups){
      const matches=tools.filter(tool=>toolEnabled(tool[0])&&matchesTool(tool,search.value));
      if(!matches.length)continue;
      count+=matches.length;results.append(el('section',{class:'switcher-group'},el('h3',{},label),...matches.map(([id,title,glyph])=>choice(id,title,glyph,()=>launchTool(id)))));
    }
    status.textContent=count?`${count} tools available`:'No matching tools.';
  }
  search.oninput=drawChoices;drawChoices();
  choices.append(search,results,status,choice('settings','Settings','sliders-horizontal',()=>openSettings()));
  menu.append(choices);
  const more=items.find(x=>x.id==='day');
  choices.prepend(choice('day','All tools','layout-grid',()=>more?.open()));
  const back=el('button',{type:'button',class:'text-button','aria-label':'Back to all tools',onclick:act(()=>more?.open())},icon('arrow-left',18),'All tools');
  nav.replaceChildren(...(active==='day'?[]:[back]),menu);
}
