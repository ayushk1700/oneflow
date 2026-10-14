import { getRecord } from './db.js';
import { el } from './utils.js';
import { emit } from './events.js';
import { credit } from './pexels-credit.js';
import { liveWallpaperCatalog, wallpaperPath } from './background-presentation.js';
let objectURL, video;
/** Release the previous local video and its decoded resources. */
export function destroy() { if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); } video = null; if (objectURL) URL.revokeObjectURL(objectURL); objectURL = null; }
/** Install one offline video wallpaper with a bundled still fallback. */
export async function render(host, id, stillCurrent, reducedMotion, local = false) {
  destroy(); const record = local ? (await liveWallpaperCatalog().catch(() => [])).find(item => item.id === id) : await getRecord('wallpapers', id);
  if (!stillCurrent()) return;
  credit(record);
  delete host.dataset.videoError; host.classList.remove('bg-loading','background-fallback');
  host.style.backgroundImage = "url('../assets/backgrounds/alpine.webp')";
  host.replaceChildren(); host.dataset.load = 'ready';
  if (!record || (!local && !record.blob)) { emit('toast','Live wallpaper missing. The bundled landscape is available.'); return; }
  if (!local) objectURL = URL.createObjectURL(record.blob);
  video = el('video',{ class:'live-wallpaper',loop:true,playsinline:true,preload:'auto','aria-hidden':'true',tabindex:-1 });
  const element=video;
  video.muted = true; video.loop = true; video.playsInline = true; video.src = local ? wallpaperPath(record.file, true) : objectURL;
  video.addEventListener('loadeddata',() => { if (!stillCurrent()||video!==element) return; video.classList.add('is-visible'); sync(reducedMotion()); });
  video.addEventListener('error',() => {if(!stillCurrent()||video!==element)return; host.dataset.videoError = video?.error?.message || 'Unsupported video'; emit('toast','This wallpaper could not play. Try another MP4 or WebM file.'); video?.remove(); });
  host.append(video); sync(reducedMotion());
}
/** Pause when motion is reduced or the dashboard is in a background tab. */
export function sync(reduced) { if (!video) return; if (reduced || document.hidden) video.pause(); else video.play().catch(() => { emit('toast','Wallpaper playback is paused. Choose a still or another local video in Scenery.'); }); }
