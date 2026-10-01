import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.ONEFLOW_NODE_MODULES ? `${process.env.ONEFLOW_NODE_MODULES}/playwright` : 'playwright');
const context=await chromium.launchPersistentContext(path.resolve('.test-profile',`resilience-${Date.now()}`),{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-extension-debugging'],ignoreDefaultArgs:['--disable-extensions']});
const browser=context.browser();
const results=[];
const pass=name=>{results.push(name);console.log(`PASS: ${name}`);};
try {
 const cdp=await browser.newBrowserCDPSession();const {id}=await cdp.send('Extensions.loadUnpacked',{path:process.cwd()});
 const page=await context.newPage();
 await page.goto(`chrome-extension://${id}/newtab/index.html`);await page.waitForSelector('html[data-ready=true]');
 await page.getByRole('button',{name:'Skip for now',exact:true}).click();
 const failures=await page.evaluate(async()=>{
   const b=await import('../core/backup.js'),s=await import('../core/storage.js');const base=await b.exportData();
   const cases=[x=>x.schemaVersion=99,x=>delete x.local,x=>x.local.lists=[],x=>x.local.links=[{id:'x',title:'Bad',url:'javascript:alert(1)'}],x=>x.local.tasks=[{id:'a',text:'Orphan',listId:'missing',completed:false}],x=>x.database.images=[{id:'bad',data:'data:image/svg+xml;base64,AAAA'}],x=>x.local.settings.background={kind:'upload',id:'missing',color:'#123456',blur:0,rotate:false}];
   let rejected=0;for(const edit of cases){const input=structuredClone(base);edit(input);try{await b.parseBackup(JSON.stringify(input));}catch{rejected++;}}
   return {rejected,unchanged:JSON.stringify(s.get())===JSON.stringify(base.local)};
 });
 assert.equal(failures.rejected,7);assert(failures.unchanged);pass('Seven malformed backups rejected without changing saved data');
 await page.evaluate(async()=>{const s=await import('../core/storage.js');await s.update(d=>{d.focus={date:(awaitNoop=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;})(),text:'<img src=x onerror=alert(1)>',completed:false};});});
 assert.equal(await page.locator('#focus img').count(),0);assert.match(await page.locator('#focus').innerText(),/<img/);pass('Hostile text displays literally without HTML execution');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByLabel('Complete daily focus').check();
 await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduce');
 assert.equal(await page.locator('script[src*=confetti]').count(),0);pass('Device reduced-motion prevents loading celebration code');
 // Deterministic provider/permission responses. This is not a real permission-prompt acceptance test.
 await page.evaluate(()=>{chrome.permissions.request=async()=>false;chrome.permissions.contains=async()=>false;});
 await page.getByRole('button',{name:'Set up local weather',exact:true}).click();
 await page.getByLabel('City name',{exact:true}).fill('Berlin');
 await page.getByRole('button',{name:'Find city',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('not granted'));pass('Denied weather access produces a recoverable message');
 await page.evaluate(()=>{chrome.permissions.request=async()=>true;chrome.permissions.contains=async()=>true;});
 let forecastCalls=0;
 await context.route('https://geocoding-api.open-meteo.com/**',route=>route.fulfill({json:{results:[{name:'Berlin',country:'Germany',admin1:'Berlin',latitude:52.52,longitude:13.41}]}}));
 await context.route('https://api.open-meteo.com/**',route=>{forecastCalls++;return route.fulfill({json:{current:{temperature_2m:20,weather_code:2}}});});
 await page.getByRole('button',{name:'Find city',exact:true}).click();
 await page.getByRole('button',{name:'Berlin · Berlin Germany',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#weather').textContent.includes('20°'));
 await page.evaluate(async()=>{const w=await import('../components/weather/index.js');await w.refresh();});
 assert.equal(forecastCalls,1);pass('City selection and 30-minute weather cache work with mocked provider responses');
 await page.getByRole('button',{name:'Close panel',exact:true}).click();
 await page.evaluate(async()=>{const s=await import('../core/storage.js');await s.update(d=>{d.settings.units='fahrenheit';d.weather.cache.at=Date.now()-3600000;});});
 await page.waitForFunction(()=>document.querySelector('#weather').textContent.includes('68°'));
 await context.setOffline(true);await page.reload();await page.waitForSelector('html[data-ready=true]');
 assert.match(await page.locator('#weather').innerText(),/68°.*Berlin, Germany · cached/s);pass('Stale weather stays visible offline and converts units correctly');
 await context.setOffline(false);
 await page.evaluate(async()=>{const s=await import('../core/storage.js');await s.update(d=>{d.weather={location:null,cache:null};});});
 // Check documented foreground pairs and the brightest possible upload through the veil.
 const luminance=rgb=>rgb.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
 const brightest=await page.evaluate(()=>{const veil=document.querySelector('.readability');const first=getComputedStyle(veil).backgroundImage.match(/rgba?\(([^)]+)\)/)[1].split(',').map(Number);const second=getComputedStyle(veil,'::after').backgroundColor.match(/rgba?\(([^)]+)\)/)[1].split(',').map(Number);return [0,1,2].map(i=>(255*(1-first[3])+first[i]*first[3])*(1-second[3])+second[i]*second[3]);});
 const pairs=[[[246,248,244],[24,38,35]],[[200,208,205],[40,56,52]],[[20,43,35],[241,244,238]],[[67,89,79],[225,232,223]],[[224,232,223],brightest]];
 const ratios=pairs.map(([a,b])=>ratio(a,b));assert(ratios.every(x=>x>=4.5),`Contrast: ${ratios}`);pass(`Core text contrast ratios: ${ratios.map(x=>x.toFixed(2)).join(', ')}`);
 await page.evaluate(async()=>{const b=await import('../core/backup.js');await b.resetData();});
 assert.equal(await page.evaluate(async()=>(await import('../core/storage.js')).get().settings.onboarding),false);
 assert.equal(await page.evaluate(async()=>(await import('../core/db.js')).getAll('images').then(x=>x.length)),0);
 const sync=await page.evaluate(()=>chrome.storage.sync.get('preferences'));assert.equal(sync.preferences,undefined);pass('Full reset clears local state, image records, and synced preferences');
}catch(error){results.push(`FAIL: ${error.stack}`);console.error(error);process.exitCode=1;}
finally{await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/resilience-report.json',JSON.stringify(results,null,2));await browser.close();}
