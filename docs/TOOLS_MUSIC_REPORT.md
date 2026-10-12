# Tools and Music Stage Report — October 4, 2026

## Built

- Tools moved out of the central card to a round main-screen button immediately beside Settings. Focus/Music remain at bottom-left; Tools/Settings form the bottom-right pair. Shared SVG icons, sizes, spacing and focus states are retained.
- The round Focus launcher now opens fullscreen Flow rather than timer preferences. Leaving fullscreen retains the shared session, consistent with the existing timer lifecycle. Session settings remain available within the session card.
- Tool directory organized into Plan & focus, Reflect & recharge, and Make it yours. Each tool has a direct name, a visible explanation of its use, and a matching accessible label/description. Tasks and Ambient sounds are full directory entries.
- YouTube Music watch links, YouTube song/short links and playlist links resolve to the supported privacy-enhanced YouTube embedded player. Spotify playlists remain supported. Playback controls are visible, and no autoplay parameter is added.
- Song discovery field opens a correctly encoded YouTube Music search in a new tab. Copying a resulting song/playlist URL into ONEFLOW loads its player. This is an explicit external search, not an in-app catalog search.
- Provider loading uses a validated immutable URL, retains the existing explicit connection action, and aborts a late load if Music is no longer visible. Closing/switching still removes playback frames. External-player fallback is provided for unavailable embeds.

## Files

```
newtab/index.html, newtab/newtab.js   corner Tools and fullscreen launcher
newtab/sketch.css, newtab/app.css    consistent right corner pair/discovery styles
core/features.js                    explained tool directory
components/music/index.js           song/playlist player and discovery
 tests/youtube-music.test.js         accepted/rejected media URLs
 tests/sketch-browser.js             navigation, fullscreen and song frame checks
 docs/TOOLS_MUSIC_REPORT.md          this stage report
 scripts/package.js                 include report in archive
 release/oneflow-1.0.0.zip           refreshed local build and checksum
```

## Acceptance

- PASS: 47 unit tests, including three new song/playlist URL cases and hostile-origin/credential rejection.
- PASS: static syntax, CSP, safe rendering, manifest references and generated stylesheet checks. Initial eager JS remains below 150 KiB (approximately 141 KiB).
- PASS: Chrome and Edge interaction checks: adjacent Tools/Settings; fullscreen launcher; shared timer start/pause; explained tool directory and Tasks entry; Music remains disconnected until requested; valid song frame; actual local soundscape state; mobile width; light theme; no page errors.
- Provider frame construction is tested with a controlled YouTube response fixture. Live playback, audibility and provider/account restrictions are not certified by that fixture. YouTube may refuse particular videos or extension embeds; the external provider link remains available.
- PASS: refreshed extracted-package smoke checks in Chrome and Edge for offline startup, no initial website grants/requests, task entry, timer controls, keyboard dialog/Escape and Hindi fallback.

## Load and test

Reload the unpacked extension and open a fresh new tab, or extract release/oneflow-1.0.0.zip and choose Load unpacked on the extracted folder in Chrome/Edge extension developer mode. Export a backup before replacing an existing installation.

Run `node --test tests/*.test.js`, `node scripts/check.js`, and `node tests/sketch-browser.js chrome` / `edge`. Browser checks require the supplied Playwright directory in ONEFLOW_NODE_MODULES. Packaging is `node scripts/package.js`; extracted smoke checks are `node tests/package-browser.js chrome` / `edge`.

## API decision and limits

This integration uses YouTube’s supported embedded playback surface, not an unofficial YouTube Music account API, scraped audio, a direct media stream or a remotely loaded SDK in the extension. No API key, extra host permission or background playback promise is introduced. Search results and queues stay with YouTube Music/the connected player. New labels use English fallback.

Reference: https://developers.google.com/youtube/iframe_api_reference

No user decision is required for this local implementation. Nothing was published and the Git index was not changed.
