import { careerActions } from '../../core/journeys-logic.js';
import { updateWork } from '../../core/storage.js';
import { library,tabs } from '../panel-design/index.js';
import { workspace,creation,el,input,area,field,button,section,message,choices,requireText,addJourney,editJourney,beginJourney,journeyTask,linkedSessions,minutes,download,remove } from '../journeys/shared.js';

/** Navigate opportunities by stage while keeping progress, evidence and preparation separate. @returns {Promise<void>} */
export async function open(){
  const data=await workspace('career','Career Sprint','Choose an opportunity, prepare one next action, and keep evidence of your progress.');if(!data)return;
  const {root,j,sessions}=data,title=input(),organization=input(),url=input('',4096,'url'),description=area('',10000),goal=input(String(j.careerGoal),2,'number');goal.min=1;goal.max=50;
  const week=j.career.filter(r=>r.appliedAt>=Date.now()-7*86400000),total=sessions.filter(s=>j.career.some(r=>linkedSessions('career',r.id,[s]).length)).reduce((n,s)=>n+minutes(s),0);
  root.append(section('This week',message(`${week.length}/${j.careerGoal} opportunities marked applied · ${total} recorded career minutes overall`),el('details',{},el('summary',{},'Weekly goal and report'),field('Weekly application goal',goal),button('Save weekly goal',async()=>{await updateWork(w=>{w.journeys.careerGoal=Number(goal.value);});await open();}),button('Export progress story',()=>download('oneflow-career-week.txt',`${week.length} opportunities marked applied this week.\n${j.career.map(r=>`${r.title} — ${r.organization}: ${r.stage}\nEvidence: ${r.evidence||'Not recorded'}\nSkill gap: ${r.skillGap||'Not recorded'}`).join('\n\n')}`)))));
  root.append(creation(j.career.length,'New opportunity',field('Role or career project',title),field('Organization',organization),field('Opportunity link (optional)',url),field('Job description or brief',description),button('Add opportunity',async()=>{
    await addJourney('career',{title:requireText(title,'a role'),organization:organization.value,url:url.value,description:description.value,evidence:'',skillGap:'',stage:'discover',followAt:0,appliedAt:null});await open();
  },true)));
  const view=library(root,{name:'career',heading:'Opportunities',filters:['discover','prepare','apply','followup','improve'],variant:'pipeline'});
  for(const r of j.career){
    const stage=choices(['discover','prepare','apply','followup','improve'],r.stage),evidence=area(r.evidence,5000),gap=area(r.skillGap),follow=input(r.followAt?new Date(r.followAt).toISOString().slice(0,10):'',10,'date');
    const save=async()=>{await editJourney('career',r.id,x=>{x.stage=stage.value;x.evidence=evidence.value;x.skillGap=gap.value;x.followAt=follow.value?new Date(follow.value+'T09:00:00').getTime():0;if(stage.value==='apply'&&!x.appliedAt)x.appliedAt=Date.now();});await open();};
    const overview=el('div',{class:'stack'},field('Pipeline stage',stage),field('Follow-up date',follow),button('Save opportunity progress',save,true),el('details',{},el('summary',{},'Job description'),el('p',{},r.description||'No description saved.')));
    if(r.url)overview.append(el('a',{href:r.url,target:'_blank',rel:'noopener noreferrer'},'Open opportunity'));
    const evidencePage=el('div',{class:'stack'},field('Portfolio or progress evidence',evidence),field('Skill gaps to practice',gap),button('Save evidence',save,true));
    const next=el('div',{class:'stack'}),actions=careerActions(r.title,r.description).map(t=>input(t,240)),proposals=el('details',{},el('summary',{},'Review preparation actions'));
    actions.forEach(a=>proposals.append(field('Preparation action',a)));proposals.append(button('Add edited preparation tasks',async()=>{for(const [i,a] of actions.entries())await journeyTask('career',r.id,requireText(a,'an action'),25,String(i));}));next.append(proposals);
    for(const [purpose,duration] of [['Portfolio',25],['Interview practice',15],['Networking preparation',15],['Skill gap practice',20]])next.append(button(`Start ${purpose.toLowerCase()}`,()=>beginJourney('career',r.id,`${purpose}: ${r.title}`,duration,purpose)));
    const box=section(r.title,message(`${r.organization} · ${r.stage}${r.followAt&&r.followAt<=Date.now()?' · Follow-up due':''}`));
    tabs(box,[{label:'Overview',content:overview},{label:'Evidence',content:evidencePage},{label:'Next steps',content:next}],`career-${r.id}`);box.append(message(`${linkedSessions('career',r.id,sessions).length} preparation sessions`),remove('career',r.id,open));view.add({id:r.id,title:r.title,summary:`${r.organization} · ${r.stage}`,status:r.stage,detail:box});
  }
}
export function init(){}
export const render=open;
export function destroy(){}
