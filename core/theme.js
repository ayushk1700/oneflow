import { t as translate } from './i18n.js';
import { get } from './storage.js';
import { getRecord } from './db.js';
import { watch } from './ui.js';
import { dayKey, el } from './utils.js';
import { emit } from './events.js';
import { backgroundCatalog, backgroundPresentation, backgroundSource } from './background-presentation.js';
let unsubscribe, objectURL, revision = 0, lastBackground, dayTimer, artwork;
let live;
const media = matchMedia('(prefers-color-scheme: dark)');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
/** True when either the system or the explicit preference reduces motion. */
export const reduceMotion = () => get().settings.reducedMotion || motion.matches;
function shade(settings = get().settings) {
  const root = document.documentElement, data = get(), style = backgroundPresentation(artwork, settings.contrast === 'strong');
  root.dataset.shading = Object.keys(data.layout).length ? 'balanced' : 'directional';
  for (const key of ['left','mobile','flow','all']) root.style.setProperty('--shade-' + key, style[key]);
  // A central text zone must remain legible even on an unknown white upload.
  // The slider controls a local text veil, not a full-screen gray filter.
  root.style.setProperty('--home-shade', settings.contrast === 'strong' ? .85 : Math.max(style.all, (settings.appearance.overlay - 20) / 100));
  root.style.setProperty('--background-position', style.position);
  root.style.setProperty('--background-mobile-position', style.mobilePosition);
}
function validPhotoURL(value, host) {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === host && !url.username && !url.password; } catch { return false; }
}
function loadImage(hero, source, preview, fallback, version) {
  const placeholder = el('div', { class: 'landscape-preview', 'aria-hidden': 'true' });
  placeholder.style.backgroundImage = `url("${preview}")`;
  hero.replaceChildren(placeholder); hero.style.backgroundImage = `url("${preview}")`;
  hero.classList.add('bg-loading'); hero.classList.remove('background-fallback'); hero.dataset.load = 'loading';
  const image = new Image(); image.className = 'landscape-image'; image.alt = ''; image.setAttribute('aria-hidden', 'true'); image.decoding = 'async'; image.src = source;
  // Decoding never delays Home becoming usable. The thumbnail stays underneath the fade.
  image.decode().then(() => {
    if (version !== revision) return;
    hero.style.backgroundImage = `url("${source}")`; hero.append(image); hero.classList.remove('bg-loading'); hero.dataset.load = 'ready';
    requestAnimationFrame(() => { if (version === revision && image.isConnected) image.classList.add('is-visible'); });
  }).catch(() => {
    if (version !== revision) return;
    if (fallback && source !== fallback) { loadImage(hero, fallback, preview, null, version); return; }
    hero.classList.remove('bg-loading'); hero.classList.add('background-fallback'); hero.dataset.load = 'fallback'; emit('toast', translate('m0118'));
  });
}
/** Apply color, font, motion, and scene-aware background preferences. */
export async function render(override) {
  const s = override?.background ? override : get().settings, root = document.documentElement;
  const canvas = s.background.kind === 'solid' && /^#(?:ffffff|000000)$/i.test(s.background.color) ? s.background.color.toLowerCase() === '#ffffff' ? 'white' : 'black' : 'photo';
  root.dataset.canvas = canvas;
  root.dataset.theme = canvas === 'white' ? 'light' : canvas === 'black' ? 'dark' : s.theme === 'auto' ? (media.matches ? 'dark' : 'light') : s.theme;
  root.dataset.font = s.font; root.dataset.contrast = s.contrast; root.dataset.motion = s.reducedMotion || motion.matches ? 'reduce' : 'full';
  root.style.setProperty('--accent', s.accent);
  const rgb = s.accent.match(/\w\w/g).map(x => { const c = parseInt(x, 16) / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
  root.style.setProperty('--accent-ink', rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? 'var(--color-black)' : 'var(--color-white)');
  root.style.setProperty('--accent-shade', rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? 'var(--color-white)' : 'var(--color-black)');
  root.style.setProperty('--background-blur', `${s.background.blur}px`); shade(s);
  const a = s.appearance;
  for (const [key,value] of Object.entries({ 'clock-size':a.clockSize + 'px','clock-weight':a.clockWeight,'panel-alpha':a.panelOpacity / 100,'user-shade':a.overlay / 100,'motion-speed':a.motionSpeed + 's' })) root.style.setProperty('--' + key,value);
  root.dataset.brand = String(a.showBrand); root.dataset.date = String(a.showDate); root.dataset.caption = String(a.showCaption);
  root.dataset.live = s.background.kind === 'animated' ? s.background.id : 'off'; live?.sync(reduceMotion());
  document.dispatchEvent(new Event('oneflow:theme'));
  const key = JSON.stringify(s.background) + dayKey() + navigator.onLine;
  if (key === lastBackground) return;
  lastBackground = key;
  const version = ++revision, b = s.background, hero = document.querySelector('#landscape');
  live?.destroy();
  document.querySelector('#photo-attribution')?.replaceChildren();
  if (b.kind === 'video' || b.kind === 'local-video') { artwork = undefined; shade(s); root.dataset.background = b.kind; if (objectURL) URL.revokeObjectURL(objectURL); objectURL = null; live = await import('./live-wallpaper.js'); if (version !== revision) return; await live.render(hero,b.id,() => version === revision,() => reduceMotion(),b.kind === 'local-video'); if (version === revision) document.querySelector('#landscape-name').textContent = 'Your live wallpaper'; return; }
  let source, preview, fallback, ownedURL, name = translate(canvas === 'white' ? 'Pure white' : canvas === 'black' ? 'Pure black' : 'm0109');
  artwork = undefined; shade(s);
  const attribution = document.querySelector('#photo-attribution'); attribution?.replaceChildren();
  if (b.kind === 'bundled') {
    const items = await backgroundCatalog().catch(() => [{id:'alpine',name:'The quiet Alps',file:'alpine.webp',thumbnail:'alpine-thumb.webp'}]);
    if (version !== revision) return;
    const index = Math.floor(new Date(`${dayKey()}T12:00:00`).getTime() / 86400000) % items.length;
    artwork = b.rotate ? items[index] : items.find(item => item.id === b.id) || items[0];
    source = backgroundSource(artwork); preview = backgroundSource(artwork,true); name = translate(artwork.name);
  } else if (b.kind === 'upload') {
    const record = await getRecord('images', b.id);
    if (version !== revision) return;
    if (record?.blob) {
      ownedURL = URL.createObjectURL(record.blob); source = preview = ownedURL; name = record.name || translate('m0641');
      if (record.pexels) { const credit = await import('./pexels-credit.js'); if (version !== revision) { URL.revokeObjectURL(ownedURL); return; } credit.credit(record); }
      if (record.unsplash && validPhotoURL(record.unsplash.url, 'images.unsplash.com') && validPhotoURL(record.unsplash.profile, 'unsplash.com')) {
        fallback = source;
        // Legacy selections stay local after retiring the online provider.
        attribution?.append(translate('m0115'), el('a', { href: record.unsplash.profile, target: '_blank', rel: 'noreferrer' }, record.unsplash.author), ' on ', el('a', { href: 'https://unsplash.com/?utm_source=oneflow&utm_medium=referral', target: '_blank', rel: 'noreferrer' }, translate('m0116')));
      }
    } else { source = '../wallpaper/alpine.webp'; preview = source.replace('.webp', '-thumb.webp'); name = translate('m0110'); emit('toast', translate('m0117')); }
  }
  if (version !== revision) { if (ownedURL) URL.revokeObjectURL(ownedURL); return; }
  if (objectURL) URL.revokeObjectURL(objectURL); objectURL = ownedURL;
  shade(s); root.dataset.background = artwork?.id || b.kind; hero.style.backgroundColor = b.color;
  if (source) loadImage(hero, source, preview, fallback, version);
  else { hero.replaceChildren(); hero.classList.remove('bg-loading','background-fallback'); hero.dataset.load = 'ready'; hero.style.backgroundImage = b.kind === 'gradient' ? `linear-gradient(145deg, ${b.color}, var(--gradient-middle) 65%, var(--gradient-end))` : 'none'; }
  document.querySelector('#landscape-name').textContent = name;
  if (b.kind === 'animated') document.querySelector('#landscape-name').textContent = { aurora:'Aurora glow',dusk:'Rose dusk',ocean:'Ocean drift',ember:'Warm embers' }[b.id] || 'Animated atmosphere';
}
export function init() {
  unsubscribe = watch(d => [d.settings, d.layout], () => render().catch(error => emit('error', error)));
  media.addEventListener('change', render); motion.addEventListener('change', render);
  addEventListener('online', render); addEventListener('offline', render);
  document.addEventListener('visibilitychange',visibility);
  dayTimer = setInterval(() => render().catch(error => emit('error', error)), 60000);
  return render();
}
export function destroy() {
  live?.destroy(); document.removeEventListener('visibilitychange',visibility);
  revision++; unsubscribe?.(); clearInterval(dayTimer); media.removeEventListener('change', render); motion.removeEventListener('change', render); removeEventListener('online', render); removeEventListener('offline', render);
  if (objectURL) URL.revokeObjectURL(objectURL); objectURL = undefined; lastBackground = undefined; document.querySelector('#landscape')?.replaceChildren();
}
function visibility() { document.documentElement.dataset.visible = String(!document.hidden); live?.sync(reduceMotion()); }
