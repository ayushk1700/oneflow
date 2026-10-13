import { tabs } from '../panel-design/index.js';
import { connectYouTube } from './youtube-player.js';
import { searchSongs } from './youtube-search.js';
import { backgroundSync } from '../../core/timer-client.js';
import { emit } from '../../core/events.js';
import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { resumePanel, openPanel, field, act, icon, isPanel } from '../../core/ui.js';
/** Only construct known provider song or playlist URLs, never arbitrary iframe content. */
export function embedURL(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const spotify = url.hostname === 'open.spotify.com' && url.pathname.match(/^\/(?:embed\/)?playlist\/([A-Za-z0-9]{10,80})\/?$/);
    if (spotify) return { provider: translate('m0273'), url: `https://open.spotify.com/embed/playlist/${spotify[1]}` };
    const hosts = ['www.youtube.com','youtube.com','music.youtube.com','www.youtube-nocookie.com','youtu.be'];
    if (!hosts.includes(url.hostname)) return null;
    const video = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.pathname.startsWith('/embed/') ? url.pathname.slice(7) : url.searchParams.get('v');
    const list = url.searchParams.get('list');
    if (video && /^[A-Za-z0-9_-]{11}$/.test(video)) return { provider: 'YouTube', kind: 'song', url: `https://www.youtube-nocookie.com/embed/${video}?playsinline=1&controls=1&rel=0${/^[A-Za-z0-9_-]{10,100}$/.test(list || '') ? `&list=${encodeURIComponent(list)}` : ''}` };
    if (['/playlist','/watch','/embed/videoseries'].includes(url.pathname) && /^[A-Za-z0-9_-]{10,100}$/.test(list || '')) return { provider: 'YouTube', kind: 'playlist', url: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}&playsinline=1&controls=1` };
  } catch { /* Invalid input is handled by the form. */ }
  return null;
}
let root, stopPlayback, cancelSearch;
const stamp = seconds => `${Math.floor(Math.max(0,seconds) / 60)}:${String(Math.floor(Math.max(0,seconds) % 60)).padStart(2,'0')}`;
/** Build local controls, enabling them only after the player handshake. */
function playbackControls(frame, title, playlist) {
  const status = el('p', { role:'status', class:'muted' }, 'Connecting to YouTube…');
  const play = el('button', { type:'button', class:'primary', disabled:true }, 'Play');
  const previous = el('button', { type:'button', disabled:true }, 'Previous');
  const next = el('button', { type:'button', disabled:true }, 'Next');
  const volume = el('input', { type:'range', min:0, max:100, value:50, disabled:true, 'aria-label':'YouTube volume' });
  const seek = el('input', { type:'range', min:0, max:0, value:0, disabled:true, 'aria-label':'YouTube playback position' });
  const time = el('span', { class:'muted' }, '0:00 / 0:00');
  let state = -1, duration = 0;
  const bridge = connectYouTube(frame, info => {
    if (info.ready) { play.disabled = volume.disabled = false; previous.disabled = next.disabled = !playlist; status.textContent = 'Ready. Press Play to listen.'; }
    if (Number.isFinite(info.playerState)) { state = info.playerState; play.textContent = state === 1 ? 'Pause' : 'Play'; status.textContent = ({1:'Playing',2:'Paused',3:'Buffering…',0:'Finished',5:'Ready to play'})[state] || 'Ready'; }
    if (Number.isFinite(info.duration) && info.duration >= 0) { duration = info.duration; seek.max = duration; seek.disabled = duration === 0; }
    if (Number.isFinite(info.currentTime) && info.currentTime >= 0) { if (document.activeElement !== seek) seek.value = Math.min(duration,info.currentTime); time.textContent = `${stamp(info.currentTime)} / ${stamp(duration)}`; }
    if (Number.isFinite(info.volume)) volume.value = Math.max(0,Math.min(100,info.volume));
    if (typeof info.videoData?.title === 'string' && info.videoData.title) title.textContent = info.videoData.title.slice(0,300);
    if (info.error !== undefined || info.unavailable) { for (const node of [play,previous,next,volume,seek]) node.disabled = true; status.textContent = info.unavailable ? 'Custom controls could not connect. Try the YouTube player controls or open the provider link.' : `YouTube cannot play this item (code ${info.error}). Open the provider link or choose another song.`; }
    if (info.blocked) status.textContent = 'Playback was blocked by the browser. Press Play in the YouTube player.';
  });
  play.onclick = () => bridge.command(state === 1 ? 'pauseVideo' : 'playVideo');
  previous.onclick = () => bridge.command('previousVideo'); next.onclick = () => bridge.command('nextVideo');
  volume.oninput = () => bridge.command('setVolume',[Number(volume.value)]);
  seek.onchange = () => bridge.command('seekTo',[Number(seek.value),true]);
  return { root:el('section',{class:'youtube-controls stack','aria-label':'ONEFLOW YouTube controls'},el('div',{class:'row wrap'},previous,play,next),field('Playback position',seek),time,field('Volume',volume),status),destroy:bridge.destroy };
}
export function render() { open(); }
export function open() {
  if (resumePanel('music')) return;
  const input = el('input', { type:'url', value:get().music.url, required:true, placeholder:'Paste a YouTube song or playlist link…', 'aria-label':'Song or playlist URL' });
  const player = el('div',{class:'music-player'}), title = el('h3',{class:'music-title'},'Your soundtrack.');
  let controller, disposed = false, loadVersion = 0;
  const stop = () => { loadVersion++; controller?.destroy(); controller = null; player.replaceChildren();form.querySelector('button').classList.add('primary'); };
  stopPlayback = stop;
  async function load(source, name) {
    const submitted = source.trim(), embed = embedURL(submitted);
    if (!embed) throw new Error('Use a YouTube song or playlist link, or a Spotify playlist.');
    const version = ++loadVersion;
    await update(d => { d.music.url = submitted; });
    if (version !== loadVersion || disposed || !isPanel('music') || !player.isConnected) return;
    root.querySelector('[role=tab]')?.click();stop(); form.querySelector('button').classList.remove('primary');input.value = submitted; title.textContent = name || `${embed.provider} ${embed.kind || 'playlist'}`;
    const url = new URL(embed.url);
    if (embed.provider === 'YouTube') { url.searchParams.set('enablejsapi','1'); url.searchParams.set('origin',location.origin); }
    const frame = el('iframe',{src:url.href,title:`${embed.provider} player`,allow:'autoplay; encrypted-media; fullscreen; picture-in-picture',referrerpolicy:'strict-origin-when-cross-origin',sandbox:'allow-scripts allow-same-origin allow-presentation allow-popups',width:'100%',height:'352'});
    player.append(frame);
    if (embed.provider === 'YouTube') { controller = playbackControls(frame,title,embed.kind === 'playlist' || url.searchParams.has('list')); player.append(controller.root); }
    player.append(el('a',{href:submitted,target:'_blank',rel:'noopener noreferrer'},'Open in provider ↗'));
  }
  const form = el('form',{class:'stack music-connect',onsubmit:act(event=>{event.preventDefault();return load(input.value);})},field('Song or playlist URL',input),el('small',{class:'muted'},'Loading connects to the selected provider. Playback stops when you leave Music.'),el('button',{type:'submit',class:'primary'},'Load song or playlist'));
  const query = el('input',{type:'search',required:true,maxlength:200,placeholder:'Song, artist or mood…','aria-label':'Search songs'});
  const key = el('input',{type:'password',value:get().music.youtubeKey || '',maxlength:200,autocomplete:'off','aria-label':'YouTube Data API key'});
  const keyStatus = el('small',{class:'muted',role:'status'});
  const credentials = el('details',{},el('summary',{},'YouTube API key & search connection'),field('YouTube Data API key',key),el('small',{class:'muted'},'Your key stays on this device and is included in exported backups. Search sends your query and key to Google.'),el('button',{type:'button',onclick:act(async()=>{await update(d=>{d.music.youtubeKey=key.value.trim();});keyStatus.textContent='Search key saved on this device.';})},'Save search key'),el('button',{type:'button',onclick:act(async()=>{cancelSearch?.();key.value='';await update(d=>{delete d.music.youtubeKey;});if(globalThis.chrome?.permissions) await chrome.permissions.remove({origins:['https://www.googleapis.com/*']});keyStatus.textContent='Search connection forgotten.';})},'Forget search connection'),keyStatus);
  const searchStatus = el('p',{role:'status',class:'muted'}), results = el('div',{class:'song-results stack'}), searchButton = el('button',{type:'submit'},'Search songs');
  let searchVersion = 0, request;
  cancelSearch = () => { searchVersion++; request?.abort(); if(searchButton.disabled)searchStatus.textContent='Search paused. Submit again to continue.'; searchButton.disabled = false; };
  const searchForm = el('form',{class:'stack',onsubmit:act(async event=>{
    event.preventDefault(); cancelSearch(); const version = searchVersion, term = query.value, apiKey = key.value.trim();
    if (!apiKey) { searchStatus.textContent = 'Add your YouTube Data API key below. Playback of song links does not require a key.'; credentials.open=true; key.focus(); return; }
    // Request access from this direct user action, never during dashboard startup.
    if (globalThis.chrome?.permissions && !await chrome.permissions.request({origins:['https://www.googleapis.com/*']})) { searchStatus.textContent='Search access was declined. You can still load song links.'; return; }
    if (version !== searchVersion || disposed) return;
    request = new AbortController(); searchButton.disabled=true; searchStatus.textContent='Searching YouTube…'; results.replaceChildren();
    try {
      const rows = await searchSongs(term,apiKey,request.signal);
      if (version !== searchVersion || disposed || !isPanel('music')) return;
      results.replaceChildren(...rows.map(song=>el('button',{class:'song-result',type:'button',onclick:act(()=>load(`https://www.youtube.com/watch?v=${song.id}`,song.title))},el('strong',{},song.title),el('small',{},song.artist))));
      searchStatus.textContent = rows.length ? `${rows.length} songs found. Choose one to load.` : 'No songs found. Try a different search.';
    } catch(error) { if (version === searchVersion && error.name !== 'AbortError') searchStatus.textContent=error.message; }
    finally { if (version === searchVersion) searchButton.disabled=false; }
  })},field('Find a song',query),searchButton,searchStatus,results,credentials);
  const sidebar = el('section',{class:'music-sidebar stack','aria-label':'Find music'},el('p',{class:'eyebrow'},'FIND YOUR SOUND'),searchForm);
  if (get().settings.widgets.sounds) for (const [name,label] of [['rain','Rainfall'],['forest','Forest air'],['ocean','Ocean waves']]) sidebar.append(el('button',{class:'soundscape-choice',onclick:act(async()=>{await update(d=>{for(const sound of Object.keys(d.audio.volumes))d.audio.volumes[sound]=sound === name ? .5 : 0;d.audio.playing=true;});if(globalThis.chrome?.runtime?.id)await backgroundSync();else await(await import('../sounds/index.js')).syncAudio();emit('toast',`${label} playing`);})},icon('audio-lines'),label));
  const disconnect=el('details',{},el('summary',{},'Manage player'),el('button',{type:'button',onclick:act(async()=>{stop();input.value='';title.textContent='Your soundtrack.';form.querySelector('button').classList.add('primary');await update(d=>{d.music.url='';});})},'Disconnect player'));
  const listening=el('section',{class:'music-main'},title,el('p',{class:'music-intro'},'Load a YouTube song or playlist, or a Spotify playlist. Connections begin only when you choose to load or search.'),player,form,disconnect);root=el('div',{class:'music-workspace stack'});tabs(root,[{label:'Listen',content:listening},{label:'Search',content:sidebar}],'music');
  openPanel(translate('m0655'),'music',root,()=>{disposed=true;cancelSearch?.();stop();root=null;},'music',()=>{cancelSearch?.();stop();});
}
export function init() {}
export function destroy() { cancelSearch?.(); stopPlayback?.(); root=null; }
