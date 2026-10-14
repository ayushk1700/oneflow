// Optional QA dependencies are isolated in .qa-tools; they are never shipped.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {snapshot,generateReport} from '../.qa-tools/node_modules/lighthouse/core/index.js';
import puppeteer from '../.qa-tools/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.ONEFLOW_NODE_MODULES+'/playwright');
const context=await chromium.launchPersistentContext(path.resolve('.test-profile/lighthouse-customization-'+Date.now()),{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:1440,height:1000},args:['--enable-unsafe-extension-debugging','--remote-debugging-port=9225'],ignoreDefaultArgs:['--disable-extensions']});
let browser;
try{
const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:path.resolve('.qa-tools/stage2-extension')});
const tab=await context.newPage(),url=`chrome-extension://${id}/newtab/index.html`;await tab.goto(url);await tab.locator('html[data-ready=true]').waitFor();
const skip=tab.getByRole('button',{name:'Skip for now',exact:true});if(await skip.count())await skip.click();await tab.locator('#panel').waitFor({state:'hidden'});
browser=await puppeteer.connect({browserURL:'http://127.0.0.1:9225'});const page=(await browser.pages()).find(p=>p.url()===url);
const results=[];
for(const name of ['home','drawer','layout','layout-light']){
 if(name==='drawer'){await tab.locator('#home-menu > summary').focus();await tab.keyboard.press('s');await tab.getByRole('dialog',{name:'Personalize ONEFLOW'}).waitFor();}
 if(name==='layout'){await tab.evaluate(async()=>{await(await import('../core/customization.js')).flush();document.querySelector('.customization-drawer')?.close();const m=await import('../core/personal-layout.js');m.applyPreset(m.startingLayout('Dashboard'));});}
 if(name==='layout-light')await tab.evaluate(async()=>{const s=await import('../core/customization.js');s.set('theme.mode','light');await s.flush();});
 const result=await snapshot(page,{flags:{onlyCategories:['accessibility'],logLevel:'error'},config:{extends:'lighthouse:default',settings:{onlyCategories:['accessibility']}}});
 const failures=Object.values(result.lhr.audits).filter(a=>a.score===0).map(a=>({id:a.id,title:a.title,details:a.details}));
 results.push({name,score:result.lhr.categories.accessibility.score*100,failures});
 await fs.writeFile(`docs/qa-results/personalization-lighthouse-${name}.html`,generateReport(result.lhr));console.log(JSON.stringify(results.at(-1),null,2));
}
await fs.writeFile('docs/qa-results/personalization-lighthouse.json',JSON.stringify(results,null,2));
if(results.some(r=>r.score<90))process.exitCode=1;
}finally{browser?.disconnect();await context.close();}
