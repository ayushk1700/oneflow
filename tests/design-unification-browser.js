// Visual inventory uses disposable extension storage; never a user's browser profile.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`);
const browser=process.argv.includes('edge')?'edge':'chrome',phase=process.argv.includes('--before')?'before':'after';
const report={browser,phase,panels:[],errors:[]};let context;
try{
  context=await chromium.launchPersistentContext(path.resolve('.test-profile',`unification-${browser}-${Date.now()}`),{executablePath:browser==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:1440,height:900},args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
  const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:process.cwd()}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button',{name:'Skip for now',exact:true}).click();
  await page.locator('#landscape[data-load=ready]').waitFor();await page.emulateMedia({reducedMotion:'reduce'});await context.setOffline(true);
  const allNames=await page.evaluate(async()=>['home','tools',...(await import('../core/tool-catalog.js')).tools.map(t=>t[0]),'settings','blocker','links','weather']);
  const names=process.argv.includes('--links')?['links']:process.argv.includes('--missing')?['countdowns','customizer','layout','settings','links','weather']:allNames;
  const directory=`docs/screenshots/unification-${phase}-${browser}`;await fs.mkdir(directory,{recursive:true});
  for(const theme of ['dark','light'])for(const name of names){
    try{
      if(await page.locator('.designer').isVisible())await page.locator('.designer').getByRole('button',{name:'Cancel',exact:true}).click();
      await page.evaluate(async({name,theme})=>{const ui=await import('../core/ui.js');if(document.querySelector('#panel').open)ui.closePanel();await(await import('../core/storage.js')).update(d=>{d.settings.theme=theme;});const m=await import('../core/features.js');if(name==='settings'){(await import('../core/events.js')).emit('settings:open','appearance');return;}if(['countdowns','links','weather'].includes(name)){const widget=await import(`../components/${name}/index.js`);widget.init(document.querySelector('#'+name));(widget.open||widget.manage)();return;}if(name==='tools')await m.openDay();else if(name!=='home')await m.openFeature(name);},{name,theme});
      if(name==='notes')await page.frameLocator('.notes-workspace-frame').locator('.workspace').waitFor();
      else if(['customizer','layout'].includes(name))await page.locator('.designer').waitFor();
      else if(name!=='home')await page.locator('#panel[open]').waitFor();
      for(const width of (phase==='before'?[1440]:[1440,390,320,720])){
        await page.setViewportSize({width,height:width===720?450:900});
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const screenshot=`${directory}/${name}-${theme}-${width}.png`;await page.screenshot({path:screenshot,animations:'disabled'});
        const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,panelOverflow:document.querySelector('#panel-body')?.scrollWidth>document.querySelector('#panel-body')?.clientWidth+1}));
        report.panels.push({name,theme,width,screenshot,...metrics});
      }
      console.log(`${phase}: ${name} / ${theme}`);
    }catch(error){report.errors.push(`${name}/${theme}: ${error.message}`);}
  }
}catch(error){report.errors.push(error.message);}finally{
  await fs.mkdir('docs/qa-results',{recursive:true});await fs.writeFile(`docs/qa-results/unification-${phase}-${browser}${process.argv.includes('--links')?'-links':process.argv.includes('--missing')?'-supplement':''}.json`,JSON.stringify(report,null,2)+'\n');await context?.close();
  if(report.errors.length||report.panels.some(p=>p.overflow||p.panelOverflow))process.exitCode=1;
}
