import { validatePersonalization } from './personalization-schema.js';
export const SETTINGS_VERSION = 2;
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const color = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const number = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
const time = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function contrast(first, second) {
  const luminance = hex => { const values=hex.slice(1).match(/../g).map(value=>{const n=parseInt(value,16)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return values[0]*.2126+values[1]*.7152+values[2]*.0722; };
  const a=luminance(first),b=luminance(second);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
const fail = path => { throw new Error(`Invalid customization setting: ${path}.`); };
/** Reject unknown keys recursively; arrays use an explicit record schema below. */
export function knownKeys(value, template, path = 'settings') {
  if (!object(value)) fail(path);
  for (const key of Object.keys(template)) if (!Object.hasOwn(value,key)) fail(`${path}.${key}`);
  for (const key of Object.keys(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key) || !Object.hasOwn(template, key)) throw new Error(`Unknown customization field: ${path}.${key}.`);
    if (object(template[key]) && Object.keys(template[key]).length) knownKeys(value[key], template[key], `${path}.${key}`);
  }
}
export function validatePalette(palette) {
  knownKeys(palette, { background: '', surface: '', text: '', muted: '', border: '' }, 'palette');
  if (!['background','surface','text','muted','border'].every(key => color(palette[key]))) fail('palette');
}
/** Validate the complete Stage 1 object before preview or persistence. */
export function validateSettings(value, defaults) {
  knownKeys(value, defaults);
  if (value.schemaVersion !== SETTINGS_VERSION) fail('schemaVersion');
  const t = value.theme, b = value.background, a = value.accessibility;
  if (!['light','dark','auto','scheduled'].includes(t.mode) || !color(t.accent) || typeof t.paletteEnabled !== 'boolean' || typeof t.preset !== 'string' || t.preset.length > 80) fail('theme');
  validatePalette(t.palette);
  if (t.paletteEnabled && ['text','muted'].some(key => ['surface','background'].some(surface => contrast(t.palette[key],t.palette[surface]) < 4.5))) throw new Error('Text and muted colors must have at least 4.5:1 contrast against the background and surface.');
  if (!time(t.schedule.light) || !time(t.schedule.dark) || t.schedule.light === t.schedule.dark) fail('theme.schedule');
  if (!number(t.glass.blur,0,40) || !number(t.glass.opacity,80,100) || !number(t.glass.border,0,80) || !number(t.glass.shadow,0,90)) fail('theme.glass');
  if (!number(t.shape.radius,0,36) || !number(t.shape.borderThickness,0,3)) fail('theme.shape');
  if (!['system','atkinson','opendyslexic','mono'].includes(t.typography.family) || !number(t.typography.scale,.85,1.5) || !number(t.typography.weight,300,700) || !number(t.typography.lineHeight,1.3,2)) fail('theme.typography');
  if (!Array.isArray(t.customThemes) || t.customThemes.length > 20) fail('theme.customThemes');
  for (const saved of t.customThemes) {
    knownKeys(saved, { name:'',mode:'',accent:'',palette:defaults.theme.palette }, 'theme.customThemes');
    if (typeof saved.name !== 'string' || !saved.name.trim() || saved.name.length > 60 || !['dark','light'].includes(saved.mode) || !color(saved.accent)) fail('theme.customThemes');
    validatePalette(saved.palette);
  }
  if (new Set(t.customThemes.map(item => item.name)).size !== t.customThemes.length) fail('theme.customThemes');
  if (!['bundled','solid','gradient','animated-gradient','url','upload','animated','video','local-video'].includes(b.kind) || typeof b.id !== 'string' || b.id.length > 100 || !color(b.color) || !number(b.blur,0,20) || typeof b.rotate !== 'boolean') fail('background');
  if (!['compact','comfortable','spacious'].includes(value.layout.density)) fail('layout.density');
  if (!Object.keys(defaults.widgets).filter(key=>key!=='preferences').every(key => typeof value.widgets[key] === 'boolean')) fail('widgets');
  if (typeof value.behavior.zen !== 'boolean' || typeof value.behavior.clock24 !== 'boolean' || !['home','focus','ambient'].includes(value.behavior.startupView)) fail('behavior');
  if (!['highContrast','reduceMotion','largeText','dyslexia'].every(key => typeof a[key] === 'boolean')) fail('accessibility');
  return validatePersonalization(value);
}
/** Version zero carried the same sections without a version marker. */
export function migrateSettings(value, defaults) {
  if (!object(value)) fail('settings');
  if (value.schemaVersion === undefined || value.schemaVersion === 0 || value.schemaVersion === 1) {
    const merge=(base,old)=>object(base)&&object(old)?Object.fromEntries([...new Set([...Object.keys(base),...Object.keys(old)])].map(key=>[key,Object.hasOwn(old,key)?merge(base[key],old[key]):structuredClone(base[key])])):structuredClone(old);
    value=merge(defaults,value);value.schemaVersion=SETTINGS_VERSION;
  }
  return validateSettings(value, defaults);
}
export function resolveTheme(theme, systemDark, date = new Date()) {
  if (theme.mode === 'auto') return systemDark ? 'dark' : 'light';
  if (theme.mode !== 'scheduled') return theme.mode;
  const minutes = value => Number(value.slice(0,2)) * 60 + Number(value.slice(3));
  const current = date.getHours() * 60 + date.getMinutes(), light = minutes(theme.schedule.light), dark = minutes(theme.schedule.dark);
  return (light < dark ? current >= light && current < dark : current >= light || current < dark) ? 'light' : 'dark';
}
