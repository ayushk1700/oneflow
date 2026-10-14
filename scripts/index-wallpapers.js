// Optional catalog refresh after adding files; no runtime filesystem permissions.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { normalizeBackground, wallpaperPath } from '../core/background-presentation.js';

/** Index top-level regular media files without changing or deleting originals. */
export async function indexWallpapers(root = process.cwd()) {
  const data = path.join(root,'data');
  await fs.mkdir(data,{recursive:true});
  let previous = [];
  try { previous = JSON.parse(await fs.readFile(path.join(data,'backgrounds.json'),'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const catalogs = [];
  for (const [folder,live] of [['assets/backgrounds',false],['livewallpaper',true]]) {
    const location = path.join(root,folder);
    let entries=[];
    try{entries=await fs.readdir(location,{withFileTypes:true});}catch(error){if(error.code!=='ENOENT')throw error;}
    const names = new Set(entries.filter(entry => entry.isFile()).map(entry => entry.name));
    const rows = [];
    for (const file of [...names].sort()) {
      if (/[-.]thumb\.(webp|png|jpe?g|avif)$/i.test(file)) continue;
      try { wallpaperPath(file,live); } catch { continue; }
      const old = !live && previous.find(item => (item.file || `${item.id}.webp`) === file);
      const id = old?.id || `${live ? 'live' : 'still'}-${createHash('sha256').update(file).digest('hex').slice(0,16)}`;
      const name = old?.name || path.parse(file).name.replaceAll(/[_-]+/g,' ').slice(0,100);
      if (live) rows.push({id,name,file});
      else {
        const thumb = `${path.parse(file).name}-thumb.webp`;
        rows.push(normalizeBackground({...old,id,name,file,folder:'assets',thumbnail:names.has(thumb) ? thumb : file,category:old?.category || 'Local collection'}));
      }
    }
    // Keep the existing scene ordering (and daily rotation order) stable.
    if (!live) rows.sort((a,b) => {
      const rank = item => { const i=previous.findIndex(old => old.id===item.id); return i<0 ? previous.length : i; };
      return rank(a)-rank(b);
    });
    catalogs.push(rows);
  }
  await fs.writeFile(path.join(data,'backgrounds.json'),JSON.stringify(catalogs[0],null,2)+'\n');
  await fs.writeFile(path.join(data,'livewallpapers.json'),JSON.stringify(catalogs[1],null,2)+'\n');
  return {stills:catalogs[0].length,live:catalogs[1].length};
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await indexWallpapers();
  console.log(`Indexed ${result.stills} static wallpapers and ${result.live} live wallpapers. Reload the extension to apply.`);
}
