import { readLatest, sessionGet } from '../core/storage.js';
import { readJSON } from '../core/network.js';
import {assertFeature} from '../core/privacy.js';
/** Fixed provider request; never accept arbitrary URLs or keys through messages. */
export async function searchPexels({query,kind}) {
  assertFeature('pexels');
  if (typeof query !== 'string' || !query.trim() || query.length > 100 || !['photo','video'].includes(kind)) throw new Error('Enter a wallpaper search up to 100 characters.');
  if (!await chrome.permissions.contains({origins:['https://api.pexels.com/*']})) throw new Error('Pexels website access is missing. Reload ONEFLOW in Extensions, reopen the tab and allow access when searching.');
  const key = (await sessionGet('pexels-key') || (await readLatest()).integrations.pexelsKey)?.trim();
  if (!key) throw new Error('Save your Pexels API key first.');
  const path = kind === 'video' ? 'v1/videos/search' : 'v1/search';
  let response;
  try { response = await fetch(`https://api.pexels.com/${path}?query=${encodeURIComponent(query.trim())}&orientation=landscape&per_page=6`,{headers:{Authorization:key},credentials:'omit',redirect:'error',signal:AbortSignal.timeout(20000)}); }
  catch(error) { throw new Error(error.name === 'TimeoutError' ? 'Pexels took too long to respond. Try searching again.' : 'Cannot reach Pexels. Check your internet connection and whether a VPN, firewall or privacy extension blocks api.pexels.com. Reload ONEFLOW in Extensions and reopen this tab if you recently updated it.'); }
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Pexels did not accept the key. Copy the API key from your Pexels API dashboard, without Bearer or quotation marks.' : response.status === 429 ? 'Pexels rate limit reached. Try again later.' : `Pexels is unavailable (HTTP ${response.status}). Try again later.`);
  try { return await readJSON(response); } catch { throw new Error('Pexels returned an unexpected or oversized response. Try again later.'); }
}
