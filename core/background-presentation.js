let catalogPromise;
let livePromise;
/** Catalog paths stay inside their designated folder, including names with spaces. */
export function wallpaperPath(file, live = false) {
  const extension = live ? /\.(mp4|webm)$/i : /\.(webp|png|jpe?g|avif)$/i;
  if (typeof file !== 'string' || /[/\\\x00-\x1f]/.test(file) || !extension.test(file) || file.startsWith('.')) throw new Error('Invalid local wallpaper filename.');
  return `../${live ? 'livewallpaper' : 'wallpaper'}/${encodeURIComponent(file).replaceAll("'", '%27')}`;
}
export function backgroundSource(item, thumbnail = false) {
  if(item.folder==='assets'){const file=thumbnail?item.thumbnail||item.file:item.file;wallpaperPath(file);return '../assets/backgrounds/'+encodeURIComponent(file);}
  return wallpaperPath(thumbnail ? item.thumbnail || item.file || `${item.id}-thumb.webp` : item.file || `${item.id}.webp`);
}
const clamp = (value, low, high, fallback) => Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;
const point = value => Array.isArray(value) && value.length === 2 ? value.map(n => clamp(n, 0, 100, 50)) : [50, 50];
/** Normalize local artwork metadata without accepting executable paths or CSS. */
export function normalizeBackground(item) {
  if (!item || typeof item.id !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(item.id) || typeof item.name !== 'string') throw new Error('Invalid bundled background metadata.');
  if(item.folder!==undefined&&!['assets','wallpaper'].includes(item.folder))throw new Error('Invalid background folder.');
  backgroundSource(item); backgroundSource(item, true);
  return { ...item, position: point(item.position), mobilePosition: point(item.mobilePosition), shade: clamp(item.shade, .54, .72, .60) };
}
/** Videos are catalogued separately and fetched only after selection. */
export function liveWallpaperCatalog() {
  if (!livePromise) livePromise = fetch(new URL('../data/livewallpapers.json', import.meta.url)).then(async response => {
    if (!response.ok) throw new Error('Local live wallpaper catalog is unavailable.');
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error('Invalid local live wallpaper catalog.');
    for (const item of items) {
      if (!item || !/^[a-z][a-z0-9-]{0,39}$/.test(item.id) || typeof item.name !== 'string') throw new Error('Invalid local live wallpaper.');
      wallpaperPath(item.file, true);
    }
    if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('Duplicate local live wallpaper.');
    return items;
  }).catch(error => { livePromise = undefined; throw error; });
  return livePromise;
}
/** Read the small local catalog once; a failed read can be retried. */
export function backgroundCatalog() {
  if (!catalogPromise) catalogPromise = fetch(new URL('../data/backgrounds.json', import.meta.url)).then(async response => {
    if (!response.ok) throw new Error('Bundled backgrounds are unavailable.');
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) throw new Error('Bundled backgrounds are unavailable.');
    const items = rows.map(normalizeBackground);
    if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('Duplicate bundled background.');
    return items;
  }).catch(error => { catalogPromise = undefined; throw error; });
  return catalogPromise;
}
/** Conservative shading over text zones; the opposite side remains clear. */
export function backgroundPresentation(artwork, strong = false) {
  const shade = strong ? .82 : clamp(artwork?.shade, .54, .72, .64);
  return { position: point(artwork?.position).map(n => `${n}%`).join(' '), mobilePosition: point(artwork?.mobilePosition).map(n => `${n}%`).join(' '),
    left: shade, mobile: Math.max(.52, shade), flow: Math.max(.54, shade), all: Math.max(.52, shade) };
}
