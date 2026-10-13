// Integrated release audit: conservative rendered backing samples, not antialiased glyph pixels.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`),sharp=require(`${process.env.ONEFLOW_NODE_MODULES}/sharp`);
const checks=[],errors=[],requests=[],contrast=[];
const report={checks,errors,requests,contrast,method:'Minimum contrast against every backing pixel in rendered text ranges (measured placeholder bounds for inputs); foreground hidden, control backgrounds retained. No text-shadow credit. 1440x900 and 320x700.'};
let context;
const lum=rgb=>rgb.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
try {
  context=await chromium.launchPersistentContext(path.resolve('.test-profile',`design9-${Date.now()}`),{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:1440,height:900},args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
  const cdp=await context.browser().newBrowserCDPSession(),{id}=await cdp.send('Extensions.loadUnpacked',{path:process.cwd()}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.getByRole('button',{name:'Skip for now',exact:true}).click();await page.locator('#panel').waitFor({state:'hidden'});
  await page.emulateMedia({reducedMotion:'reduce'});await context.setOffline(true);
  const samples=[['.clock-time',3],['.clock-period',4.5],['.greeting',4.5],['.date-label',4.5],['.session-setup > input',4.5,'::placeholder'],['#focus .session-duration select',4.5],['#web-search',4.5,'::placeholder'],['#quotes blockquote',4.5],['#quotes .quote-details > summary',4.5],['#journal-button',4.5],['#dock button',4.5],['#journal-button svg,#dock svg,#home-menu > summary svg',3]];
  const scenes=JSON.parse(await fs.readFile('data/backgrounds.json','utf8'));
  async function measure(name,width) {
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const points=await page.evaluate(samples=>samples.flatMap(([selector,limit,pseudo])=>[...document.querySelectorAll(selector)].filter(n=>n.checkVisibility()).flatMap(n=>{
      const style=getComputedStyle(n,pseudo),color=style.color.match(/[\d.]+/g).map(Number),rects=[];
      if(n.matches('input,select')){const r=n.getBoundingClientRect(),s=getComputedStyle(n),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=s.font;const text=n.matches('select')?n.options[n.selectedIndex].textContent:n.value||n.placeholder,width=Math.min(ctx.measureText(text).width,r.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),height=parseFloat(s.fontSize);rects.push({x:s.textAlign==='center'?r.x+(r.width-width)/2:r.x+parseFloat(s.paddingLeft),y:r.y+(r.height-height)/2,width,height});}
      else if(n.matches('svg')){const r=n.getBoundingClientRect();rects.push({x:r.x,y:r.y,width:r.width,height:r.height});}
      else{const walker=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);while(walker.nextNode()){if(!walker.currentNode.textContent.trim()||walker.currentNode.parentElement.closest('svg')||selector==='.clock-time'&&walker.currentNode.parentElement.closest('.clock-period'))continue;const range=document.createRange();range.selectNodeContents(walker.currentNode);for(const r of range.getClientRects())rects.push({x:r.x,y:r.y,width:r.width,height:r.height});}}
      return rects.filter(r=>r.width>4&&r.height>4).map(rect=>({selector,limit,rect,color}));
    })),samples);
    await page.evaluate(()=>{globalThis.auditStyles=[...document.querySelectorAll('.centerpiece *,.topbar *,.tool-cluster *')].map(n=>({n,css:n.style.cssText,placeholder:n.getAttribute('placeholder')}));for(const {n} of auditStyles){n.style.setProperty('color','transparent','important');n.style.setProperty('text-shadow','none','important');if(n.matches('svg'))n.style.visibility='hidden';if(n.hasAttribute('placeholder'))n.setAttribute('placeholder','');}});
    const {data,info}=await sharp(await page.screenshot({animations:'disabled'})).removeAlpha().raw().toBuffer({resolveWithObject:true});await page.evaluate(()=>{for(const {n,css,placeholder} of auditStyles){n.style.cssText=css;if(placeholder!==null)n.setAttribute('placeholder',placeholder);}delete globalThis.auditStyles;});
    for(const point of points){let minimum=Infinity;const r=point.rect;
      for(let y=Math.max(0,Math.ceil(r.y)+2);y<Math.min(info.height,Math.floor(r.y+r.height)-2);y++)for(let x=Math.max(0,Math.ceil(r.x)+2);x<Math.min(info.width,Math.floor(r.x+r.width)-2);x++){const offset=(y*info.width+x)*info.channels;minimum=Math.min(minimum,ratio(point.color,[...data.subarray(offset,offset+3)]));}
      contrast.push({scene:name,width,selector:point.selector,limit:point.limit,minimum,pass:minimum>=point.limit});
    }
  }
  for(const width of [1440,320]){
    await page.setViewportSize({width,height:width===320?700:900});
    for(const scene of scenes){await page.evaluate(async id=>(await import('../core/storage.js')).update(d=>{d.settings.background.kind='bundled';d.settings.background.rotate=false;d.settings.background.id=id;}),scene.id);await page.waitForFunction(id=>document.documentElement.dataset.background===id&&document.querySelector('#landscape').dataset.load==='ready',scene.id);await measure(scene.id,width);if(scene.id==='still-ec30a7337910c6ec'){await fs.mkdir('docs/screenshots',{recursive:true});await page.screenshot({path:`docs/screenshots/design-9-chrome-home-${width}.png`,animations:'disabled'});}}
    await page.evaluate(async()=>{const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1920,1080);const blob=await new Promise(resolve=>canvas.toBlob(resolve));await(await import('../core/db.js')).put('images',{id:'audit-white',blob});await(await import('../core/storage.js')).update(d=>{d.settings.background.kind='upload';d.settings.background.id='audit-white';});});
    await page.waitForFunction(()=>document.documentElement.dataset.background==='upload'&&document.querySelector('#landscape').dataset.load==='ready');await measure('white-upload',width);
    await page.evaluate(async()=>(await import('../core/storage.js')).update(d=>{d.settings.contrast='strong';}));await measure('white-upload-strong',width);
    for(const color of ['#ffffff','#000000']){await page.evaluate(async color=>(await import('../core/storage.js')).update(d=>{d.settings.contrast='normal';d.settings.background.kind='solid';d.settings.background.color=color;}),color);await page.waitForFunction(color=>document.documentElement.dataset.canvas===(color==='#ffffff'?'white':'black'),color);await measure(color,width);}
  }
  report.panelContrast=[];
  for(const theme of ['dark','light']){
    await page.evaluate(async theme=>{await(await import('../core/storage.js')).update(d=>{d.settings.theme=theme;d.settings.background.kind='bundled';d.settings.background.id='alpine';});await(await import('../core/features.js')).openDay();},theme);await page.locator('#panel[data-panel=day]').waitFor();
    const colors=await page.evaluate(()=>{const root=getComputedStyle(document.documentElement),node=document.createElement('span');document.body.append(node);const read=token=>{node.style.color=root.getPropertyValue(token);return getComputedStyle(node).color.match(/[\d.]+/g).map(Number);};const result=Object.fromEntries(['--text','--muted','--panel','--surface','--action','--action-ink','--focus-ring'].map(k=>[k,read(k)]));node.remove();return result;});
    for(const [foreground,background,limit] of [['--text','--panel',4.5],['--muted','--panel',4.5],['--muted','--surface',4.5],['--action-ink','--action',4.5],['--focus-ring','--panel',3]]){const c=colors[background],alpha=c[3]??1,backing=c.slice(0,3).map((v,i)=>v*alpha+colors['--panel'][i]*(1-alpha));report.panelContrast.push({theme,foreground,background,limit,ratio:ratio(colors[foreground],backing)});}
    await page.keyboard.press('Escape');
  }
  const catalog=await page.evaluate(async()=>{const m=await import('../core/tool-catalog.js');return {hubs:m.hubs.map(([name,items])=>({name,count:items.length})),tools:m.tools.map(([id,label])=>({id,label,enabled:m.toolEnabled(id)}))};});report.catalog=catalog;
  assert(catalog.hubs.every(h=>h.count<=6));
  await page.evaluate(async()=>{await(await import('../core/features.js')).openFeature('commands');});await page.getByLabel('Search commands').waitFor();
  for(const tool of catalog.tools.filter(t=>t.enabled&&t.id!=='commands')){await page.getByLabel('Search commands').fill(tool.label);await page.locator('#panel').getByRole('button',{name:tool.label,exact:true}).waitFor();}
  for(const query of ['Open tasks','Open habits']){await page.getByLabel('Search commands').fill(query);await page.locator('#panel').getByRole('button',{name:'Notes',exact:true}).waitFor();}
  checks.push('All five hubs contain at most six tools; every enabled catalog tool is discoverable by its current command name.');
  await page.keyboard.press('Escape');
  const failed=contrast.filter(c=>!c.pass);report.failedContrast=failed;
  console.log(`Backing samples: ${contrast.length}; failures: ${failed.length}; minimum clock: ${Math.min(...contrast.filter(c=>c.selector==='.clock-time').map(c=>c.minimum)).toFixed(3)}`);
  assert.equal(failed.length,0,JSON.stringify(failed.slice(0,12)));assert(report.panelContrast.every(c=>c.ratio>=c.limit),JSON.stringify(report.panelContrast));
  checks.push('All bundled scenes, white upload, strong contrast, white/black canvases meet sampled Home AA thresholds at desktop and compact widths; panel semantic text/action/focus colors pass.');
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);checks.push('Offline integrated audit has no page errors or external requests.');
}catch(error){report.failure=error.message;console.error(error);process.exitCode=1;}finally{await fs.mkdir('docs/qa-results',{recursive:true});await fs.writeFile('docs/qa-results/design-stage-9-chrome.json',JSON.stringify(report,null,2)+'\n');await context?.close();}
