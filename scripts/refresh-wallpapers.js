// Optional maintainer tool: original SVG scenes and optimized offline WebP copies.
// Stable IDs preserve installed background choices and scene presets.
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.ONEFLOW_NODE_MODULES ? `${process.env.ONEFLOW_NODE_MODULES}/sharp` : 'sharp');

const scenes = [
  { id:'alpine', name:'Stillwater', category:'Mist & mountains', colors:['#8b9d98','#c7c6b6','#415f59','#1f3934'],
    far:'M0 650 170 484 285 539 466 356 601 462 715 570 825 503 1010 620 1260 410 1390 464 1520 300 1650 455 1810 395 1920 520',
    near:'M0 754Q210 650 375 700T710 802L1030 826Q1200 742 1450 693T1920 677', water:true },
  { id:'cozy', name:'Quiet coast', category:'Warm stone & sea', colors:['#a7aaa0','#d2c5ad','#758e83','#344e48'],
    far:'M0 723Q250 689 475 731T910 738T1410 696T1920 732',
    near:'M0 801Q175 751 373 806T770 953Q1040 1031 1350 1080H0', water:true, sun:true },
  { id:'lofi', name:'Lavender dusk', category:'Soft evening', colors:['#8e939e','#c8bdb9','#747d87','#343f4b'],
    far:'M0 686Q190 470 435 568T940 670T1400 543T1920 654',
    near:'M0 800Q230 613 458 772T918 864Q1345 690 1580 717T1920 810' },
  { id:'minimal', name:'Sage meadow', category:'Open horizons', colors:['#9ba89b','#ceceba','#788c70','#3c5544'],
    far:'M0 710Q286 588 560 674T1100 696T1620 646T1920 680',
    near:'M0 853Q300 710 651 828T1200 850T1660 772T1920 830' },
  { id:'dark', name:'Blue hour', category:'Restful night', colors:['#34474e','#84918f','#465e64','#1b3038'],
    far:'M0 720 185 580 344 612 491 445 645 597 829 709 1037 599 1260 486 1430 575 1604 403 1807 618 1920 580',
    near:'M0 840Q264 726 545 816T1100 845T1600 760T1920 797', water:true, moon:true },
  { id:'summit', name:'Desert hush', category:'Sand & sunset', colors:['#aa9c94','#d0baa3','#a5917e','#695b50'],
    far:'M0 746Q245 519 568 669T1120 725T1610 627T1920 720',
    near:'M0 864Q378 626 768 884T1450 912T1920 850', sun:true }
];

/** Compose smooth, layered landscapes with an open central text area. */
function artwork(scene) {
  const [sky, glow, ridge, foreground] = scene.colors;
  const light = scene.sun ? `<circle cx="1480" cy="330" r="54" fill="${glow}" opacity=".68"/>` : scene.moon ? '<circle cx="1500" cy="280" r="19" fill="#d9ddd0" opacity=".7"/>' : '';
  const water = scene.water ? `<path d="M0 770Q600 725 960 798T1920 763V1080H0Z" fill="url(#water)"/><g stroke="${glow}" stroke-width="1" opacity=".12"><path d="M650 845h460m-330 23h650m-1020 36h750m-900 45h470m510 40h540"/></g>` : '';
  const foregroundPath = scene.id === 'cozy' ? scene.near : `${scene.near}V1080H0Z`;
  const trees = scene.id === 'alpine' || scene.id === 'dark' ? Array.from({length:34}, (_, i) => {
    const x = i < 17 ? i * 25 - 30 : 1510 + (i - 17) * 30, y = 955 + Math.sin(i * 2) * 25, h = 48 + (i * 37 % 90);
    return `<path d="M${x} ${y-h}l${-h*.24} ${h*.74}h${h*.12}l${-h*.21} ${h*.26}h${h*.66}l${-h*.21} ${-h*.26}h${h*.12}Z" fill="${foreground}" opacity=".72"/>`;
  }).join('') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
<defs>
 <linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset=".76" stop-color="${glow}"/><stop offset="1" stop-color="${ridge}"/></linearGradient>
 <linearGradient id="water" x2="0" y2="1"><stop stop-color="${ridge}" stop-opacity=".25"/><stop offset="1" stop-color="${foreground}"/></linearGradient>
 <linearGradient id="mist" x2="0" y2="1"><stop stop-color="${glow}" stop-opacity="0"/><stop offset=".55" stop-color="${glow}" stop-opacity=".27"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></linearGradient>
 <radialGradient id="air"><stop stop-color="${glow}" stop-opacity=".16"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
<ellipse cx="1350" cy="320" rx="800" ry="450" fill="url(#air)"/>${light}
<path d="${scene.far}V1080H0Z" fill="${ridge}" opacity=".4"/>
<path d="${scene.far}V1080H0Z" transform="translate(-170 95) scale(1.2 1)" fill="${ridge}" opacity=".44"/>
${water}<path d="${foregroundPath}" fill="${foreground}" opacity=".58"/>
<rect y="565" width="1920" height="430" fill="url(#mist)"/>
<path d="M0 966Q280 864 538 990T1010 1070T1580 1010T1920 952V1080H0Z" fill="${foreground}" opacity=".75"/>${trees}
</svg>`;
}

await fs.mkdir('wallpaper',{recursive:true});
for (const scene of scenes) {
  const svg = artwork(scene), base = `wallpaper/${scene.id}`;
  await fs.writeFile(`${base}.svg`, svg);
  await sharp(Buffer.from(svg)).webp({quality:83}).toFile(`${base}.webp`);
  await sharp(Buffer.from(svg)).resize(384,216).webp({quality:65}).toFile(`${base}-thumb.webp`);
}
const previous = JSON.parse(await fs.readFile('data/backgrounds.json','utf8'));
const refreshed = scenes.map(({id,name,category,colors}) => ({id,name,category,colors:colors.slice(0,3),position:[50,50],mobilePosition:[50,50],shade:.54,source:`${id}.svg`,file:`${id}.webp`,thumbnail:`${id}-thumb.webp`}));
await fs.writeFile('data/backgrounds.json', JSON.stringify([...refreshed,...previous.filter(item => !scenes.some(scene => scene.id === item.id))],null,2)+'\n');
console.log('Rendered six original muted scenes and thumbnails; saved scene identifiers retained.');
