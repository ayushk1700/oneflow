import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome', checks = [], errors = [], requests = [];
const context = await chromium.launchPersistentContext(path.resolve('.test-profile',`journal-page-${browser}-${Date.now()}`),{
  executablePath:browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true,acceptDownloads:true,downloadsPath:path.resolve('test-results','journal-downloads'),viewport:{width:1440,height:900},timezoneId:'Asia/Kolkata',
  args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']
});
const page = await context.newPage();
page.on('pageerror',e => errors.push(e.message));
page.on('request',r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
const pass = label => { checks.push(label); console.log('PASS: ' + label); };
const journal = async () => { await page.locator('#journal-button').click(); await page.locator('.journal-date-heading').filter({hasText:/\d/}).waitFor(); };
const editor = page.getByLabel('Your reflection',{exact:true});
const menu = label => page.locator('.journal-menu').getByRole('button',{name:label,exact:true}).click();
const shot = name => page.screenshot({path:`docs/screenshots/journal-page-${browser}-${name}.png`,animations:'disabled'});
async function fullscreen() {
  assert.deepEqual(await page.locator('#panel').boundingBox(),{x:0,y:0,...page.viewportSize()});
  assert.equal(await page.locator('#panel-nav').isVisible(),false);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert(await editor.isVisible());
  assert.equal(await page.locator('.journal-page > *').count(),2);
  assert.equal(await page.locator('.journal-topbar,.journal-editor-footer,.journal-templates').count(),0);
  assert.equal(await page.getByRole('button',{name:/Print all|Print current|Insert template/}).count(),0);
}
async function saved(text) {
  await page.waitForFunction(async text => (await (await import('../core/db.js')).getAll('journal')).some(e => e.text===text),text);
}
try {
  await fs.mkdir('docs/screenshots',{recursive:true});
  const cdp = await context.browser().newBrowserCDPSession();
  const {id} = await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  const launch = await page.locator('#journal-button').boundingBox();
  assert(launch.x > 1200 && launch.y < 60);
  assert.equal(await page.locator('#dock [data-tool=journal]').count(),0);
  await shot('home');
  await journal(); await fullscreen(); await shot('light');
  await page.keyboard.press('Tab'); assert(await editor.evaluate(n => n===document.activeElement));
  await page.getByRole('button',{name:'Back to home'}).focus(); await page.keyboard.press('Shift+Tab');
  assert(await editor.evaluate(n => n===document.activeElement));
  const text='A quiet moment worth keeping. <script>literal text</script>';
  await editor.fill(text); await page.getByRole('button',{name:'Back to home'}).click();
  await journal(); assert.equal(await editor.inputValue(),text); await saved(text);
  assert.equal(await page.locator('#panel script').count(),0);
  pass('Full viewport, minimal writing page, keyboard trap and drafts survive immediate close');
  await menu('Settings');
  assert.equal(await page.locator('#panel').getAttribute('data-panel'),'journal');
  await page.getByLabel('Journal appearance',{exact:true}).selectOption('dark');
  await page.waitForFunction(() => document.querySelector('.journal-workspace').dataset.journalTheme==='dark');
  await shot('settings-dark');
  await page.getByLabel('Journal typeface',{exact:true}).selectOption('serif');
  await page.getByLabel('Text size',{exact:true}).fill('22'); await page.getByLabel('Text size',{exact:true}).press('Tab');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.journal-writing')).fontSize==='22px');
  await page.getByLabel('Autosave journal entries',{exact:true}).uncheck();
  await editor.fill('Manually saved reflection.'); await page.getByRole('button',{name:'Save reflection',exact:true}).click(); await saved('Manually saved reflection.');
  const downloading=page.waitForEvent('download'); await page.getByRole('button',{name:'Export journal',exact:true}).click();
  const download=await downloading;
  assert.equal(JSON.parse(await fs.readFile(await download.path(),'utf8')).entries[0].text,'Manually saved reflection.');
  await page.getByLabel('Autosave journal entries',{exact:true}).check();
  await page.getByLabel('Journal appearance',{exact:true}).selectOption('auto');
  await page.waitForFunction(() => document.querySelector('.journal-workspace').dataset.journalTheme===document.documentElement.dataset.theme);
  await page.getByLabel('Journal appearance',{exact:true}).selectOption('dark');
  await page.getByRole('button',{name:'Back to pages'}).click(); await shot('dark');
  await menu('Search'); await page.getByLabel('Search reflections').fill('Manually'); assert.equal(await page.locator('.journal-result').count(),1);
  await page.locator('.journal-result').click(); assert.equal(await editor.inputValue(),'Manually saved reflection.');
  await menu('Search');
  await page.getByRole('button',{name:'Previous month',exact:true}).click();
  await page.locator('.journal-calendar-days button:not(:disabled):not(.other-month)').first().click();
  await editor.fill('An earlier page.'); await saved('An earlier page.');
  await page.keyboard.press('Escape'); await journal(); assert.equal(await editor.inputValue(),'Manually saved reflection.');
  pass('Own settings panel, dark/auto themes, typography, manual save, export, search and calendar');
  await menu('Settings'); await page.getByLabel('Journal appearance',{exact:true}).selectOption('light'); await page.getByRole('button',{name:'Back to pages'}).click();
  await page.evaluate(async () => { const {update}=await import('../core/storage.js'); await update(d => { d.settings.studio.enabled=true; }); });
  await fullscreen(); assert.equal(await page.getByRole('button',{name:'Insert template'}).count(),0);
  for (const [width,height] of [[1280,800],[700,700],[390,844],[320,700]]) {
    await page.keyboard.press('Escape'); await page.setViewportSize({width,height}); await journal(); await fullscreen();
    if (width<=700) {
      assert.equal(await page.locator('.journal-sidebar').isVisible(),false);
      await page.getByRole('button',{name:'Show journal sidebar'}).click();
      await menu('Settings'); assert(await page.getByLabel('Journal appearance',{exact:true}).isVisible());
      await shot(`settings-${width}`);
      await page.getByRole('button',{name:'Back to pages'}).click();
      await page.getByRole('button',{name:'Hide journal sidebar'}).click();
    }
    await shot(String(width));
  }
  await page.emulateMedia({reducedMotion:'reduce'}); await context.setOffline(true);
  await page.keyboard.press('Escape'); await page.reload(); await journal(); await fullscreen();
  assert.equal(await editor.inputValue(),'Manually saved reflection.');
  assert.deepEqual(errors,[]); assert.deepEqual(requests,[]);
  pass('1280/700/390/320px layouts, mobile settings, Studio without templates, reduced motion and offline persistence');
} catch(error) { console.error(error); checks.push('FAIL: '+error.message); process.exitCode=1; await shot('failure').catch(()=>{}); }
finally { await fs.mkdir('test-results',{recursive:true}); await fs.writeFile(`test-results/journal-page-${browser}.json`,JSON.stringify({browser,checks,errors,requests},null,2)); await context.close(); }

