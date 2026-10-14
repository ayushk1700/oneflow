import { el } from '../../core/utils.js';

let card, face, hourHand, minuteHand, expandButton, caption;
/** Shared analog geometry for Ambient and the personalized dashboard clock. */
export function createClockFace({seconds=false}={}){const hourHand=el('span',{class:'ambient-clock-hand ambient-clock-hour'}),minuteHand=el('span',{class:'ambient-clock-hand ambient-clock-minute'}),secondHand=seconds?el('span',{class:'ambient-clock-hand personal-clock-second'}):null;const face=el('div',{class:'ambient-clock-face',role:'img'},el('div',{class:'ambient-clock-dial','aria-hidden':'true'},...Array.from({length:12},(_,index)=>{const tick=el('span',{class:'ambient-clock-tick'});tick.style.setProperty('--tick',index*30+'deg');return tick;}),hourHand,minuteHand,secondHand,el('span',{class:'ambient-clock-pin'})));return {face,hourHand,minuteHand,secondHand};}
export function updateClockFace(value,now,time){const minutes=now.getMinutes()+now.getSeconds()/60;value.hourHand.style.transform=`translateX(-50%) rotate(${(now.getHours()%12+minutes/60)*30}deg)`;value.minuteHand.style.transform=`translateX(-50%) rotate(${minutes*6}deg)`;if(value.secondHand)value.secondHand.style.transform=`translateX(-50%) rotate(${now.getSeconds()*6}deg)`;value.face.setAttribute('aria-label','Local time: '+time);value.face.title=time;}

function expandIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M14 3h7v7M21 3l-7 7M10 21H3v-7M3 21l7-7');
  svg.append(path);
  return svg;
}

function setExpanded(expanded) {
  card.dataset.expanded = String(expanded);
  expandButton.setAttribute('aria-expanded', String(expanded));
  const label = expanded ? 'Collapse ambient clock' : 'Expand ambient clock';
  expandButton.setAttribute('aria-label', label);
  expandButton.title = label;
  expandButton.querySelector('path').setAttribute('d', expanded ? 'M21 10h-7V3M14 10l7-7M3 14h7v7M10 14l-7 7' : 'M14 3h7v7M21 3l-7 7M10 21H3v-7M3 21l7-7');
}

function onKeydown(event) {
  if (event.key === 'Escape' && card?.dataset.expanded === 'true') {
    event.preventDefault();
    setExpanded(false);
    expandButton.focus();
  }
}

/** Mount the independent, local-time analog clock once Ambient is first opened. */
export function init() {
  if (card) return;
  ({face,hourHand,minuteHand}=createClockFace());
  expandButton = el('button', {
    class: 'ambient-clock-expand', type: 'button',
    'aria-controls': 'ambient-clock',
    onclick: () => setExpanded(card.dataset.expanded !== 'true')
  }, expandIcon());
  caption = el('span', { class: 'ambient-clock-caption' });
  card = el('aside', { id: 'ambient-clock', class: 'ambient-clock-card', 'aria-label': 'Ambient clock', hidden: true }, face, caption, expandButton);
  document.body.append(card);
  setExpanded(false);
  document.addEventListener('keydown', onKeydown);
}

/** Refresh from the real local clock; the dashboard owns the shared tick. */
export function render(visible) {
  if (!card) return;
  card.hidden = !visible;
  if (!visible) { setExpanded(false); return; }
  if (document.hidden) return;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  updateClockFace({face,hourHand,minuteHand},now,time);
  caption.textContent = time;
}

/** Remove the clock and its keyboard handler. */
export function destroy() {
  document.removeEventListener('keydown', onKeydown);
  card?.remove();
  card = face = hourHand = minuteHand = expandButton = null;
}
