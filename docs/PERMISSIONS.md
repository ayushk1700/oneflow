# Permissions and network use — release 1.0.0

| Permission | Required? | Reason and trigger |
| --- | --- | --- |
| `storage` | Yes | Local records/settings, small synced preferences and browser-session Flow leases. No history is read. |
| `activeTab`, `scripting` | Yes | The toolbar or Alt+Shift+N injects the notes shell into the explicitly invoked tab. Temporary access reads its title, URL and current selection for the Capture page button. No persistent content script or new host grant. |
| `contextMenus` | Optional | Requested only by Notes → Options & privacy → Enable capture context menu. Captures the selected link/text/page on an explicit menu click. Disable removes the menu and revokes permission. |
| `search` | Yes | Both search forms call `chrome.search.query` only on explicit submission, honoring the browser’s default search provider. No query history is stored or provider setting changed. |
| `alarms` | Yes | Timer deadlines/badge, audio sleep, optional habit/ritual/backup reminders and override expiry. |
| `notifications` | Yes | Timer notices and configured reminders. Timer notices can be disabled; OS settings can suppress display. |
| `offscreen` | Yes | One local AUDIO_PLAYBACK owner for requested sounds/chime after tabs close, created only when needed. |
| `declarativeNetRequest` | Yes | Session-scoped navigation redirects during explicitly started Flow focus. No persistent dynamic/static rules or feedback permission. |
| `geolocation` | Optional | Explicit Use my location, rounded coordinates; denial leaves city search available. |
| Open-Meteo API/geocoding hosts | Optional | Weather setup; selected coordinates/city search and expired-cache refresh while enabled. |
| Pexels API/image/video hosts | Optional | Explicit personal-key photo/video background search. Selected files cache offline with attribution. Background selection supports the productivity dashboard. |
| `http://*/*`, `https://*/*` | Optional declaration | Arbitrary user-selected blocker domains. Blocklist requests only selected domain patterns/subdomains. Allow-only requests all HTTP/HTTPS sites to redirect anything outside the allowlist. No broad host grant at installation. |

`chrome.tabs.create` opens extension workspaces without `tabs` permission. No `history`, `cookies`, `webRequest`, `downloads`, `unlimitedStorage` or `declarativeNetRequestFeedback` permission is used.

## Focus work context

`tabs` is optional and requested only on Save capsule with Include current-window tabs, or Restore capsule with Reopen saved tabs checked. Capture reads ordinary HTTP/HTTPS titles and full URLs in the current non-private window at that moment, capped at 100. URLs may include private paths and query strings. It never reads page bodies or history. Restore compares current-window URLs to avoid duplicates, opens missing tabs in the background, and never closes or navigates existing tabs. Disable tab capture access revokes the grant; saved URLs remain until their capsule is deleted. Context-only capture and restore need no tab grant. [Chrome tabs documentation](https://developer.chrome.com/docs/extensions/reference/api/tabs) describes the URL/title access controlled by this permission.

Focus DNA learning and tab-switch counting are separate opt-ins, off by default. Activation counting uses `tabs.onActivated` while the shared focus timer runs, without reading visited URLs, titles or content. A switch is an observation, not an abandonment judgment. Counts include returning to ONEFLOW and intentional work-tab changes. Recovery observes this dashboard's visibility and timer pauses locally, can be disabled, and never auto-pauses solely because another tab is used. No new host permission, network service or remotely hosted code is added.

## Blocker lifecycle and scope

Rules target GET main-frame HTTP/HTTPS navigations. Existing pages and non-GET submissions are not intercepted. Pause, breaks, expiry and leaving Flow clear rules. A `chrome.storage.session` lease survives worker suspension but disappears on restart; orphaned Flow is released rather than silently reactivated. Install/update/shutdown clear session rules. Expiry is checked before history writes, so a failed record write does not retain an expired block.

The interstitial offers an explicit five-minute hostname override. Only visits reaching that page are logged, with the latest 200 hostnames/timestamps retained locally; paths and queries are excluded. This is not a complete browsing/request log. Forgetting website access can require online services to reconnect if their grants were covered by a broad grant.

Browser rules have no built-in expiry field. OS sleep or a failed alarm can delay cleanup until worker resumption; restart clears session rules. This is a focus aid, not a security boundary or parental-control product.

## CSP and optional services

Dictionary lookup requests optional `https://api.dictionaryapi.dev/*` access when the user submits a word. Only that English word is sent, without credentials or a referrer. Definitions remain in memory for this dashboard tab (up to 30 words), and no startup request is made. Clear words & disconnect clears that cache and requests access revocation. Web search uses an explicit search-provider form in a new tab and needs no host permission. Its query is sent to the selected Google, Bing or DuckDuckGo provider only on submit.

YouTube song search requests optional `https://www.googleapis.com/*` access only on Search songs. The YouTube Data API receives the search query and user-supplied API key. Forget search key clears its saved configuration and requests revocation. CSP permits this API connection but retains local-only extension scripts. Playback uses the existing visible YouTube iframe and requires no search key.

Scripts/styles use self; objects and base URI changes are prohibited. No inline scripts, eval or remote extension code. `blocked/index.html` is web-accessible for redirects. `components/notes/capture.html` is accessible to HTTP/HTTPS pages so an extension-owned iframe can render within a closed shadow root. Its entry point requires a short-lived, single-use, tab-bound launch token before reading notes when embedded cross-origin. Page messages cannot read or mutate notes; the frame sends only close/move/resize requests to its own shell. Other extension pages are not exposed. The CSP allows self-hosted frames for the dashboard Notes entry. External music frames use Spotify/YouTube origins and their own policies; no provider SDK runs in the extension.

Voice capture requests `getUserMedia({audio:true})` only on Record voice note, using the browser's microphone prompt. No extension-wide microphone grant is added. Restrictive page permissions policies can block an embedded recorder; the full Notes tab is the fallback. Recording stops after two minutes or on exit; local blobs are limited to 8 MB. No speech recognition, transcription or audio upload is used. A page can remove/obscure its overlay, so the overlay is an isolation boundary for note data, not a trusted display against a hostile website.

Notes reminders reuse `alarms` and `notifications`. One-shot alarms are reconstructed from IndexedDB on worker activation and note changes. Trash cancels a reminder. Browser shutdown/OS notification suppression can delay delivery. The title appears in the local system notification; note body/audio do not.

The external AI connection and its API origin are excluded by user choice. Music loads only after Connect & load playlist; closing/switching removes it. weather forget-location clears data/grants. Full delete clears both storage backends, synced preferences and optional grants.

Readable backups include private records/keys; encryption is optional and local. No backup, diagnostic, blocker log or session history is sent to a developer service. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md).

References: [DNR/session rules](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest), [optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions), [alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [offscreen](https://developer.chrome.com/docs/extensions/reference/api/offscreen), [CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy), [Pexels](https://www.pexels.com/api/documentation/), [Spotify](https://developer.spotify.com/documentation/embeds).


Pexels backgrounds: api.pexels.com, images.pexels.com and videos.pexels.com are optional, requested only on explicit search. The key goes only to the API in its Authorization header. Thumbnails are external; selected photos/videos are cached locally. No remote scripts or autoplay remote videos. Disconnect removes these origin grants.
# Personal workspaces

The nine new workspace tools add no required permissions. Quiet Web reuses optional `tabs`, requested from Review current-window tabs. It enables explicit categorization, inactive-tab parking after saving a capsule, and duplicate-free reopening. Private tabs and privileged/executable URLs are excluded. Website blocking retains its existing explicit controls. Meeting owners never trigger messages or third-party calls.

