import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.ONEFLOW_NODE_MODULES ? `${process.env.ONEFLOW_NODE_MODULES}/playwright` : 'playwright');
const name=process.argv[2] || 'chrome';
const executablePath=name==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile=path.resolve('.test-profile',`stage2-${name}-${Date.now()}`);
const launch=()=>chromium.launchPersistentContext(profile,{executablePath,headless:true,viewport:{width:1440,height:960},args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
let context=await launch(),page;
const report={browser:name,checks:[],errors:[],requests:[],timings:[]};
const pass=s=>{report.checks.push(s);console.log(`PASS: ${s}`);};
async function until(p, predicate) { const deadline=Date.now()+15000; while(Date.now()<deadline){if(await p.evaluate(predicate))return;await new Promise(resolve=>setTimeout(resolve,100));}throw new Error('Timed out waiting for browser state'); }
const observe=p=>{p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});p.on('request',r=>{if(r.url().startsWith('https:'))report.requests.push(r.url());});};
const close=async()=>{if(await page.locator('#panel').isVisible())await page.getByRole('button',{name:'Close panel',exact:true}).click();};
const feature=async title=>{await close();await page.getByRole('button',{name:'Your day',exact:true}).click();await page.getByRole('button',{name:new RegExp(title)}).click();};
try{
 const browserCDP=await context.browser().newBrowserCDPSession();const {id}=await browserCDP.send('Extensions.loadUnpacked',{path:process.cwd()});
 page=await context.newPage();observe(page);await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.waitForSelector('html[data-ready=true]');await page.getByRole('button',{name:'Skip for now',exact:true}).click();
 // Seed a genuine v1 IndexedDB and local document before exercising any IDB widget.
 await page.evaluate(async()=>{
   await (await import('../core/timer-client.js')).backgroundSync();
   const s=await import('../core/storage.js'),old=s.get();old.schemaVersion=1;old.settings.name='Migration';old.tasks=[{id:'old-task',text:'Keep this Stage 1 task',listId:'inbox',completed:false}];
   for(const k of ['timerConfig','timer','sessionOutbox','timerNotice','audio','moods','music','integrations'])delete old[k];
   for(const k of ['timer','sounds','journal','notes','habits','countdowns','stats','mood','music'])delete old.settings.widgets[k];
   await chrome.storage.local.set({oneflow:old});
   await new Promise((resolve,reject)=>{const r=indexedDB.open('oneflow',1);r.onupgradeneeded=()=>{for(const key of ['journal','sessions','images'])r.result.createObjectStore(key,{keyPath:'id'});};r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('journal','readwrite');tx.objectStore('journal').put({id:'old-journal',date:'2026-09-01',prompt:'An earlier good thing',text:'Keep this reflection',updatedAt:1});tx.oncomplete=()=>{db.close();resolve();};};});
 });
 await page.reload();await page.waitForSelector('html[data-ready=true]');
 const migrated=await page.evaluate(async()=>{const s=await import('../core/storage.js'),db=await import('../core/db.js');return{version:s.get().schemaVersion,tasks:s.get().tasks,journal:await db.getAll('journal'),dbVersion:(await db.openDB()).version};});
 assert.equal(migrated.version,2);assert.equal(migrated.dbVersion,2);assert.equal(migrated.tasks[0].id,'old-task');assert.equal(migrated.journal[0].text,'Keep this reflection');pass('Stage 1 local and IndexedDB migrations preserve existing records');
 assert.equal(await page.locator('script[src*=chart]').count(),0);assert.equal(await page.locator('iframe').count(),0);assert.deepEqual(report.requests,[]);pass('Startup loads no charts, music frames, or third-party resources');
 await feature('The good in today');await page.getByLabel('Journal entry',{exact:true}).fill('I appreciated a quiet morning.');await page.getByRole('button',{name:'Save reflection',exact:true}).click();await page.getByText('Saved on this device.',{exact:true}).waitFor();
 await page.getByText('1 day gratitude streak · a few lines are enough',{exact:true}).waitFor();
 await page.getByLabel('Search journal',{exact:true}).fill('quiet');await page.waitForFunction(()=>document.querySelectorAll('.entry-card .entry-text').length===1);pass('Journal saves, updates its streak, searches, and retains migrated history');
 await feature('Room for a thought');await page.getByRole('button',{name:'New note',exact:true}).click();await page.getByLabel('Note title',{exact:true}).fill('A useful thought');await page.getByLabel('Note text',{exact:true}).fill('# A small plan\n**Write** one page.\n<script>alert(1)</script>');await until(page, async()=>(await import('../core/storage.js')).get().notes[0]?.text.includes('script'));
 await page.getByRole('button',{name:'Preview formatting',exact:true}).click();assert.equal(await page.locator('.markdown-preview script').count(),0);assert.equal(await page.locator('.markdown-preview strong').innerText(),'Write');pass('Notes autosave and markdown preview never executes HTML');
 await feature('Small promises');await page.getByRole('button',{name:'Add habit',exact:true}).click();await page.getByLabel('Habit name',{exact:true}).fill('Read a few pages');await page.getByRole('button',{name:'Save habit',exact:true}).click();await page.locator('.habit-day').last().click();await until(page, async()=>(await import('../core/storage.js')).get().habits[0]?.dates.length===1);await page.getByRole('button',{name:'Manage reminders in Settings',exact:true}).click();await page.getByLabel('Remind me: Read a few pages',{exact:true}).fill('21:15');await page.getByLabel('Remind me: Read a few pages',{exact:true}).dispatchEvent('change');await until(page, async()=>(await chrome.alarms.getAll()).some(a=>a.name.startsWith('oneflow-habit-')));
 const alarms=await page.evaluate(()=>chrome.alarms.getAll());assert(alarms.some(a=>a.name.startsWith('oneflow-habit-')));pass('Habit check-ins, weekly heatmap, and daily reminder alarms persist');
 await feature('Looking forward');await page.getByRole('button',{name:'Add a countdown',exact:true}).click();await page.getByLabel('Event name',{exact:true}).fill('A fresh start');await page.getByLabel('Event date',{exact:true}).fill('2026-12-31');await page.getByRole('button',{name:'Save event',exact:true}).click();await page.getByRole('button',{name:'Pin to dashboard',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#countdowns').textContent.includes('A fresh start'));pass('Countdown saves and pins to main dashboard');
 await feature('A moment for you');await page.getByRole('button',{name:'Feeling good',exact:true}).click();await until(page, async()=>(await import('../core/storage.js')).get().moods.length===1);pass('Mood check-in stores a timestamp and energy value');
 await close();await page.getByRole('button',{name:'My tasks',exact:true}).click();await page.getByRole('button',{name:'Focus on Keep this Stage 1 task',exact:true}).click();await until(page, async()=>(await import('../core/storage.js')).get().timer.status==='running');
 await close();await page.getByRole('button',{name:'Focus',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).waitFor();
 const paused=await page.evaluate(async()=>(await import('../core/storage.js')).get().timer.remaining);assert(paused>0);
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();pass('Task-linked timer starts, pauses, resumes, and updates live');
 const second=await context.newPage();observe(second);await second.goto(page.url());await second.waitForSelector('html[data-ready=true]');
 await page.evaluate(async()=>{await (await import('../core/timer-client.js')).timerCommand('pause');});
 await until(second, async()=>(await import('../core/storage.js')).get().timer.status==='paused');await second.close();pass('Timer state synchronizes across open tabs');
 await close();await page.getByRole('button',{name:'Sounds',exact:true}).click();await page.getByRole('button',{name:'Play soundscape',exact:true}).click();
 await until(page, async()=>{const c=await chrome.runtime.getContexts({contextTypes:['OFFSCREEN_DOCUMENT']});return c.length===1;});
 await until(page, async()=>{try{return (await chrome.runtime.sendMessage({target:'audio',type:'inspect'}))?.layers===1;}catch{return false;}});
 const audio=await page.evaluate(async()=>{const result=await chrome.runtime.sendMessage({target:'audio',type:'inspect'});return {result,config:(await import('../core/storage.js')).get().audio,contexts:await chrome.runtime.getContexts({contextTypes:['OFFSCREEN_DOCUMENT']})};});assert.equal(audio.result?.state,'running');assert.equal(audio.result?.layers,1);
 await page.getByLabel('Forest morning',{exact:true}).fill('30');await page.getByLabel('Forest morning',{exact:true}).dispatchEvent('change');
 await until(page, async()=>(await chrome.runtime.sendMessage({target:'audio',type:'inspect'})).layers===2);
 await page.screenshot({path:`test-results/stage2-${name}-sounds.png`,fullPage:true});pass('Offscreen Web Audio runs a two-layer mix in a single shared owner');
 await page.getByRole('button',{name:'Pause soundscape',exact:true}).click();await until(page, async()=>(await chrome.runtime.sendMessage({target:'audio',type:'inspect'})).layers===0);
 // Fast persisted test deadline exercises the real alarm with all dashboard tabs closed.
 const worker=context.serviceWorkers().find(w=>w.url().includes(id));assert(worker);
 await worker.evaluate(()=>{const original=chrome.notifications.create.bind(chrome.notifications);globalThis.testNotices=[];chrome.notifications.create=async(...args)=>{try{const id=await original(...args);globalThis.testNotices.push({id,accepted:true});return id;}catch(error){globalThis.testNotices.push({id:args[0],accepted:false,error:error.message});throw error;}};});
 await page.evaluate(async()=>{const s=await import('../core/storage.js');await s.update(d=>{Object.assign(d.timer,{status:'running',phase:'focus',duration:1500,remaining:1500,startedAt:Date.now(),observedAt:Date.now(),endsAt:Date.now()+1500,sessionId:'closed-tabs-test'});d.timerConfig.autoBreak=false;});await (await import('../core/timer-client.js')).backgroundSync();});
 await page.close();
 await new Promise((resolve,reject)=>{const deadline=Date.now()+15000;const poll=async()=>{try{const result=await worker.evaluate(async()=>{const sessions=await new Promise((resolve,reject)=>{const r=indexedDB.open('oneflow',2);r.onsuccess=()=>{const db=r.result,q=db.transaction('sessions').objectStore('sessions').getAll();q.onsuccess=()=>{db.close();resolve(q.result);};q.onerror=()=>reject(q.error);};r.onerror=()=>reject(r.error);});return{sessions,notices:globalThis.testNotices || [],local:(await chrome.storage.local.get('oneflow')).oneflow.timer,alarms:await chrome.alarms.getAll()};});if(result.sessions.some(s=>s.id==='closed-tabs-test')&&result.notices.some(n=>n.id.includes('closed-tabs-test')))return resolve(report.notification=result.notices);if(Date.now()>deadline)return reject(new Error('Closed-tab completion/notification did not arrive: '+JSON.stringify(result)));setTimeout(poll,300);}catch(e){reject(e);}};poll();});
 assert(report.notification.every(n=>n.accepted));
 pass('Real browser alarm logs a completed session and the notification API accepts it with every dashboard tab closed');
 page=await context.newPage();observe(page);await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.waitForSelector('html[data-ready=true]');
 assert.equal(await page.evaluate(async()=>(await import('../core/db.js')).getAll('sessions').then(x=>x.filter(s=>s.id==='closed-tabs-test').length)),1);pass('Reopening does not duplicate the completed session');
 await page.getByRole('button',{name:'Focus',exact:true}).click();assert(await page.locator('.break-card').isVisible());await page.screenshot({path:`test-results/stage2-${name}-timer.png`,fullPage:true});
 await feature('Your progress');await page.waitForFunction(()=>Boolean(globalThis.Chart));assert(await page.locator('.stats-table').count());await page.screenshot({path:`test-results/stage2-${name}-stats.png`,fullPage:true});pass('Break companion appears and stats load Chart.js only on demand');
 await close();const backup=await page.evaluate(async()=>(await import('../core/backup.js')).exportData());assert(backup.database.journal.length>=2);assert.equal(backup.local.notes.length,1);assert.equal(backup.local.habits.length,1);assert.equal(backup.local.countdowns.length,1);assert.equal(backup.local.moods.length,1);
 await page.evaluate(async backup=>{const b=await import('../core/backup.js');await b.resetData();await b.importData(await b.parseBackup(JSON.stringify(backup)));},backup);await page.reload();await page.waitForSelector('html[data-ready=true]');
 assert.equal(await page.evaluate(async()=>(await import('../core/storage.js')).get().notes[0].title),'A useful thought');assert.equal(await page.evaluate(async()=>(await import('../core/db.js')).getAll('journal').then(x=>x.length)),backup.database.journal.length);pass('Full Stage 2 export/import restores every new data collection');
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`test-results/stage2-${name}-mobile.png`,fullPage:true});await page.setViewportSize({width:1440,height:960});await page.screenshot({path:`test-results/stage2-${name}-dashboard.png`,fullPage:true});
 for(let i=0;i<5;i++){await page.reload();await page.waitForSelector('html[data-ready=true]');report.timings.push(await page.evaluate(()=>performance.getEntriesByName('oneflow-ready')[0].startTime));}pass(`Repeat-open samples: ${report.timings.map(x=>x.toFixed(0)).join(', ')} ms`);
 await page.evaluate(async()=>{await (await import('../core/timer-client.js')).timerCommand('reset');await (await import('../core/timer-client.js')).timerCommand('start');});const before=await page.evaluate(async()=>(await import('../core/storage.js')).get().timer.endsAt);
 await context.close();context=await launch();const cdp=await context.browser().newBrowserCDPSession();try{await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});}catch(e){if(!/already|installed/i.test(e.message))throw e;}
 page=await context.newPage();observe(page);await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.waitForSelector('html[data-ready=true]');assert.equal(await page.evaluate(async()=>(await import('../core/storage.js')).get().timer.endsAt),before);assert.equal(await page.evaluate(async()=>(await import('../core/storage.js')).get().audio.volumes.forest),.3);pass('Browser restart retains timer deadline, sound volumes, and new data');
 assert.deepEqual(report.errors,[]);pass('No page or console errors across Stage 2 flows');
}catch(error){report.failure=error.stack;console.error(error);process.exitCode=1;if(page&&!page.isClosed())await page.screenshot({path:'test-results/stage2-failure.png',fullPage:true}).catch(()=>{});}
finally{await fs.mkdir('test-results',{recursive:true});await fs.writeFile(`test-results/stage2-${name}-report.json`,JSON.stringify(report,null,2));await context.close();}
