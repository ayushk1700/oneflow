# Stage 2 permissions and network use

| Permission | Required? | Reason and trigger |
| --- | --- | --- |
| `storage` | Yes | Local settings/tasks and small browser-synced preferences. No browsing history is read. |
| `alarms` | Yes | Timestamp-based timer phase completion, minute badge refresh, opt-in daily habit reminders, and audio sleep stop. Alarms are re-created after worker/browser restarts. |
| `notifications` | Yes | Timer phase notices (can be disabled in timer settings) and habit reminders configured by the user. Browser/OS notification settings can suppress display. |
| `offscreen` | Yes | One local AUDIO_PLAYBACK document owns the requested sound mix and optional chime, allowing sound after all dashboard tabs close. It is not created until playback or a chime is requested. It has no remote content. |
| `geolocation` | Optional | Requested only when the user clicks **Use my location** inside weather. Coordinates are rounded to two decimal places before weather lookup. Denial leaves city search available. |
| `https://geocoding-api.open-meteo.com/*` | Optional host | Requested from the user's city-search/location action. City search sends the typed city to Open-Meteo. |
| `https://api.open-meteo.com/*` | Optional host | Requested with weather setup. Sends selected coordinates to Open-Meteo, then refreshes at most once per 30 minutes per active dashboard after cache expiry. |
| `https://api.unsplash.com/*` | Optional host | Requested only from Connect & search photographs. Sends search terms and the user's key to Unsplash, and records required wallpaper-selection download events. |
| `https://images.unsplash.com/*` | Optional host | Requested with Unsplash search. Displays provider thumbnails and hotlinked selected images online; caches the selected image locally for offline use. |

**Forget location & remove access** clears weather data and removes the optional permissions. Disabling the weather widget stops scheduled refreshes; an already-started request may finish. **Delete all data** also revokes weather/location access. No access is requested during onboarding.

No declarativeNetRequest, tabs, history, cookies, downloads, or all-sites host permission is requested. Blocking remains Stage 3. `chrome.tabs.create` only opens the extension page and needs no tabs permission.

All scripts, fonts, icons, bundled illustrations, sounds, prompts and quotes load locally. The statistics library is locally vendored. No analytics or telemetry is present. Music iframes load only after **Connect & load playlist**, with a network/privacy explanation. CSP allows frames only from `open.spotify.com` and `www.youtube-nocookie.com`; their embedded documents use provider media services and their own cookies/policies. No remote iframe API script is injected into the extension. Closing the panel removes the iframe.

Unsplash keys are stored only in local settings, never browser sync. The full, unencrypted JSON backup includes the key and private journal content; the backup screen explicitly says so. Online selected photos use the API-provided URL and show links crediting both photographer and Unsplash. Offline photos use the cached blob. Disconnect clears the key, revokes optional hosts, and returns to a bundled scene.

Browser-managed settings sync contains only name, theme, accent, and widget toggles. Tasks, photos, journal entries, notes, moods, sessions and access keys are not synced. Search/quick links navigate only on user action. No location is requested during onboarding.

API references: [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [offscreen audio](https://developer.chrome.com/docs/extensions/reference/api/offscreen), [Unsplash requirements](https://unsplash.com/documentation), [Spotify embeds](https://developer.spotify.com/documentation/embeds).
