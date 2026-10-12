import { el } from './utils.js';
import { act, icon } from './ui.js';
/** Keep cross-tool navigation quiet without changing the shared dialog lifecycle.
 * @param {HTMLElement} nav @param {Array} items @param {string} active */
export function draw(nav,items,active){
  const menu=el('details',{class:'panel-switcher'},el('summary',{},icon('layout-grid',18),'Switch tool'));
  const choices=el('div',{class:'panel-switcher-options'});
  for(const item of items){
    choices.append(el('button',{type:'button',class:'panel-nav-button','data-tool':item.id,'aria-current':active===item.id?'page':'false',onclick:act(()=>{menu.open=false;return item.open();})},icon(item.glyph,18),item.label));
  }
  menu.append(choices);
  const more=items.find(x=>x.id==='day');
  nav.replaceChildren(el('button',{type:'button',class:'text-button','aria-label':'Back to all tools',onclick:act(()=>more?.open())},icon('arrow-left',18),'All tools'),menu);
}
