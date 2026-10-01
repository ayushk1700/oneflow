# ONEFLOW · Stage 1 report

Delivered on October 1, 2026. Stage 1 only; Stage 2 and Stage 3 have not been started.

## What was built

A loadable MV3 extension with a calm illustrated new-tab dashboard, progressive tool dock, accessible native panels, skippable onboarding, shared versioned storage, and seven independently switchable widgets.

| Area | Delivered |
| --- | --- |
| Foundation | Manifest, four PNG icon sizes, strict CSP, minimal service worker, local storage migrations, IndexedDB stores, event bus, transient state, translation boundary |
| Dashboard | Local-time greeting/clock, 12/24-hour setting, daily main focus, check-off and lazy-loaded motion-aware confetti |
| Tasks | Multiple lists; add/edit/delete/complete; list rename/delete; SortableJS drag ordering and keyboard-accessible move buttons; draft preservation during list refreshes |
| Search & links | Three search engines; add/edit/remove links; local initial-letter icons; credential-free http/https validation |
| Quotes | 500 unique original ONEFLOW reflection variations, refresh, favorite/unfavorite, favorites panel |
| Weather | City search, optional geolocation, at-use permission requests, Open-Meteo attribution, temperature units, 30-minute cache, stale/offline state, forget-location/revoke control |
| Backgrounds | Five bundled original WebP landscape illustrations and lazy thumbnails, category labels, blur-up loading, solid/gradient, daily rotation, blur slider, safe raster uploads, photo deletion |
| Settings | Dark/light/device themes, accent contrast selection, font, units, clock, reduced motion, all widget toggles, complete JSON export/import, delete all data |
| Documentation | Installation, architecture, permission rationale, dependency licenses, asset provenance, manual QA and this report |

No remote scripts, fonts, favicon services, tracking, analytics, or hardcoded keys. Executable dependencies are pinned and bundled. Required permission: `storage` only. Optional permissions: geolocation and the two Open-Meteo hosts.

## File tree

```text
ONEFLOW/
├── AGENTS.md                  # Master context from the supplied pack
├── manifest.json
├── README.md
├── package.json               # Optional checks; no runtime build
├── newtab/                    # HTML, CSS, entry module
├── background/service-worker.js
├── core/
│   ├── storage.js, schema.js, db.js, backup.js
│   ├── events.js, state.js, theme.js
│   └── ui.js, utils.js, i18n.js
├── components/                # index.js + style.css per module
│   ├── clock/, focus/, tasks/, search/, links/
│   └── quotes/, weather/, settings/, onboarding/
├── data/                      # backgrounds, 500 quotes; future-stage data containers
├── assets/
│   ├── backgrounds/           # original SVG sources, WebPs, thumbnails, provenance
│   ├── icons/                 # PNG marks, local Lucide symbol subset
│   └── sounds/LICENSES.md     # no Stage 1 sound assets
├── vendor/                    # pinned sources and licenses
├── scripts/                   # preview, static checks, optional asset/data generators
├── tests/                     # pure unit tests + browser and resilience scripts
└── docs/                      # architecture, permissions, QA, report, screenshots/results
```

## How to load and test

Open `chrome://extensions` or `edge://extensions`, enable Developer mode, choose **Load unpacked**, and select `D:\BOOKS\ONEFLOW`. Open a new tab and keep the ONEFLOW override if prompted. No installation or compilation is needed. The local web preview uses a separate browser-storage fallback and does not replace extension permission testing.

Run `node --test tests/*.test.js` and `node scripts/check.js`. Optional Playwright checks: `node tests/browser.js chrome`, `node tests/browser.js edge`, `node tests/resilience.js`. Set `ONEFLOW_NODE_MODULES` if Playwright is provided in a shared runtime. See `QA.md` for the full human walkthrough.

## Results and acceptance checklist

Verified in isolated headless profiles using installed Chrome **154.0.8037.92** and Edge **154.0.4258.48**, loaded unpacked through the browser's developer protocol. No personal browser profile was used.

