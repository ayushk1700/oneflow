import { get, update, sessionGet, sessionSet } from '../../core/storage.js';
import { put, getAll } from '../../core/db.js';
import { el, uid } from '../../core/utils.js';
import { field, select, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { validateVideo, decodeRaster } from '../../core/media-validation.js';
const origins = ['https://api.pexels.com/*', 'https://images.pexels.com/*', 'https://videos.pexels.com/*'];
/** Allow only the provider's HTTPS media and attribution origins. */
export function trusted(value, hosts) {
  try { const url = new URL(value); return url.protocol === 'https:' && hosts.includes(url.hostname) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
/** Normalize API data without putting untrusted markup or URLs in the UI. */
export function mediaItems(data, kind) {
  const rows = kind === 'video' ? data.videos : data.photos;
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 6).flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const page = trusted(item.url, ['www.pexels.com', 'pexels.com']);
    const thumb = trusted(kind === 'video' ? item.image : item.src?.medium, ['images.pexels.com']);
    const files = Array.isArray(item.video_files) ? item.video_files : [];
    const file = files.filter(f => ['video/mp4','video/webm'].includes(f.file_type) && f.width >= 960 && f.width <= 1920 && f.height < f.width).sort((a,b) => a.width - b.width)[0];
    const source = trusted(kind === 'video' ? file?.link : item.src?.large2x, kind === 'video' ? ['videos.pexels.com'] : ['images.pexels.com']);
    const author = kind === 'video' ? item.user?.name : item.photographer;
    if (!page || !thumb || !source || typeof author !== 'string') return [];
    return [{ page, thumb, source, author: author.slice(0,120), name: typeof item.alt === 'string' && item.alt ? item.alt.slice(0,100) : `${kind === 'video' ? 'Video' : 'Photo'} by ${author.slice(0,70)}` }];
  });
}
async function download(source, limit) {
  const response = await fetch(source, { credentials:'omit', referrerPolicy:'no-referrer', redirect:'error', signal:AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('The wallpaper could not be downloaded. Try another result.');
  if (Number(response.headers.get('content-length')) > limit) throw new Error('This wallpaper is too large. Choose another result.');
  const reader = response.body.getReader(), chunks = []; let size = 0;
  try { while (true) { const {done,value} = await reader.read(); if (done) break; size += value.length; if (size > limit) { await reader.cancel(); throw new Error('This wallpaper is too large. Choose another result.'); } chunks.push(value); } } finally { reader.releaseLock(); }
  return new Blob(chunks,{type:response.headers.get('content-type')?.split(';')[0] || ''});
}
/** Opt-in background selection for ONEFLOW's productivity dashboard. */
export function render(container) {
  const key = el('input',{type:'password',autocomplete:'off',maxlength:200,value:get().integrations.pexelsKey || ''});
  sessionGet('pexels-key').then(value => { if (value && !key.value) key.value = value; }).catch(() => {});
  const query = el('input',{type:'search',required:true,maxlength:100,value:'nature landscape'});
  const kind = select([['photo','Photos'],['video','Videos']],'photo',() => {});
  const status = el('p',{class:'muted',role:'status','aria-live':'polite'}), results = el('div',{class:'background-grid pexels-results'});
  const search = el('button',{type:'submit'},'Search Pexels'); let epoch = 0;
  const form = el('form',{class:'stack',onsubmit:act(async event => {
    event.preventDefault(); const term = query.value.trim(), apiKey = key.value.trim();
    if (!apiKey || !term) { status.textContent = 'Save your Pexels API key and enter a search first.'; return; }
    const ticket = ++epoch; search.disabled = true; results.replaceChildren(); status.textContent = 'Searching Pexels…';
    try {
      if (globalThis.chrome?.permissions && !await chrome.permissions.request({origins})) throw new Error('Pexels website access was not granted. Local wallpapers still work.');
      if (ticket !== epoch || !container.isConnected) return;
      if (!globalThis.chrome?.runtime?.id) throw new Error('Pexels search needs the installed extension. Load ONEFLOW unpacked in Chrome or Edge, then open a new tab.');
      const type = kind.value;
      let response;
      try { response = await chrome.runtime.sendMessage({target:'worker',type:'pexels-search',query:term,kind:type}); }
      catch { throw new Error('ONEFLOW needs a reload. Reload it on the Extensions page, then close this tab and open a new tab.'); }
      if (!response?.ok) throw new Error(response?.error || 'Reload ONEFLOW in Extensions and reopen this tab to enable Pexels search.');
      const items = mediaItems(response.data,type); if (ticket !== epoch || !container.isConnected) return;
      status.textContent = items.length ? `${items.length} ${type === 'video' ? 'videos' : 'photos'} found. Select one to save offline.` : 'No compatible results. Try a different search.';
      for (const item of items) {
        const use = el('button',{type:'button',onclick:act(async () => {
          use.disabled = true;
          try {
            const video = type === 'video', store = video ? 'wallpapers' : 'images';
            const blob = await download(item.source,(video ? 16 : 8)*1024*1024);
            if (video) { if (!['video/mp4','video/webm'].includes(blob.type)) throw new Error('This result is not a supported video.'); await validateVideo(blob); }
            else { const bitmap = await decodeRaster(blob); bitmap.close(); }
            if (ticket !== epoch || !container.isConnected) return;
            await navigator.locks.request('oneflow-backup',async () => {
              if ((await getAll(store)).length >= (video ? 2 : 8)) throw new Error(video ? 'Your two-video library is full. Remove a video first.' : 'Your eight-photo library is full. Remove a photo first.');
              const id = uid(); await put(store,{id,name:item.name,blob,createdAt:Date.now(),pexels:{author:item.author,page:item.page}});
              await update(d => { Object.assign(d.settings.background,{kind:video ? 'video' : 'upload',id,rotate:false}); });
            });
            status.textContent = 'Saved offline and applied.'; emit('toast','Pexels wallpaper saved offline.');
          } catch(error) { status.textContent = error.message || 'Download failed. Check your connection.'; } finally { use.disabled = false; }
        })},type === 'video' ? 'Use video wallpaper' : 'Use photo wallpaper');
        results.append(el('article',{class:'pexels-result stack'},el('img',{src:item.thumb,alt:item.name,loading:'lazy',referrerpolicy:'no-referrer'}),el('a',{href:item.page,target:'_blank',rel:'noreferrer'},`${item.author} · Pexels`),use));
      }
    } catch(error) { if (ticket === epoch) status.textContent = error.message || 'Search failed. Check your connection.'; } finally { search.disabled = false; }
  })},field('Wallpaper media',kind),field('Search photos or videos',query),search);
  container.append(el('h4',{},'Pexels backgrounds'),el('a',{href:'https://www.pexels.com',target:'_blank',rel:'noreferrer'},'Photos and videos provided by Pexels'),el('p',{class:'muted'},'Search only when you choose. Selected backgrounds are saved locally. Your key stays on this device; ordinary data backups include it.'),field('Pexels API key',key),el('button',{type:'button',onclick:act(async () => { const value=key.value.trim(); if (!value || /[\r\n]/.test(value)) throw new Error('Enter a valid Pexels API key.'); await sessionSet('pexels-key',value); status.textContent='Key available for this browser session only. It is not included in backups.'; })},'Use key for this session'),el('button',{type:'button',onclick:act(async () => { const value = key.value.trim(); if (!value || /[\r\n]/.test(value)) { status.textContent = 'Enter a valid Pexels API key.'; return; } await sessionSet('pexels-key',null); await update(d => { d.integrations.pexelsKey = value; }); status.textContent = 'API key saved on this device.'; })},'Save Pexels key'),el('a',{href:'https://www.pexels.com/api/',target:'_blank',rel:'noreferrer'},'Get your Pexels API key'),form,status,results,el('button',{type:'button',onclick:act(async () => { ++epoch; await sessionSet('pexels-key',null); await update(d => { d.integrations.pexelsKey = ''; }); key.value = ''; results.replaceChildren(); if (globalThis.chrome?.permissions) await chrome.permissions.remove({origins}); status.textContent = 'Pexels disconnected. Saved wallpapers still work offline.'; })},'Disconnect Pexels'));
}
export function init() {}
export function destroy() {}

