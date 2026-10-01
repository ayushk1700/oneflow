import { get, update } from '../../core/storage.js';
import { SOUND_NAMES } from '../../core/stage2-schema.js';
import { backgroundSync } from '../../core/timer-client.js';
import { el } from '../../core/utils.js';
import { openPanel, field, select, act, watch } from '../../core/ui.js';
import { emit } from '../../core/events.js';
let preview, off, play;
const labels = { rain: 'Rain on the window', cafe: 'A quiet café', fireplace: 'By the fireplace', forest: 'Forest morning', ocean: 'Along the shore', white: 'White noise', brown: 'Brown noise' };
async function apply() {
  if (globalThis.chrome?.runtime?.id) return backgroundSync();
  if (!preview) { const { SoundEngine } = await import('../../core/audio-engine.js'); preview = new SoundEngine(); }
  if (get().audio.playing) await preview.mix(get().audio, () => update(d => { d.audio.playing = false; d.audio.sleepAt = null; })); else preview.stop();
}
export function render() { if (play) { play.textContent = get().audio.playing ? 'Pause soundscape' : 'Play soundscape'; play.setAttribute('aria-pressed', String(get().audio.playing)); } }
export function open() {
  const audio = get().audio, content = el('div', { class: 'stack' });
  content.append(el('p', { class: 'muted' }, 'Build your own pocket of calm. Original, locally synthesized soundscapes. Mix a little of each.'));
  const grid = el('div', { class: 'sound-grid' });
  for (const name of SOUND_NAMES) {
    const value = el('output', {}, `${Math.round(audio.volumes[name] * 100)}%`);
    const range = el('input', { type: 'range', min: 0, max: 100, value: audio.volumes[name] * 100, 'aria-label': labels[name], oninput: e => { value.textContent = `${e.target.value}%`; }, onchange: act(async e => { const v = Number(e.target.value) / 100; await update(d => { d.audio.volumes[name] = v; }); await apply(); }) });
    grid.append(el('div', { class: 'sound-tile' }, el('div', { class: 'row' }, el('span', { class: 'grow' }, labels[name]), value), range));
  }
  play = el('button', { class: 'primary', onclick: act(async () => { if (!get().audio.playing && !Object.values(get().audio.volumes).some(v => v > 0)) throw new Error('Turn up at least one sound first.'); await update(d => { d.audio.playing = !d.audio.playing; }); try { await apply(); } catch (error) { await update(d => { d.audio.playing = false; }); throw error; } render(); }) });
  content.append(grid, field('Master volume', el('input', { type: 'range', min: 0, max: 100, value: audio.master * 100, onchange: act(async e => { await update(d => { d.audio.master = Number(e.target.value) / 100; }); await apply(); }) })),
    field('Sleep timer', select([['0','Keep playing'],['15','15 minutes'],['30','30 minutes'],['60','1 hour'],['120','2 hours']], '0', act(async e => { const minutes = Number(e.target.value); await update(d => { d.audio.sleepAt = minutes ? Date.now() + minutes * 60000 : null; }); await apply(); emit('toast', minutes ? `Sound will stop in ${minutes} minutes.` : 'Sleep timer cleared.'); }))),
    audio.sleepAt ? el('small', { class: 'muted' }, `Current stop time: ${new Date(audio.sleepAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`) : null,
    play, el('small', { class: 'muted' }, 'In the extension, sound continues after closing a new tab. It stops when the browser closes.'));
  openPanel('Somewhere peaceful', 'sounds', content, () => { play = null; }); render();
}
export function init() { off = watch(d => d.audio, render); }
export function destroy() { off?.(); play = null; if (get().audio.playing) update(d => { d.audio.playing = false; }).then(apply).catch(error => emit('error', error)); }
