# Stage Report — Visual customization studio

Date: 9 October 2026

## What was built

ONEFLOW now has a shared visual customization studio under Tools → Customize and Settings → Appearance. Tools → Layout opens its layout controls directly. The scenic dashboard, Workspace tabs (Tasks / Notes / Habits), separate Journal and unified Settings remain the main navigation.

| Area | Delivered controls |
| --- | --- |
| Live editor | Immediate preview, Save / Cancel, undo / redo, starting presets and section resets |
| Responsive layouts | Independent desktop/mobile positions, direct dragging, grid snap, width, scale, hide, lock and alignment |
| Wallpapers | Bundled scenery, cached photos/video, animated atmospheres, playlists, shuffle, interval, crop, shading, blur and playback speed |
| Typography | Independent clock, greeting, timer and journal fonts, sizes, weight, spacing and alignment; dashboard text colors |
| Glass and surfaces | Panel opacity, blur, tint, corners, border and shadow |
| Complete Scenes | Save and restore customization with existing Scene controls while preserving personal records and active timer deadlines |
| Automatic Scenes | Time, selected weekdays, sunrise/sunset and focus/break triggers; manual two-hour pause; Flow protection |
| Dock | Reorder, hide/show, left/center/right placement, labels and auto-hide with keyboard reveal |
| Focus | Digits, progress ring or bar; task position, compact controls and distraction visibility |
| Soundscapes | Named mixes, focus/break selection, fade duration and existing sleep timer; never starts sound merely by saving a design |
| Journal | Shared frame, plain/ruled/dotted paper, reusable templates, writing width, theme, autosave and prompts |
| Interactions | Remappable task/search/timer/Flow shortcuts, local alert previews, alert volume, motion duration and celebrations |
| Accessibility | Larger controls, stronger contrast, reduced motion/transparency and keyboard focus profiles |
| Portable designs | Export/import validated settings, Scenes and referenced local media; excludes tasks, notes, journal records, API keys and location/rules |

Photo/video importing and Pexels search remain in Settings → Appearance → Wallpapers. No extra permissions, dependencies or remotely hosted executable code were added.

## Changed file tree

```text
components/
  customizer/index.js             live editor and controls
  layout/index.js                 shared editor entry point
  tools/index.js                  grouped Tools page
  settings/index.js               Appearance entry point
  sounds/index.js                 saved mix selection
core/
  studio-schema.js                defaults and bounded validation
  studio-runtime.js               preview and saved presentation
  studio-logic.js                 scheduling, solar time and playlists
  studio-presets.js               private-data-free portable designs
  schema.js                      schema 7 migration
  scenes.js, stage3-schema.js     complete Scene snapshots
  theme.js, audio-engine.js       preview and audio fades
  features.js, lazy-widgets.js    lazy loading
background/
  studio.js                      automatic Scenes and playlists
  service-worker.js              alarms and phase audio integration
  audio/audio.js                 configurable local alerts
newtab/
  newtab.js, dashboard.css        editor integration and shared tokens
  app.css                        generated local stylesheet
tests/
  studio.test.js                 validation, migration and scheduling
  studio-browser.js              real-extension acceptance walkthrough
  panels-browser.js              shared-tool regression checks
  package-browser.js             extracted release load checks
docs/
  CUSTOMIZATION_STUDIO_REPORT.md  this report
  ARCHITECTURE.md, CHANGELOG.md   implementation notes
README.md, scripts/package.js     usage and release packaging
```

## Load and test

1. Open `chrome://extensions` or `edge://extensions` and enable Developer mode.
2. Reload the existing ONEFLOW entry, or Load unpacked from `D:\BOOKS\ONEFLOW`. Alternatively extract `release/oneflow-1.0.0.zip` and select its folder.
3. Open a fresh new tab. Open Tools → Customize.
4. Try a starting preset, adjust typography and dock placement, then Cancel. Reopen, change the design and Save; reload to verify persistence.
5. Open Layout to position an element. Check desktop and mobile profiles separately. Open Journal to insert a template and Sounds to choose a saved mix.
6. Save a Scene before creating automatic Scene rules. Enter approximate coordinates for solar triggers. Start audio manually before testing phase sound changes.
7. Export a design preset and import it into a spare profile. Imported media is installed on Save; it needs available wallpaper library space.

Developer checks: `node --test tests/*.test.js`, `node scripts/check.js`, `node tests/studio-browser.js chrome`, `node tests/studio-browser.js edge`, `node tests/panels-browser.js chrome`, `node scripts/package.js`, and `node tests/package-browser.js chrome`. Browser tests use Playwright from the external `ONEFLOW_NODE_MODULES` runtime; the extension itself needs no package installation or compilation.

## Acceptance checklist

- PASS — 74 unit tests, including schema migration and running deadline preservation.
- PASS — Manifest references, JavaScript syntax, strict CSP, safe DOM rendering and 500 local quotes.
- PASS — Initial JavaScript is 148.6 KiB against the 150 KiB budget; the editor is lazy-loaded.
- PASS — Chrome and Edge: preview, Undo/Redo, Cancel, Save and all customization categories.
- PASS — Independent layout profiles, direct dragging, locks, remapped shortcut, actual journal template insertion and paper settings.
- PASS — Local wallpaper preset roundtrip; validation writes no media, Save installs new media IDs, credentials remain intact.
- PASS — Complete Scenes, wallpaper alarms and automatic phase Scene with a full session UUID preserve timer state.
- PASS — Offline reload at 1440, 390 and 320 pixels, with no page errors or external startup calls.
- PASS — Screenshots inspected for editor placement, narrow-screen controls and timer presentation.
- PASS — Existing tool panels and all Settings sections fit desktop, 390 px and 320 px; drafts, timer state and Flow survive tool changes with no console/CSP errors.
- PASS — Extracted 201-file ZIP loads offline, opens the studio and privacy page, preserves focus behavior and passes keyboard/plain-text rendering checks.
- PASS — Final measured eight cached opens: 133.5–174.4 ms. An earlier run had two outliers at 348 and 560.5 ms; startup is not guaranteed under every machine load. Raw final timings and marks are in `test-results/package-chrome-report.json`; panel results are in `test-results/panels-chrome-report.json`.

## Known limits and decisions

- Automatic changes depend on the browser running and its alarm delivery. Time/solar rules are checked approximately once per minute; sunrise/sunset is an offline approximation using manually supplied coordinates.
- Layout profiles use a 700 px breakpoint. The mobile profile can be edited on desktop, but actual phone-width composition should be checked with a narrow browser window.
- Fonts use local system families. Journal text keeps the paper theme's contrast colors. Custom dashboard colors and positions remain the user's design choices.
- Imported media uses the existing limits: eight still images and two local video wallpapers, up to 16 MB per video. A preset containing media cannot fully preview those imported backgrounds until Save installs them.
- Pexels needs the user's valid key and optional website permission. This stage did not verify a real paid/free account credential or guarantee provider availability.
- Automated tests verify sound configuration and state; subjective audio balance, screen-reader behavior and physical touch-device ergonomics still benefit from human acceptance.
- No publisher decision is needed to use this stage locally. Existing store-launch requirements remain separate; the package has not been submitted to a browser store.

Existing mixed workspace changes were preserved. No broad commit or destructive cleanup was performed.
