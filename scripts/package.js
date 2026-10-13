import fs from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { releaseFiles } from './release-files.js';
import { spawnSync } from 'node:child_process';
import { PUBLISHER, publicURL, supportLink } from '../core/publisher.js';
if (process.argv.includes('--release') && (!supportLink() || !publicURL(PUBLISHER.privacyURL))) throw new Error('Public release requires a real support contact and a hosted HTTPS privacy URL in core/publisher.js. Candidate packaging remains available.');
const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
if (process.argv.includes('--release') && (status.status !== 0 || status.stdout.trim())) throw new Error('Public release must use a clean, identified Git revision.');
await import('./styles.js');
await import('./launch-pages.js');
const root=process.cwd(), manifest=JSON.parse(await fs.readFile('manifest.json','utf8'));
for (const args of [['scripts/check.js'], ['scripts/check-vendor.js'], ['--test', 'tests/*.test.js']]) { const result = spawnSync(process.execPath, args, { stdio: 'inherit' }); if (result.status !== 0) throw new Error('Release verification failed. No archive was written.'); }
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let crc=0xffffffff;for(const value of bytes)crc=table[(crc^value)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
const files = await releaseFiles(root);
const locals=[],central=[];let offset=0;
for(const file of files.sort()){
  const name=file.replaceAll('\\','/');
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
const sourceFiles = await Promise.all(files.sort().map(async file => ({ path: file.replaceAll('\\','/'), sha256: createHash('sha256').update(await fs.readFile(file)).digest('hex') })));
const revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
await fs.writeFile(`${destination}.build.json`,JSON.stringify({version:manifest.version,publicRelease:process.argv.includes('--release'),sourceRevision:revision.status===0?revision.stdout.trim():null,workingTreeDirty:Boolean(status.stdout.trim()),files:sourceFiles},null,2)+'\n');
console.log(`Packaged ${entries} verified files: ${destination} (${(zip.length/1048576).toFixed(2)} MB). ${process.argv.includes('--release')?'Public release':'Local candidate; publisher setup is required before public distribution'}.`);





