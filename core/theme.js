import { get } from './storage.js';
import { getRecord } from './db.js';
import { watch } from './ui.js';
import { dayKey } from './utils.js';
import { emit } from './events.js';
const backgrounds = ['alpine', 'cozy', 'lofi', 'minimal', 'dark'];
let unsubscribe, objectURL, revision = 0, lastBackground, dayTimer;
const media = matchMedia('(prefers-color-scheme: dark)');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
/** True when either the system or the explicit preference reduces motion. */
export const reduceMotion = () => get().settings.reducedMotion || motion.matches;
/** Apply color, font, motion, and background preferences. */
export async function render() {
  const { settings: s } = get(), root = document.documentElement;
  root.dataset.theme = s.theme === 'auto' ? (media.matches ? 'dark' : 'light') : s.theme;
  root.dataset.font = s.font; root.dataset.motion = reduceMotion() ? 'reduce' : 'full';
  root.style.setProperty('--accent', s.accent);
  // Accent text uses a contrast-safe ink independent of the selected theme.
  const rgb = s.accent.match(/\w\w/g).map(x => { const c = parseInt(x, 16) / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
  root.style.setProperty('--accent-ink', rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? '#101815' : '#ffffff');
  root.style.setProperty('--background-blur', `${s.background.blur}px`);
  const key = JSON.stringify(s.background) + dayKey();
  if (key === lastBackground) return;
  lastBackground = key;
  const version = ++revision, b = s.background, hero = document.querySelector('#landscape');
  let source = null, name = 'Your own little world';
  if (b.kind === 'bundled') {
    const index = Math.floor(new Date(`${dayKey()}T12:00:00`).getTime() / 86400000) % backgrounds.length;
    const id = b.rotate ? backgrounds[index] : (backgrounds.includes(b.id) ? b.id : 'alpine');
    source = `../assets/backgrounds/${id}.webp`;
    name = { alpine: 'The quiet Alps', cozy: 'Golden hour', lofi: 'After the rain', minimal: 'Soft horizons', dark: 'Blue hour' }[id];
  } else if (b.kind === 'upload') {
    const record = await getRecord('images', b.id);
    if (version !== revision) return;
    if (record?.blob) source = URL.createObjectURL(record.blob);
    else { source = '../assets/backgrounds/alpine.webp'; emit('toast', 'Uploaded background is missing. Showing the quiet Alps.'); }
  }
  if (version !== revision) return;
  if (objectURL) URL.revokeObjectURL(objectURL);
  objectURL = source?.startsWith('blob:') ? source : null;
  hero.style.backgroundColor = b.color;
  if (source) {
    if (source.startsWith('../assets/backgrounds/')) hero.style.backgroundImage = `url("${source.replace('.webp', '-thumb.webp')}")`;
    hero.classList.add('bg-loading');
    const image = new Image(); image.src = source;
    image.decode().then(() => {
      if (version !== revision) return;
      hero.style.backgroundImage = `url("${source}")`; hero.classList.remove('bg-loading');
    }).catch(() => { if (version === revision) { hero.classList.remove('bg-loading'); emit('toast', 'This background could not be decoded. Choose another in Scenery.'); } });
  } else {
    hero.classList.remove('bg-loading');
    hero.style.backgroundImage = b.kind === 'gradient' ? `linear-gradient(145deg, ${b.color}, #172f31 65%, #766553)` : 'none';
  }
  document.querySelector('#landscape-name').textContent = name;
}
export function init() {
  unsubscribe = watch(d => d.settings, () => render().catch(error => emit('error', error)));
  media.addEventListener('change', render); motion.addEventListener('change', render);
  dayTimer = setInterval(() => render().catch(error => emit('error', error)), 60000);
  return render();
}
export function destroy() { unsubscribe?.(); clearInterval(dayTimer); media.removeEventListener('change', render); motion.removeEventListener('change', render); if (objectURL) URL.revokeObjectURL(objectURL); }
