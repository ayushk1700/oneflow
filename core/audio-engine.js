import { t as translate } from './i18n.js';
import { SOUND_NAMES } from './stage2-schema.js';
/** Shared by the offscreen owner and the ordinary-browser preview. */
export class SoundEngine {
  constructor() { this.context = null; this.master = null; this.layers = new Map(); this.buffers = new Map(); this.epoch = 0; this.sleep = null; }
  async ready() {
    if (!this.context) { this.context = new AudioContext(); this.master = this.context.createGain(); this.master.connect(this.context.destination); }
    await this.context.resume();
  }
  async mix(config, onSleep = () => {}) {
    const epoch = ++this.epoch; await this.ready();
    const fade = Math.max(.03,Math.min(10,config.fade || .24) / 3);
    this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(config.master, this.context.currentTime, fade); clearTimeout(this.sleep);
    if(config.sleepAt){const duration=Math.max(0,(config.sleepAt-Date.now())/1000),end=this.context.currentTime+duration,start=this.context.currentTime+Math.max(0,duration-10);this.master.gain.setValueAtTime(config.master,start);this.master.gain.linearRampToValueAtTime(0,end);}
    if (config.sleepAt) this.sleep = setTimeout(() => { this.stop(); onSleep(); }, Math.max(0, config.sleepAt - Date.now()));
    for (const name of SOUND_NAMES) {
      const volume = config.playing ? config.volumes[name] : 0;
      if (!volume) { const layer = this.layers.get(name); if (layer && !layer.stopping) { layer.gain.gain.setTargetAtTime(0,this.context.currentTime,fade); layer.stopping=setTimeout(()=>{layer.source.stop();layer.gain.disconnect();this.layers.delete(name);},fade*3000); } continue; }
      if (!this.buffers.has(name)) {
        const response = await fetch(new URL(`../assets/sounds/${name}.wav`, import.meta.url));
        if (!response.ok) throw new Error(translate('m0001', {p0: name}));
        this.buffers.set(name, await this.context.decodeAudioData(await response.arrayBuffer()));
      }
      if (epoch !== this.epoch) return;
      if (!this.layers.has(name)) {
        const source = this.context.createBufferSource(), gain = this.context.createGain(); source.buffer = this.buffers.get(name); source.loop = true; source.connect(gain); gain.connect(this.master); gain.gain.value = 0; source.start(); this.layers.set(name, { source, gain });
      }
      const layer = this.layers.get(name); clearTimeout(layer.stopping); layer.stopping=null; layer.gain.gain.setTargetAtTime(volume, this.context.currentTime, fade);
    }
  }
  stop() { this.epoch++; clearTimeout(this.sleep); for (const { source, gain, stopping } of this.layers.values()) { clearTimeout(stopping); source.stop(); gain.disconnect(); } this.layers.clear(); }
  async chime(options = {}) {
    if (options.sound === 'none' || options.volume === 0) return;
    await this.ready();
    const notes = options.sound === 'bell' ? [880] : options.sound === 'soft' ? [392,523.25] : [523.25,659.25,783.99];
    for (const [index, frequency] of notes.entries()) {
      const oscillator = this.context.createOscillator(), gain = this.context.createGain(), start = this.context.currentTime + index * .15;
      oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.045 * (options.volume ?? 50) / 50, start + .03); gain.gain.exponentialRampToValueAtTime(.001, start + 1.3);
      oscillator.connect(gain); gain.connect(this.context.destination); oscillator.start(start); oscillator.stop(start + 1.4); oscillator.onended = () => gain.disconnect();
    }
  }
}
