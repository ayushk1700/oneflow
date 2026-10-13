// One-time Stage 5 migration. Review source diffs; regenerate bundles separately.
import fs from 'node:fs/promises';
import path from 'node:path';
const spaces={4:'space-xs',8:'space-sm',12:'space-3',16:'space-md',24:'space-lg',32:'space-5',48:'space-2xl',64:'space-3xl'};
const scale=Object.keys(spaces).map(Number);
const nearest=(n,values)=>values.reduce((best,v)=>Math.abs(v-n)<Math.abs(best-n)?v:best,values[0]);
const size=n=>n===0?'0':n<0?`calc(-1 * ${size(-n)})`:spaces[n]?`var(--${spaces[n]})`:`calc(var(--space-xs) * ${n/4})`;
const type={12:'text-small',14:'text-body',16:'text-subheading',20:'text-input',28:'text-title',40:'text-metric',64:'text-display',128:'clock-size'};
const colors={'#172b22':'bg','#f6f1e7':'text-primary','#cad8c7':'border-strong','#c9d9b5':'accent','#142118':'accent-contrast','#ffe68c':'focus-ring','#ffb5ac':'danger','#0003':'shadow-ink','#182b26f5':'surface-1','#142020f5':'surface-1','#cbd3ca':'text-secondary','#ffffff24':'border-subtle','#ffffff50':'border-strong','#0004':'overlay'};
const records=[];
for(const root of ['newtab','components','blocked'])for(const entry of await fs.readdir(root,{recursive:true})){
  const file=path.join(root,entry).replaceAll('\\','/');if(!file.endsWith('.css')||/newtab\/(tokens|app|widgets)\.css$/.test(file))continue;
  const before=await fs.readFile(file,'utf8');
  const after=before.replace(/([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g,(all,property,value)=>{
    if(property.startsWith('--')&&property!=='--workspace-radius'&&property!=='--workspace-gap'&&property!=='--shadow')return all;
    const original=value;
    value=value.replace(/#[a-f\d]{3,8}\b/gi,c=>`var(--${colors[c.toLowerCase()]||'text-primary'})`);
    if(property==='border-radius')value=value.replace(/(?:\d+(?:\.\d+)?)(?:px|%|rem)/g,n=>`var(--radius-${n.endsWith('%')||parseFloat(n)>=40?'full':parseFloat(n)<=8?'sm':parseFloat(n)<=16?'md':'lg'})`);
    else if(property==='z-index'&&/^-?\d+$/.test(value.trim())){const n=Number(value);value=`var(--layer-${n<0?(n===-3?'scenery':n===-2?'shade':'underlay'):n===0?'base':n<=2?'widget':n<=4?'dropdown':n<=8?'drawer':n<=12?'modal':'toast'})`;}
    else if(property==='font-weight'&&/^\d+$/.test(value.trim()))value=`var(--weight-${Number(value)<500?'regular':Number(value)<600?'medium':'heading'})`;
    else if(property==='font-family')value='var(--font)';
    else if(property==='line-height'&&/^\d*\.?\d+$/.test(value.trim()))value=`var(--leading-${Number(value)<=1.2?'display':Number(value)<=1.4?'heading':Number(value)<=1.65?'body':'reading'})`;
    else if(property==='letter-spacing'&&/^-?[\d.]+(?:em|px)$/.test(value.trim()))value=`var(--tracking-${parseFloat(value)<0?'heading':parseFloat(value)===0?'body':'label'})`;
    else value=value.replace(/(-?\d*\.?\d+)px\b/g,(match,number)=>{
      const n=Number(number);if(n===0)return '0';
      if(property==='font-size'||property==='font')return `var(--${type[nearest(Math.abs(n),Object.keys(type).map(Number))]})`;
      if(/^(?:border|outline|text-shadow|box-shadow|filter|backdrop-filter)/.test(property)&&Math.abs(n)<=3)return `var(--${Math.abs(n)<=1?'stroke':Math.abs(n)<=2?'stroke-strong':'focus-width'})`;
      if(/^(padding|margin|gap|row-gap|column-gap)/.test(property))return size((n<0?-1:1)*(Math.abs(n)>64?Math.round(Math.abs(n)/4)*4:nearest(Math.abs(n),scale)));
      if(Math.abs(n)<4)return n<0?'calc(-1 * var(--stroke))':'var(--stroke)';
      return size(Math.round(n/4)*4);
    });
    if(property==='font')value=value.replace(/['"]Segoe UI['"],sans-serif/,'var(--font)');
    if(/^(animation|transition)/.test(property))value=value.replace(/\b\d*\.?\d+(ms|s)\b/g,()=> 'var(--motion-base)').replace(/cubic-bezier\([^)]*\)|ease-in-out|ease-out|ease-in|\bease\b/g,'var(--easing-standard)');
    if(value!==original)records.push({file,property,before:original,after:value});
    return `${property}:${value}`;
  });
  await fs.writeFile(file,after);
}
await fs.writeFile('docs/qa-results/unification-style-migration.json',JSON.stringify(records,null,2)+'\n');
console.log(`Normalized ${records.length} authored declarations. Geometry uses multiples of the 4px base; breakpoints remain CSS media-query literals.`);
