import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.ONEFLOW_NODE_MODULES+'/playwright');
const name=process.argv[2]||'chrome',checks=[],errors=[],network=[];
const context=await chromium.launchPersistentContext(path.resolve('.test-profile','backgrounds-'+name+'-'+Date.now()),{executablePath:name==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:1440,height:960},args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message)); page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
const pass=label=>{checks.push(label);console.log('PASS: '+label);};
const catalog=JSON.parse(await fs.readFile('data/backgrounds.json','utf8'));
async function change(id) { await page.evaluate(async id=>{await (await import('../core/storage.js')).update(d=>{Object.assign(d.settings.background,{kind:'bundled',id,rotate:false});});},id); await page.waitForFunction(id=>document.documentElement.dataset.background===id&&document.querySelector('#landscape').dataset.load==='ready',id); }
async function shot(label){await page.screenshot({path:`test-results/backgrounds-${name}-${label}.png`,fullPage:!/(flow|zoom)/.test(label),animations:'disabled'});}
async function settings(tab='backgrounds'){await page.evaluate(async tab=>(await import('../core/events.js')).emit('settings:open',tab),tab);await page.locator('.settings-content').waitFor();}
try {
 await fs.mkdir('test-results',{recursive:true});const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
 await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.waitForSelector('html[data-ready=true]');await page.getByRole('button',{name:'Skip for now',exact:true}).click();await context.setOffline(true);
 for (const [width,height] of [[1440,960],[1280,720],[390,844],[320,640]]) {
   await page.setViewportSize({width,height});
   for (const item of catalog) {
     await change(item.id);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     const image=page.locator('.landscape-image');assert.equal(await image.evaluate(n=>getComputedStyle(n).objectFit),'cover');
     assert.equal(await image.evaluate(n=>getComputedStyle(n).objectPosition),(width>1023?item.position:item.mobilePosition).map(n=>`${n}%`).join(' '));
     await page.getByRole('button',{name:'Start focus',exact:true}).scrollIntoViewIfNeeded();assert(await page.getByRole('button',{name:'Start focus',exact:true}).isVisible());
     await shot(`${item.id}-${width}`);
   }
 }
 pass(`${catalog.length} bundled backgrounds work offline at desktop, compact laptop and two mobile sizes`);
 await page.setViewportSize({width:1440,height:960});await change('alpine');
 await page.route('**/assets/backgrounds/cozy.webp',async route=>{await new Promise(r=>setTimeout(r,600));await route.continue();});
 await page.evaluate(async()=>(await import('../core/storage.js')).update(d=>{d.settings.background.id='cozy';}));
 await page.reload();await page.waitForSelector('html[data-ready=true]');
 await page.waitForSelector('#landscape[data-load=loading]');assert.match(await page.locator('.landscape-preview').evaluate(n=>n.style.backgroundImage),/cozy-thumb/);assert(await page.getByRole('button',{name:'Start focus',exact:true}).isEnabled());
 assert.equal(await page.locator('.landscape-image').count(),0);
 await change('dark');await page.waitForTimeout(800);assert.equal(await page.locator('.landscape-image').getAttribute('src'),'../assets/backgrounds/dark.webp');await page.unroute('**/assets/backgrounds/cozy.webp');
 pass('Slow decode keeps Home usable and stale image completions cannot replace a newer scene');
 await page.route('**/assets/backgrounds/lofi.webp',route=>route.abort());await page.evaluate(async()=>(await import('../core/storage.js')).update(d=>{d.settings.background.id='lofi';}));await page.reload();await page.waitForSelector('html[data-ready=true]');await page.waitForSelector('#landscape[data-load=fallback]');assert.match(await page.locator('.landscape-preview').evaluate(n=>n.style.backgroundImage),/lofi-thumb/);await page.unroute('**/assets/backgrounds/lofi.webp');
 pass('A failed full-size image keeps its offline thumbnail visible');
 await settings();await page.locator('.background-card').first().waitFor();assert.equal(await page.locator('.background-card').count(),catalog.length);assert(await page.locator('.background-card img').evaluateAll(nodes=>nodes.every(n=>n.getAttribute('src').endsWith('-thumb.webp'))));
 await page.getByLabel('Upload a photograph',{exact:true}).setInputFiles('assets/backgrounds/cozy.webp');await page.waitForSelector('.uploaded-background img[src^="blob:"]');assert.equal(await page.locator('.uploaded-background img').evaluate(n=>n.naturalWidth),384);await shot('uploads');await page.keyboard.press('Escape');await page.waitForSelector('#landscape[data-load=ready]');assert.match(await page.locator('.landscape-image').getAttribute('src'),/^blob:/);
 await page.evaluate(async()=>{await (await import('../core/features.js')).openFeature('scenes');});await page.locator('#panel[data-panel=scenes]').waitFor();await page.getByLabel('Scene name',{exact:true}).fill('My uploaded scene');await page.getByRole('button',{name:'Save current scene',exact:true}).click();await page.getByText('My uploaded scene',{exact:true}).waitFor();
 const card=page.locator('.scene-card').filter({has:page.getByText('My uploaded scene',{exact:true})});await card.locator('summary').click();await card.locator('img[src^="blob:"]').waitFor();await page.waitForFunction(()=>Array.from(document.querySelectorAll('.scene-preview-image[src^="blob:"]')).some(n=>n.naturalWidth===384));assert(await page.locator('.scene-preview-image[src*="assets/backgrounds"]').evaluateAll(nodes=>nodes.every(n=>n.src.endsWith('-thumb.webp'))));await shot('scenes');await page.keyboard.press('Escape');await page.reload();await page.waitForSelector('html[data-ready=true]');await page.waitForSelector('#landscape[data-load=ready]');assert.match(await page.locator('.landscape-image').getAttribute('src'),/^blob:/);
 pass('Upload selection, small photo/scene previews and an uploaded scene survive offline reload');
 await page.evaluate(async()=>(await import('../core/storage.js')).update(d=>{d.settings.contrast='strong';d.layout={focus:{x:1,y:1,w:8,h:2}};}));assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--shade-left')),'0.82');assert.equal(await page.locator('html').getAttribute('data-shading'),'balanced');
 await page.evaluate(async()=>(await import('../core/storage.js')).update(d=>{d.layout={};d.settings.contrast='normal';d.settings.reducedMotion=true;}));assert.equal(await page.locator('.landscape-image').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(async()=>(await import('../core/storage.js')).update(d=>{d.settings.reducedMotion=false;}));assert.equal(await page.locator('html').getAttribute('data-motion'),'reduce');await page.emulateMedia({reducedMotion:'no-preference'});
 pass('Custom layouts strengthen coverage; explicit and system reduced motion suppress the image fade');
 await settings();await page.getByRole('button',{name:'Pure white',exact:true}).click();await page.waitForSelector('html[data-canvas=white]');assert.equal(await page.locator('.readability').evaluate(n=>getComputedStyle(n).backgroundImage),'none');await page.getByRole('button',{name:'Photo',exact:true}).click();await page.waitForSelector('#landscape[data-load=ready]');assert.match(await page.locator('.landscape-image').getAttribute('src'),/^blob:/);await page.keyboard.press('Escape');
 pass('Pure white stays unshaded and Photo restores the selected upload');
 await change(catalog.at(-1).id);await page.keyboard.press('/');assert.equal(await page.locator('#search input').evaluate(n=>n===document.activeElement),true);await page.keyboard.press('Escape');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');await page.keyboard.press('n');await page.getByLabel('New task',{exact:true}).waitFor();await page.keyboard.press('Escape');
 await page.getByLabel('Your main focus today').fill('Find a quiet rhythm');await page.getByRole('button',{name:'Start focus',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.evaluate(()=>document.activeElement.blur());await page.keyboard.press('Space');await page.getByRole('button',{name:'Resume',exact:true}).waitFor();await page.keyboard.press('f');await page.locator('#flow-view[open]').waitFor();assert.equal(await page.locator('.readability').evaluate(n=>getComputedStyle(n).visibility),'hidden');await shot('flow');await page.getByRole('button',{name:'Leave Flow',exact:true}).click();await page.locator('#panel[data-panel=flow-summary]').waitFor();await page.keyboard.press('Escape');
 pass('Search, new-task, timer, Flow and Escape shortcuts work with visible keyboard focus');
 const zoom=await page.evaluate(async()=>{const tab=await chrome.tabs.getCurrent();await chrome.tabs.setZoom(tab.id,2);return await chrome.tabs.getZoom(tab.id);});assert.equal(zoom,2);await page.waitForFunction(()=>innerWidth===720);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await settings('focus');await page.getByRole('button',{name:'Save rhythm',exact:true}).waitFor();assert(await page.locator('#panel-body').evaluate(n=>n.scrollWidth<=n.clientWidth+2));for(let i=0;i<25;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.closest('#panel')!==null));}await shot('zoom-200');await page.keyboard.press('Escape');await page.evaluate(async()=>{const tab=await chrome.tabs.getCurrent();await chrome.tabs.setZoom(tab.id,1);});
 pass('Actual 200% tab zoom fits Home and Focus Settings; keyboard focus stays in the dialog');
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);assert.deepEqual((await page.evaluate(()=>chrome.permissions.getAll())).origins,[]);pass('No page exceptions, external requests or new website permissions');
} catch(error){console.error(error);process.exitCode=1;checks.push('FAIL: '+error.message);await shot('failure').catch(()=>{});}finally{await fs.writeFile(`test-results/backgrounds-${name}-report.json`,JSON.stringify({browser:name,checks,errors,network},null,2));await context.close();}

