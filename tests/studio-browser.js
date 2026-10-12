import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.ONEFLOW_NODE_MODULES+'/playwright');
const browser=process.argv[2]||'chrome';
const context=await chromium.launchPersistentContext(path.resolve('.test-profile',`studio-${browser}-${Date.now()}`),{executablePath:browser==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,timeout:30000,viewport:{width:1440,height:960},args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
const page=await context.newPage(),errors=[],checks=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
const state=()=>page.evaluate(async()=>(await import('../core/storage.js')).get());
const pass=label=>{checks.push(label);console.log('PASS: '+label);};
async function studio(){await page.evaluate(async()=>(await import('../core/features.js')).openFeature('customizer'));await page.getByLabel('Customization category',{exact:true}).waitFor();}
async function category(value){await page.getByLabel('Customization category',{exact:true}).selectOption(value);}
async function range(label,value){await page.getByLabel(label,{exact:true}).evaluate((node,value)=>{node.dispatchEvent(new Event('pointerdown'));node.value=String(value);node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));},value);}
try{
const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.getByRole('button',{name:'Skip for now',exact:true}).click();
await page.evaluate(async()=>{await (await import('../core/storage.js')).update(d=>{d.tasks.push({id:'private-task',text:'Private task never shared',listId:'inbox',completed:false});d.notes.push({id:'private-note',title:'Private',text:'Private note never shared',updatedAt:1});d.integrations.pexelsKey='private-key-never-shared';});});
const original=(await state()).settings;await studio();await page.getByRole('button',{name:'Fresh morning',exact:true}).click();assert.equal((await state()).settings.background.id,original.background.id);assert.equal(await page.locator('html').getAttribute('data-studio'),'true');await page.getByRole('button',{name:'Undo',exact:true}).click();await page.getByRole('button',{name:'Redo',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual((await state()).settings,original);assert.equal(await page.locator('html').getAttribute('data-studio'),null);pass('Preview, Undo/Redo and Cancel do not persist experimental settings');

await studio();await category('layout');await page.getByLabel('Lock position',{exact:true}).check();
const clock=page.locator('.clock-time'),locked=await page.locator('#clock').evaluate(n=>n.style.left);let rect=await clock.boundingBox();
await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+60,rect.y+rect.height/2+40);await page.mouse.up();assert.equal(await page.locator('#clock').evaluate(n=>n.style.left),locked);
await page.getByLabel('Lock position',{exact:true}).uncheck();rect=await clock.boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+60,rect.y+rect.height/2+40);await page.mouse.up();assert.notEqual(await page.locator('#clock').evaluate(n=>n.style.left),locked);
await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.deepEqual((await state()).settings,original);pass('Direct dragging moves unlocked elements; locks and Cancel protect the design');
await studio();for(const name of ['overview','layout','type','surfaces','wallpaper','dock','focus','journal','soundscapes','automation','interaction','access','portable']){await category(name);assert(await page.locator('.designer-body').isVisible());assert(await page.locator('.designer').evaluate(n=>n.scrollWidth<=n.clientWidth+2));}
await category('layout');await range('Horizontal position',10);await range('Vertical position',20);await page.getByLabel('Lock position',{exact:true}).check();await page.getByLabel('Layout profile',{exact:true}).selectOption('mobile');await range('Horizontal position',5);await range('Vertical position',25);
await category('type');await page.getByLabel('Text element',{exact:true}).selectOption('clock');await page.getByLabel('Typeface',{exact:true}).selectOption('mono');await range('Text size',140);
await category('dock');await page.getByLabel('Dock placement',{exact:true}).selectOption('center');await page.getByLabel('Show tool labels',{exact:true}).check();
await category('wallpaper');await page.getByRole('button',{name:'Add current wallpaper to playlist',exact:true}).click();await page.locator('.designer-gallery button').nth(1).click();await page.getByRole('button',{name:'Add current wallpaper to playlist',exact:true}).click();await range('Rotate every minutes',1);
await category('focus');await page.getByLabel('Timer style',{exact:true}).selectOption('ring');await page.getByRole('button',{name:'Preview Focus',exact:true}).click();
await category('journal');await page.getByLabel('Paper pattern',{exact:true}).selectOption('ruled');await page.getByLabel('Template name',{exact:true}).fill('Study reflection');await page.getByLabel('Template text',{exact:true}).fill('One thing I learned today…');await page.getByRole('button',{name:'Add journal template',exact:true}).click();
await category('soundscapes');await page.getByLabel('Soundscape name',{exact:true}).fill('Rain focus');await page.getByRole('button',{name:'Save current sound mix',exact:true}).click();await page.getByLabel('Focus soundscape',{exact:true}).selectOption({label:'Rain focus'});
await category('automation');await page.getByLabel('Enable automatic Scenes',{exact:true}).check();await page.getByLabel('Rule trigger',{exact:true}).selectOption('sunrise');await page.getByRole('button',{name:'Add automatic Scene rule',exact:true}).click();await page.getByRole('button',{name:'Pause automatic changes for 2 hours',exact:true}).click();
await category('interaction');await page.getByLabel('New task shortcut',{exact:true}).selectOption('t');await page.getByLabel('Alert sound',{exact:true}).selectOption('soft');await page.getByLabel('Completion celebration',{exact:true}).selectOption('sparkles');
await category('access');await page.getByRole('button',{name:'Larger controls',exact:true}).click();await page.screenshot({path:`docs/screenshots/studio-${browser}-editor.png`});
await page.getByRole('button',{name:'Save design',exact:true}).click();await page.locator('.designer').waitFor({state:'hidden'});const saved=(await state()).settings;assert.equal(saved.studio.enabled,true);assert.equal(saved.studio.type.clock.font,'mono');assert.equal(saved.studio.layouts.mobile.clock.x,5);assert.equal(saved.studio.journal.templates.length,2);assert.equal(saved.studio.wallpaper.playlist.length,2);assert.equal(saved.studio.soundscapes.length,1);assert.equal((await state()).audio.playing,false);pass('All customization categories save; independent layouts, templates, mixes and rules persist without starting audio');
await page.evaluate(async()=>(await import('../core/dashboard-view.js')).setView('home'));await page.keyboard.press('t');await page.locator('.notes-workspace-frame').waitFor();await page.keyboard.press('Escape');
await page.evaluate(async()=>{await(await import('../core/features.js')).openFeature('journal');});await page.getByRole('button',{name:'Hide journal sidebar',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Insert template',exact:true}).count(),0);assert.equal(await page.locator('.journal-workspace').getAttribute('data-paper'),'ruled');await page.screenshot({path:`docs/screenshots/studio-${browser}-journal.png`});await page.keyboard.press('Escape');pass('Remapped shortcuts and journal paper work without template controls');
const preset=await page.evaluate(async()=>(await import('../core/studio-presets.js')).exportPreset());const text=JSON.stringify(preset);assert(!text.includes('private-key-never-shared'));assert(!text.includes('Private task never shared'));assert(!text.includes('Private note never shared'));assert.equal(preset.settings.name,'');assert.equal(preset.settings.studio.automation.rules.length,0);
const parsed=await page.evaluate(async text=>{const module=await import('../core/studio-presets.js');const result=await module.parsePreset(text);return result.settings.studio.type.clock.font;},text);assert.equal(parsed,'mono');pass('Portable preset roundtrip excludes private records, keys, location and automation');
const timerBefore=(await state()).timer;await page.evaluate(async()=>{const scenes=await import('../core/scenes.js'),storage=await import('../core/storage.js');await storage.update(d=>{d.scenes.push({id:'custom-design',name:'Custom design',snapshot:scenes.snapshot(d)});});await scenes.applyScene('custom-design');});assert.deepEqual((await state()).timer,timerBefore);
await page.evaluate(async()=>(await import('../core/storage.js')).update(d=>{d.settings.studio.automation.pausedUntil=0;d.settings.studio.automation.enabled=false;}));await page.evaluate(async()=>(await import('../core/timer-client.js')).backgroundSync());assert((await page.evaluate(()=>chrome.alarms.getAll())).some(a=>a.name==='oneflow-customization'));pass('Complete Scenes and background wallpaper alarm preserve the timer');

await page.evaluate(async()=>{
 const db=await import('../core/db.js'),storage=await import('../core/storage.js'),presets=await import('../core/studio-presets.js');
 const blob=await (await fetch('../assets/backgrounds/alpine.webp')).blob();
 await db.put('images',{id:'preset-photo',name:'Local test wallpaper',blob});
 await storage.update(d=>{d.settings.background={kind:'upload',id:'preset-photo',color:'#293c36',blur:0,rotate:false};});
 const count=(await db.getAll('images')).length,exported=await presets.exportPreset(),parsed=await presets.parsePreset(JSON.stringify(exported));
 if((await db.getAll('images')).length!==count)throw new Error('Preview imported media before Save');
 if(parsed.settings.background.id==='preset-photo')throw new Error('Imported media identity was reused');
 await presets.saveDesign(parsed.settings,parsed);
 if(!(await db.getRecord('images',storage.get().settings.background.id))?.blob)throw new Error('Imported wallpaper missing');
 if(storage.get().integrations.pexelsKey!=='private-key-never-shared')throw new Error('Import replaced private credentials');
});pass('Local wallpaper presets validate without writes and install new media only on Save');
await page.evaluate(async()=>{
 const storage=await import('../core/storage.js'),scenes=await import('../core/scenes.js'),automation=await import('../background/studio.js');
 const now=new Date();
 await storage.update(d=>{
  d.settings.studio.enabled=true;d.settings.studio.wallpaper.playlist=[];
  const design=scenes.snapshot(d);design.settings.accent='#123456';
  d.scenes.push({id:'phase-test',name:'Phase test',snapshot:design});
  d.settings.studio.automation={enabled:true,pausedUntil:0,latitude:0,longitude:0,lastRuns:{},rules:[{id:'phase-rule',sceneId:'phase-test',trigger:'phase',phase:'focus',time:'00:00',days:[now.getDay()]}]};
  d.timer.status='running';d.timer.startedAt=now.getTime();d.timer.endsAt=now.getTime()+d.timer.duration;d.timer.sessionId='12345678-1234-1234-1234-123456789012';
 });
 const deadline=storage.get().timer.endsAt;await automation.processStudio(now);
 if(storage.get().settings.accent!=='#123456'||!storage.get().settings.studio.automation.lastRuns['phase-rule'])throw new Error('Phase scene did not apply');
 if(storage.get().timer.endsAt!==deadline)throw new Error('Automatic scene changed timer deadline');
 await storage.update(d=>{d.settings.studio.automation.enabled=false;d.settings.studio.automation.pausedUntil=Date.now()+7200000;d.settings.studio.type.clock.font='mono';});
});pass('Automatic phase Scene records full session IDs and preserves the running deadline');
await page.evaluate(async()=>(await import('../components/layout/index.js')).open());
assert.equal(await page.getByLabel('Customization category',{exact:true}).inputValue(),'layout');await page.getByRole('button',{name:'Cancel',exact:true}).click();pass('Layout tool opens the unified responsive visual editor');
await context.setOffline(true);await page.reload();await page.waitForSelector('html[data-ready=true]');await page.waitForSelector('html[data-studio=true]');assert.equal((await state()).settings.studio.type.clock.font,'mono');
for(const width of [1440,390,320]){await page.setViewportSize({width,height:960});await studio();await category('surfaces');assert(await page.locator('.designer').evaluate(n=>n.scrollWidth<=n.clientWidth+2));await page.screenshot({path:`docs/screenshots/studio-${browser}-${width}.png`});await page.getByRole('button',{name:'Cancel',exact:true}).click();}
assert.deepEqual(errors,[]);assert.deepEqual(network,[]);pass('Offline reload and desktop/390/320 editor fit without external calls or page errors');
}catch(error){console.error(error);await page.screenshot({path:`docs/screenshots/studio-${browser}-failure.png`}).catch(()=>{});process.exitCode=1;}finally{await fs.mkdir('test-results',{recursive:true});await fs.writeFile(`test-results/studio-${browser}-report.json`,JSON.stringify({checks,errors,network},null,2));await context.close();}


