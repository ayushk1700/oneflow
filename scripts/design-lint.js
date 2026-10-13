import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Check authored declarations, ignoring comments, selectors and media conditions.
 * Runtime values (image URLs, layout positions, progress and stored preferences)
 * are data, not literal decorative decisions. See DESIGN_SYSTEM.md. */
export function inspect(source,file) {
  const findings=[],clean=source.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' '));
  const add=(index,rule,value)=>findings.push({file,line:clean.slice(0,index).split('\n').length,rule,value});
  if(file.endsWith('.css')){
    for(const m of clean.matchAll(/([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g)){
      const [,property,value]=m;
      if(/#[a-f\d]{3,8}\b|rgba?\(\s*\d|hsla?\(\s*\d/i.test(value))add(m.index,'raw-color',value);
      if(/(?:^|[\s,(])-?\d*\.?\d+px\b/.test(value))add(m.index,'raw-length',value);
      if(property==='border-radius'&&/(?:\d|\.)+(?:rem|em|%)\b/.test(value))add(m.index,'raw-radius',value);
      if(/^(?:padding|margin|gap|row-gap|column-gap)/.test(property)&&/(?:^|\s)-?\d*\.?\d+(?:rem|em)\b/.test(value))add(m.index,'off-scale-spacing',value);
      if(property==='z-index'&&/^-?\d+$/.test(value.trim()))add(m.index,'raw-layer',value);
      if(/^(?:animation|transition)/.test(property)&&/\b\d*\.?\d+(?:ms|s)\b/.test(value))add(m.index,'raw-motion',value);
      if(property==='font-size'&&/\b\d*\.?\d+(?:rem|em)\b/.test(value))add(m.index,'raw-type',value);
      if(value.includes('--var('))add(m.index,'invalid-token',value);
    }
  }else{
    for(const m of clean.matchAll(/\bstyle\s*=\s*["'][^"']+|\bstyle\s*:\s*["'`][^"'`]+/g))if(m[0].includes(':')||m[0].includes('=')) { if(!/^style\s*:\s*['"`]digits$/.test(m[0]))add(m.index,'inline-style',m[0]); }
    for(const m of clean.matchAll(/\.style\.(?:color|backgroundColor|fontSize|borderRadius|padding|margin|boxShadow)\s*=\s*['"]([^'"]+)['"]/g))if(!m[1].startsWith('var(')&&m[1]!=='')add(m.index,'inline-visual-literal',m[0]);
    // Stored color formats and migration sentinels are explicitly checked below.
    const dataColors={
      'core/schema.js':['#c9d9b5','#293c36','#7845df'],
      'core/studio-schema.js':['#1c2522'],
      'background/service-worker.js':['#385b48'],
      'core/theme.js':['#ffffff'],
      'components/settings/index.js':['#ffffff','#000000'],
      'components/stats/index.js':['#f5f5f5']
    };
    for(const m of clean.matchAll(/#[a-f\d]{3,8}\b/gi))if(!(dataColors[file]||[]).includes(m[0].toLowerCase()))add(m.index,'raw-color',m[0]);
  }
  return findings;
}
export async function audit() {
  const issues=[];let count=0;
  for(const root of ['newtab','components','core','blocked','background','dev'])for(const entry of await fs.readdir(root,{recursive:true})){
    const file=path.join(root,entry).replaceAll('\\','/');
    if(!/\.(css|html|js)$/.test(file)||/newtab\/(tokens|app|widgets)\.css$/.test(file))continue;
    count++;issues.push(...inspect(await fs.readFile(file,'utf8'),file));
  }
  return {count,issues};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=await audit();
  for(const issue of result.issues)console.error(`${issue.file}:${issue.line} ${issue.rule}: ${issue.value}`);
  console.log(`${result.issues.length?'FAIL':'PASS'} design lint: ${result.count} authored files; ${result.issues.length} violations. Generated bundles, vendor, fixtures and stored-format sentinels are not decorative source.`);
  process.exitCode=result.issues.length?1:0;
}
