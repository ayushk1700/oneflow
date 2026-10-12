# ONEFLOW · Calm Home Stage 1/2 report

Completed 9 October 2026.

## Outcome

Stage 1 and Stage 2 are implemented as a visual refinement of the existing extension. Home now presents the clock, greeting, daily quote, main focus, search, and a quiet tool dock over the user’s static wallpaper collection. Secondary tools remain available through Options, Tools, and panels.

The fresh-install default uses the open-sky static scene in `wallpaper`, which gives the clock a calm text area. Bright user uploads receive a stronger local readability veil; ordinary folder wallpapers keep their colour and depth.

The information hierarchy follows the same product pattern Flocus documents for Home, Focus Mode, and Ambient Mode: a greeting/clock ritual on Home, a focused timer/task surface, and a background-first ambient surface. See the [Flocus mode overview](https://help.flocus.com/en/articles/10227523-switching-dashboard-modes-and-what-each-is) and [official product page](https://flocus.com/index) for the reference behavior.

## Implemented

- Reworked Home composition: light-weight clock, restrained greeting/date, one main-focus prompt, daily local quote, browser search, and one centered dock.
- Added native Options disclosure for view switching, Settings, fullscreen, shortcuts, scenery, weather, quick links, and countdowns.
- Kept the main view free of hidden/empty secondary widgets; deferred quote/weather/link/countdown modules until needed, while the daily quote is loaded as an intentional Home element.
- Added scene-aware shading, strong-contrast mode, white-upload protection, reduced-motion handling, keyboard focus restoration, and responsive dock wrapping.
- Preserved custom Studio typography and explicit widget placements while restoring default disclosure when Studio is disabled.
- Added folder-backed static wallpaper cataloging through `wallpaper/`, safe filename validation, and local live-video cataloging through `livewallpaper/`.
- Added `npm run wallpapers` to index added local files without modifying originals. Live video playback is muted, lazy, looped, paused when hidden/reduced, and falls back to a still scene on failure.
- Kept browser-uploaded videos separate from bundled folder videos so existing backup behavior remains intact.

## Main files

```text
wallpaper/                         static source images and starter scenes
livewallpaper/                     live-video source folder (currently empty)
data/backgrounds.json              indexed static catalog
data/livewallpapers.json           indexed live catalog
scripts/index-wallpapers.js        safe local catalog refresh
core/background-presentation.js    catalog/path validation and presentation metadata
core/live-wallpaper.js              local video lifecycle and fallback
core/theme.js                       image/video selection and readability state
newtab/index.html                   calm Home structure
newtab/dashboard.css                composition, dock, menu, and readability treatment
newtab/tokens.css                   canonical visual tokens
newtab/newtab.js                    progressive widget loading
tests/calm-home-browser.js          Chrome acceptance walkthrough
```

## How to load

1. Run `npm run wallpapers` after adding or replacing files in `wallpaper` or `livewallpaper`.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode, choose **Load unpacked**, and select `D:\BOOKS\ONEFLOW`.
4. Reload the extension after catalog changes. Choose **Options → Settings → Scenery** to select a static or live item.

## Verification

| Check | Result |
| --- | --- |
| Unit suite | PASS — 77 tests |
| Manifest/CSP/syntax/safe-DOM checker | PASS |
| Initial application JavaScript | PASS — 143.5 KiB / 150 KiB |
| Chrome Home acceptance | PASS — desktop and 1440/1280/390/320px layouts |
| Keyboard shortcuts and focus restoration | PASS |
| Focus session identity across Home/Focus modes | PASS |
| Bright uploaded wallpaper contrast | PASS — sampled minimum 4.5:1 |
| Offline reload and external request check | PASS — no runtime errors or external requests |
| Live-folder playback | Pending media — catalog and runtime path are implemented, but `livewallpaper` contains no video yet |

Latest visual evidence: [Chrome Home capture](screenshots/calm-chrome-home-1440.png).

## Known issues and decisions

- The folder contains user-provided artwork with mixed file sizes and naming. It is indexed safely but not recompressed or edited; optimized previews are optional. Keep only artwork you are licensed to distribute.
- `livewallpaper` is intentionally empty until a licensed MP4/WebM is supplied. The extension does not invent a placeholder live video.
- A universal sub-300 ms startup guarantee is not claimed across machines; the measured Chrome cached samples from this run remain within the existing performance budget, while the first run also loads the local quote.
- Firefox remains compatible where its MV3 implementation supports the current APIs, but Chrome and Edge are the verified browsers for this stage.

Stage 3 was not started.
