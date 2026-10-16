import { el } from '../../core/utils.js';

let card, face, hourHand, minuteHand, caption;
/** Shared analog geometry for Ambient and the personalized dashboard clock. */
export function createClockFace({seconds=false}={}){const hourHand=el('span',{class:'ambient-clock-hand ambient-clock-hour'}),minuteHand=el('span',{class:'ambient-clock-hand ambient-clock-minute'}),secondHand=seconds?el('span',{class:'ambient-clock-hand personal-clock-second'}):null;const face=el('div',{class:'ambient-clock-face',role:'img'},el('div',{class:'ambient-clock-dial','aria-hidden':'true'},...Array.from({length:12},(_,index)=>{const tick=el('span',{class:'ambient-clock-tick'});tick.style.setProperty('--tick',index*30+'deg');return tick;}),hourHand,minuteHand,secondHand,el('span',{class:'ambient-clock-pin'})));return {face,hourHand,minuteHand,secondHand};}
export function updateClockFace(value,now,time){const minutes=now.getMinutes()+now.getSeconds()/60;value.hourHand.style.transform=`translateX(-50%) rotate(${(now.getHours()%12+minutes/60)*30}deg)`;value.minuteHand.style.transform=`translateX(-50%) rotate(${minutes*6}deg)`;if(value.secondHand)value.secondHand.style.transform=`translateX(-50%) rotate(${now.getSeconds()*6}deg)`;value.face.setAttribute('aria-label','Local time: '+time);value.face.title=time;}

/** Mount the independent, local-time analog clock once Ambient is first opened. */
export function init() {
  if (card) return;
  ({face,hourHand,minuteHand}=createClockFace());
  caption = el('span', { class: 'ambient-clock-caption' });
  card = el('aside', { id: 'ambient-clock', class: 'ambient-clock-card', 'aria-label': 'Ambient clock', hidden: true }, face, caption);
  document.body.append(card);

}

/** Refresh from the real local clock; the dashboard owns the shared tick. */
export function render(visible) {
  if (!card) return;
  card.hidden = !visible;
  if (!visible) return;
  if (document.hidden) return;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  updateClockFace({face,hourHand,minuteHand},now,time);
  caption.textContent = time;
}

/** Remove the clock and its keyboard handler. */
export function destroy() {
  card?.remove();
  card = face = hourHand = minuteHand = null;
}
