import { get, update } from '../../core/storage.js';
import { put, getAll } from '../../core/db.js';
import { el, uid } from '../../core/utils.js';
import { field, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
const origins = ['https://api.unsplash.com/*','https://images.unsplash.com/*'];
const trusted = (value, host) => { try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === host && !url.username && !url.password ? url : null; } catch { return null; } };
async function api(path) {
  const url = trusted(path, 'api.unsplash.com'); if (!url) throw new Error('Invalid Unsplash API address.');
  const key = get().integrations.unsplashKey.trim(); if (!key) throw new Error('Save your own Unsplash access key first.');
  const response = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' }, credentials: 'omit', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(response.status === 401 ? 'Unsplash did not accept this access key.' : response.status === 403 ? 'Unsplash access is limited. Try again later.' : 'Unsplash is unavailable. Your local backgrounds still work.');
  return response.json();
}
/** Settings-only, opt-in Unsplash search with attribution and offline cache. */
export function render(container) {
  const key = el('input', { type: 'password', autocomplete: 'off', maxlength: 200, value: get().integrations.unsplashKey, 'aria-label': 'Unsplash access key' });
  const query = el('input', { type: 'search', required: true, maxlength: 100, value: 'calm landscape', 'aria-label': 'Search Unsplash' }), results = el('div', { class: 'background-grid' });
  const form = el('form', { class: 'stack', onsubmit: act(async event => {
    event.preventDefault();
    if (globalThis.chrome?.permissions && !await chrome.permissions.request({ origins })) throw new Error('Unsplash access was not granted.');
    const data = await api(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query.value.trim())}&per_page=6&orientation=landscape`);
    results.replaceChildren();
    for (const photo of data.results || []) {
      const image = trusted(photo.urls?.regular, 'images.unsplash.com'), thumb = trusted(photo.urls?.small, 'images.unsplash.com'), profile = trusted(photo.user?.links?.html, 'unsplash.com'), download = trusted(photo.links?.download_location, 'api.unsplash.com');
      if (!image || !thumb || !profile || !download || typeof photo.user?.name !== 'string') continue;
      profile.searchParams.set('utm_source', 'oneflow'); profile.searchParams.set('utm_medium', 'referral');
      const caption = photo.alt_description || 'Unsplash photograph';
      const card = el('article', { class: 'unsplash-result stack' }, el('img', { src: thumb.href, alt: caption, loading: 'lazy', referrerpolicy: 'no-referrer' }), el('small', {}, 'Photo by ', el('a', { href: profile.href, target: '_blank', rel: 'noreferrer' }, photo.user.name), ' on ', el('a', { href: 'https://unsplash.com/?utm_source=oneflow&utm_medium=referral', target: '_blank', rel: 'noreferrer' }, 'Unsplash')),
        el('button', { onclick: act(async () => {
          if ((await getAll('images')).length >= 8) throw new Error('Keep up to eight photos. Remove one before adding another.');
          const response = await fetch(image, { credentials: 'omit', signal: AbortSignal.timeout(20000) }); if (!response.ok) throw new Error('The photograph could not be cached.');
          const blob = await response.blob(); if (!['image/jpeg','image/png','image/webp'].includes(blob.type) || blob.size > 8 * 1024 * 1024) throw new Error('Choose a smaller photograph.');
          const bitmap = await createImageBitmap(blob); bitmap.close();
          await api(download.href); // Unsplash requires a download event when selecting wallpaper.
          const id = uid(); await put('images', { id, name: caption.slice(0,100), blob, createdAt: Date.now(), unsplash: { url: image.href, author: photo.user.name.slice(0,120), profile: profile.href } });
          await update(d => { Object.assign(d.settings.background, { kind: 'upload', id, rotate: false }); }); emit('toast', 'A new view, with an offline copy saved.');
        }) }, 'Use this photograph'));
      results.append(card);
    }
    if (!results.children.length) results.append(el('p', { class: 'muted' }, 'No photos found. Try another search.'));
  }) }, field('Search Unsplash', query), el('button', { type: 'submit' }, 'Connect & search photographs'));
  container.append(el('hr', { class: 'divider' }), el('h3', {}, 'An optional window to the world'), el('p', { class: 'muted' }, 'Use your own Unsplash access key. Searches connect only when requested. Selected photos load from Unsplash online and keep an offline copy. Attribution stays visible.'), field('Unsplash access key', key), el('button', { onclick: act(async () => { await update(d => { d.integrations.unsplashKey = key.value.trim(); }); emit('toast', 'Access key saved only on this device.'); }) }, 'Save access key'), form, results,
    el('button', { onclick: act(async () => { await update(d => { d.integrations.unsplashKey = ''; if (d.settings.background.kind === 'upload') Object.assign(d.settings.background, { kind: 'bundled', id: 'alpine' }); }); key.value = ''; results.replaceChildren(); if (globalThis.chrome?.permissions) await chrome.permissions.remove({ origins }); emit('toast', 'Unsplash disconnected. Cached photos remain in your library.'); }) }, 'Disconnect Unsplash'));
}
export function init() {}
export function destroy() {}
