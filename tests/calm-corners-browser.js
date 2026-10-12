import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.ONEFLOW_NODE_MODULES+'/playwright');
const context=await chromium.launchPersistentContext(path.resolve('.test-profile','calm-corners-'+Date.now()),{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:1440,height:900},args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',error=>errors.push(error.message));
const pass=text=>{checks.push(text);console.log('PASS: '+text);};
const shot=name=>page.screenshot({path:`docs/screenshots/calm-corners-${name}.png`,animations:'disabled'});
try {
  const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
  await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await page.locator('#landscape[data-load=ready]').waitFor();
  assert(!(await page.locator('.readability').evaluate(n=>getComputedStyle(n).backgroundImage)).includes('radial-gradient'));
  for(const [width,height] of [[1440,900],[390,844],[320,700]]) {
    await page.setViewportSize({width,height});
    const dock=await page.locator('#dock').boundingBox(),more=await page.locator('#home-menu > summary').boundingBox(),journal=await page.locator('#journal-button').boundingBox();
    assert(dock.x<=24 && dock.y>height-100); assert(more.x>=dock.x+dock.width); assert(journal.x>width/2 && journal.y<50);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); await shot('home-'+width);
  }
  pass('Separate bottom-left controls and top-right Journal fit desktop/mobile; central radial shade removed');
  await page.setViewportSize({width:1440,height:900});await page.locator('#dock [data-tool=workspace]').click();
  const frame=page.frameLocator('.notes-workspace-frame');
  const add=async label=>{await frame.getByLabel('Create new',{exact:true}).click();await frame.locator('.create-options').getByRole('button',{name:label,exact:true}).click();};
  const saved=()=>frame.getByRole('status').filter({hasText:'Saved on this device'}).waitFor();
  await add('Note');await frame.getByLabel('Note title',{exact:true}).fill('A calm idea');await frame.getByLabel('Note text',{exact:true}).fill('A little space for thoughts.');await saved();
  await frame.getByRole('button',{name:'← All notes',exact:true}).click();assert(await frame.getByRole('button',{name:'Open A calm idea'}).isVisible());
  await add('Checklist');await frame.getByLabel('Note title',{exact:true}).fill('Today');await frame.getByLabel('Item 1',{exact:true}).fill('Read a chapter');await frame.getByLabel('Complete item 1',{exact:true}).check();await saved();
  await frame.getByRole('button',{name:'← All notes',exact:true}).click();
  await add('Task');await frame.getByLabel('Task text',{exact:true}).fill('Take a walk');await saved();await frame.getByRole('button',{name:'← All notes',exact:true}).click();
  await add('Habit');await frame.getByLabel('Habit name',{exact:true}).fill('Read daily');await saved();await frame.getByRole('button',{name:'← All notes',exact:true}).click();
  await shot('notes');
  await frame.getByLabel('Create new',{exact:true}).click();await frame.locator('.create-options').getByRole('button',{name:'Note',exact:true}).focus();await page.keyboard.press('Escape');assert.equal(await frame.locator('.create-menu').getAttribute('open'),null);
  for(const width of [390,320]){await page.setViewportSize({width,height:844});assert(await frame.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot('notes-'+width);}
  await frame.getByRole('button',{name:'Close notes',exact:true}).click();await context.setOffline(true);await page.reload();await page.locator('#dock [data-tool=workspace]').click();assert(await frame.getByRole('button',{name:'Open A calm idea'}).isVisible());
  pass('Plus menu creates and saves notes/checklists/tasks/habits; cards and Escape work, mobile fits, offline reload retains entries');
  await frame.getByRole('button',{name:'Close notes',exact:true}).click();await page.locator('#dock [data-tool=sounds]').click();await page.locator('#panel[data-panel=sounds]').waitFor();await page.keyboard.press('Escape');
  await page.locator('#journal-button').click();await page.locator('.journal-writing').waitFor();assert.equal(await page.locator('#panel').evaluate(n=>getComputedStyle(n).borderRadius),'0px');
  assert.deepEqual(errors,[]);pass('Sounds and full-page Journal remain available without page errors');
}catch(error){checks.push('FAIL: '+error.message);console.error(error);process.exitCode=1;await shot('failure').catch(()=>{});}
finally{await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/calm-corners.json',JSON.stringify({checks,errors},null,2));await context.close();}
