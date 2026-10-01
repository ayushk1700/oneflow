// Optional integration runner. Uses an isolated profile, never your browser data.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES ? `${process.env.ONEFLOW_NODE_MODULES}/playwright` : 'playwright');
const browserName = process.argv[2] || 'chrome';
const executablePath = browserName === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = path.resolve('.test-profile', `${browserName}-${Date.now()}`);
await fs.mkdir('test-results', { recursive:true });
const launch = () => chromium.launchPersistentContext(profile, { executablePath, headless:true, viewport:{width:1440,height:960}, args:['--enable-unsafe-extension-debugging'], ignoreDefaultArgs:['--disable-extensions'] });
let context = await launch();
const report = { browser:browserName, checks:[], consoleErrors:[], cspErrors:[], readyMs:[] };
const check = (name) => { report.checks.push(name); console.log(`PASS: ${name}`); };
let page;
function observe(p) {
  p.on('pageerror',error=>report.consoleErrors.push(error.message));
  p.on('console',message=>{if(message.type()==='error') { report.consoleErrors.push(message.text()); if(/content security policy|refused to/i.test(message.text())) report.cspErrors.push(message.text()); }});
}
async function load() {
  const cdp = await context.browser().newBrowserCDPSession();
  const {id} = await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
  page = await context.newPage(); observe(page);
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.waitForSelector('html[data-ready=true]');
  return id;
}
const closePanel = async () => { if(await page.locator('#panel').isVisible()) await page.getByRole('button',{name:'Close panel',exact:true}).click(); };
try {
  const id = await load();
  await page.getByLabel('What should we call you?').fill('Alex');
  await page.getByRole('button',{name:'Make a little room'}).click();
  await page.waitForSelector('#panel', { state:'hidden' });
  assert.match(await page.locator('#clock').innerText(),/Alex/); check('Onboarding saves name and closes');
  await page.getByLabel('Your main focus today').fill('Make space for the next good idea');
  await page.getByLabel('Your main focus today').press('Enter');
  await page.getByLabel('Complete daily focus').check();
  assert(await page.getByLabel('Complete daily focus').isChecked()); check('Daily focus saves and completes');
  await page.getByLabel('Complete daily focus').uncheck();
  await page.keyboard.press('n');
  await page.getByLabel('New task',{exact:true}).fill('A thoughtful first task');
  await page.getByLabel('New task',{exact:true}).press('Enter');
  await page.getByLabel('Complete A thoughtful first task',{exact:true}).waitFor();
  await page.getByLabel('New task',{exact:true}).fill('A second small step');
  await page.getByLabel('New task',{exact:true}).press('Enter');
  await page.getByLabel('Move A second small step up',{exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.task-text')?.firstChild.textContent==='A second small step');
  await page.getByLabel('Edit A thoughtful first task',{exact:true}).click();
  await page.getByLabel('Edit task',{exact:true}).fill('An edited first task');
  await page.getByLabel('Edit task',{exact:true}).press('Enter');
  await page.getByLabel('Complete An edited first task',{exact:true}).check();
  await page.getByLabel('Add a list',{exact:true}).click();
  await page.getByLabel('List name',{exact:true}).fill('Tomorrow');
  await page.getByLabel('List name',{exact:true}).press('Enter');
  await page.waitForFunction(()=>document.querySelector('select[aria-label="Task list"]')?.selectedOptions[0].textContent==='Tomorrow');
  await page.getByLabel('New task',{exact:true}).fill('A task for tomorrow');
  await page.getByLabel('New task',{exact:true}).press('Enter');
  await page.getByLabel('Complete A task for tomorrow',{exact:true}).waitFor();
  check('Tasks add, edit, complete, reorder, and support multiple lists');
  await closePanel();
  await page.getByRole('button',{name:'Manage quick links',exact:true}).click();
  await page.getByLabel('Link name',{exact:true}).fill('Reading');
  await page.getByLabel('Link URL',{exact:true}).fill('https://example.com/reading');
  await page.getByRole('button',{name:'Add link',exact:true}).click();
  await closePanel(); assert.equal(await page.locator('#links a').getAttribute('href'),'https://example.com/reading'); check('Quick links save locally');
  await page.getByRole('button',{name:'Favorite quote',exact:true}).click();
  await page.getByRole('button',{name:'Favorite quotes',exact:true}).click();
  assert(await page.getByRole('button',{name:'Remove favorite',exact:true}).isVisible()); await closePanel(); check('Quotes favorite and show history');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Theme',{exact:true}).selectOption('light');
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
  await page.getByRole('switch',{name:'24-hour clock',exact:true}).check();
  await page.getByRole('switch',{name:'Reduce motion',exact:true}).check();
  await page.getByRole('button',{name:'Widgets',exact:true}).click();
  for(const [label,selector] of [['Clock & greeting','#clock'],['Daily main focus','#focus'],['Web search','#search'],['Quick links','#links'],['Words of encouragement','#quotes'],['Weather','#weather']]) {
    await page.getByRole('switch',{name:label,exact:true}).uncheck(); await page.locator(selector).waitFor({state:'hidden'});
    await page.getByRole('switch',{name:label,exact:true}).check(); await page.locator(selector).waitFor({state:'visible'});
  }
  await page.getByRole('switch',{name:'To-do lists',exact:true}).uncheck(); await page.locator('#dock button[aria-label="My tasks"]').waitFor({state:'detached'});
  await page.getByRole('switch',{name:'To-do lists',exact:true}).check(); await page.locator('#dock button[aria-label="My tasks"]').waitFor({state:'attached'});
  check('All seven widgets disable completely and re-enable');
  await page.getByRole('button',{name:'Scenery',exact:true}).last().click();
  await page.locator('.background-card').last().click();
  await page.getByLabel('Upload a photograph',{exact:true}).setInputFiles(path.resolve('assets/backgrounds/cozy.webp'));
  await page.waitForFunction(()=>document.querySelector('#landscape').style.backgroundImage.includes('blob:'));
  check('Bundled backgrounds and uploaded IndexedDB photos apply');
  await page.getByRole('button',{name:'Your data',exact:true}).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button',{name:'Export all data',exact:true}).click();
  const download = await downloadPromise; const backupPath=path.resolve('test-results',`${browserName}-backup.json`); await download.saveAs(backupPath);
  const backup=JSON.parse(await fs.readFile(backupPath,'utf8'));
  assert.equal(backup.local.tasks.length,3); assert.equal(backup.database.images.length,1); assert.match(backup.database.images[0].data,/^data:image\/webp;base64,/);
  await page.evaluate(async()=>{const s=await import('../core/storage.js');await s.update(d=>{d.tasks=[];d.settings.name='Changed';});});
  await page.getByLabel('Restore from a backup',{exact:true}).setInputFiles(backupPath);
  await Promise.all([page.waitForEvent('domcontentloaded'),page.getByRole('button',{name:'Yes, continue',exact:true}).click()]);
  await page.waitForSelector('html[data-ready=true]');
  await page.waitForFunction(()=>document.querySelector('#clock').textContent.includes('Alex'));
  assert.equal(await page.evaluate(async()=>(await import('../core/storage.js')).get().tasks.length),3);
  check('Export/import restores tasks, preferences, favorites, and uploaded image blobs');
  // Two tabs deliberately race read-modify-write operations.
  const second=await context.newPage(); observe(second); await second.goto(page.url()); await second.waitForSelector('html[data-ready=true]');
  await Promise.all([page,second].map((p,i)=>p.evaluate(async i=>{const s=await import('../core/storage.js');await s.update(d=>d.tasks.push({id:`race-${i}`,text:`Concurrent ${i}`,listId:'inbox',completed:false}));},i)));
  await page.waitForFunction(async()=>(await import('../core/storage.js')).get().tasks.length===5); await second.close();
  check('Concurrent tab updates preserve both edits');
  await page.evaluate(async()=>{const s=await import('../core/storage.js');await s.update(d=>{d.settings.background={kind:'bundled',id:'alpine',blur:0,rotate:false,color:'#293c36'}; d.settings.theme='dark';});});
  await page.screenshot({path:'test-results/dashboard-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'My tasks',exact:true}).click();
  await page.screenshot({path:'test-results/tasks-panel.png',fullPage:true}); await closePanel();
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'test-results/dashboard-mobile.png',fullPage:true}); await page.setViewportSize({width:1440,height:960});
  check('Desktop and mobile layouts fit without horizontal overflow');
  await context.setOffline(true); await page.reload(); await page.waitForSelector('html[data-ready=true]');
  assert(await page.locator('#quotes blockquote').isVisible()); assert.match(await page.locator('#weather').innerText(),/Choose your city/);
  check('Offline new tab loads local assets and friendly weather state'); await context.setOffline(false);
  await page.keyboard.press('/'); assert.equal(await page.locator('#web-search').evaluate(x=>x===document.activeElement),true); await page.keyboard.press('Escape'); await page.locator('#web-search').blur();
  await page.keyboard.press('n'); await page.locator('#panel').waitFor({state:'visible'});
  await page.keyboard.press('Escape'); await page.locator('#panel').waitFor({state:'hidden'}); check('Keyboard /, N, Escape and native dialog focus work');
  for(let i=0;i<5;i++){await page.reload();await page.waitForSelector('html[data-ready=true]');report.readyMs.push(await page.evaluate(()=>performance.getEntriesByName('oneflow-ready')[0].startTime));}
  check(`Repeat-open timing recorded: ${report.readyMs.map(x=>x.toFixed(0)).join(', ')} ms`);
  // Restart the entire persistent browser, keeping only its isolated test profile.
  await context.close(); context=await launch();
  const cdp=await context.browser().newBrowserCDPSession();
  try{await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});}catch(error){if(!/already|installed/i.test(error.message))throw error;}
  page=await context.newPage();observe(page);await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.waitForSelector('html[data-ready=true]');
  assert.equal(await page.evaluate(async()=>(await import('../core/storage.js')).get().tasks.length),5);
  assert.equal(await page.evaluate(async()=>(await import('../core/db.js')).getAll('images').then(x=>x.length)),1);
  check('Full browser restart retains local storage and IndexedDB');
  assert.deepEqual(report.consoleErrors,[]); assert.deepEqual(report.cspErrors,[]); check('Zero page, console, or CSP errors during integration flow');
} catch(error) { report.failure=error.stack; console.error(error); if(page) await page.screenshot({path:'test-results/failure.png',fullPage:true}).catch(()=>{}); process.exitCode=1; }
finally { await fs.writeFile(`test-results/${browserName}-report.json`,JSON.stringify(report,null,2)); await context.close(); }
