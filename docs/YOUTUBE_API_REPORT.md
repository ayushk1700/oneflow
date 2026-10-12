# YouTube music stage report

Built local play/pause, volume, seek and playlist navigation controls around a visible YouTube player, plus optional song search using YouTube Data API v3. Song links work without a search key; searching requires the user's own key and optional Google API access. Spotify and bundled ambient sounds remain available.

## Files

- components/music/index.js, style.css: player controls, search, key connection and cleanup.
- components/music/youtube-player.js: local message adapter with source/origin checks and bounded messages.
- components/music/youtube-search.js: official search endpoint with safe text results and errors.
- manifest.json, core/stage2-schema.js: optional search access, CSP and key validation.
- newtab/widgets.css, app.css: regenerated styles.
- tests/music-api-browser.js, youtube-search.test.js, youtube-live-browser.js: controlled browser, unit and live checks.

## Load and test

Reload the unpacked extension at chrome://extensions or edge://extensions. Open Music, paste a YouTube song or playlist URL, then click Load song or playlist. Once YouTube connects, use Play, volume and playback position; playlists also expose Previous/Next. Closing Music releases its player.

For search, enable YouTube Data API v3 in your Google project. Enter your key under YouTube search connection; saving is optional. Search for a song, approve the requested API access and select a result. Forget search key removes the saved key and requests revocation of API access. Keys saved locally also appear in readable backups; keep backups private and restrict keys appropriately in Google Cloud.

## Acceptance

- PASS: 50 unit tests; manifest, CSP, syntax, safe rendering and startup budget checks.
- PASS: Chrome and Edge controlled provider tests cover handshake, commands, safe search results, source checks and closing cleanup. Search permission consent is simulated in those tests.
- BLOCKED: live YouTube iframe request returned net::ERR_NETWORK_ACCESS_DENIED in this environment. Actual playback and a real-key search require verification in an unrestricted browser.

## Decisions and limitations

No remote scripts run in the extension page. The locally bundled adapter uses YouTube's iframe message transport rather than loading its remote YT.Player SDK. This transport is not a documented standalone public API and may change; the visible native player and provider link remain fallbacks. YouTube availability, embed restrictions, identification requirements, ads and playlist behavior remain provider-controlled. This is a YouTube video player, not an unofficial YouTube Music streaming API. No extraction of audio or bypass of provider restrictions is implemented.

No API key was provided or hardcoded. No new account, required permission, tracking or vendor dependency was added.
