/** Search the official YouTube Data API; no key or query is logged. */
export async function searchSongs(query, key, signal) {
  if (!key.trim()) throw new Error('Add your YouTube Data API key to search inside ONEFLOW.');
  if (!query.trim()) return [];
  if (!navigator.onLine) throw new Error('Song search needs an internet connection.');
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.search = new URLSearchParams({ part:'snippet', type:'video', videoEmbeddable:'true', videoCategoryId:'10', maxResults:'10', q:query.trim(), key:key.trim() });
  let response;
  try { response = await fetch(url, { signal, credentials:'omit', referrerPolicy:'no-referrer' }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new Error('YouTube search could not connect. Try again.'); }
  const data = await response.json();
  if (!response.ok) {
    const reason = data.error?.errors?.[0]?.reason;
    throw new Error(reason === 'quotaExceeded' ? 'Your YouTube API search quota is exhausted. Try later.' : response.status === 403 || response.status === 400 ? 'YouTube rejected this key. Check its API access, restrictions and quota.' : 'YouTube search is unavailable. Try again.');
  }
  if (!Array.isArray(data.items)) throw new Error('YouTube returned an unreadable search response. Try again.');
  return data.items.filter(item => /^[A-Za-z0-9_-]{11}$/.test(item.id?.videoId) && typeof item.snippet?.title === 'string').map(item => ({ id:item.id.videoId, title:item.snippet.title.slice(0,300), artist:String(item.snippet.channelTitle || '').slice(0,200) }));
}
