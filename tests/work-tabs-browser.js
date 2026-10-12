import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`),browser=process.argv[2]||'chrome';
// Headless Chrome cannot answer its native optional-permission prompt. This
// isolated fixture grants tabs at install to exercise the real granted APIs.
const root=path.resolve('.test-profile',`work-tabs-${browser}-${Date.now()}`),fixture=path.join(root,'extension');
await fs.mkdir(fixture,{recursive:true});
for(const dir of ['newtab','core','components','background','data','assets','vendor','wallpaper','livewallpaper','blocked'])await fs.symlink(path.resolve(dir),path.join(fixture,dir),'junction');
const manifest=JSON.parse(await fs.readFile('manifest.json','utf8'));manifest.permissions.push('tabs');manifest.optional_permissions=manifest.optional_permissions.filter(p=>p!=='tabs');await fs.writeFile(path.join(fixture,'manifest.json'),JSON.stringify(manifest));
const context=await chromium.launchPersistentContext(path.join(root,'profile'),{executablePath:browser==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
const checks=[],errors=[];try{
  const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:fixture});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://oneflow-capsule.test/**',r=>r.fulfill({body:'<title>Test research</title><p>Local fixture</p>',contentType:'text/html'}));
  await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  const resource=await context.newPage();await resource.goto('https://oneflow-capsule.test/research');await page.bringToFront();
  await page.evaluate(async()=>(await import('../core/features.js')).openFeature('capsules'));await page.getByLabel('Capsule name',{exact:true}).fill('Research tabs');await page.getByLabel('Include current-window tabs (optional browser access)',{exact:true}).check();await page.getByRole('button',{name:'Save current work',exact:true}).click();await page.getByRole('heading',{name:'Research tabs',exact:true}).waitFor();
  const saved=await page.evaluate(async()=>(await(await import('../core/storage.js')).readWork()).capsules[0]);assert.deepEqual(saved.tabs,[{title:'Test research',url:'https://oneflow-capsule.test/research'}]);await resource.close();
  const first=await page.evaluate(async tabs=>(await import('../core/work-context.js')).reopenTabs(tabs),saved.tabs);assert.equal(first.opened,1);assert.equal(first.failed,0);
  const again=await page.evaluate(async tabs=>(await import('../core/work-context.js')).reopenTabs(tabs),saved.tabs);assert.equal(again.opened,0);
  const unsafe=await page.evaluate(async()=>(await import('../core/work-context.js')).reopenTabs([{url:'javascript:alert(1)',title:'bad'}]));assert.equal(unsafe.opened,0);assert.deepEqual(errors,[]);
  checks.push('PASS: Real granted Chrome tab APIs capture current web URLs, reopen missing resources once and reject unsafe links. Native grant dialog is outside this fixture.');console.log(checks[0]);
}catch(error){checks.push('FAIL: '+error.message);console.error(error);process.exitCode=1;}finally{await fs.mkdir('docs/qa-results',{recursive:true});await fs.writeFile(`docs/qa-results/work-tabs-${browser}.json`,JSON.stringify({checks,errors,permissionFixture:true},null,2));await context.close();}