| Acceptance item | Result | Evidence / boundary |
| --- | --- | --- |
| Loads unpacked without manifest or console errors | PASS | Both browsers accepted the manifest; zero console, page, and CSP errors in the main integration flows |
| Repeat new tab usable under 300 ms | PASS in measured environment | Latest Chrome samples: 88, 91, 85, 84, 83 ms. Edge samples: 122, 85, 87, 117, 94 ms. `oneflow-ready` measures core interactivity; image decode and optional network calls are asynchronous. This is not a guarantee for all hardware. |
| Restart persistence; full export/import | PASS | Entire browser closed/reopened; local tasks and IDB images persisted. JSON restoration recovered settings, tasks, favorites, and actual image blobs. Concurrent tab additions preserved both writes. |
| Offline behavior | PASS | Local dashboard/quotes/assets loaded offline; weather empty and stale cached states verified |
| No remote/inline scripts; strict CSP | PASS | Static checks plus runtime console/CSP monitoring. Sortable/confetti load only from vendor paths. |
| Keyboard navigation and AA image contrast | PARTIAL: automated checks pass; human audit pending | `/`, `N`, Escape, modal interaction and accessible reorder controls tested. Core panel text ratios: 6.05–14.66:1. Small weather text over the brightest possible upload: 5.00:1. Full assistive-technology and exhaustive keyboard/zoom audit remains manual. |
| Reduced motion honored | PASS | System preference suppressed confetti loading; explicit setting and CSS disable motion |
| Disable every widget completely | PASS | All seven widget roots/dock entries disappeared and re-enabled correctly |

**Unit tests: 7/7 pass. Static checks: pass. Main browser checks: 15/15 per browser. Resilience checks: 8/8 pass**, including seven malformed backup cases, hostile text rendering, weather permission denial, mocked city/weather/cache responses, offline units, contrast, and full reset including synced preferences. Weather provider responses and permission outcomes were simulated for deterministic tests; native permission acceptance and live geolocation were not claimed as verified.

The final Chrome run includes the blur-up polish and contrast fix. The Edge full flow passed before those presentation-only changes. JSON evidence is in `docs/qa-results/`; screenshots are in `docs/screenshots/`.

## Size and dependency notes

| Asset | Approximate uncompressed size |
| --- | ---: |
| All application JavaScript, including panels | 63 KiB, below 150 KiB budget |
| Local Lucide subset | 6.6 KiB |
| SortableJS, lazy loaded | 44.0 KiB |
| canvas-confetti, lazy loaded | 10.6 KiB |
| Five WebPs plus five thumbnails combined | 117.1 KiB |
| 500-entry local quotes JSON | 81.4 KiB, asynchronous |

Full Lucide source remains under vendor for reproducibility and licensing but is never loaded at runtime. Optional maintainer tools used here: Playwright **1.62.1**, Sharp **0.35.4**, Node **24.19.0**. None is needed to load the extension.

## Known limitations and decisions

- Human screen-reader testing (NVDA/Narrator), exhaustive keyboard/200% zoom review, native geolocation permission prompts, and live provider behavior remain manual QA items. There is no claim of a completed WCAG certification.
- Backgrounds are original procedural illustrations. The 500 quotes are original ONEFLOW reflection variations, composed from 50 thoughts and 10 invitations, with honest attribution. They are not a collection of historical quotations or licensed photographs.
- Light/dark changes panels and controls; the scenic dashboard retains white text and a conservative veil for readability. Accent colors get contrast-selected text.
- Settings sync seeds new-device preferences. It is not continuous multi-device task or image synchronization. Sync needs the user's browser configuration and was not tested across real accounts.
- Restore coordinates the two storage backends and rolls back IDB on a local write failure, but it is not crash-atomic across both browser APIs. Close other editing tabs during a restore. Backups are unencrypted JSON; encrypted backup is Stage 3.
- At most eight uploaded photos, 8 MB per source image, 40 MB per import. Raster images are resized and recompressed locally. Data quota failures are shown to the user.
- Firefox and Safari have not been tested. Chromium promise APIs, service-worker manifest differences, and permission handling need a porting pass.
- Timer, sounds, journal UI, habits, notes UI, statistics, Flow Mode, blocker, AI, scene layouts, and release packaging remain out of scope, exactly as specified for later stages.

No decisions are required to load or review this build. Review Stage 1 before authorizing Stage 2.
