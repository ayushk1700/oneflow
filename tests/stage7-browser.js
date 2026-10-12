import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), modules = process.env.ONEFLOW_NODE_MODULES;
const { chromium } = require(modules+'/playwright'), sharp = require(modules+'/sharp');
const browser = process.argv[2] || 'chrome', checks = [], errors = [], metrics = {contrast:[],readyMs:[],layoutShift:[]};
const context = await chromium.launchPersistentContext(path.resolve('.test-profile',`stage7-${browser}-${Date.now()}`), {
  executablePath:browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true, viewport:{width:1440,height:900}, timezoneId:'Asia/Kolkata', args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.on('pageerror',e => errors.push(e.message));
await page.addInitScript(() => {
  window.layoutShifts = 0;
  new PerformanceObserver(list => { for(const entry of list.getEntries()) if(!entry.hadRecentInput) window.layoutShifts += entry.value; }).observe({type:'layout-shift',buffered:true});
});
const pass = label => {checks.push(label); console.log('PASS: '+label);};
const state = () => page.evaluate(async () => (await import('../core/storage.js')).get());
const view = mode => page.evaluate(async mode => (await import('../core/dashboard-view.js')).setView(mode),mode);
const shot = label => page.screenshot({path:`test-results/stage7-${browser}-${label}.png`,animations:'disabled'});
const lum = rgb => rgb.map(n => n/255).map(n => n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
async function contrast(label) {
  const points = await page.locator('.greeting,.date-label,.clock-time,.clock-period,.session-title,.session-countdown,.quote-author,#quotes blockquote,.brand,.session-setup > input,#web-search,.session-duration .field > span').evaluateAll(nodes => nodes.filter(n=>n.checkVisibility()).flatMap(n => {
    const r=n.getBoundingClientRect(), s=getComputedStyle(n,n.matches('input')?'::placeholder':null), rgb=s.color.match(/[\d.]+/g)?.slice(0,3).map(Number);
    if(!rgb || r.bottom>innerHeight || r.top<0) return [];
    return [.2,.5,.8].map(f=>({name:n.className || n.id,x:Math.floor(r.x+r.width*f),y:Math.floor(r.y+r.height/2),rgb,minimum:parseFloat(s.fontSize)>=24?3:4.5}));
  }));
  await page.locator('.centerpiece,.topbar').evaluateAll(nodes=>nodes.forEach(n=>n.style.opacity='0'));
  const {data,info}=await sharp(await page.screenshot({animations:'disabled'})).removeAlpha().raw().toBuffer({resolveWithObject:true});
  await page.locator('.centerpiece,.topbar').evaluateAll(nodes=>nodes.forEach(n=>n.style.removeProperty('opacity')));
  const ratios=points.map(p=>{
    const offset=(p.y*info.width+p.x)*info.channels, a=lum(p.rgb),b=lum([...data.subarray(offset,offset+3)]);
    return {name:p.name,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),minimum:p.minimum};
  });
  metrics.contrast.push({label,minimum:Math.min(...ratios.map(r=>r.ratio))});
  assert(ratios.every(r=>r.ratio>=r.minimum),label+' contrast: '+JSON.stringify(ratios.filter(r=>r.ratio<r.minimum)));
}
async function chooseScene(id) {
  await page.evaluate(async id => (await import('../core/storage.js')).update(d=>{d.settings.background.kind='bundled';d.settings.background.id=id;d.settings.background.rotate=false;}),id);
  await page.waitForFunction(id=>document.documentElement.dataset.background===id && document.querySelector('#landscape').dataset.load==='ready',id);
}
try {
  await fs.mkdir('test-results',{recursive:true});
  const cdp=await context.browser().newBrowserCDPSession(), {id}=await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await page.locator('#panel').waitFor({state:'hidden'});
  await page.locator('html[data-ready=true]').waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduce');
  // All interactions in this section use the keyboard. Focus() establishes the starting control only.
  await page.locator('#main').focus(); await page.keyboard.press('/');
  assert.equal(await page.locator('#web-search').evaluate(n=>n===document.activeElement),true);
  await page.keyboard.type('n f');
  assert.equal((await state()).timer.status,'idle');
  await page.locator('#main').focus(); await page.keyboard.press('n');
  await page.getByLabel('New task',{exact:true}).fill('Keyboard-only task'); await page.keyboard.press('Enter');
  await page.locator('.task-text').filter({hasText:'Keyboard-only task'}).waitFor();
  await page.keyboard.press('Escape');
  assert(await page.evaluate(()=>document.activeElement.checkVisibility()));
  await page.locator('#home-menu > summary').focus(); await page.keyboard.press('Space');
  assert.equal(await page.locator('#home-menu').evaluate(n=>n.open),true);
  assert.equal((await state()).timer.status,'idle');
  await page.getByRole('button',{name:'Focus view',exact:true}).focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#focus-exit').evaluate(n=>n===document.activeElement),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('html').getAttribute('data-view'),'home');
  await page.getByLabel('Your main focus today',{exact:true}).fill('One calm step');
  await page.getByRole('button',{name:'Start focus',exact:true}).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button',{name:'Pause',exact:true}).waitFor();
  await page.waitForFunction(()=>document.activeElement.matches('.focus-start') && document.activeElement.textContent==='Pause');
  await page.keyboard.press('Enter'); await page.getByRole('button',{name:'Resume',exact:true}).waitFor();
  await page.waitForFunction(()=>document.activeElement.matches('.focus-start') && document.activeElement.textContent==='Resume');
  await page.locator('#main').focus(); await page.keyboard.press('Space');
  await page.getByRole('button',{name:'Pause',exact:true}).waitFor();
  await page.keyboard.press('Space'); await page.getByRole('button',{name:'Resume',exact:true}).waitFor();
  await page.getByRole('button',{name:'Sounds',exact:true}).focus(); await page.keyboard.press('Enter');
  await page.locator('#panel[data-panel=sounds]').waitFor();
  await page.keyboard.press('Shift+Tab');
  assert(await page.evaluate(()=>!!document.activeElement.closest('#panel')));
  await page.keyboard.press('Escape');
  assert(await page.evaluate(()=>document.activeElement.checkVisibility()));
  await shot('focus-keyboard');
  pass('Keyboard search/tasks/disclosure/start/pause/resume/sounds/exit and focus restoration');
  const scenes=JSON.parse(await fs.readFile('data/backgrounds.json','utf8'));
  for(const width of [1440,390,320]) {
    await page.setViewportSize({width,height:900});
    for(const scene of scenes) {
      await chooseScene(scene.id);
      for(const mode of ['home','focus']) {await view(mode);await contrast(`${scene.id}-${mode}-${width}`);}
    }
    await view('home'); await shot(`home-${width}`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');
    await view('ambient'); await shot(`ambient-${width}`);
    const dock=await page.locator('.tool-cluster').boundingBox(); assert(dock.x>=0 && dock.x+dock.width<=width);
  }
  pass(`All ${scenes.length} bundled scenes meet sampled AA text contrast in Home/Focus at three widths`);
  await page.setViewportSize({width:320,height:568}); await view('home');
  await page.locator('#main').focus(); await page.keyboard.press('/');
  const search=await page.locator('#web-search').boundingBox(), dock=await page.locator('.tool-cluster').boundingBox();
  assert(search.y+search.height<=dock.y,'Short-screen dock covers keyboard-focused search');
  await shot('short-mobile');
  for(const color of ['#ffffff','#000000']) {
    await page.evaluate(async color=>(await import('../core/storage.js')).update(d=>{d.settings.background.kind='solid';d.settings.background.color=color;}),color);
    await contrast('solid-'+color);
  }
  await page.setViewportSize({width:1440,height:900});
  await chooseScene('alpine');
  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{d.settings.theme='light';}));
  await contrast('light-theme-scenic'); await shot('light-home');
  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{d.settings.background.kind='animated';d.settings.background.id='aurora';}));
  assert.equal(await page.locator('#landscape').evaluate(n=>getComputedStyle(n,'::after').animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='full');
  assert.notEqual(await page.locator('#landscape').evaluate(n=>getComputedStyle(n,'::after').animationName),'none');
  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{d.settings.reducedMotion=true;}));
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduce');
  assert.equal(await page.locator('#landscape').evaluate(n=>getComputedStyle(n,'::after').animationName),'none');
  const live=JSON.parse(await fs.readFile('data/livewallpapers.json','utf8'));
  if(live.length) {
    await page.evaluate(async id=>(await import('../core/storage.js')).update(d=>{d.settings.background.kind='local-video';d.settings.background.id=id;}),live[0].id);
    await page.locator('video.live-wallpaper').waitFor();
    assert(await page.locator('video.live-wallpaper').evaluate(v=>v.paused));
  }
  pass('OS and explicit reduced motion stop animated scenery and pause local video; solid and light scenes remain readable');
  await chooseScene('alpine');
  await page.locator('#main').focus(); await page.keyboard.press('f');
  await page.locator('#flow-view[open]').waitFor();
  await page.getByRole('button',{name:'Leave Flow',exact:true}).focus(); await page.keyboard.press('Enter');
  await page.locator('#panel[data-panel=flow-summary]').waitFor(); await page.keyboard.press('Escape');
  await view('home');
  pass('Fullscreen Flow can be entered and left using the keyboard');
  for(let n=0;n<5;n++) {
    await page.reload(); await page.locator('html[data-ready=true]').waitFor();
    await page.locator('#landscape[data-load=ready]').waitFor();
    metrics.readyMs.push(await page.evaluate(()=>performance.getEntriesByName('oneflow-ready')[0].startTime));
    metrics.layoutShift.push(await page.evaluate(()=>window.layoutShifts));
  }
  metrics.readyMedianMs=[...metrics.readyMs].sort((a,b)=>a-b)[2];
  pass(`Cached ready median ${metrics.readyMedianMs.toFixed(1)}ms; max observed layout shift ${Math.max(...metrics.layoutShift).toFixed(3)}`);
  assert.deepEqual(errors,[]);
} catch(error) {await shot('failure'); throw error;}
finally {await fs.writeFile(`test-results/stage7-${browser}-report.json`,JSON.stringify({checks,errors,metrics},null,2));await context.close();}
