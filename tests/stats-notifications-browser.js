import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`);
const browser = process.argv[2] || 'chrome', checks = [], errors = [];
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `stats-notices-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, acceptDownloads: true, viewport: { width: 1440, height: 900 }, args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
const pass = label => { checks.push(label); console.log('PASS: '+label); };
const feature = async name => {
  await page.evaluate(async name => name === 'tasks' ? (await import('../core/lazy-widgets.js')).tasks.open() : (await import('../core/features.js')).openFeature(name), name);
  await page.locator(`#panel[data-panel=${['tasks','habits'].includes(name) ? 'notes' : name}]`).waitFor();
};
const settings = async () => { await page.evaluate(async () => (await import('../core/events.js')).emit('settings:open','appearance')); await page.locator('.settings-content').waitFor(); };
const shot = async label => {
  await page.locator('#panel-body').evaluate(node => {node.scrollTop=0;});
  return page.screenshot({path:`test-results/stage56-${browser}-${label}.png`,animations:'disabled'});
};
const toast = async (message,kind='info') => {
  await page.evaluate(async value => (await import('../core/events.js')).emit('toast',value), {message,kind});
  await page.waitForFunction(message => document.querySelector('#toast-message').textContent === message && !document.querySelector('#toast').hidden, message);
};
try {
  await fs.mkdir('test-results',{recursive:true});
  const cdp = await context.browser().newBrowserCDPSession();
  await cdp.send('Browser.setDownloadBehavior', {behavior:'allow',downloadPath:path.resolve('test-results'),eventsEnabled:true});
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.locator('html[data-ready=true]').waitFor();
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await page.locator('#home-menu > summary').click();
  await page.getByRole('button', { name:'Open all tools',exact:true }).click();
  await page.getByRole('button', { name:'Stats',exact:true }).click();
  await page.locator('.stats-hero').waitFor();
  assert.equal(await page.locator('.stats-hero-total strong').textContent(),'0 min');
  assert.equal(await page.locator('.stats-insight').count(),4);
  pass('First-run Stats has truthful zero and unavailable states');
  await page.evaluate(async () => {
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function(stores,...args) { if(stores === 'sessions') throw new Error('Simulated unavailable history'); return original.call(this,stores,...args); };
    try { await (await import('../components/stats/index.js')).render(); }
    finally { IDBDatabase.prototype.transaction = original; }
  });
  await page.getByText('Focus history could not be loaded.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Retry',exact:true}).click();
  await page.locator('.stats-hero').waitFor();
  pass('Unavailable history exposes a working Retry action');
  await page.evaluate(async () => {
    const { put } = await import('../core/db.js');
    const now = new Date(); now.setHours(9,0,0,0);
    for (const [id,minutes,days,completed] of [['a',25,0,true],['b',10,0,false],['c',20,1,true]]) {
      const date = new Date(now); date.setDate(date.getDate()-days);
      await put('sessions',{id,start:+date,end:+date+minutes*60000,duration:minutes*60000,completed,taskId:null});
    }
    await (await import('../components/stats/index.js')).render();
  });
  await page.waitForFunction(() => document.querySelector('.stats-hero-total strong')?.textContent === '55 min');
  await page.getByLabel('Statistics period', {exact:true}).selectOption('day');
  await page.waitForFunction(() => document.querySelector('.stats-hero-total strong')?.textContent === '35 min');
  await page.getByLabel('Statistics period', {exact:true}).selectOption('month');
  await page.waitForFunction(() => document.querySelectorAll('.stats-table tbody tr').length === 30);
  await page.getByLabel('Statistics period', {exact:true}).selectOption('week');
  await page.waitForFunction(() => document.querySelectorAll('.stats-table tbody tr').length === 7);
  const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export CSV',exact:true}).click()]);
  await download.path(); // Wait for completion; CDP saves in our explicit local output folder.
  const csv = await fs.readFile(path.join('test-results',download.suggestedFilename()),'utf8');
  assert(csv.includes('"35.0"') && csv.includes('"20.0"'));
  await page.locator('#toast-close').click();
  await shot('stats-desktop');
  pass('Day/week/month, partial-session totals, accessible data table and CSV agree');
  for (const width of [1440,390,320]) {
    await page.setViewportSize({width,height:900});
    let signature;
    for (const name of ['tasks','sounds','notes','stats','settings','notifications']) {
      if(name === 'settings') await settings(); else await feature(name);
      const geometry = await page.locator('#panel').evaluate(panel => {
        const style = getComputedStyle(panel),body = panel.querySelector('#panel-body');
        return {radius:style.borderRadius,padding:style.padding,font:style.fontFamily,background:style.backgroundColor,overflow:body.scrollWidth > body.clientWidth+2};
      });
      assert(!geometry.overflow, `${name} overflows at ${width}`);
      if (name === 'tasks' || name === 'notes') {
        const frame = page.frameLocator('.notes-workspace-frame');
        await frame.getByLabel('Search notes').waitFor();
        assert(!await page.locator('#panel .panel-header').isVisible());
        assert(!await page.locator('#panel-nav').isVisible());
        assert(await frame.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await frame.getByLabel('Search notes').focus(); await page.keyboard.press('Tab');
        assert(await frame.locator('body').evaluate(() => document.activeElement !== document.body));
        if (width === 320) await shot(`${name}-${width}`);
        continue;
      }
      if(name === 'settings') { assert.equal(geometry.radius,'0px');assert.equal(geometry.padding,'0px');await page.getByRole('heading',{name:'Appearance',exact:true}).waitFor();continue; }
      delete geometry.overflow;
      if(!signature) signature=geometry; else assert.deepEqual(geometry,signature,`Shared shell: ${name}`);
      await page.locator('#panel-title').focus(); await page.keyboard.press('Shift+Tab');
      assert(await page.evaluate(() => !!document.activeElement.closest('#panel')),`Focus escaped ${name}`);
      if(width === 320 || name === 'journal' || name === 'sounds') await shot(`${name}-${width}`);
    }
  }
  pass('Standard panels share a shell; combined Notes uses one dedicated surface; all retain keyboard focus and fit 1440/390/320px');
  await page.setViewportSize({width:1440,height:900});
  await toast('A saved focus note is ready.');
  assert.equal(await page.locator('#panel > #toast').count(),1);
  await page.locator('#toast-close').focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#toast').isVisible(),false);
  await toast('Please try saving again.','error');
  assert.equal(await page.locator('#toast-message').getAttribute('role'),'alert');
  await page.evaluate(async () => (await import('../core/events.js')).emit('toast','Queued confirmation'));
  await shot('notifications-toast');
  await page.locator('#toast-close').click();
  await page.waitForFunction(() => document.querySelector('#toast-message').textContent === 'Queued confirmation');
  await page.locator('#toast-close').click();
  await page.reload(); await page.locator('html[data-ready=true]').waitFor();
  await feature('notifications');
  await page.getByText('A saved focus note is ready.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Mark all as read',exact:true}).click();
  await page.waitForFunction(() => !document.querySelector('.notification-item.is-unread'));
  await page.getByRole('button',{name:'Clear notifications',exact:true}).click();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  assert(await page.locator('.notification-item').count() >= 2);
  pass('Modal toast is keyboard dismissible; history survives reload; read state and cancel work');
  await page.evaluate(async () => {
    const manager = await import('../core/notifications.js');
    for(let n=0;n<45;n++) await manager.record('Notice '+n,'info','bounded-'+n);
    await manager.record('Do not duplicate','info','bounded-44');
    if(manager.list().length !== 40) throw new Error('Inbox must be bounded at 40');
  });
  await page.getByRole('button',{name:'Clear notifications',exact:true}).click();
  await page.locator('.confirm-box .danger').click();
  await page.locator('.notification-empty').waitFor();
  await page.evaluate(async () => (await import('../core/storage.js')).update(d => {d.settings.theme='light';}));
  await feature('stats'); await page.locator('.stats-hero').waitFor(); await shot('stats-light');
  await settings(); await shot('settings-light');
  await page.emulateMedia({reducedMotion:'reduce'});
  await toast('Reduced motion notice');
  assert.equal(await page.locator('#toast').evaluate(node => getComputedStyle(node).animationName),'none');
  pass('Inbox deduplication, 40-item retention, confirmed clearing, light theme and reduced motion');
  assert.deepEqual(errors,[]);
  await fs.writeFile(`test-results/stage56-${browser}-report.json`,JSON.stringify({browser,checks,errors},null,2));
} catch(error) { await shot('failure'); throw error; }
finally { await context.close(); }
