import { recallPrompts, nextReview } from '../../core/journeys-logic.js';
import { openFeature } from '../../core/features.js';
import { library, tabs } from '../panel-design/index.js';
import { workspace, creation, el, input, area, field, button, section, message, choices, stamp, requireText, addJourney, editJourney, beginJourney, linkedSessions, remove } from '../journeys/shared.js';

/** Open subject navigation and focused recall. @returns {Promise<void>} */
export async function open(){
  const data=await workspace('recall','Recall Rooms','Choose a subject and practice one question at a time. Your confidence sets the next review.');if(!data)return;
  const {root,j,notes,sessions}=data,name=input(),material=area('',20000),exam=input('',10,'date'),picked=new Set(),refs=el('details',{},el('summary',{},'Link study notes'));
  for(const n of notes.filter(n=>n.state==='active'))refs.append(el('label',{class:'toggle-row'},el('span',{},n.title||'Untitled note'),el('input',{type:'checkbox',onchange:e=>e.target.checked?picked.add(n.id):picked.delete(n.id)})));
  root.append(creation(j.rooms.length,'New subject room',field('Subject',name),field('Study material',material),field('Exam date (optional)',exam),refs,button('Create recall room',async()=>{
    const text=[material.value,...notes.filter(n=>picked.has(n.id)).map(n=>n.text)].join('\n').slice(0,20000);if(!text.trim())throw new Error('Add study material or link a note.');
    await addJourney('rooms',{name:requireText(name,'a subject'),material:text,exam:exam.value,noteIds:[...picked],concepts:recallPrompts(text).map(p=>({...stamp(),...p,confidence:0,due:Date.now(),reviews:0}))});await open();
  },true)));
  const view=library(root,{name:'recall',heading:'Subjects'});
  for(const r of j.rooms){
    const due=r.concepts.filter(c=>c.due<=Date.now()),count=linkedSessions('recall',r.id,sessions).length,box=section(r.name,message(`${due.length} prompts due · ${count} study sessions${r.exam?` · Exam in ${Math.ceil((new Date(r.exam+'T00:00:00')-Date.now())/86400000)} days`:''}`));
    const review=reviewPage(r,due.length?due:r.concepts),concepts=el('div',{class:'stack'}),materials=el('div',{class:'stack'},el('p',{},r.material));
    for(const id of r.noteIds){const n=notes.find(n=>n.id===id);materials.append(message(n?`Linked Note: ${n.title||'Untitled note'}`:'A linked note is no longer available.'));}materials.append(button('Open Notes',()=>openFeature('notes')));
    const map=el('div',{class:'concept-map',role:'group','aria-label':'Concept constellation'});concepts.append(map);
    for(const c of r.concepts){
      const q=input(c.question,500),answer=area(c.answer,5000),card=el('details',{class:'concept-card'},el('summary',{},`${c.confidence<=1?'○':'●'} ${c.question}`));
      card.append(message(`Confidence ${c.confidence}/3 · Review ${new Date(c.due).toLocaleDateString()}`),field('Recall question',q),field('Answer',answer),button('Save concept',async()=>{await editJourney('rooms',r.id,x=>{const a=x.concepts.find(v=>v.id===c.id);a.question=requireText(q,'a question');a.answer=answer.value;});await open();}),button('Study this concept for 15 minutes',()=>beginJourney('recall',r.id,q.value,15,c.id)));map.append(card);
    }
    const q=input('',500),a=area('',5000);concepts.append(creation(r.concepts.length,'Add a concept',field('New recall question',q),field('New answer',a),button('Add concept',async()=>{await editJourney('rooms',r.id,x=>x.concepts.push({...stamp(),question:requireText(q,'a question'),answer:a.value,confidence:0,due:Date.now(),reviews:0}));await open();})));
    tabs(box,[{label:'Due today',content:review},{label:'Concepts',content:concepts},{label:'Materials',content:materials}],`room-${r.id}`);box.append(remove('rooms',r.id,open));view.add({id:r.id,title:r.name,summary:`${due.length} due · ${r.concepts.length} concepts`,detail:box});
  }
}
function reviewPage(room,queue){
  const root=el('div',{class:'stack'});let index=0;
  function draw(){
    root.replaceChildren();const c=queue[index];if(!c){root.append(message('No concepts yet. Add one in Concepts.'));return;}
    const answer=el('p',{hidden:true},c.answer),rating=choices([0,1,2,3],c.confidence),reveal=button('Reveal answer',()=>{answer.hidden=false;reveal.hidden=true;});
    root.append(el('div',{class:'review-progress'},message(`${index+1} of ${queue.length}${room.concepts.some(x=>x.due<=Date.now())?' due':' · optional practice'}`),button('Next question',()=>{index=(index+1)%queue.length;draw();})),el('p',{class:'review-question'},c.question),reveal,answer,field('Confidence: 0 forgotten, 3 easy',rating),button('Save review',async()=>{await editJourney('rooms',room.id,x=>{const a=x.concepts.find(v=>v.id===c.id);a.confidence=Number(rating.value);a.due=nextReview(a.confidence,a.reviews);a.reviews++;});await open();},true),button('Study this concept for 15 minutes',()=>beginJourney('recall',room.id,c.question,15,c.id)));
  }
  draw();return root;
}
export function init(){}
export const render=open;
export function destroy(){}
