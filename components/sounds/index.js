import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { SOUND_NAMES } from '../../core/stage2-schema.js';
import { backgroundSync } from '../../core/timer-client.js';
import { el } from '../../core/utils.js';
import { resumePanel, openPanel, field, select, act, watch, icon } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { tabs } from '../panel-design/index.js';
let preview, off, play, mixer, master, sleepStatus, sleepControl, mixesView, lastMixes;
const labels = { rain: translate('m0439'), cafe: translate('m0667'), fireplace: translate('m0440'), forest: translate('m0441'), ocean: translate('m0442'), white: translate('m0443'), brown: translate('m0444') };
const symbols = { rain: 'cloud-rain', cafe: 'coffee', fireplace: 'flame', forest: 'trees', ocean: 'waves', white: 'cloud', brown: 'leaf' };
async function apply() {
  if (globalThis.chrome?.runtime?.id) return backgroundSync();
  if (!preview) { const { SoundEngine } = await import('../../core/audio-engine.js'); preview = new SoundEngine(); }
  if (get().audio.playing) await preview.mix(get().audio, () => update(d => { d.audio.playing = false; d.audio.sleepAt = null; })); else preview.stop();
}
/** Synchronize a dashboard audio action with the preview or background owner. */
export async function syncAudio() { await apply(); }
function drawMixes(){
  const mixes=get().settings.studio.soundscapes,key=JSON.stringify(mixes);if(!mixesView||key===lastMixes)return;lastMixes=key;
  mixesView.replaceChildren(mixes.length?field('Saved soundscape',select([['','Choose a mix'],...mixes.map(m=>[m.id,m.name])],'',act(async event=>{const mix=get().settings.studio.soundscapes.find(m=>m.id===event.target.value);if(!mix)return;await update(d=>{d.audio.master=mix.master;d.audio.volumes={...mix.volumes};});await apply();render();}))):el('p',{class:'empty-state'},'No saved mixes yet. Save a soundscape in Customize to reuse it here.'),el('button',{type:'button',onclick:act(async()=>{await(await import('../../core/features.js')).openFeature('customizer');})},'Manage soundscapes'));
}
export function render() {
  drawMixes();
  const audio = get().audio;
  if(sleepControl){if(!audio.sleepAt)sleepControl.value='0';else if(sleepControl.value==='0')sleepControl.value='current';}
  if(master&&master!==document.activeElement)master.value=audio.master*100;
  if(sleepStatus)sleepStatus.textContent=audio.sleepAt?`Stops at ${new Date(audio.sleepAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`:'No automatic stop is scheduled.';
  if (play) { play.textContent = audio.playing ? translate('m0445') : translate('m0446'); play.setAttribute('aria-pressed', String(audio.playing)); }
  for (const tile of mixer?.querySelectorAll('[data-sound]') || []) {
    const volume = audio.volumes[tile.dataset.sound];
    tile.dataset.enabled = String(volume > 0);
    tile.querySelector('button').setAttribute('aria-pressed', String(volume > 0));
    const range = tile.querySelector('input');
    if (range !== document.activeElement) range.value = volume * 100;
    tile.querySelector('output').textContent = `${Math.round(volume * 100)}%`;
  }
}
export function open() {
  if (resumePanel('sounds')) return;
  const audio = get().audio, content = el('div', { class: 'stack' });
  content.append(el('p', { class: 'muted sound-intro' }, 'Layer a little calm into your day.'));
  const grid = el('div', { class: 'sound-grid' }); mixer = grid;
  for (const name of SOUND_NAMES) {
    const value = el('output', {}, `${Math.round(audio.volumes[name] * 100)}%`);
    const range = el('input', { type: 'range', min: 0, max: 100, value: audio.volumes[name] * 100, 'aria-label': labels[name], oninput: e => { value.textContent = `${e.target.value}%`; }, onchange: act(async e => { const v = Number(e.target.value) / 100; await update(d => { d.audio.volumes[name] = v; }); await apply(); }) });
    const control = el('button', { class: 'sound-switch grow', 'aria-label': translate('m0448', {p0: labels[name]}), 'aria-pressed': audio.volumes[name] > 0, onclick: act(async () => { await update(d => { d.audio.volumes[name] = d.audio.volumes[name] > 0 ? 0 : .4; }); await apply(); }) }, labels[name]);
    control.prepend(el('span', { class: 'sound-symbol', 'aria-hidden': 'true' }, icon(symbols[name])));
    grid.append(el('div', { class: 'sound-tile', 'data-sound': name }, el('div', { class: 'row' }, control, value), range));
  }
  play = el('button', { class: 'primary', onclick: act(async () => { if (!get().audio.playing && !Object.values(get().audio.volumes).some(v => v > 0)) throw new Error(translate('m0449')); await update(d => { d.audio.playing = !d.audio.playing; }); try { await apply(); } catch (error) { await update(d => { d.audio.playing = false; }); throw error; } render(); }) });
  const transport = el('div', { class: 'row wrap sound-transport' }, play);
  if (get().settings.widgets.music) transport.append(el('button', { type: 'button', onclick: act(async () => { await (await import('../../core/features.js')).openFeature('music'); }) }, 'My music'));
  content.prepend(transport);
  const mixView=el('div',{class:'stack'}),saved=el('div',{class:'stack'}),rest=el('div',{class:'stack'});tabs(content,[{label:'Mixer',content:mixView},{label:'Saved mixes',content:saved},{label:'Sleep',content:rest}],'sounds');
  mixesView=saved;lastMixes=null;
  master=el('input', { type: 'range', min: 0, max: 100, value: audio.master * 100, onchange: act(async e => { await update(d => { d.audio.master = Number(e.target.value) / 100; }); await apply(); }) });mixView.append(field(translate('m0450'),master),grid);
  rest.append(field(translate('m0451'), sleepControl=select([['current','Scheduled stop'],['0',translate('m0452')],['15','15 minutes'],['30','30 minutes'],['60','1 hour'],['120','2 hours']], audio.sleepAt?'current':'0', act(async e => { if(e.target.value==='current')return;const minutes = Number(e.target.value); await update(d => { d.audio.sleepAt = minutes ? Date.now() + minutes * 60000 : null; }); await apply(); emit('toast', minutes ? translate('m0453', {p0: minutes}) : translate('m0454')); }))),
    sleepStatus=el('small', {class:'muted',role:'status'}),
    el('small', { class: 'muted' }, translate('m0456')));
  openPanel(translate('m0457'), 'sounds', content, () => { play = mixer = master = sleepStatus = sleepControl = mixesView = null; }); render();
}
export function init() { off = watch(d => [d.audio,d.settings.studio.soundscapes], render); }
export function destroy() { off?.(); play = mixer = master = sleepStatus = sleepControl = mixesView = null; if (get().audio.playing) update(d => { d.audio.playing = false; }).then(apply).catch(error => emit('error', error)); }
