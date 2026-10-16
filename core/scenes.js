import { t as translate } from './i18n.js';
import { get, update } from './storage.js';
import { freshTimer } from './timer-logic.js';
import { getRecord } from './db.js';
let builtins;
/** Capture only preferences that a scene is allowed to change. */
export function snapshot(d = get()) {
  const {
    theme,
    accent,
    font,
    background,
    widgets,
    contrast
  } = d.settings;
  return structuredClone({
    settings: {
      theme,
      accent,
      font,
      background,
      widgets,
      contrast,
      appearance: d.settings.appearance,
      journal: d.settings.journal,
      studio: { ...d.settings.studio, automation: undefined }
    },
    timerConfig: d.timerConfig,
    audio: d.audio,
    layout: d.layout
  });
}
/** Apply a validated snapshot while retaining personal records and active deadlines. */
export function applySnapshot(d, value) {
  for (const key of ['theme', 'accent', 'font', 'background', 'widgets']) d.settings[key] = structuredClone(value.settings[key]);
  if(!['dark','light'].includes(d.settings.theme))d.settings.theme=d.settings.customization?.theme?.mode==='light'?'light':'dark';
  if(d.settings.customization){d.settings.customization.theme.mode=d.settings.theme;d.settings.customization.theme.paletteEnabled=false;}
  d.settings.contrast = value.settings.contrast || 'normal';
  for (const key of ['appearance','journal']) if (value.settings[key]) d.settings[key] = structuredClone(value.settings[key]);
  if (value.settings.studio) d.settings.studio = { ...structuredClone(value.settings.studio), automation: d.settings.studio.automation };
  d.timerConfig = structuredClone(value.timerConfig);
  d.audio = {
    ...structuredClone(value.audio),
    sleepAt: null
  };
  d.layout = structuredClone(value.layout);
  if (d.timer.status === 'idle') d.timer = freshTimer(d.timerConfig);
}
export async function catalog() {
  if (!builtins) {
    const response = await fetch(new URL('../data/scenes.json', import.meta.url));
    if (!response.ok) throw new Error(translate('m0051'));
    builtins = await response.json();
  }
  return [...builtins, ...get().scenes];
}
export async function sceneById(id) {
  const scene = (await catalog()).find(x => x.id === id);
  if (!scene) throw new Error(translate('m0052'));
  const value = structuredClone(scene.snapshot);
  if (value.settings.background.kind === 'upload' && !(await getRecord('images', value.settings.background.id))) throw new Error(translate('m0053'));
  if (value.settings.background.kind === 'video' && !(await getRecord('wallpapers',value.settings.background.id))) throw new Error('The scene’s local video wallpaper is missing.');
  return value;
}
export async function applyScene(id) {
  const value = await sceneById(id);
  await update(d => {
    if (d.flow.active) throw new Error(translate('m0054'));
    d.sceneUndo = snapshot(d);
    applySnapshot(d, value);
    d.sceneId = id;
    d.settings.studio.automation.pausedUntil = Date.now() + 2 * 3600000;
  });
}
export async function undoScene() {
  await update(d => {
    if (d.flow.active) throw new Error(translate('m0055'));
    if (d.sceneUndo) {
      applySnapshot(d, d.sceneUndo);
      d.sceneUndo = null;
    }
  });
}
