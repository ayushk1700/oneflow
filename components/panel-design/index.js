import { el } from '../../core/utils.js';
const selections=new Map();
/** Searchable collection with one selected detail; hidden editors retain their drafts.
 * @param {HTMLElement} root @param {{name:string,heading:string,filters?:string[],variant?:string}} options */
export function library(root,{name,heading,filters=[],variant='list'}){
  const entries=[],layout=el('div',{class:`panel-library library-${variant}`}),rail=el('aside',{class:'library-rail','aria-label':heading}),cards=el('div',{class:'library-cards'}),detail=el('div',{class:'library-detail'}),empty=el('p',{class:'empty-state',role:'status'},'No matching items. Try another search or filter.');
  const search=el('input',{type:'search','aria-label':`Search ${heading.toLowerCase()}`,placeholder:`Search ${heading.toLowerCase()}…`}),filtersNode=el('div',{class:'library-filters','aria-label':`${heading} filters`});let filter='All',selected=selections.get(name),preferred=selected;
  function choose(entry,focus=false){selected=entry.id;selections.set(name,selected);for(const x of entries){x.detail.hidden=x!==entry;x.control.setAttribute('aria-pressed',String(x===entry));}if(focus)entry.detail.querySelector('h3')?.focus({preventScroll:true});}
  function draw(){const term=search.value.trim().toLowerCase(),visible=entries.filter(x=>(filter==='All'||x.status===filter)&&`${x.title} ${x.summary}`.toLowerCase().includes(term));for(const x of entries){x.control.hidden=!visible.includes(x);x.detail.hidden=true;}empty.hidden=visible.length>0;if(visible.length)choose(visible.find(x=>x.id===preferred)||visible.find(x=>x.id===selected)||visible[0]);for(const b of filtersNode.children)b.setAttribute('aria-pressed',String(b.textContent===filter));}
  search.addEventListener('input',draw);
  for(const label of ['All',...filters])filtersNode.append(el('button',{type:'button','aria-pressed':String(label===filter),onclick:()=>{filter=label;draw();}},label));
  rail.append(search);if(filters.length)rail.append(filtersNode);rail.append(cards);layout.append(rail,detail,empty);root.append(layout);
  return {add({id,title,summary='',status='',image,detail:content}){
    const control=el('button',{type:'button',class:'library-card','aria-pressed':'false'});
    if(image)control.append(image);control.append(el('strong',{},title),el('small',{},summary));
    const entry={id,title,summary,status,detail:content,control};control.onclick=()=>{preferred=entry.id;choose(entry,true);};
    content.classList.add('library-record');const heading=content.querySelector('h3');if(heading)heading.tabIndex=-1;
    entries.push(entry);cards.append(control);detail.append(content);draw();
  }};
}
/** Keep unrelated activities in separate views with native keyboard tab navigation.
 * @param {HTMLElement} root @param {{label:string,content:HTMLElement}[]} pages */
export function tabs(root,pages,key=''){
  const nav=el('div',{class:'context-tabs',role:'tablist','aria-label':'Workspace views'}),body=el('div',{class:'context-pages'});let active=Math.max(0,pages.findIndex(p=>p.label===selections.get(`view:${key}`)));
  function choose(index,focus=false){active=index;if(key)selections.set(`view:${key}`,pages[index].label);pages.forEach((p,i)=>{p.content.hidden=i!==active;nav.children[i].setAttribute('aria-selected',String(i===active));nav.children[i].tabIndex=i===active?0:-1;});if(focus)nav.children[index].focus();nav.dispatchEvent(new CustomEvent('context:change',{detail:{index,label:pages[index].label}}));}
  pages.forEach((p,i)=>{const id=`view-${crypto.randomUUID()}`;p.content.id=id;p.content.setAttribute('role','tabpanel');p.content.setAttribute('aria-labelledby',`${id}-tab`);nav.append(el('button',{type:'button',id:`${id}-tab`,role:'tab','aria-controls':id,onclick:()=>choose(i)},p.label));body.append(p.content);});
  nav.onkeydown=e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const focused=[...nav.children].indexOf(document.activeElement),from=focused<0?active:focused;choose(e.key==='Home'?0:e.key==='End'?pages.length-1:(from+(e.key==='ArrowRight'?1:-1)+pages.length)%pages.length,true);};
  root.append(nav,body);choose(active);
}
