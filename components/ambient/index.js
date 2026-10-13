import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { emit } from '../../core/events.js';
import { act, button, icon, openPanel, closePanel } from '../../core/ui.js';
import { backgroundSync } from '../../core/timer-client.js';
import { backgroundCatalog, backgroundSource } from '../../core/background-presentation.js';

let root, sceneLabel, mixLabel, status, play, volume, mute, immersiveButton, abort, idle;
let catalog = [], visible = false, immersive = false, rememberedVolume = .5;
const soundLabels = { rain: 'Rain', forest: 'Forest', cafe: 'Café', fireplace: 'Fireplace', ocean: 'Ocean', white: 'White noise', brown: 'Brown noise' };

async function syncAudio() {
  if (globalThis.chrome?.runtime?.id) await backgroundSync();
  else await (await import('../sounds/index.js')).syncAudio();
}
async function changeAudio(change) { await update(data => change(data.audio)); await syncAudio(); }

function wake() {
  clearTimeout(idle);
  delete document.documentElement.dataset.ambientQuiet;
  if (!visible || !immersive) return;
  idle = setTimeout(() => {
    if (document.querySelector('dialog[open],#home-menu[open]') || document.activeElement?.closest('button,a,input,select,summary')) return;
    document.documentElement.dataset.ambientQuiet = 'true';
  }, 4000);
}
function setImmersive(value) {
  immersive = value;
  immersiveButton.setAttribute('aria-pressed', String(value));
  immersiveButton.title = value ? 'Leave immersive mode' : 'Fade controls when idle';
  wake();
}

/** Choose bundled scenery without changing audio or the running session. */
async function scenes() {
  const content = el('div', { class: 'ambient-scene-picker stack' });
  const draw = async () => {
    content.replaceChildren(el('p', { role: 'status' }, 'Loading your scenery…'));
    try {
      const items = await backgroundCatalog();
      if (!content.isConnected) return;
      catalog = items;
      const grid = el('div', { class: 'ambient-scene-grid' });
      for (const item of items) grid.append(el('button', {
        type: 'button', class: 'ambient-scene-choice', 'aria-pressed': String(get().settings.background.kind === 'bundled' && get().settings.background.id === item.id),
        onclick: act(async () => {
          await update(data => { data.settings.background.kind = 'bundled'; data.settings.background.id = item.id; });
          closePanel(); wake();
        })
      }, el('img', { src: backgroundSource(item, true), alt: '', loading: 'lazy' }), el('span', {}, item.name)));
      content.replaceChildren(el('p', { class: 'muted' }, 'Choose a backdrop. Your sounds and session keep their current settings.'), grid,
        el('button', { type: 'button', onclick: () => emit('settings:open', 'backgrounds') }, 'Uploads & wallpaper settings'));
    } catch (error) {
      if (content.isConnected) content.replaceChildren(el('p', { role: 'alert' }, 'Scenery could not load. Your current background is still available.'), el('button', { type: 'button', onclick: draw }, 'Try again'));
    }
  };
  openPanel('Choose a scene', 'ambient-scenes', content);
  await draw();
}

