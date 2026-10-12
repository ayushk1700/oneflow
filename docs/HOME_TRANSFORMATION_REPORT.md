# Visual Foundation and Home Transformation — Stage Report

2026-10-03. Completed the first two approved design phases. The homepage now uses a quiet monochrome interface over the bundled illustration, with an asymmetric desktop layout and a stacked responsive layout. Existing timer ownership, user records, optional integrations and permissions remain intact. This stage stops before the detailed component redesign.

## Built

- Neutral design tokens for dark/light surfaces, text, borders, action buttons, spacing, corners, shadows and focus rings. Heavy offset shadows were removed from shared controls/panels.
- Large left-aligned clock and greeting; focus/search below; right side reserved for the picture. Header contains wordmark, optional weather and directly accessible Settings.
- Four labelled dock controls remain available. New profiles start with quotes, links and countdowns off; existing saved widget choices are preserved.
- Photo, Pure Black and Pure White buttons in Scenery. Pure White supplies dark text/light controls; Pure Black supplies light controls. Returning to Photo restores the selected bundled/upload identifier.
- Unified task/daily-focus/break timer preserved. Task selection is shown when unfinished tasks exist; discard-draft controls appear only when needed.
- Background shading protects the text while leaving the illustration visible. Small text in header/scene label has a darker backing for bright uploads. Light, auto, stronger contrast and reduced-motion settings remain functional.
- Tailwind CSS **3.4.17**, pinned and generated locally with preflight disabled. Only **343 bytes** of responsive utilities and the MIT license ship; no compiler, CDN connection or Tailwind runtime JavaScript is included.
- Existing 22 widget style files consolidated into one checked-in stylesheet to reduce startup requests. Component source styles remain isolated and editable. The package script refreshes the bundle, and the static checker rejects stale output.

## File tree

~~~text
newtab/index.html              home layout, local styles and Settings launcher
newtab/foundation.css          neutral tokens, shared surfaces, responsive home
newtab/newtab.css              existing base styles without chained imports
newtab/widgets.css             checked-in consolidated component styles
newtab/newtab.js               direct Settings action
core/theme.js                  photo/black/white presentation and theme contrast
core/schema.js                 calmer new-profile defaults; existing choices retained
core/scenes.js                 contrast included in saved preference snapshots
core/i18n.js                   new labels in the central catalog
components/settings/index.js   background presentation controls
components/session-view/      progressive idle controls, same timer behavior
vendor/tailwindcss/3.4.17/     generated CSS and MIT license
vendor/README.md               version, license, source and regeneration details
scripts/tailwind.config.cjs    responsive utility source configuration
scripts/tailwind.input.css     utilities-only input
scripts/styles.js             component CSS consolidation
scripts/widget-styles.json     source stylesheet inventory
scripts/check.js               CSS references and bundle freshness checks
scripts/package.js             updated runtime packaging
 tests/home-foundation-browser.js Chrome/Edge home acceptance
 docs/qa-results/home-*.json    final structured results
 docs/screenshots/home-*.png    desktop, session, mobile and canvas captures
release/oneflow-1.0.0.zip       rebuilt unpacked extension archive
~~~

## Acceptance checklist

| Check | Result |
|---|---|
| Offline local Tailwind / desktop grid / four dock controls | PASS Chrome + Edge |
| Direct Settings access | PASS Chrome + Edge |
| Photo / Pure Black / Pure White controls | PASS Chrome + Edge |
| Unified timer start/pause and retained session | PASS Chrome + Edge |
| Light, auto, reduced motion and optional widgets | PASS Chrome + Edge |
| Laptop, tablet, mobile, narrow mobile and zoom-sized layouts | PASS Chrome + Edge |
| Offline reload / no console or CSP errors / no startup network | PASS Chrome + Edge |
| Existing unified-timer interaction suite | PASS Chrome, 9 checks |
| Schema/storage/timer/security unit tests | PASS 41/41 |
| Stage 3 regression: scenes, layout, reminders, real DNR, restart and encrypted backup | PASS Chrome, 21 checks |
| Eager JavaScript budget | PASS 132.0 KiB / 150 KiB |
| Five repeat opens after style consolidation | PASS 148, 138, 166, 143, 151 ms |
| Complete screen-reader and human contrast audit | MANUAL REVIEW |
| Detailed per-component redesign / new artwork set | NEXT PHASE |

One pre-consolidation repeat open measured 304 ms against the 300 ms target. Consolidating stylesheet requests resolved the observed regression; the final five samples are listed above. Local timings are observations, not guarantees for every device.

## Load and test

Refresh http://127.0.0.1:4173/newtab/index.html to see the preview. For browser features, reload ONEFLOW at chrome://extensions or edge://extensions and open a fresh new tab. Load D:\BOOKS\ONEFLOW unpacked, or extract the rebuilt zip and choose its manifest folder. No compilation or installation is required to run the extension.

Run node scripts/check.js and node --test tests/*.test.js. With ONEFLOW_NODE_MODULES pointing to the optional Playwright runtime, run node tests/home-foundation-browser.js chrome and edge, plus node tests/unified-timer-browser.js chrome and node tests/stage3-browser.js chrome. Runtime extension code does not depend on those test tools.

If editing a component stylesheet, run node scripts/styles.js. If adding Tailwind utility classes, regenerate with the pinned standalone CLI using scripts/tailwind.config.cjs and scripts/tailwind.input.css as documented in vendor/README.md. The ready-to-load generated files are committed artifacts; the compiler remains outside the release. Tailwind's official static-CSS installation guidance: https://v3.tailwindcss.com/docs/installation.

## Limits and decisions

The existing illustrated background set is used for these phases; the new artwork collection belongs to the later background phase. Panels inherit the foundation, but their detailed layouts will be redesigned individually next. Responsive tests include zoom-sized viewports rather than an actual browser zoom/assistive-technology session. Human screen-reader, actual 200% zoom and broad uploaded-image contrast review remain manual.

No new account, API calls, tracking or permissions were added. External AI remains absent. Existing custom accents are retained for charts/details while action controls are monochrome. No user decision is required for this completed stage. Git commits remain pending the author identity previously requested; all files and the zip are saved.
