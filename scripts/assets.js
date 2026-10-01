// Optional maintainer tool. Generated assets are committed; users need no build.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.ONEFLOW_NODE_MODULES ? `${process.env.ONEFLOW_NODE_MODULES}/sharp` : 'sharp');
const palette = JSON.parse(await fs.readFile('data/backgrounds.json', 'utf8'));
function landscape(colors, id) {
  const [sky, middle, dark] = colors;
  let random = 127;
  const rand = () => { random = (random * 16807) % 2147483647; return random / 2147483647; };
  const ridge = (base, height, phase) => Array.from({ length: 121 }, (_, i) => {
    const x = i * 16;
    return `${x},${Math.round(base - Math.abs(Math.sin(i * .038 + phase)) * height - Math.sin(i * .12 + phase) * height * .24 - (rand() - .5) * height * .12)}`;
  }).join(' ');
  let trees = '';
  for (let i = 0; i < 180; i++) {
    const x = rand() * 1920, y = 955 + rand() * 125, h = 35 + rand() * 150;
    if (x > 650 && x < 1260) continue;
    trees += `<path d="M${x} ${y-h}l${-h*.26} ${h*.7}h${h*.13}l${-h*.2} ${h*.23}h${h*.66}l${-h*.2} ${-h*.23}h${h*.13}Z" fill="${dark}" opacity="${.45+rand()*.55}"/>`;
  }
  const sun = id === 'cozy' ? '<circle cx="1310" cy="260" r="55" fill="#ffdea1" opacity=".65"/>' : id === 'dark' ? '<circle cx="1420" cy="205" r="25" fill="#dce8ee" opacity=".65"/>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="#dce1d7"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="${middle}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="mist" x2="0" y2="1"><stop stop-color="#cfdfd6" stop-opacity="0"/><stop offset=".6" stop-color="#cfdfd6" stop-opacity=".22"/><stop offset="1" stop-color="#cfdfd6" stop-opacity="0"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer></filter></defs><rect width="1920" height="1080" fill="url(#sky)"/>${sun}<path d="M0 520 Q420 380 720 435T1450 360T1920 415" stroke="#e8ece4" stroke-width="50" opacity=".08" fill="none"/><polygon points="0,850 ${ridge(700,420,.5)} 1920,850" fill="${middle}" opacity=".47"/><polygon points="0,900 ${ridge(800,410,2.2)} 1920,900" fill="${middle}" opacity=".74"/><polygon points="0,1080 ${ridge(1050,430,1.4)} 1920,1080" fill="${dark}" opacity=".7"/><path d="M790 650Q925 720 1105 820L1650 1080H300L780 900Q1000 810 880 750Z" fill="url(#water)"/><path d="M0 790Q330 870 695 881L910 825Q500 1040 0 1080ZM1920 700Q1560 800 1110 830L1050 854Q1530 910 1920 1080Z" fill="${dark}" opacity=".6"/><rect y="560" width="1920" height="380" fill="url(#mist)"/>${trees}<rect width="1920" height="1080" filter="url(#grain)" opacity=".8"/></svg>`;
}
for (const item of palette) {
  const svg = landscape(item.colors, item.id);
  await fs.writeFile(`assets/backgrounds/${item.id}.svg`, svg);
  await sharp(Buffer.from(svg)).webp({ quality: 83 }).toFile(`assets/backgrounds/${item.id}.webp`);
  await sharp(Buffer.from(svg)).resize(384, 216).webp({ quality: 65 }).toFile(`assets/backgrounds/${item.id}-thumb.webp`);
}
const mark = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="#203c33"/><path d="M20 72C36 24 50 24 64 58s30 46 44-4M20 94C36 46 50 46 64 80s30 46 44-4" stroke="#d6e9ba" stroke-width="7" fill="none" stroke-linecap="round"/></svg>';
for (const size of [16,32,48,128]) await sharp(Buffer.from(mark)).resize(size,size).png().toFile(`assets/icons/icon-${size}.png`);
const context = { exports: {} }; context.module = { exports: context.exports };
vm.runInNewContext(await fs.readFile('vendor/lucide/0.468.0/lucide.min.js', 'utf8'), context);
const names = ['search','arrow-right','arrow-up-right','pencil','plus','trash-2','sun','cloud','heart','refresh-cw','bookmark','chevron-up','chevron-down','folder-plus','list-todo','layout-grid','image','sliders-horizontal','clock','audio-lines','play'];
const serialize = ([tag, attrs, children = []]) => `<${tag} ${Object.entries(attrs).map(([k,v]) => `${k}="${v}"`).join(' ')}>${children.map(serialize).join('')}</${tag}>`;
const symbols = names.map(name => {
  const key = name.split('-').map(x => x[0].toUpperCase()+x.slice(1)).join('');
  const [,attrs,children] = context.exports[key];
  return serialize(['symbol',{...attrs,id:name},children]);
});
const [,heartAttrs,heartChildren] = context.exports.Heart;
symbols.push(serialize(['symbol',{...heartAttrs,id:'heart-filled',fill:'currentColor'},heartChildren]));
await fs.writeFile('assets/icons/lucide.svg', `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`);
console.log('Generated five original landscapes, thumbnails, icons, and a local Lucide subset.');
