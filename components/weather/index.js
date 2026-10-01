import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { openPanel, field, icon, watch, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
let root, unsubscribe, refreshTimer, busy = false, alive = false;
const origins = ['https://api.open-meteo.com/*', 'https://geocoding-api.open-meteo.com/*'];
const locationKey = loc => `${loc.latitude.toFixed(3)},${loc.longitude.toFixed(3)}`;
function description(code) { if (code === 0) return 'Clear skies'; if (code < 4) return 'Partly cloudy'; if (code < 50) return 'Misty'; if (code < 70) return 'Rain'; if (code < 80) return 'Snow'; if (code < 90) return 'Showers'; return 'Thunderstorms'; }
async function requestPermission(geolocation = false) {
  if (!globalThis.chrome?.permissions) return true;
  return chrome.permissions.request({ origins, ...(geolocation ? { permissions: ['geolocation'] } : {}) });
}
async function fetchJSON(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Weather service is unavailable. Please try again later.');
  return response.json();
}
export function render() {
  const { weather, settings } = get(), cache = weather.cache, loc = weather.location;
  const valid = cache && loc && cache.key === locationKey(loc);
  const temperature = valid ? Math.round(settings.units === 'fahrenheit' ? cache.temperature * 9 / 5 + 32 : cache.temperature) : null;
  root.replaceChildren(el('button', { class: 'weather-summary', onclick: open, 'aria-label': valid ? `${temperature} degrees, ${description(cache.code)}, ${loc.name}. Weather settings` : 'Set up local weather' }, icon(valid && cache.code > 2 ? 'cloud' : 'sun', 24), el('span', {}, valid ? `${temperature}°` : 'Weather', el('small', {}, valid ? `${loc.name}${Date.now() - cache.at > 1800000 ? ' · cached' : ''}` : 'Choose your city'))));
}
export async function refresh(force = false) {
  const { location: loc, cache } = get().weather;
  if (!alive || !loc || busy || (!force && cache?.key === locationKey(loc) && Date.now() - cache.at < 1800000)) return;
  if (globalThis.chrome?.permissions && !await chrome.permissions.contains({ origins })) return;
  busy = true;
  try {
    const data = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`);
    if (!Number.isFinite(data.current?.temperature_2m) || !Number.isFinite(data.current?.weather_code)) throw new Error('Weather response was incomplete.');
    await update(d => { if (d.weather.location && locationKey(d.weather.location) === locationKey(loc)) d.weather.cache = { temperature: data.current.temperature_2m, code: data.current.weather_code, at: Date.now(), key: locationKey(loc) }; });
  } catch (error) { if (force) emit('toast', `${error.message} ${cache ? 'Showing saved weather.' : 'Your dashboard still works offline.'}`); }
  finally { busy = false; if (alive) render(); }
}
export function open() {
  const content = el('div', { class: 'stack' }), results = el('div', { class: 'stack', 'aria-live': 'polite' });
  const city = el('input', { type: 'search', required: true, minlength: 2, maxlength: 100, placeholder: 'Search for a city', 'aria-label': 'City name' });
  const search = el('button', { type: 'submit', class: 'primary' }, 'Find city');
  const choose = async location => { await update(d => { d.weather.location = location; d.weather.cache = null; }); results.replaceChildren(el('p', {}, `Selected ${location.name}.`)); await refresh(true); };
  const form = el('form', { class: 'stack', onsubmit: act(async event => {
    event.preventDefault(); const permission = requestPermission(); search.disabled = true;
    try {
      if (!await permission) throw new Error('Weather access was not granted. You can try again anytime.');
      const data = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.value.trim())}&count=5&language=en&format=json`);
      const cities = (data.results || []).filter(x => Number.isFinite(x.latitude) && Number.isFinite(x.longitude));
      results.replaceChildren(...(cities.length ? cities.map(x => el('button', { type: 'button', onclick: act(() => choose({ name: `${x.name}, ${x.country || x.admin1 || ''}`.slice(0, 200), latitude: x.latitude, longitude: x.longitude })) }, `${x.name} · ${x.admin1 || ''} ${x.country || ''}`)) : [el('p', {}, 'No cities found. Try a nearby town.')]));
    } finally { search.disabled = false; }
  }) }, field('Your city', city), search);
  content.append(el('p', { class: 'muted' }, 'A small window to the world outside. City search and coordinates are sent to Open-Meteo only when weather is enabled. No account needed.'), form,
    el('button', { type: 'button', onclick: act(async () => {
      if (!await requestPermission(true)) throw new Error('Location access was not granted. You can search by city instead.');
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('Location unavailable. Search by city instead.')), { timeout: 10000, maximumAge: 1800000 }));
      await choose({ name: 'Your location', latitude: Math.round(position.coords.latitude * 100) / 100, longitude: Math.round(position.coords.longitude * 100) / 100 });
    }) }, 'Use my location'), results);
  const cache = get().weather.cache;
  if (cache) content.append(el('p', { class: 'muted' }, `Last updated ${new Date(cache.at).toLocaleString()}. Saved weather is available offline.`));
  if (get().weather.location) content.append(el('button', { onclick: act(async () => { await update(d => { d.weather = { location: null, cache: null }; }); if (globalThis.chrome?.permissions) await chrome.permissions.remove({ origins, permissions: ['geolocation'] }); open(); }) }, 'Forget location & remove access'));
  content.append(el('a', { href: 'https://open-meteo.com/', target: '_blank', rel: 'noreferrer', class: 'muted' }, 'Weather data by Open-Meteo · CC BY 4.0'));
  openPanel('A little forecast', 'weather', content);
}
export function init(node) { alive = true; root = node; render(); unsubscribe = watch(d => [d.weather, d.settings.units], render); refresh(); refreshTimer = setInterval(() => refresh(), 60000); }
export function destroy() { alive = false; unsubscribe?.(); clearInterval(refreshTimer); root?.replaceChildren(); }
