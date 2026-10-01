import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { openPanel, field, act } from '../../core/ui.js';
/** Only construct known provider playlist URLs, never arbitrary iframe content. */
export function embedURL(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const spotify = url.hostname === 'open.spotify.com' && url.pathname.match(/^\/(?:embed\/)?playlist\/([A-Za-z0-9]{10,80})\/?$/);
    if (spotify) return { provider: 'Spotify', url: `https://open.spotify.com/embed/playlist/${spotify[1]}` };
    const list = url.searchParams.get('list');
    if (['www.youtube.com','youtube.com','www.youtube-nocookie.com'].includes(url.hostname) && /^[A-Za-z0-9_-]{10,100}$/.test(list || '')) return { provider: 'YouTube', url: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}` };
  } catch { /* Invalid input is handled by the form. */ }
  return null;
}
let root;
export function render() { open(); }
export function open() {
  const input = el('input', { type: 'url', value: get().music.url, required: true, placeholder: 'https://open.spotify.com/playlist/…', 'aria-label': 'Playlist URL' }), player = el('div', { class: 'music-player' });
  const form = el('form', { class: 'stack', onsubmit: act(async event => {
    event.preventDefault(); const embed = embedURL(input.value); if (!embed) throw new Error('Use a Spotify or YouTube HTTPS playlist link.');
    await update(d => { d.music.url = input.value; });
    player.replaceChildren(el('iframe', { src: embed.url, title: `${embed.provider} playlist`, loading: 'lazy', allow: 'autoplay; encrypted-media; fullscreen; picture-in-picture', referrerpolicy: 'strict-origin-when-cross-origin', sandbox: 'allow-scripts allow-same-origin allow-presentation allow-popups', width: '100%', height: '352' }), el('p', { class: 'muted' }, 'If playback is unavailable, the provider may require sign-in or restrict this playlist.'), el('a', { href: input.value, target: '_blank', rel: 'noreferrer' }, 'Open playlist on its website'));
  }) }, field('Playlist URL', input), el('p', { class: 'muted' }, 'Loading a player connects to Spotify or YouTube and their media services. Their cookies, account rules, and privacy policies apply. Playback stops when this panel closes.'), el('button', { type: 'submit', class: 'primary' }, 'Connect & load playlist'));
  root = el('div', { class: 'stack' }, form, player, el('button', { onclick: act(async () => { player.replaceChildren(); input.value = ''; await update(d => { d.music.url = ''; }); }) }, 'Disconnect & forget playlist'));
  openPanel('A soundtrack of your own', 'music', root, () => { player.replaceChildren(); root = null; });
}
export function init() {}
export function destroy() { root?.querySelector('iframe')?.remove(); root = null; }
