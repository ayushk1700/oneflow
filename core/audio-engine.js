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
    this.master.gain.setTargetAtTime(config.master, this.context.currentTime, .08); clearTimeout(this.sleep);
    if (config.sleepAt) this.sleep = setTimeout(() => { this.stop(); onSleep(); }, Math.max(0, config.sleepAt - Date.now()));
    for (const name of SOUND_NAMES) {
      const volume = config.playing ? config.volumes[name] : 0;
      if (!volume) { const layer = this.layers.get(name); if (layer) { layer.source.stop(); layer.gain.disconnect(); this.layers.delete(name); } continue; }
      if (!this.buffers.has(name)) {
        const response = await fetch(new URL(`../assets/sounds/${name}.wav`, import.meta.url));
        if (!response.ok) throw new Error(`The bundled ${name} sound could not load.`);
        this.buffers.set(name, await this.context.decodeAudioData(await response.arrayBuffer()));
      }
      if (epoch !== this.epoch) return;
      if (!this.layers.has(name)) {
        const source = this.context.createBufferSource(), gain = this.context.createGain(); source.buffer = this.buffers.get(name); source.loop = true; source.connect(gain); gain.connect(this.master); gain.gain.value = 0; source.start(); this.layers.set(name, { source, gain });
      }
      this.layers.get(name).gain.gain.setTargetAtTime(volume, this.context.currentTime, .08);
    }
  }
  stop() { this.epoch++; clearTimeout(this.sleep); for (const { source, gain } of this.layers.values()) { source.stop(); gain.disconnect(); } this.layers.clear(); }
  async chime() {
    await this.ready();
    for (const [index, frequency] of [523.25, 659.25, 783.99].entries()) {
      const oscillator = this.context.createOscillator(), gain = this.context.createGain(), start = this.context.currentTime + index * .15;
      oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.045, start + .03); gain.gain.exponentialRampToValueAtTime(.001, start + 1.3);
      oscillator.connect(gain); gain.connect(this.context.destination); oscillator.start(start); oscillator.stop(start + 1.4); oscillator.onended = () => gain.disconnect();
    }
  }
}
