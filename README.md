# ONEFLOW

A little space to focus. ONEFLOW is an offline-first Manifest V3 new tab extension for Chrome and Edge, written in plain HTML, CSS, and JavaScript. **This is Stage 1 (foundation and core dashboard), version 0.1.0.**

## Load the extension

1. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository folder (`D:\BOOKS\ONEFLOW`), containing `manifest.json`.
4. Open a new tab. If the browser asks, approve keeping ONEFLOW as your new tab page.
5. Enter a name and choose a theme, or skip onboarding.

No package installation, account, compilation, or API key is needed.

## In your space

- Local-time clock, greeting, and daily main focus with a small completion celebration.
- Multiple to-do lists, editing, completion, deletion, drag sorting, and accessible reorder buttons.
- Google, Bing, or DuckDuckGo search; editable quick links with local letter icons.
- 500 locally bundled original ONEFLOW reflections, refresh, and favorites.
- Optional Open-Meteo weather, city search, optional location access, Celsius/Fahrenheit, 30-minute cache, and offline state.
- Five original illustrated landscapes, daily rotation, solid colors, gradients, blur, and up to eight uploaded photographs stored in IndexedDB.
- Light, dark, and device-based panel themes; accent and typography controls; independent widget toggles.
- Full JSON backup/restore including uploaded images; explicit delete-all control.

The scenic dashboard retains white text and its contrast veil in both themes. Light/dark controls the panels and form surfaces. `N` opens a new task, `/` focuses search, and `Esc` dismisses panels. Shortcuts do not interrupt text entry.

## Development and verification

Node 20+ is sufficient for the dependency-free checks:

```sh
node --test tests/*.test.js
node scripts/check.js
node scripts/preview.js
```

The optional local preview at `http://127.0.0.1:4173/newtab/index.html` uses localStorage in place of Chrome storage. It is a design preview; browser-specific permission behavior must be checked in the extension.

Optional browser integration tests use Playwright with installed Chrome or Edge:

```sh
node tests/browser.js chrome
node tests/browser.js edge
```

Set `ONEFLOW_NODE_MODULES` to a directory containing Playwright if it is supplied by an external runtime. Tests create their own `.test-profile` and write screenshots/results under `test-results`. They never use a personal browser profile. Asset generation uses Sharp through the same variable (`node scripts/assets.js`); generated assets already ship in the repository.

See [Architecture](docs/ARCHITECTURE.md), [Permissions](docs/PERMISSIONS.md), [Stage 1 report](docs/STAGE_1_REPORT.md), and [QA checklist](docs/QA.md). Add features through isolated widget modules and the shared storage boundary. Vendor executable dependencies locally and record versions and licenses. Keep user/API strings in text nodes, and validate every imported data format before writing.

## Later stages

Timer, audio, journal, habits, notes, countdowns, focus statistics, and Unsplash are Stage 2. Scenes, Flow Mode, blocking, rituals, AI assistance, full localization, release packaging, and store submission are Stage 3. They are intentionally not enabled in this foundation build.
