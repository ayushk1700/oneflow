const DAY=86400000;
/** Small deterministic entry actions, with no diagnosis or hidden AI. */
export function tinyStep(title){
  const text=String(title).trim();if(!text)throw new Error('Name the task you want to begin.');
  const kind=/write|draft|document|essay|present/i.test(text)?'writing':/research|source|compare|find/i.test(text)?'research':/study|learn|exam|read/i.test(text)?'study':/email|send|invoice|apply|schedule/i.test(text)?'admin':/design|draw|compose|build|create/i.test(text)?'creative':'general';
  const actions={writing:'Open the document and write one sentence.',research:'Find one source and save its link.',study:'Read one paragraph and write one question.',admin:'Open what you need and fill in the first field.',creative:'Make one rough sketch or a tiny draft.',general:'Open the materials and do the smallest visible step.'};
  return {kind,action:actions[kind]};
}
/** Turn explicit definitions or short note sentences into editable recall prompts. */
export function recallPrompts(text){
  const lines=String(text).split(/\n+|(?<=[.!?])\s+/).map(s=>s.replace(/^[-*]\s*/,'').trim()).filter(s=>s.length>8).slice(0,30);
  return lines.map(line=>{const parts=line.split(/:\s*|\s+is\s+/i);return parts.length>1?{question:`Explain ${parts[0].slice(0,180)} in your own words.`,answer:parts.slice(1).join(': ').slice(0,5000)}:{question:`What can you recall about: ${line.slice(0,180)}?`,answer:line.slice(0,5000)};});
}
/** Low confidence returns sooner; high confidence expands a bounded interval. */
export function nextReview(confidence,reviews=0,now=Date.now()){
  if(!Number.isInteger(confidence)||confidence<0||confidence>3)throw new Error('Choose a confidence from 0 to 3.');
  const days=confidence<2?1:confidence===2?Math.min(14,3+reviews*2):Math.min(60,7*2**Math.min(reviews,3));return now+days*DAY;
}
const words=text=>new Set(String(text).toLowerCase().match(/[a-z]{4,}/g)?.filter(w=>!['this','that','with','from','have','will','about','into','your','idea','some','then','there','their'].includes(w))||[]);
/** Transparent keyword overlap suggests relationships, never merges notes silently. */
export function relatedIdeas(ideas){
  return ideas.filter(x=>x.stage!=='archived').flatMap((a,i,all)=>all.slice(i+1).flatMap(b=>{const left=words(a.title),right=words(b.title),shared=[...left].filter(w=>right.has(w));return shared.length?[{a:a.id,b:b.id,shared}]:[];}));
}
/** Conservative meeting parsing supports explicit labels and Owner: action lines. */
export function parseMeeting(text){
  const source=String(text).trim().slice(0,20000);if(!source)throw new Error('Paste meeting notes first.');
  const decisions=[],questions=[],actions=[];
  for(const raw of source.split(/\n+/).slice(0,300)){
    const line=raw.replace(/^[-*•]\s*/,'').trim();if(!line)continue;
    if(/^(decision|decided|agreed)\s*:/i.test(line)){decisions.push(line.replace(/^[^:]+:\s*/, '').slice(0,500));continue;}
    if(/^(question|open question|unanswered)\s*:/i.test(line)||line.endsWith('?')){questions.push(line.replace(/^(question|open question|unanswered)\s*:\s*/i,'').slice(0,500));continue;}
    if(/^(action|todo|next)\s*:/i.test(line)){const value=line.replace(/^[^:]+:\s*/,''),match=value.match(/^([^:]{1,80}):\s*(.+)$/);actions.push({owner:match?match[1].trim():'',text:(match?match[2]:value).slice(0,240)});continue;}
    const owned=line.match(/^([\p{L}][\p{L}\s.'-]{0,79}):\s*(.+)$/u);
    if(owned&&/^(send|write|prepare|review|create|follow|draft|check|book|build|collect|update)\b/i.test(owned[2]))actions.push({owner:owned[1].trim(),text:owned[2].slice(0,240)});
  }
  return {source,decisions:decisions.slice(0,100),questions:questions.slice(0,100),actions:actions.slice(0,100)};
}
/** Career preparation is a reviewable template based on explicit requirements. */
export function careerActions(title,description){
  const requirements=String(description).split(/\n+|;\s*/).map(s=>s.trim()).filter(s=>/experience|skill|require|knowledge|proficien|portfolio/i.test(s)).slice(0,3);
  return [`Read the requirements for ${title}`,...requirements.map(s=>`Prepare an example for: ${s}`),'Select two relevant work examples','Draft the application or outreach','Practice a two-minute introduction'].slice(0,5).map(s=>s.slice(0,240));
}
/** Format reviewed lines safely for spreadsheets, including formula-like text. */
export function reportCSV(lines){
  const cell=value=>`"${String(value??'').replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')}"`;
  return [['Date','Project','Client','Description','Minutes','Hourly rate','Amount','Currency'],...lines.filter(x=>x.approved).map(x=>[x.date,x.project,x.client,x.text,x.minutes,x.rate,(x.minutes*x.rate/60).toFixed(2),x.currency])].map(row=>row.map(cell).join(',')).join('\r\n');
}
/** Summarize self-reported energy only when there are repeated observations. */
export function energyAdvice(checks,sessions){
  const completed=checks.filter(x=>x.after!==null),low=completed.filter(x=>x.before<=2);
  const depleted=completed.filter(x=>x.before>=3&&x.after<=2);
  const total=sessions.filter(s=>new Date(s.start).toDateString()===new Date().toDateString()).reduce((n,s)=>n+s.duration,0)/60000;
  const morning=completed.filter(x=>x.hour<12&&x.before>=4),late=completed.filter(x=>x.hour>=16&&x.before>=4);
  return {light:low.length>=3,overwork:depleted.length>=3||total>=240,morning:morning.length>=3&&late.length<3,count:completed.length};
}
