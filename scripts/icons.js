// Regenerate only the local icon subset; never touch user wallpaper assets.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source = await fs.readFile('assets/icons/lucide.svg', 'utf8');
const names = [...new Set([...source.matchAll(/id="([^"]+)"/g)].map(match => match[1]).concat(['x','download','bell','check-check','check','printer','chart-no-axes-column','chevron-left','chevron-right','cloud-rain','coffee','flame','trees','waves','leaf','ellipsis','notebook-pen','arrow-left','pause','volume-2','volume-x','maximize']))];
const context = { exports: {} }; context.module = { exports: context.exports };
vm.runInNewContext(await fs.readFile('vendor/lucide/0.468.0/lucide.min.js','utf8'), context);
const serialize = ([tag, attrs, children = []]) => `<${tag} ${Object.entries(attrs).map(([key,value]) => `${key}="${value}"`).join(' ')}>${children.map(serialize).join('')}</${tag}>`;
const symbols = names.map(name => {
  const key = (name === 'heart-filled' ? 'heart' : name).split('-').map(word => word[0].toUpperCase()+word.slice(1)).join('');
  const [,attrs,children] = context.exports[key];
  return serialize(['symbol',{...attrs,id:name,...(name === 'heart-filled' ? {fill:'currentColor'} : {})},children]);
});
await fs.writeFile('assets/icons/lucide.svg', `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`);
console.log(`Generated ${names.length} icons from the existing pinned Lucide library.`);
