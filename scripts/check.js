import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const manifest = JSON.parse(await fs.readFile('manifest.json', 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ['storage','alarms','notifications','offscreen']);
assert(!manifest.host_permissions);
const csp = manifest.content_security_policy.extension_pages;
assert(csp.includes("script-src 'self'") && !csp.includes('unsafe-'));
for (const file of [manifest.chrome_url_overrides.newtab, manifest.background.service_worker, ...Object.values(manifest.icons)]) await fs.access(file);
async function walk(dir) { return (await Promise.all((await fs.readdir(dir, { withFileTypes:true })).map(async x => x.isDirectory() ? walk(path.join(dir,x.name)) : path.join(dir,x.name)))).flat(); }
const files = (await Promise.all(['core','newtab','components','background'].map(walk))).flat();
let jsBytes = 0;
for (const file of files) {
  const content = await fs.readFile(file,'utf8');
  if (file.endsWith('.js')) { jsBytes += Buffer.byteLength(content); const check = spawnSync(process.execPath,['--check',file],{encoding:'utf8'}); assert.equal(check.status,0,check.stderr); assert(!/\.innerHTML\s*=|\beval\s*\(/.test(content),`Unsafe rendering: ${file}`); }
  if (file.endsWith('.html')) { assert(!/<script\b[^>]*src=["']https?:/i.test(content)); assert(!/\son\w+=["']/i.test(content)); assert(!/<script\b(?![^>]*\bsrc=)[^>]*>/i.test(content)); }
}
assert(jsBytes < 150 * 1024, `Initial JS over budget: ${jsBytes}`);
const quotes = JSON.parse(await fs.readFile('data/quotes.json','utf8'));
assert(quotes.length >= 500); assert.equal(new Set(quotes.map(x=>x.id)).size,quotes.length); assert.equal(new Set(quotes.map(x=>x.text)).size,quotes.length);
console.log(`PASS: manifest references, CSP, syntax, safe DOM rendering, ${quotes.length} unique local quotes.`);
console.log(`Initial application JavaScript: ${(jsBytes/1024).toFixed(1)} KiB / 150 KiB budget.`);
