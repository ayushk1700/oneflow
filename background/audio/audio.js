import { SoundEngine } from '../../core/audio-engine.js';
const engine = new SoundEngine();
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.target !== 'audio' || sender.id !== chrome.runtime.id) return false;
  const run = async () => {
    if (message.type === 'mix') await engine.mix(message.config, () => chrome.runtime.sendMessage({ target: 'worker', type: 'audio-slept' }));
    if (message.type === 'stop') engine.stop();
    if (message.type === 'chime') await engine.chime(message.options);
    return { ok: true, state: engine.context?.state, layers: engine.layers.size };
  };
  run().then(respond, error => respond({ ok: false, error: error.message })); return true;
});