/** Mount Ambient controls only after this view is opened. */
export function init() {
  if (root) return;
  abort = new AbortController();
  const home = el('button', { type: 'button', class: 'ambient-home', onclick: () => emit('dashboard:view', 'home') }, icon('arrow-left'), 'Back to Home');
  sceneLabel = el('span', {}, 'Choose scenery');
  const scene = el('button', { type: 'button', class: 'ambient-scene', 'aria-label': 'Choose Ambient scene', 'aria-haspopup': 'dialog', onclick: act(scenes) }, icon('image'), sceneLabel, icon('chevron-down'));
  mixLabel = el('strong'); status = el('small');
  const mixer = el('button', { type: 'button', class: 'ambient-mix', 'aria-label': 'Open sound mixer', 'aria-haspopup': 'dialog', onclick: act(async () => (await import('../../core/features.js')).openFeature('sounds')) }, icon('audio-lines'), el('span', {}, mixLabel, status));
  play = button('Play ambient sounds', 'play', act(async () => {
    if (!Object.values(get().audio.volumes).some(value => value > 0)) { await (await import('../../core/features.js')).openFeature('sounds'); return; }
    const playing = get().audio.playing;
    try { await changeAudio(audio => { audio.playing = !playing; audio.sleepAt = null; }); }
    catch (error) { await update(data => { data.audio.playing = false; }); throw error; }
  }));
  mute = button('Mute ambient sounds', 'volume-2', act(() => changeAudio(audio => {
    if (audio.master > 0) { rememberedVolume = audio.master; audio.master = 0; }
    else audio.master = rememberedVolume;
  })));
  volume = el('input', { type: 'range', min: 0, max: 100, step: 1, 'aria-label': 'Ambient volume',
    oninput: event => volume.setAttribute('aria-valuetext', `${event.target.value}%`),
    onchange: act(event => { const level = Number(event.target.value) / 100; return changeAudio(audio => { audio.master = level; }); })
  });
  const audio = el('div', { class: 'ambient-audio', role: 'group', 'aria-label': 'Ambient sounds' }, mixer, play, mute, volume);
  immersiveButton = el('button', { type: 'button', class: 'ambient-immersive', 'aria-label': 'Immersive', 'aria-pressed': 'false', onclick: event => {
    setImmersive(!immersive);
    // Pointer users can enjoy the fade; keyboard focus always keeps controls visible.
    if (event.detail > 0) event.currentTarget.blur();
  } }, icon('maximize'), el('span', {}, 'Immersive'));
  root = el('section', { class: 'ambient-interface', 'aria-label': 'Ambient controls', hidden: true }, home, scene, audio, immersiveButton);
  document.body.append(root);
  for (const event of ['pointermove', 'pointerdown', 'keydown', 'focusin', 'focusout', 'toggle', 'visibilitychange']) document.addEventListener(event, wake, { signal: abort.signal, passive: true, capture: true });
  document.addEventListener('keydown', event => {
    if (visible && event.key === 'Escape' && immersive && !event.defaultPrevented && !document.querySelector('dialog[open],#home-menu[open]')) setImmersive(false);
  }, { signal: abort.signal });
  backgroundCatalog().then(items => { catalog = items; render(visible); }).catch(() => {});
}

/** Reflect saved scenery and audio without restarting playback. @param {boolean} active */
export function render(active) {
  if (!root) return;
  if (visible !== active) { visible = active; if (!active) setImmersive(false); else wake(); }
  root.hidden = !active;
  if (!active) return;
  const data = get(), background = data.settings.background, audio = data.audio;
  sceneLabel.textContent = background.kind === 'bundled' ? catalog.find(item => item.id === background.id)?.name || 'Choose scenery' : background.kind === 'solid' ? 'Quiet canvas' : 'Your scenery';
  const names = Object.entries(audio.volumes).filter(([, level]) => level > 0).map(([name]) => soundLabels[name] || name);
  mixLabel.textContent = names.join(' + ') || 'Choose sounds';
  status.textContent = audio.playing ? audio.master === 0 ? 'Muted' : 'Playing' : 'Paused';
  const label = audio.playing ? 'Pause ambient sounds' : 'Play ambient sounds';
  play.setAttribute('aria-label', label); play.title = label; play.replaceChildren(icon(audio.playing ? 'pause' : 'play'));
  mute.setAttribute('aria-label', audio.master === 0 ? 'Unmute ambient sounds' : 'Mute ambient sounds');
  mute.replaceChildren(icon(audio.master === 0 ? 'volume-x' : 'volume-2'));
  if (document.activeElement !== volume) volume.value = String(Math.round(audio.master * 100));
  volume.setAttribute('aria-valuetext', `${volume.value}%`);
  root.querySelector('.ambient-audio').hidden = !data.settings.widgets.sounds;
  document.documentElement.dataset.ambientAudio = String(data.settings.widgets.sounds);
}

/** Release controls, idle timeout and listeners. */
export function destroy() { clearTimeout(idle); abort?.abort(); root?.remove(); root = null; visible = immersive = false; delete document.documentElement.dataset.ambientQuiet; delete document.documentElement.dataset.ambientAudio; }
