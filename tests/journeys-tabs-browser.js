import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`),browser=process.argv[2]||'chrome',checks=[],errors=[];
// Grant only in this isolated fixture; production keeps optional tab access.
const root=path.resolve('.test-profile',`journeys-tabs-${browser}-${Date.now()}`),fixture=path.join(root,'extension');await fs.mkdir(fixture,{recursive:true});
for(const dir of ['newtab','core','components','background','data','assets','vendor','wallpaper','livewallpaper','blocked']){try{await fs.symlink(path.resolve(dir),path.join(fixture,dir),'junction');}catch(error){if(!['EPERM','EACCES'].includes(error.code))throw error;await fs.cp(path.resolve(dir),path.join(fixture,dir),{recursive:true});}}
const manifest=JSON.parse(await fs.readFile('manifest.json','utf8'));manifest.permissions.push('tabs');manifest.optional_permissions=manifest.optional_permissions.filter(p=>p!=='tabs');await fs.writeFile(path.join(fixture,'manifest.json'),JSON.stringify(manifest));
const context=await chromium.launchPersistentContext(path.join(root,'profile'),{executablePath:browser==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:1440,height:900},args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
const page=await context.newPage(),url='https://quiet-oneflow.test/research';page.on('pageerror',e=>errors.push(e.message));
const tabIds=()=>page.evaluate(async()=>(await chrome.tabs.query({currentWindow:true})).map(t=>t.id));
const settledButton=()=>page.waitForFunction(()=>![...document.querySelectorAll('#panel button')].some(b=>b.textContent==='Open saved tab'&&b.disabled));
try{
  await context.route('https://quiet-oneflow.test/**',route=>route.fulfill({body:'<title>Quiet reading</title><p>Local fixture</p>',contentType:'text/html'}));
  const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:fixture});await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.getByRole('button',{name:'Skip for now',exact:true}).click();await page.locator('#panel').waitFor({state:'hidden'});
  const resource=await context.newPage();await resource.goto(url);await page.bringToFront();const activeId=await page.evaluate(async()=>{const current=await chrome.tabs.getCurrent();await chrome.tabs.update(current.id,{active:true});return current.id;});
  await page.waitForFunction(async url=>(await chrome.tabs.query({currentWindow:true})).some(t=>t.url===url&&t.status==='complete'),url);
  const resourceId=await page.evaluate(async url=>(await chrome.tabs.query({currentWindow:true})).find(t=>t.url===url).id,url);
  await page.evaluate(async()=>{await(await import('../core/features.js')).openFeature('quietweb');});await page.locator('#panel[data-panel=quietweb]').waitFor();
  await page.getByText('Review browser tabs',{exact:true}).click();await page.getByRole('button',{name:'Review current-window tabs',exact:true}).click();await page.getByLabel('Tab bucket',{exact:true}).waitFor();await page.getByLabel('Tab bucket',{exact:true}).selectOption('later');await page.getByRole('button',{name:'Save tab category',exact:true}).click();await page.waitForFunction(async()=>(await(await import('../core/storage.js')).readWork()).journeys.quiet.length===1);
  await page.waitForFunction(()=>!document.querySelector('#panel button:disabled'));await page.getByText('Park tabs & reset',{exact:true}).click();await page.getByRole('button',{name:'Park later tabs safely',exact:true}).click();await page.locator('.confirm-box .danger').click();
  await page.waitForFunction(async id=>!(await chrome.tabs.query({currentWindow:true})).some(t=>t.id===id),resourceId);
  const work=await page.evaluate(async()=>(await(await import('../core/storage.js')).readWork()));assert(work.capsules[0].tabs.some(t=>t.url===url));assert.equal(work.journeys.quiet[0].bucket,'later');assert((await tabIds()).includes(activeId));
  await page.getByRole('tab',{name:'Later',exact:true}).click();const before=await tabIds();await page.getByRole('button',{name:'Open saved tab',exact:true}).click();await settledButton();
  await page.waitForFunction(async count=>(await chrome.tabs.query({currentWindow:true})).length===count,before.length+1);const restored=(await tabIds()).filter(id=>!before.includes(id));assert.equal(restored.length,1);
  // Count IDs, including temporarily URL-less commits, after the second operation completes.
  await page.getByRole('button',{name:'Open saved tab',exact:true}).click();await settledButton();assert.deepEqual((await tabIds()).filter(id=>!before.includes(id)),restored);
  checks.push('PASS: Actual tab IDs prove capsule-before-close parking, active-tab protection and duplicate-free restoration, including pending navigation.');
  // Controlled API omission exercises the safety boundary: no closure without its persisted return URL.
  await page.evaluate(({id,url})=>{const original=chrome.tabs.query.bind(chrome.tabs);let calls=0;globalThis.restoreTabQuery=()=>{chrome.tabs.query=original;};chrome.tabs.query=async options=>{const rows=await original(options),capture=++calls===2;return rows.map(t=>t.id===id?{...t,url:capture?'':url,pendingUrl:capture?undefined:url}:t);};},{id:restored[0],url});
  await page.getByText('Park tabs & reset',{exact:true}).click();await page.getByRole('button',{name:'Park later tabs safely',exact:true}).click();await page.locator('.confirm-box .danger').click();await page.getByText('Could not save every tab return path. Your tabs stayed open; review them and try again.',{exact:true}).waitFor();
  await page.evaluate(()=>{restoreTabQuery();delete globalThis.restoreTabQuery;});assert((await tabIds()).includes(restored[0]));checks.push('PASS: A URL omitted during capture prevents closing the tab; the failure is visible. Native permission dialogs remain a manual gate.');
  assert.deepEqual(errors,[]);checks.forEach(x=>console.log(x));
}catch(error){checks.push('FAIL: '+error.message);console.error(error);process.exitCode=1;}finally{await fs.mkdir('docs/qa-results',{recursive:true});await fs.writeFile(`docs/qa-results/journeys-tabs-${browser}.json`,JSON.stringify({checks,errors,permissionFixture:true},null,2));await context.close();}
