import * as settings from './customization.js';
import { resolveTheme } from './customization-schema.js';
const root = () => document.documentElement;
const system = matchMedia('(prefers-color-scheme: dark)');
let off, timer, applying = false;
const owned = new Set(), sizes = new Map(), spacing = new Map();
const variable = (name, value) => { root().style.setProperty(name, value); owned.add(name); };
/** Resolve validated preferences into the existing token roles. */
export function apply() {
  if (applying || !settings.get()) return;
  applying = true;
  try {
    for (const name of owned) root().style.removeProperty(name); owned.clear();
    const value = settings.get(), theme = value.theme, a = value.accessibility, base = settings.defaults();
    root().dataset.theme = resolveTheme(theme, system.matches);
    root().dataset.notesTheme=root().dataset.theme;
    root().dataset.density = value.layout.density; root().dataset.zen = String(value.behavior.zen);
    root().dataset.contrast = a.highContrast ? 'strong' : 'normal';
    root().dataset.motion = a.reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'full';
    root().dataset.visible = String(!document.hidden);
    variable('--foundation-border', 'var(--border-strong)');
    variable('--roundness', theme.shape.radius / 24); variable('--stroke', `${theme.shape.borderThickness}px`);
    variable('--panel-alpha', theme.glass.opacity / 100);
    if (theme.glass.blur !== base.theme.glass.blur) { variable('--glass-blur', `${theme.glass.blur}px`); variable('--studio-blur', `${theme.glass.blur}px`); }
    if (theme.glass.border !== base.theme.glass.border) variable('--border-subtle', `color-mix(in srgb, var(--foundation-border) ${theme.glass.border}%, transparent)`);
    if (theme.glass.shadow !== base.theme.glass.shadow) for (const name of ['--elevation-card','--elevation-modal']) variable(name, `0 var(--space-sm) var(--space-xl) rgb(var(--shadow-rgb) / ${theme.glass.shadow / 100})`);
    if (a.highContrast) {
      const dark = root().dataset.theme === 'dark';
      for (const name of ['--bg','--surface-1','--surface-2','--surface-3']) variable(name, dark ? 'var(--color-black)' : 'var(--color-white)');
      for (const name of ['--text-primary','--text-secondary','--border-subtle','--border-strong']) variable(name, dark ? 'var(--color-white)' : 'var(--color-black)');
    }
    const family = a.dyslexia ? 'opendyslexic' : theme.typography.family;
    variable('--font-ui', `var(--font-${family === 'mono' ? 'mono' : family === 'system' ? 'system' : family})`);
    variable('--font', 'var(--font-ui)'); variable('--leading-body', theme.typography.lineHeight); variable('--weight-regular', theme.typography.weight);
    const notesFont=theme.widgetFonts?.notes;if(document.title.includes('Notes')&&notesFont&&notesFont!=='inherit')variable('--notes-font',`var(--font-${notesFont})`);
    const scale = theme.typography.scale * (a.largeText ? 1.2 : 1);
    for (const [name, size] of sizes) variable(name, `${size * scale}px`);
    const density = { compact:.85, comfortable:1, spacious:1.15 }[value.layout.density];
    if (density !== 1) for (const [name,size] of spacing) variable(name, `${size * density}px`);
  } finally { applying = false; }
}
/** Load once; heavy settings code stays off the default startup path. */
export async function init({dashboard=true}={}) {
  if (off) return;
  await settings.init();
  if (off) return;
  const style = getComputedStyle(root());
  for (const name of ['--text-small','--text-body','--text-title','--text-label','--text-input','--text-subheading','--text-brand']) {
    const size = parseFloat(style.getPropertyValue(name)); if (Number.isFinite(size)) sizes.set(name, size);
  }
  for (const name of ['--space-xs','--space-sm','--space-md','--space-lg','--space-xl','--space-2xl','--space-3xl']) {
    const size = parseFloat(style.getPropertyValue(name)); if (Number.isFinite(size)) spacing.set(name,size);
  }
  off = settings.subscribe(apply); system.addEventListener('change', apply);
  document.addEventListener('oneflow:theme', apply); document.addEventListener('visibilitychange', visibility);
  addEventListener('pagehide', save); timer = setInterval(() => { if (!document.hidden) apply(); }, 60000); apply();
  if(dashboard)await (await import('./personalization-runtime.js')).init();
}
function visibility() { root().dataset.visible = String(!document.hidden); if (!document.hidden) apply(); else save(); }
function save() { settings.flush().catch(() => {}); }
export function destroy() { off?.(); off = null; clearInterval(timer); system.removeEventListener('change', apply); document.removeEventListener('oneflow:theme', apply); document.removeEventListener('visibilitychange', visibility); removeEventListener('pagehide', save); for (const name of owned) root().style.removeProperty(name); owned.clear(); }
