import { t as translate, setLanguage, translateShell } from '../core/i18n.js';
import { init, get } from '../core/storage.js';
const target = location.hash.slice(1);
const send = async type => {
  const result = await chrome.runtime.sendMessage({
    target: 'worker',
    type,
    url: target
  });
  if (!result?.ok) throw new Error(result?.error || translate('m0614'));
  return result;
};
async function begin() {
  if (top !== self) throw new Error('Open the blocked page directly to change website access.');
  await init();
  setLanguage(get().settings.language);
  translateShell();
  const url = new URL(target);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error(translate('m0615'));
  document.querySelector('#host').textContent = url.hostname;
  document.querySelector('#override').onclick = async () => {
    try {
      const result = await send('override');
      if (result.allowed) location.replace(url.href);
    } catch (error) {
      document.querySelector('#error').textContent = error.message;
    }
  };
  const result = await send('blocked');
  if (result.allowed) {
    document.querySelector('#message').textContent = translate('m0616');
    document.querySelector('#override').textContent = translate('m0617');
  }
}
document.querySelector('#back').onclick = () => location.replace(chrome.runtime.getURL('newtab/index.html'));
begin().catch(error => {
  document.querySelector('#error').textContent = error.message;
  document.querySelector('#override').disabled = true;
});
