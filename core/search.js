/** Search using the browser's chosen provider without saving the query.
 * @param {string} text @param {'CURRENT_TAB'|'NEW_TAB'} disposition
 * @param {object} api Browser API, injectable for tests.
 */
export async function searchWeb(text, disposition = 'CURRENT_TAB', api = globalThis.chrome) {
  const query = String(text).trim();
  (await import('./privacy.js')).assertFeature('webSearch');
  if (!query) throw new Error('Enter something to search for.');
  if (query.length > 1000) throw new Error('Keep your search under 1,000 characters.');
  const preferences=(await import('./storage.js')).get().settings.customization?.widgets?.preferences?.search;
  if(preferences){const destination=(await import('./personal-search.js')).searchDestination(query,preferences);if(destination){if(disposition==='NEW_TAB'&&api?.tabs?.create)await api.tabs.create({url:destination});else if(globalThis.location)location.assign(destination);else return destination;return;}}
  if (!api?.search?.query) throw new Error('Browser search is available in the installed extension. Use your address bar to search in this preview.');
  await api.search.query({ text: query, disposition });
}
