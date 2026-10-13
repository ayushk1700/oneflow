// Exercise the real unpacked extension; never use the user's browser profile.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`);
const browser = process.argv[2] || 'chrome', checks = [], errors = [], requests = [];
let context, page;
const pass = label => { checks.push(label); console.log('PASS: ' + label); };
const open = async id => {
  await page.evaluate(async id => {
    const f = await import('../core/features.js');
    if (id === 'day') await f.openDay(); else await f.openFeature(id);
  }, id);
  await page.locator(`#panel[open][data-panel=${id}]`).waitFor();
};
const timer = () => page.evaluate(async () => (await import('../core/storage.js')).get().timer);
const switchTool = async id => {
  await page.locator('.panel-switcher > summary').click();
  await page.locator(`#panel-nav [data-tool=${id}]`).click();
  await page.locator(`#panel[open][data-panel=${id}]`).waitFor();
};
try {
  await fs.mkdir('docs/screenshots', { recursive:true });
  context = await chromium.launchPersistentContext(path.resolve('.test-profile',`design34-${browser}-${Date.now()}`), {
    executablePath:browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless:true, viewport:{width:1440,height:900}, args:['--enable-unsafe-extension-debugging'], ignoreDefaultArgs:['--disable-extensions']
  });
  page = await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if (/^https?:/.test(r.url())) requests.push(r.url());});
  const cdp = await context.browser().newBrowserCDPSession(), {id} = await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await page.locator('#panel').waitFor({state:'hidden'});
  await open('day');
  const titles = await page.locator('.tool-group h3').allTextContents();
  assert.deepEqual(titles,['Focus','Plan','Reflect','Learn and Career','Environment','System utilities','Workspaces','Reflection shortcuts']);
  const sizes = await page.locator('.tool-group').evaluateAll(nodes=>nodes.slice(0,5).map(n=>n.querySelectorAll('.day-card').length));
  assert(sizes.every(n=>n<=6));
  assert.equal(await page.getByRole('button',{name:'Website blocking',exact:true}).count(),0);
  await page.getByLabel('Search all tools',{exact:true}).fill('meeting follow-up');
  assert.equal(await page.locator('.day-card').count(),1);
  assert.equal(await page.locator('.day-card').getAttribute('aria-label'),'Afterglow');
  pass('Five hubs stay within six tools; workspace/reflection shortcuts remain accessible and proposed aliases resolve');
  await open('commands');
  const commandSearch = page.locator('#panel-body input[type=search]');
  for (const [alias,label] of [['Next-Step Compiler','Next-Step Compiler'],['next steps','Next-Step Compiler'],['resume work','Focus Recovery'],['energy check-in','Energy Weather'],['layout','Customize'],['Mood','Mood'],['Open sounds','Sounds']]) {
    await commandSearch.fill(alias);
    assert(await page.locator('.command-workspace').getByRole('button',{name:label,exact:true}).isVisible());
  }
  await commandSearch.fill('next steps'); await commandSearch.focus();
  await page.keyboard.press('Escape'); await page.locator('#panel').waitFor({state:'hidden'});
  pass('Old and proposed command names resolve; the first Escape closes from a populated search field');
  await open('recall');
  const draft = page.getByLabel('Subject',{exact:true});
  await draft.fill('Live subject draft');
  await draft.evaluate(n=>n.setSelectionRange(5,12));
  await switchTool('sounds'); await switchTool('recall');
  assert.equal(await draft.inputValue(),'Live subject draft');
  assert.deepEqual(await draft.evaluate(n=>[n.selectionStart,n.selectionEnd]),[5,12]);
  await page.locator('.panel-switcher > summary').click();
  await page.getByLabel('Search switch tools',{exact:true}).fill('meeting follow-up');
  assert(await page.locator('#panel-nav [data-tool=afterglow]').isVisible());
  assert(!await page.locator('#panel-nav [data-tool=recall]').isVisible());
  await page.keyboard.press('Escape'); await page.locator('#panel').waitFor({state:'hidden'});
  pass('Global switcher searches aliases and restores live editor text and selection');
  await page.evaluate(async()=>{await(await import('../core/storage.js')).update(d=>{d.settings.widgets.sounds=false;d.settings.widgets.music=false;});});
  await open('day'); await page.getByLabel('Search all tools',{exact:true}).fill('Sounds'); assert.equal(await page.locator('.day-card').count(),0);
  await open('commands'); await commandSearch.fill('Sounds'); assert.equal(await page.locator('.command-workspace button').count(),0);
  await open('recall'); await page.locator('.panel-switcher > summary').click(); assert.equal(await page.locator('#panel-nav [data-tool=sounds]').count(),0);
  await page.keyboard.press('Escape');
  await page.evaluate(async()=>{
    const {el}=await import('../core/utils.js'),{openPanel}=await import('../core/ui.js');
    openPanel('Long links','acceptance-links',el('p',{},'https://example.org/'+ 'a'.repeat(2000)));
  });
  await page.setViewportSize({width:320,height:900});
  assert(await page.locator('#panel-body').evaluate(n=>n.scrollWidth<=n.clientWidth));
  await page.keyboard.press('Escape');
  await page.evaluate(async()=>{await(await import('../core/storage.js')).update(d=>{d.settings.widgets.sounds=true;d.settings.widgets.music=true;});});
  pass('Disabled tools are excluded from launcher, switcher and commands');
  await page.evaluate(async()=>{
    const {el}=await import('../core/utils.js'),{tabs}=await import('../components/panel-design/index.js'),{openPanel}=await import('../core/ui.js');
    const root=el('div'); tabs(root,['First','Second','Third'].map(label=>({label,content:el('p',{},label)})),'acceptance'); openPanel('Tabs','acceptance-tabs',root);
  });
  await page.getByRole('tab',{name:'First',exact:true}).focus();
  for (const [key,name] of [['ArrowRight','Second'],['End','Third'],['Home','First'],['ArrowLeft','Third']]) {
    await page.keyboard.press(key);assert.equal(await page.getByRole('tab',{name,exact:true}).getAttribute('aria-selected'),'true');
  }
  await page.keyboard.press('Escape');
  for (const theme of ['light','dark']) {
    await page.evaluate(async theme=>(await import('../core/storage.js')).update(d=>{d.settings.theme=theme;}),theme);
    for (const width of [1440,390,320]) {
      await page.setViewportSize({width,height:900}); await open('day');
      const frame=await page.locator('#panel').evaluate(n=>{const s=getComputedStyle(n);return {radius:s.borderRadius,padding:s.padding,blur:s.backdropFilter,overflow:n.scrollWidth>n.clientWidth};});
      assert.equal(frame.radius,'20px');assert.equal(frame.padding,width>700?'24px':'16px');assert.equal(frame.blur,'none');assert.equal(frame.overflow,false);
      await page.screenshot({path:`docs/screenshots/design-3-4-${browser}-tools-${theme}-${width}.png`,animations:'disabled'});
      await page.locator('.panel-switcher > summary').click();
      const bounds=await page.locator('.panel-switcher-options').boundingBox(); assert(bounds.x>=0&&bounds.x+bounds.width<=width);
      await page.keyboard.press('Escape');
    }
  }
  pass('Shared frame, switcher and accessible tabs fit both themes at desktop, 390px and 320px');
  await page.evaluate(async()=>{await(await import('../core/timer-client.js')).timerCommand('start',{taskTitle:'A calm session',focusMinutes:25});});
  await page.locator('html[data-view=focus]').waitFor();
  assert.equal(await page.locator('[role=timer]:visible').count(),1);
  assert(await page.locator('#focus progress').isVisible());
  await page.locator('#focus .session-options > summary').click();
  assert(await page.getByRole('button',{name:'Save a capsule',exact:true}).isVisible());
  assert(await page.getByRole('button',{name:'Leave a resume note',exact:true}).isVisible());
  const active=await timer();
  await page.screenshot({path:`docs/screenshots/design-3-4-${browser}-focus-options-320.png`,animations:'disabled'});
  await page.getByRole('button',{name:'Leave a resume note',exact:true}).click();
  await page.locator('#panel[open][data-panel=recovery]').waitFor();
  assert.equal((await timer()).endsAt,active.endsAt);
  await page.keyboard.press('Escape');await page.locator('#panel').waitFor({state:'hidden'});
  assert.equal(await page.getByRole('button',{name:'Leave a resume note',exact:true}).evaluate(n=>n===document.activeElement),true);
  const protectedRestore=await page.evaluate(async()=>{
    const m=await import('../core/work-context.js'),c=await m.captureCapsule('Protected context','Next action',false,[]);
    try{await m.restoreCapsule(c.id);return false;}catch(error){return /current session/.test(error.message);}
  });
  assert.equal(protectedRestore,true);assert.equal((await timer()).endsAt,active.endsAt);
  await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).waitFor();
  const paused=await timer();
  await page.evaluate(async()=>{(await import('../core/dashboard-view.js')).setView('ambient');});
  await page.locator('.ambient-interface:not([hidden])').waitFor();
  assert.equal((await timer()).remaining,paused.remaining);
  await page.locator('#ambient-session').click();assert.equal((await timer()).sessionId,active.sessionId);
  await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();
  await page.getByRole('button',{name:'End session',exact:true}).click();await page.getByRole('button',{name:'Start focus',exact:true}).waitFor();
  await page.evaluate(async()=>{
    const {timerCommand}=await import('../core/timer-client.js'),{update}=await import('../core/storage.js');
    await timerCommand('start',{taskTitle:'Completion acceptance',focusMinutes:1});
    // Advance the test fixture's deadline, then let the actual owner record completion.
    await update(d=>{d.timer.startedAt=Date.now()-60001;d.timer.endsAt=Date.now()-1;});
    await timerCommand('tick');
  });
  await page.getByRole('heading',{name:'Break',exact:true}).waitFor();
  const completed=await page.evaluate(async()=>(await import('../core/db.js')).getAll('sessions'));
  assert.equal(completed.filter(s=>s.taskTitle==='Completion acceptance'&&s.completed).length,1);
  await page.evaluate(async()=>{const v=await import('../core/dashboard-view.js');v.setView('ambient');v.setView('focus');});
  assert.equal((await timer()).phase,'short');
  pass('Completed session is recorded once and remains in its break phase across Ambient/Focus changes');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.screenshot({path:`docs/screenshots/design-3-4-${browser}-focus-completed.png`,animations:'disabled'});
  pass('Focus exposes context capture and accessible progress; capsule restore and view changes preserve active/paused sessions');
  await context.setOffline(true);await page.reload();await page.locator('html[data-ready=true]').waitFor();await open('day');
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  pass('Offline reload, reduced motion, CSP and no-external-request checks pass');
} catch(error) {
  checks.push('FAIL: '+error.message);console.error(error);process.exitCode=1;
  await page?.screenshot({path:`docs/screenshots/design-3-4-${browser}-failure.png`}).catch(()=>{});
} finally {
  await fs.mkdir('docs/qa-results',{recursive:true});
  await fs.writeFile(`docs/qa-results/design-stage-3-4-${browser}.json`,JSON.stringify({checks,errors,requests},null,2));
  await context?.close();
}
