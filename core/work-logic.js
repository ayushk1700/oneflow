/** Offline rules produce an editable proposal, never a claim of understanding. */
export function compileSteps(input, blockMinutes = 25) {
  const text = String(input).trim().slice(0, 10000);
  if (!text) throw new Error('Paste a brief or idea first.');
  const outcome = text.split(/[\n.!?]/)[0].replace(/^[-*\d.)\s]+/, '').slice(0, 200) || 'Make progress on this idea';
  const fragments = text.split(/\n+|;\s*|\s+[•]\s*/).map(s => s.replace(/^[-*\d.)\s]+/, '').trim()).filter(Boolean);
  let actions;
  if (fragments.length >= 3) actions = fragments.slice(0,5).map(s => /^(collect|read|review|write|draft|create|compare|test|send|outline|solve|practice|check|build|summarize|find)\b/i.test(s) ? s : `Work through: ${s}`);
  else if (/present|slides|pitch/i.test(text)) actions = ['Collect three sources', 'Draft the slide outline', 'Create the opening slide', 'Build the remaining slides', 'Review timing aloud'];
  else if (/exam|study|lecture|biology|learn|chapter/i.test(text)) actions = ['List the topics to understand', 'Read one section and summarize it', 'Answer five practice questions', 'Review mistakes and unclear ideas'];
  else if (/website|landing|design|client/i.test(text)) actions = ['List the audience and page goal', 'Collect three useful references', 'Sketch the page sections', 'Build the first section', 'Review content and accessibility'];
  else if (/research|source|compare/i.test(text)) actions = ['Write the question to answer', 'Find three relevant sources', 'Compare the evidence', 'Write a short conclusion'];
  else actions = [`Define what “${outcome.slice(0,120)}” should achieve`, 'Collect the information or materials needed', 'Create the smallest useful first draft', 'Review the draft and choose the next improvement'];
  const safeBlock = Number.isInteger(blockMinutes) && blockMinutes >= 1 && blockMinutes <= 180 ? blockMinutes : 25;
  const steps = actions.map((title,i) => ({ text: title.slice(0,240), minutes: i === 0 ? 10 : /build|remaining|draft/i.test(title) ? 35 : 20, energy: i === 0 || /collect|review/i.test(title) ? 'normal' : 'deep' }));
  return { outcome, steps, minutes: steps.reduce((n,s)=>n+s.minutes,0), blocks: steps.reduce((n,s)=>n+Math.ceil(s.minutes/safeBlock),0), first: steps[0].text };
}
/** Descriptive comparisons require repeated observations on both sides. */
export function focusRecipe(samples) {
  if (samples.length < 6) return { ready: false, explanation: `Record ${6-samples.length} more opted-in sessions before comparing conditions.` };
  const dimensions = ['minutes','sound','wallpaper','hour','breakMinutes','interruptions'];
  const overall = samples.filter(s=>s.completed).length / samples.length;
  const candidates = [];
  for (const key of dimensions) {
    const groups = new Map();
    const relevant=key==='interruptions'?samples.filter(s=>s.switchCounting===true):samples;
    for (const s of relevant) { const value = key === 'hour' ? Math.floor(s.hour / 4) * 4 : key==='interruptions' ? s.interruptions===0?0:s.interruptions<3?1:3 : s[key]; if (!groups.has(value)) groups.set(value,[]); groups.get(value).push(s); }
    for (const [value, rows] of groups) {
      const rest = relevant.filter(s => !rows.includes(s));
      if (rows.length < 3 || rest.length < 3) continue;
      const rate = rows.filter(s=>s.completed).length/rows.length, baseline = rest.filter(s=>s.completed).length/rest.length;
      if (rate > baseline + .15) candidates.push({ key, value, rate, baseline, count: rows.length, interruptions: rows.reduce((n,s)=>n+s.interruptions,0)/rows.length });
    }
  }
  candidates.sort((a,b)=>(b.rate-b.baseline)-(a.rate-a.baseline) || b.count-a.count);
  if (!candidates.length) return { ready:false, explanation:`${samples.length} sessions recorded; no condition has a clear repeated advantage yet.` };
  const best = candidates[0], label = best.key === 'minutes' ? `${best.value}-minute sessions` : best.key === 'sound' ? (best.value === 'quiet' ? 'quiet sessions' : `${best.value} audio`) : best.key === 'hour' ? `sessions between ${String(best.value).padStart(2,'0')}:00 and ${String(best.value+4).padStart(2,'0')}:00` : best.key === 'breakMinutes' ? `${best.value}-minute planned breaks` : best.key==='interruptions' ? `${best.value===0?'no':best.value===1?'one or two':'three or more'} counted tab switches` : `wallpaper ${best.value}`;
  return { ready:true, ...best, overall, explanation:`You completed ${Math.round(best.rate*100)}% of ${best.count} sessions with ${label}, versus ${Math.round(best.baseline*100)}% with other conditions. Average tab switches: ${best.interruptions.toFixed(1)}. This is an association, not proof of cause.` };
}
/** Fit whole tasks into compatible blocks without assigning recovery time. */
export function buildEnergyPlan(tasks, blocks) {
  const ordered = [...blocks].sort((a,b)=>a.start-b.start), used = new Map(), assignments = [], unplaced = [];
  const compatible = { deep:['deep'], normal:['normal','deep'], light:['light','normal','deep'] };
  for (const task of tasks.filter(t=>!t.completed)) {
    const effort=Number(task.effort), minutes = Number.isFinite(effort) ? Math.max(1, Math.min(180, Math.round(effort))) : 25, energy = compatible[task.energy] ? task.energy : 'normal';
    const block = [...ordered].sort((a,b)=>compatible[energy].indexOf(a.energy)-compatible[energy].indexOf(b.energy) || a.start-b.start).find(b => compatible[energy].includes(b.energy) && b.end-b.start-(used.get(b.id)||0) >= minutes);
    if (!block) { unplaced.push(task.id); continue; }
    assignments.push({ taskId:task.id, blockId:block.id, minutes, start:block.start+(used.get(block.id)||0) });
    used.set(block.id,(used.get(block.id)||0)+minutes);
  }
  return { assignments, unplaced };
}
