# Stage Report: Pexels photo and video backgrounds

## Built

Appearance → Wallpapers now offers optional Pexels photos and videos, using a personal API key stored locally. Searching requests optional API/image/video origin permissions from the user's action. There are no startup requests. Selected backgrounds download once into IndexedDB and remain available offline; creator/Pexels attribution is shown in results and on the dashboard. Disconnect clears the key and provider grants while retaining saved files. No new dependencies or remotely hosted code.

Errors cover absent/invalid keys, denied permission, network failures, rate limits, empty/incompatible results, full libraries, oversized media and damaged videos. Search offers six landscape results. Photos are capped at 8 MB each and eight saved images; videos at 16 MB each and two saved videos. Downloads are bounded while streaming. API authorization is sent only to the API host. Media and attribution URLs are restricted to provider HTTPS origins; redirect downloads are rejected.

## Files

- components/pexels/index.js: isolated Settings-only provider search and selection.
- components/settings/index.js and customization.js: lazy integration and shared video validation.
- core/pexels-credit.js, theme.js, live-wallpaper.js: safe, persisted image/video credits.
- core/stage2-schema.js: validates optional Pexels key; old schema 6 data remains compatible.
- manifest.json: optional Pexels origins and limited image/connect CSP additions.
- newtab/dashboard.css and app.css: consistent provider cards.
- tests/pexels.test.js and pexels-browser.js: URL safety, schema compatibility and controlled provider flows.

## Load and test

Reload ONEFLOW on chrome://extensions or edge://extensions, open a fresh tab, and choose Settings → Appearance → Wallpapers → Pexels backgrounds. Get a key at https://www.pexels.com/api/, paste it in the password field and save. Choose Photos or Videos, search, grant access when requested, and select a result to save offline. Do not paste your key into chat.

## Acceptance

- PASS: unit tests for trusted URLs, compatible video selection and optional key validation.
- PASS: controlled Chrome API responses: denied permissions, unauthorized/rate-limited responses, safe photo selection/credit, damaged video rejection, silent decoded video, backup roundtrip, disconnect and offline playback with attribution.
- PASS: manifest/CSP/syntax checks; provider module remains lazy.
- Native provider permission prompt is represented by a permission stub in browser tests. Live Pexels account requests and actual provider MP4 codec samples require a real key and remain unverified. The valid video test fixture uses the existing local WebM recording.

## Decisions and limits

Pexels' dedicated FAQ permits background selection as a supporting feature of an app whose main purpose is different: https://help.pexels.com/hc/en-us/articles/4405588861721-Can-I-use-the-API-as-a-wallpaper-app. ONEFLOW remains a productivity dashboard; this is not a stock-media download service. Attribution remains visible. General API guidelines: https://www.pexels.com/api/documentation/.

API keys are local, not synced. Ordinary backups include integration settings, so treat exported backups as sensitive or use the existing encrypted backup option. No key is hardcoded. Videos can exceed the local cap or use unsupported codecs; choose another result. Provider request limits apply. No store publication was performed. The earlier report's blanket statement that Pexels required approval for ONEFLOW is superseded by the specific supporting-feature FAQ.

Final verification: all 65 unit tests pass. Initial JavaScript is 149.7 KiB / 150 KiB. Extracted release ZIP loads in Chrome with no startup network requests or website grants and passes offline keyboard/task/timer/privacy checks.

