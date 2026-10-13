import { el } from './utils.js';

/** Attach one inline error to a field and preserve any existing hint association. */
export function setFieldError(control,message='') {
  const previous=control.dataset.errorId;
  if(previous){document.getElementById(previous)?.remove();control.setAttribute('aria-describedby',(control.getAttribute('aria-describedby')||'').split(' ').filter(id=>id!==previous).join(' '));delete control.dataset.errorId;}
  control.setAttribute('aria-invalid',String(Boolean(message)));
  if(!message)return;
  const id=`error-${crypto.randomUUID()}`,error=el('p',{id,class:'ui-error-message',role:'alert'},message);
  control.dataset.errorId=id;control.setAttribute('aria-describedby',[control.getAttribute('aria-describedby'),id].filter(Boolean).join(' '));control.after(error);
}

/** Run an asynchronous action once, retaining its accessible label and size. */
export async function busy(control,action) {
  if(control.getAttribute('aria-busy')==='true')return;
  const disabled=control.disabled;control.disabled=true;control.setAttribute('aria-busy','true');
  try{return await action();}finally{control.disabled=disabled;control.removeAttribute('aria-busy');}
}

/** Roving keyboard focus for tablists, menus and segmented choices; returns cleanup. */
export function roving(group,{selector='button',select=true}={}) {
  const items=()=>[...group.querySelectorAll(selector)].filter(n=>!n.disabled&&n.getAttribute('aria-disabled')!=='true'&&!n.hidden);
  const move=event=>{
    if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    const nodes=items();if(!nodes.length)return;event.preventDefault();
    const current=Math.max(0,nodes.indexOf(document.activeElement)),next=event.key==='Home'?0:event.key==='End'?nodes.length-1:(current+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+nodes.length)%nodes.length;
    nodes.forEach((node,i)=>node.tabIndex=i===next?0:-1);nodes[next].focus();if(select)nodes[next].click();
  };
  group.addEventListener('keydown',move);return()=>group.removeEventListener('keydown',move);
}

/** A focus/hover tooltip, dismissible with Escape and associated with its trigger. */
export function tooltip(trigger,text) {
  const tip=el('span',{id:`tip-${crypto.randomUUID()}`,class:'ui-tooltip',role:'tooltip',hidden:true},text);
  const previous=trigger.getAttribute('aria-describedby');trigger.setAttribute('aria-describedby',[previous,tip.id].filter(Boolean).join(' '));trigger.after(tip);
  let dismissed=false;
  const show=()=>{if(!dismissed)tip.hidden=false;},hide=()=>{tip.hidden=true;dismissed=false;},key=e=>{if(e.key==='Escape'){tip.hidden=true;dismissed=true;}};
  trigger.addEventListener('focus',show);trigger.addEventListener('pointerenter',show);trigger.addEventListener('blur',hide);trigger.addEventListener('pointerleave',hide);trigger.addEventListener('keydown',key);
  return()=>{tip.remove();if(previous)trigger.setAttribute('aria-describedby',previous);else trigger.removeAttribute('aria-describedby');for(const [event,fn] of [['focus',show],['pointerenter',show],['blur',hide],['pointerleave',hide],['keydown',key]])trigger.removeEventListener(event,fn);};
}
