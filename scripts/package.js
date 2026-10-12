import fs from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
await import('./styles.js');
await import('./launch-pages.js');
const root=process.cwd(), manifest=JSON.parse(await fs.readFile('manifest.json','utf8'));
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let crc=0xffffffff;for(const value of bytes)crc=table[(crc^value)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
async function walk(dir){return(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(item=>item.isDirectory()?walk(path.join(dir,item.name)):path.join(dir,item.name)))).flat();}
const files=['manifest.json','README.md',...(await Promise.all(['newtab','background','blocked','components','core','data','assets','vendor'].map(walk))).flat(),'docs/PRIVACY_POLICY.md','docs/PERMISSIONS.md','docs/ARCHITECTURE.md','docs/QA.md','docs/STAGE_3_REPORT.md','docs/REFINEMENT_COMPLETION_REPORT.md','docs/CHANGELOG.md','docs/STORE_LISTING.md','docs/UNIFIED_TIMER_REPORT.md','docs/HOME_TRANSFORMATION_REPORT.md','docs/FOCUS_PANELS_REPORT.md','docs/SKETCH_UI_REPORT.md','docs/TOOLS_MUSIC_REPORT.md','docs/YOUTUBE_API_REPORT.md','docs/SEARCH_DICTIONARY_REPORT.md','docs/BACKGROUNDS_RELEASE_REPORT.md','docs/DASHBOARD_REPLACEMENT_REPORT.md','docs/UNIFIED_APPEARANCE_REPORT.md','docs/WALLPAPER_REFRESH_REPORT.md','docs/PEXELS_REPORT.md','docs/WORKSPACE_REPORT.md','docs/PEXELS_CONNECTION_REPORT.md','docs/CUSTOMIZATION_STUDIO_REPORT.md','docs/AMBIENT_CLOCK_REPORT.md','docs/CLEAR_WALLPAPER_REPORT.md'];
files.push('docs/DESIGN_CONSTITUTION.md','docs/PANEL_REDESIGN_RECOMMENDATION_STATUS.md',...(await fs.readdir('docs')).filter(name=>/^PANEL_REDESIGN_STAGE_.*_(REPORT|PLAN)\.md$/.test(name)).map(name=>`docs/${name}`));
const locals=[],central=[];let offset=0;
files.push(...(await Promise.all(['wallpaper','livewallpaper'].map(walk))).flat());
files.push('docs/launch/privacy.html', 'docs/launch/support.html', 'docs/launch/launch.css', 'docs/LAUNCH_CHECKLIST.md', 'docs/BETA_GUIDE.md', 'docs/MARKET_RELEASE_REPORT.md');
for(const file of files.sort()){
  const name=file.replaceAll('\\','/');if(name.includes('/ai/') || name==='core/ai.js')continue;
  const bytes=await fs.readFile(path.join(root,file)),compressed=deflateRawSync(bytes),encoded=Buffer.from(name),crc=crc32(bytes);
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(encoded.length,26);
  locals.push(local,encoded,compressed);
  const header=Buffer.alloc(46);header.writeUInt32LE(0x02014b50);header.writeUInt16LE(20,4);header.writeUInt16LE(20,6);header.writeUInt16LE(0x800,8);header.writeUInt16LE(8,10);header.writeUInt16LE(33,14);header.writeUInt32LE(crc,16);header.writeUInt32LE(compressed.length,20);header.writeUInt32LE(bytes.length,24);header.writeUInt16LE(encoded.length,28);header.writeUInt32LE(offset,42);central.push(header,encoded);offset+=local.length+encoded.length+compressed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22),entries=central.length/2;
end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries,8);end.writeUInt16LE(entries,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...locals,directory,end]),destination=path.join('release',`oneflow-${manifest.version}.zip`);await fs.mkdir('release',{recursive:true});await fs.writeFile(destination,zip);
await fs.writeFile(`${destination}.sha256`,`${createHash('sha256').update(zip).digest('hex')}  ${path.basename(destination)}\n`);
await fs.writeFile('release/SCREENSHOTS.json',JSON.stringify({version:manifest.version,files:['docs/launch/chrome-start-easily.png','docs/launch/chrome-stay-focused.png','docs/launch/chrome-see-progress.png','docs/launch/chrome-onboarding.png'],promo:'docs/launch/promo-440x280.png',demo:'docs/launch/oneflow-demo.webm',note:'1280×800 captures from a disposable sample profile; timer advanced for completion screenshot. Public submission requires publisher details and human acceptance.'},null,2)+'\n');
console.log(`Packaged ${entries} files: ${destination} (${(zip.length/1048576).toFixed(2)} MB). External AI connection excluded.`);





