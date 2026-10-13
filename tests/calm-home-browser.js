import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const sharp = require(process.env.ONEFLOW_NODE_MODULES + '/sharp');
const browser = process.argv[2] || 'chrome';
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `calm-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true, viewport:{width:1440,height:900}, timezoneId:'Asia/Kolkata',
  args:['--enable-unsafe-extension-debugging'], ignoreDefaultArgs:['--disable-extensions']
});
const page = await context.newPage(), errors = [], network = [], checks = [], metrics = {};
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (/^https?:/.test(r.url())) network.push(r.url()); });
const pass = label => { checks.push(label); console.log('PASS: ' + label); };
const menu = page.locator('#home-menu');
const options = async () => { if (!await menu.getAttribute('open').then(v => v !== null)) await menu.locator('summary').first().click(); };
const view = async mode => { if(mode === 'Home' && await page.locator('#focus-exit').isVisible()) { await page.locator('#focus-exit').click(); return; } await options(); await page.getByRole('button', {name:mode+' view',exact:true}).click(); };
const shot = async name => page.screenshot({path:`docs/screenshots/calm-${browser}-${name}.png`,animations:'disabled'});
const close = async () => { if(await page.locator('#panel[data-panel=notes]').isVisible()) await page.frameLocator('.notes-workspace-frame').getByRole('button',{name:'Close notes',exact:true}).click(); else await page.keyboard.press('Escape'); await page.locator('#panel').waitFor({state:'hidden'}); };
async function fits() {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal page overflow');
  const result = await page.locator('#dock button,#journal-button,#home-menu > summary').evaluateAll(nodes => nodes.filter(n => n.checkVisibility()).every(n => {
    const r=n.getBoundingClientRect(); return r.x>=0 && r.right<=innerWidth && r.y>=0 && r.bottom<=innerHeight;
  }));
  assert(result, 'Dock controls outside viewport');
}
try {
  await fs.mkdir('docs/screenshots',{recursive:true});
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.locator('#panel[data-panel=onboarding]').waitFor(); await shot('onboarding');
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await page.locator('#landscape[data-load=ready]').waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduce');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.clock-time')).fontWeight === '400');
  assert.equal(await page.locator('#dock button').count(),2);
  assert(!await page.locator('#weather').isVisible());
  assert(await page.locator('#quotes blockquote').isVisible());
  assert.equal(await menu.getAttribute('open'),null);
  const homeGroups = ['.greeting','.clock-time','.date-label','#focus','#search','#quotes blockquote','#journal-button','#dock','#home-menu > summary'];
  for (const selector of homeGroups) assert(await page.locator(selector).isVisible(), `Missing Home group: ${selector}`);
  const visibleGroups = await page.locator('.greeting,.clock-time,.date-label,#focus,#search,#quotes,#timer,#journal-button,#focus-exit,#dock,#home-menu > summary,#settings-button,.brand,#weather,#links,#countdowns').evaluateAll(nodes=>nodes.filter(node=>node.checkVisibility({visibilityProperty:true})).length);
  assert.equal(visibleGroups,9);
  assert(!await page.locator('#settings-button').isVisible());
  assert(!await page.locator('.brand').isVisible());
  await fits(); await shot('home-1440');
  pass('Fresh Home shows light clock, daily quote, one focus prompt and two dock shortcuts and a top-right Journal button');

  for (const [width,height] of [[1280,800],[390,844],[320,700]]) {
    await page.setViewportSize({width,height}); await fits();
    const focus = await page.getByLabel('Your main focus today').boundingBox();
    const dock = await page.locator('.tool-cluster').boundingBox();
    assert(focus.y+focus.height<dock.y,'Home focus overlaps dock');
    await shot(`home-${width}`);
    await options();
    assert(await page.locator('#settings-button').isVisible());
    const box=await page.locator('.home-menu-body').boundingBox();
    assert(box.x>=0 && box.x+box.width<=width && box.y>=0,'Options menu overflow');
    await shot(`options-${width}`);
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('open'),null);
    assert(await menu.locator('summary').first().evaluate(n=>n===document.activeElement));
  }
  pass('1440/1280/390/320 layouts fit; menu works with Escape and restores focus');

  await page.setViewportSize({width:1440,height:900});
  await options();
  await page.locator('#settings-button').click();
  await page.locator('#panel[data-panel=settings]').waitFor(); await shot('settings'); await close();
  await page.getByRole('button',{name:'Notes',exact:true}).click();
  await page.locator('#panel[data-panel=notes]').waitFor(); await shot('tasks'); await close();
  await page.getByRole('button',{name:'Sounds',exact:true}).click();
  await page.locator('#panel[data-panel=sounds]').waitFor(); await close();
  await options(); await page.getByRole('button',{name:'Open all tools',exact:true}).click();
  await page.locator('#panel[data-panel=day]').waitFor();
  assert(await page.getByRole('button',{name:'Music',exact:true}).isVisible());
  assert(await page.getByRole('button',{name:'Stats',exact:true}).isVisible()); await close();
  pass('Settings, Tasks, Sounds and More open; Music and Stats remain reachable');
  await page.locator('.greeting').click(); await page.keyboard.press('n');
  await page.locator('#panel[data-panel=notes]').waitFor(); await close();
  await page.locator('.greeting').click(); await page.keyboard.press('/');
  assert(await page.locator('#web-search').evaluate(n=>n===document.activeElement));
  pass('N opens Tasks and / focuses search without revealing secondary Home controls');

  await page.getByLabel('Your main focus today').fill('Read one chapter');
  await page.getByLabel('Focus duration',{exact:true}).selectOption('custom');await page.getByLabel('Focus duration in minutes').fill('32');
  await view('Ambient'); await page.locator('#ambient-clock').waitFor(); await shot('ambient');
  await view('Home');
  assert.equal(await page.getByLabel('Your main focus today').inputValue(),'Read one chapter');
  assert.equal(await page.getByLabel('Focus duration in minutes').inputValue(),'32');
  await page.getByRole('button',{name:'Start focus',exact:true}).click();
  await page.getByRole('button',{name:'Pause',exact:true}).waitFor(); await shot('focus');
  assert.equal(await page.locator('html').getAttribute('data-view'),'focus');
  const before=await page.evaluate(async ()=>(await import('../core/storage.js')).get().timer);
  await view('Home'); await view('Focus');
  const after=await page.evaluate(async ()=>(await import('../core/storage.js')).get().timer);
  assert.equal(before.sessionId,after.sessionId); assert.equal(before.endsAt,after.endsAt);
  await page.locator('#focus .session-title').focus(); await page.keyboard.press('Space');
  await page.getByRole('button',{name:'Resume',exact:true}).waitFor();
  await page.getByRole('button',{name:'End session',exact:true}).click();
  await view('Home');
  await page.evaluate(async () => (await import('../core/storage.js')).update(d=>{d.lastFocusSession=null;}));
  pass('Mode changes preserve unsaved title/duration and active timer identity; pause and stop work');

  const catalog=JSON.parse(await fs.readFile('data/backgrounds.json','utf8'));
  for(const item of catalog) {
    await page.evaluate(async id => (await import('../core/storage.js')).update(d=>{d.settings.background.id=id;}),item.id);
    await page.waitForFunction(id=>document.documentElement.dataset.background===id && document.querySelector('#landscape').dataset.load==='ready',item.id);
    assert.notEqual(await page.locator('.readability').evaluate(n=>getComputedStyle(n).backgroundImage),'none');
    await shot('scene-'+item.id);
  }
  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{d.settings.theme='light';d.settings.background.id='alpine';}));
  await options(); await shot('light-options'); await page.keyboard.press('Escape');
  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{d.settings.background.kind='solid';d.settings.background.color='#ffffff';}));
  await page.waitForFunction(()=>document.documentElement.dataset.canvas==='white');
  assert.equal(await page.locator('.readability').evaluate(n=>getComputedStyle(n).backgroundImage),'none');
  await shot('white');
  pass('Six bundled scenes have readability shading; light panel theme and pure white canvas work');

  // Sample the rendered backing under small Home text against a worst-case upload.
  await page.evaluate(async () => {
    const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1920,1080);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    await (await import('../core/db.js')).put('images',{id:'contrast-test',name:'White contrast test',blob});
    await (await import('../core/storage.js')).update(d=>{d.settings.background.kind='upload';d.settings.background.id='contrast-test';d.settings.theme='dark';});
  });
  await page.waitForFunction(()=>document.documentElement.dataset.background==='upload' && document.querySelector('#landscape').dataset.load==='ready');
  await shot('white-upload');
  const points=await page.locator('.greeting,.date-label,.session-setup > input,#web-search,.session-duration > select').evaluateAll(nodes=>nodes.map(n=>{
    const r=n.getBoundingClientRect(),c=getComputedStyle(n,n.matches('input')?'::placeholder':null).color.match(/[\d.]+/g).slice(0,3).map(Number);
    return {x:Math.floor(r.x+r.width/2),y:Math.floor(r.y+r.height/2),c};
  }));
  await page.locator('.centerpiece,.topbar').evaluateAll(nodes=>nodes.forEach(n=>n.style.visibility='hidden'));
  const {data,info}=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});
  await page.locator('.centerpiece,.topbar').evaluateAll(nodes=>nodes.forEach(n=>n.style.removeProperty('visibility')));
  const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const ratios=points.map(p=>{const k=(p.y*info.width+p.x)*info.channels;return (lum(p.c)+.05)/(lum([...data.subarray(k,k+3)])+.05);});
  metrics.whiteUploadTextContrast=ratios;
  assert(Math.min(...ratios)>=4.5,'Small Home text contrast below AA: '+ratios);
  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{d.settings.contrast='strong';d.settings.appearance.overlay=85;}));
  await page.waitForFunction(()=>Number(document.documentElement.style.getPropertyValue('--home-shade'))===.85);
  pass('White-upload sampled text backing meets 4.5:1; overlay preference and strong contrast apply');

  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{
    d.settings.background.kind='bundled';d.settings.background.id='alpine';d.settings.theme='dark';
    d.settings.contrast='normal';d.settings.appearance.overlay=60;
    d.settings.studio.enabled=true;d.settings.studio.type.clock.size=116;d.settings.studio.type.clock.weight=500;
    d.settings.studio.layouts.desktop.weather={x:75,y:10,w:20,scale:1,locked:false,hidden:false};
  }));
  await page.waitForFunction(()=>document.documentElement.dataset.studio==='true');
  assert.equal(await page.locator('.clock-time').evaluate(n=>getComputedStyle(n).fontSize),'116px');
  assert(await page.locator('#weather[data-studio-floating=true]').isVisible());
  await page.setViewportSize({width:320,height:700}); await fits(); await shot('studio-320');
  await page.evaluate(async ()=>(await import('../core/storage.js')).update(d=>{d.settings.studio.enabled=false;}));
  await page.waitForFunction(()=>!document.querySelector('#weather').dataset.studioFloating);
  await page.setViewportSize({width:1440,height:900});
  await context.setOffline(true); await page.reload();
  await page.locator('html[data-ready=true]').waitFor(); await fits();
  metrics.cachedReadyMs=[];
  for(let i=0;i<3;i++) {
    await page.reload(); await page.locator('html[data-ready=true]').waitFor();
    metrics.cachedReadyMs.push(await page.evaluate(()=>performance.getEntriesByName('oneflow-ready')[0].startTime));
  }
  assert.deepEqual(errors,[]); assert.deepEqual(network,[]);
  pass('Custom typography survives; offline reload produces no runtime/CSP errors or external requests');
} finally {
  await fs.mkdir('test-results',{recursive:true});
  await fs.writeFile(`test-results/calm-${browser}-report.json`,JSON.stringify({checks,errors,network,metrics},null,2));
  await context.close();
}

