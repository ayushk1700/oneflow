// Stage 1/2 acceptance: real unpacked extension, disposable browser data only.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`);
const browser = process.argv[2] || 'chrome';
assert(['chrome','edge'].includes(browser));
const checks = [], errors = [], requests = [];
let context, page;
const pass = text => { checks.push(text); console.log('PASS: ' + text); };
const screenshot = async label => page.screenshot({ path: `docs/screenshots/design-1-2-${browser}-${label}.png`, animations: 'disabled' });
const more = async () => { if (await page.locator('#home-menu').getAttribute('open') === null) await page.locator('#home-menu > summary').click(); };
const close = async () => { await page.keyboard.press('Escape'); await page.locator('#panel').waitFor({ state:'hidden' }); };
async function changeSettings(values) {
  await page.evaluate(async values => { await (await import('../core/storage.js')).update(data => Object.assign(data.settings, values)); }, values);
}
try {
  context = await chromium.launchPersistentContext(path.resolve('.test-profile', `foundation-${browser}-${Date.now()}`), {
    executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless:true, viewport:{width:1440,height:900}, timezoneId:'Asia/Kolkata',
    args:['--enable-unsafe-extension-debugging'], ignoreDefaultArgs:['--disable-extensions']
  });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await fs.mkdir('docs/screenshots', { recursive:true });
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path:process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button', { name:'Skip for now', exact:true }).click();
  await page.locator('#landscape[data-load=ready]').waitFor();
  const tokens = await page.evaluate(() => {
    const s=getComputedStyle(document.documentElement), value=name=>s.getPropertyValue(name).trim();
    return { font:value('--font'), weights:['regular','medium','heading'].map(name=>value('--weight-'+name)), radius:value('--radius-panel'), notes:value('--notes-paper'), settings:value('--settings-paper'), homeShade:value('--home-shade') };
  });
  assert(tokens.font.includes('system-ui') && tokens.font.includes('SF Pro Text'));
  assert.deepEqual(tokens.weights, ['400','500','600']);
  assert.equal(tokens.radius, '20px'); assert.equal(tokens.homeShade, '0.6');
  assert.equal(await page.locator('.clock-time').evaluate(n=>getComputedStyle(n).fontWeight),'400');
  pass('Shared font stack, supported weights, panel radius and original default shading resolve correctly');
  for (const theme of ['dark','light']) {
    await changeSettings({theme});
    await page.locator(`html[data-theme=${theme}]`).waitFor();
    for (const [width,height] of [[1440,900],[390,844],[320,700]]) {
      await page.setViewportSize({width,height});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert(!await page.locator('#settings-button').isVisible());
      assert(!await page.locator('.brand').isVisible());
      const groups = ['.greeting','.clock-time','.date-label','#focus','#search','#quotes blockquote','#journal-button','#dock','#home-menu > summary'];
      for (const selector of groups) assert(await page.locator(selector).isVisible(), selector);
      const visibleGroups = await page.locator('.greeting,.clock-time,.date-label,#focus,#search,#quotes,#timer,#journal-button,#focus-exit,#dock,#home-menu > summary,#settings-button,.brand,#weather,#links,#countdowns').evaluateAll(nodes=>nodes.filter(node=>node.checkVisibility({visibilityProperty:true})).length);
      assert.equal(visibleGroups,9);
      for (const selector of ['#journal-button','#dock button','#home-menu > summary','.session-duration select','.focus-start']) {
        const targets = await page.locator(selector).evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).map(n=>n.getBoundingClientRect().height));
        assert(targets.every(height=>height>=44), 'Small target: '+selector);
      }
      const dock = await page.locator('#dock').boundingBox(), trigger=await page.locator('#home-menu > summary').boundingBox();
      assert(dock.x + dock.width <= trigger.x, 'Corner controls overlap');
      await screenshot(`home-${theme}-${width}`);
      await more();
      assert(await page.locator('#settings-button').isVisible());
      const menu = await page.locator('.home-menu-body').boundingBox();
      assert(menu.x>=0 && menu.x+menu.width<=width && menu.y>=0);
      await page.keyboard.press('Escape');
      assert(await page.locator('#home-menu > summary').evaluate(n=>n===document.activeElement));
    }
  }
  pass('Nine core Home groups, quiet menu-only Settings/brand, 44px targets and fitting corners at 1440/390/320px in both themes');
  await page.setViewportSize({width:1440,height:900});
  for (const theme of ['dark','light']) {
    await changeSettings({theme}); await more(); await page.locator('#settings-button').click();
    await page.locator('#panel[data-panel=settings][open]').waitFor();
    assert.equal(await page.locator('#panel').evaluate(n=>getComputedStyle(n).borderRadius),'0px');
    const background = await page.locator('#panel').evaluate(n=>getComputedStyle(n).backgroundColor);
    assert.notEqual(background,'rgba(0, 0, 0, 0)');
    await screenshot(`settings-${theme}`); await close();
    assert(await page.locator('#home-menu > summary').evaluate(n=>n===document.activeElement));
    await page.locator('#journal-button').click(); await page.locator('.journal-writing').waitFor();
    await screenshot(`journal-${theme}`); await close();
    await page.getByRole('button',{name:'Sounds',exact:true}).click();
    await page.locator('#panel[data-panel=sounds][open]').waitFor();
    assert.equal(await page.locator('#panel').evaluate(n=>getComputedStyle(n).borderRadius),'20px');
    await screenshot(`sounds-${theme}`); await close();
  }
  pass('Workspace Settings, Paper Journal and Calm Sounds retain their dedicated surfaces; Settings restores focus to More');
  await page.getByRole('button',{name:'Notes',exact:true}).click();
  const notes=page.frameLocator('.notes-workspace-frame');
  await notes.locator('.workspace').waitFor();
  for (const theme of ['light','dark']) {
    await notes.locator('html').evaluate((n,theme)=>n.dataset.notesTheme=theme,theme);
    const alias=await notes.locator('html').evaluate(n=>{const s=getComputedStyle(n);return [s.getPropertyValue('--notes-paper').trim(),s.getPropertyValue('--paper-surface').trim()];});
    assert.equal(alias[0],alias[1]);
    for (const width of [1440,320]) {
      await page.setViewportSize({width,height:844});
      assert(await notes.locator('html').evaluate(n=>n.scrollWidth<=innerWidth));
      await screenshot(`notes-${theme}-${width}`);
    }
  }
  await notes.getByRole('button',{name:'Close notes',exact:true}).click();
  pass('Notes light/dark base aliases resolve and the iframe workspace fits desktop and narrow mobile');
  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(async()=>{await(await import('../core/storage.js')).update(d=>{d.tasks.push({id:'foundation-task',text:'A selected task',listId:'inbox',completed:false});});});
  await page.getByLabel('Your main focus today').fill('Keep my custom draft');
  await page.getByLabel('Focus duration',{exact:true}).selectOption('custom');
  await page.getByLabel('Focus duration in minutes').fill('37');
  await page.getByLabel('Choose a task',{exact:true}).selectOption('foundation-task');
  await page.getByLabel('Choose a task',{exact:true}).selectOption('');
  assert.equal(await page.getByLabel('Your main focus today').inputValue(),'Keep my custom draft');
  assert.equal(await page.getByLabel('Focus duration in minutes').inputValue(),'37');
  for (const minutes of ['25','50']) { await page.getByLabel('Focus duration',{exact:true}).selectOption(minutes); assert(!await page.getByLabel('Focus duration in minutes').isVisible()); }
  await page.getByRole('button',{name:'Start focus',exact:true}).click();
  await page.getByRole('button',{name:'Pause',exact:true}).waitFor();
  const before=await page.evaluate(async()=>(await import('../core/storage.js')).get().timer);
  assert.equal(before.duration,50*60000);
  await page.locator('#focus-exit').click(); await more(); await page.getByRole('button',{name:'Ambient view',exact:true}).click();
  await more(); assert(await page.locator('#settings-button').isVisible()); await page.locator('#settings-button').click(); await close();
  await page.locator('#ambient-session').click();
  const after=await page.evaluate(async()=>(await import('../core/storage.js')).get().timer);
  assert.equal(after.sessionId,before.sessionId); assert.equal(after.endsAt,before.endsAt);
  pass('Task/custom draft and duration controls work; Ambient Settings and returning to focus preserve timer identity/deadline');
  await page.getByRole('button',{name:'End session',exact:true}).click(); await page.locator('#focus-exit').click();
  await page.evaluate(async()=>{await(await import('../core/storage.js')).update(d=>{d.lastFocusSession=null;d.settings.widgets.sounds=false;d.settings.widgets.journal=false;});});
  await page.getByRole('button',{name:'Sounds',exact:true}).waitFor({state:'hidden'}); assert(!await page.locator('#journal-button').isVisible());
  await page.evaluate(async()=>{await(await import('../core/storage.js')).update(d=>{d.settings.widgets.sounds=true;d.settings.widgets.journal=true;d.settings.accent='#785bb3';d.settings.theme='auto';d.settings.studio.enabled=true;d.settings.studio.type.clock.size=116;d.settings.studio.type.clock.weight=500;d.settings.studio.layouts.desktop.weather={x:75,y:10,w:20,scale:1,locked:false,hidden:false};});});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.clock-time')).fontSize==='116px');
  assert(await page.locator('#weather[data-studio-floating=true]').isVisible());
  await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.locator('html[data-theme=light][data-motion=reduce]').waitFor();
  assert.equal(await page.locator('#home-menu > summary').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
  await context.setOffline(true); await page.reload();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.clock-time')).fontSize==='116px');
  assert.equal(await page.locator('html').evaluate(n=>n.style.getPropertyValue('--accent')),'#785bb3');
  await page.evaluate(async()=>{await(await import('../core/storage.js')).update(d=>{d.settings.studio.enabled=false;});});
  await page.waitForFunction(()=>!document.querySelector('#weather').dataset.studioFloating);
  assert(!await page.locator('#weather').isVisible());
  assert.deepEqual(errors,[]); assert.deepEqual(requests,[]);
  pass('Disabled tools leave no shortcut; saved Studio typography/placement and custom accent survive offline reload; disabling Studio restores disclosure; auto theme and reduced motion work');
} catch(error) {
  checks.push('FAIL: '+error.message); console.error(error.message); process.exitCode=1;
  if(page) await screenshot('failure').catch(()=>{});
} finally {
  await fs.mkdir('docs/qa-results',{recursive:true});
  await fs.writeFile(`docs/qa-results/design-foundation-${browser}.json`,JSON.stringify({checks,errors,requests},null,2)+'\n');
  await context?.close();
}
