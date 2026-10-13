// Optional release tooling. Runs current acceptance suites in isolated browser profiles.
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
const extra=process.argv.includes('--extra'),followup=process.argv.includes('--followup'),prefix=`design-stage-9${followup?'-followup':extra?'-extra':''}`;
const output=`docs/qa-results/${prefix}-suites.json`;
const suites=followup?['journeys-tabs','work-context','ambient-clock']:extra?['design-foundation','calm-home','ambient-clock','studio','ui-refinement']:['design-foundation','calm-home','unified-timer','ambient-redesign','design-stage-3-4','design-stage-5-6','design-stage-7-8','panel-redesign','panel-entry','panel-planning','panel-environment','panel-remaining','work-context','journeys-tabs','panel-boundaries','combined-notes','notes-capture','notes-overlay','journal-fullscreen','settings-page','stats-notifications','music-api'];
const report={startedAt:new Date().toISOString(),method:'Sequential installed Chrome acceptance suites, each with a disposable profile. Native/provider fixtures keep their existing limits. Performance is measured separately after all suites close.',results:[]};
await fs.mkdir('docs/qa-results',{recursive:true});
async function run(name,args){
  const started=Date.now(),result={name,args};report.results.push(result);
  const child=spawn(process.execPath,args,{env:process.env,stdio:['ignore','pipe','pipe']});let text='';
  child.stdout.on('data',chunk=>{text+=chunk;});child.stderr.on('data',chunk=>{text+=chunk;});
  const timeout=setTimeout(()=>child.kill(),300000);
  result.exitCode=await new Promise(resolve=>{child.on('error',error=>{text+=error.message;resolve(-1);});child.on('exit',code=>resolve(code??-1));});clearTimeout(timeout);
  result.elapsedMs=Date.now()-started;result.pass=result.exitCode===0;result.log=`docs/qa-results/${prefix}-${name}.log`;
  await fs.writeFile(result.log,text);await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
  console.log(`${result.pass?'PASS':'FAIL'} ${name} (${Math.round(result.elapsedMs/1000)}s)`);
}
await run('syntax',['scripts/check.js']);
await run('units',['--test',...(await fs.readdir('tests')).filter(n=>n.endsWith('.test.js')).map(n=>`tests/${n}`)]);
for(const suite of suites)await run(suite,[`tests/${suite}-browser.js`,'chrome']);
if(!extra&&!followup)await run('edge-launch',['tests/design-stage-7-8-browser.js','edge']);
report.finishedAt=new Date().toISOString();await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
if(report.results.some(result=>!result.pass))process.exitCode=1;
