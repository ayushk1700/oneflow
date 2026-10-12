import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { openPanel, field, icon, watch, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
let root, unsubscribe, refreshTimer, busy = false, alive = false;
const origins = ['https://api.open-meteo.com/*', 'https://geocoding-api.open-meteo.com/*'];
const locationKey = loc => `${loc.latitude.toFixed(3)},${loc.longitude.toFixed(3)}`;
function description(code) { if (code === 0) return translate('m0552'); if (code < 4) return translate('m0553'); if (code < 50) return translate('m0554'); if (code < 70) return translate('m0555'); if (code < 80) return translate('m0556'); if (code < 90) return translate('m0557'); return translate('m0558'); }
async function requestPermission(geolocation = false) {
  if (!globalThis.chrome?.permissions) return true;
  return chrome.permissions.request({ origins, ...(geolocation ? { permissions: ['geolocation'] } : {}) });
}
async function fetchJSON(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error(translate('m0559'));
  return response.json();
}
export function render() {
  const { weather, settings } = get(), cache = weather.cache, loc = weather.location;
  const valid = cache && loc && cache.key === locationKey(loc);
  const temperature = valid ? Math.round(settings.units === 'fahrenheit' ? cache.temperature * 9 / 5 + 32 : cache.temperature) : null;
  root.replaceChildren(el('button', { class: 'weather-summary', onclick: open, 'aria-label': valid ? translate('m0560', {p0: temperature, p1: description(cache.code), p2: loc.name}) : translate('m0561') }, icon(valid && cache.code > 2 ? 'cloud' : 'sun', 24), el('span', {}, valid ? `${temperature}°` : translate('m0302'), el('small', {}, valid ? `${loc.name}${Date.now() - cache.at > 1800000 ? ' · cached' : ''}` : translate('m0562')))));
}
export async function refresh(force = false) {
  const { location: loc, cache } = get().weather;
  if (!alive || !loc || busy || (!force && cache?.key === locationKey(loc) && Date.now() - cache.at < 1800000)) return;
  if (globalThis.chrome?.permissions && !await chrome.permissions.contains({ origins })) return;
  busy = true;
  try {
    const data = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`);
    if (!Number.isFinite(data.current?.temperature_2m) || !Number.isFinite(data.current?.weather_code)) throw new Error(translate('m0563'));
    await update(d => { if (d.weather.location && locationKey(d.weather.location) === locationKey(loc)) d.weather.cache = { temperature: data.current.temperature_2m, code: data.current.weather_code, at: Date.now(), key: locationKey(loc) }; });
  } catch (error) { if (force) emit('toast', `${error.message} ${cache ? translate('m0564') : translate('m0565')}`); }
  finally { busy = false; if (alive) render(); }
}
export function open() {
  const content = el('div', { class: 'stack' }), results = el('div', { class: 'stack', 'aria-live': 'polite' });
  const city = el('input', { type: 'search', required: true, minlength: 2, maxlength: 100, placeholder: translate('m0566'), 'aria-label': translate('m0567') });
  const search = el('button', { type: 'submit', class: 'primary' }, translate('m0568'));
  const choose = async location => { await update(d => { d.weather.location = location; d.weather.cache = null; }); results.replaceChildren(el('p', {}, translate('m0569', {p0: location.name}))); await refresh(true); };
  const form = el('form', { class: 'stack', onsubmit: act(async event => {
    event.preventDefault(); const permission = requestPermission(); search.disabled = true;
    try {
      if (!await permission) throw new Error(translate('m0570'));
      const data = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.value.trim())}&count=5&language=en&format=json`);
      const cities = (data.results || []).filter(x => Number.isFinite(x.latitude) && Number.isFinite(x.longitude));
      results.replaceChildren(...(cities.length ? cities.map(x => el('button', { type: 'button', onclick: act(() => choose({ name: `${x.name}, ${x.country || x.admin1 || ''}`.slice(0, 200), latitude: x.latitude, longitude: x.longitude })) }, `${x.name} · ${x.admin1 || ''} ${x.country || ''}`)) : [el('p', {}, translate('m0571'))]));
    } finally { search.disabled = false; }
  }) }, field(translate('m0572'), city), search);
  content.append(el('p', { class: 'muted' }, translate('m0573')), form,
    el('button', { type: 'button', onclick: act(async () => {
      if (!await requestPermission(true)) throw new Error(translate('m0574'));
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error(translate('m0575'))), { timeout: 10000, maximumAge: 1800000 }));
      await choose({ name: translate('m0576'), latitude: Math.round(position.coords.latitude * 100) / 100, longitude: Math.round(position.coords.longitude * 100) / 100 });
    }) }, translate('m0577')), results);
  const cache = get().weather.cache;
  if (cache) content.append(el('p', { class: 'muted' }, translate('m0578', {p0: new Date(cache.at).toLocaleString()})));
  if (get().weather.location) content.append(el('button', { onclick: act(async () => { await update(d => { d.weather = { location: null, cache: null }; }); if (globalThis.chrome?.permissions) await chrome.permissions.remove({ origins, permissions: ['geolocation'] }); open(); }) }, translate('m0579')));
  content.append(el('a', { href: 'https://open-meteo.com/', target: '_blank', rel: 'noreferrer', class: 'muted' }, translate('m0580')));
  openPanel(translate('m0673'), 'weather', content);
}
export function init(node) { alive = true; root = node; render(); unsubscribe = watch(d => [d.weather, d.settings.units], render); refresh(); refreshTimer = setInterval(() => refresh(), 60000); }
export function destroy() { alive = false; unsubscribe?.(); clearInterval(refreshTimer); root?.replaceChildren(); }
