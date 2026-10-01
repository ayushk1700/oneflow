# Stage 1 permissions and network use

| Permission | Required? | Reason and trigger |
| --- | --- | --- |
| `storage` | Yes | Local settings/tasks and small browser-synced preferences. No browsing history is read. |
| `geolocation` | Optional | Requested only when the user clicks **Use my location** inside weather. Coordinates are rounded to two decimal places before weather lookup. Denial leaves city search available. |
| `https://geocoding-api.open-meteo.com/*` | Optional host | Requested from the user's city-search/location action. City search sends the typed city to Open-Meteo. |
| `https://api.open-meteo.com/*` | Optional host | Requested with weather setup. Sends selected coordinates to Open-Meteo, then refreshes at most once per 30 minutes per active dashboard after cache expiry. |

**Forget location & remove access** clears weather data and removes the optional permissions. Disabling the weather widget stops scheduled refreshes; an already-started request may finish. **Delete all data** also revokes weather/location access. No access is requested during onboarding.

No alarms, notifications, declarativeNetRequest, tabs, history, cookies, downloads, background page, offscreen, or all-sites host permission is requested. Timer-related permissions and blocker permissions belong to later stages and must be justified when implemented.

All scripts, fonts, icons, illustrations, and quotes load locally. Search and user-selected quick links navigate to the chosen website only after a user action. The Open-Meteo attribution link navigates only when clicked. Browser-managed settings sync depends on the user's Chrome/Edge sync configuration; it contains only name, theme, accent, and toggles. No task data or uploaded photograph is synced by ONEFLOW.
