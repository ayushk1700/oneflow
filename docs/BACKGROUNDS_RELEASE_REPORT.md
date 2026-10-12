# Background Presentation and Release — Stage Report

4 October 2026. Completed design phases 5 and 6. Bundled artwork remains the visual centre, while scene-aware shading protects the dashboard and fullscreen timer. Existing selections, uploads and optional integrations remain compatible. The first five landscapes passed offline desktop/mobile checks before the new illustration was drawn.

## What was built

- A shared local background catalog with desktop/mobile focal positions and bounded shading. Home concentrates shade behind text; custom layouts use broader coverage. Strong contrast increases it. Pure white remains unshaded.
- Thumbnail-first loading and a 220 ms fade after full image decoding. Home becomes usable without waiting for decoding. Stale completions cannot replace a newer selection; a failed full image leaves its thumbnail visible.
- Flow supplies its own central shading and hides Home's overlay, keeping the picture visible without stacking the two layers. System and explicit reduced motion disable the fade.
- Small bundled scene previews and locally resized upload previews. Original IndexedDB image blobs and the existing backup format are retained. Preview URLs are released with their view; selected-image URLs are released on replacement.
- **A quiet journey**, original editable SVG artwork with a warm summit, lake and traveller. Its 1920×1080 WebP is 28,564 bytes; its 384×216 preview is 2,678 bytes. It is an optional sixth selection, leaving existing selections and five built-in Scenes intact.
- Preserved user-uploaded images, cached Unsplash photos/attribution, and explicit optional music/photo connections. Remote photo failure falls back to its cached blob. No new permissions, accounts, tracking, network providers or executable dependencies were introduced. External AI remains excluded.
- Screenshots, current QA evidence, documentation and the rebuilt version 1.0.0 release archive with SHA-256 checksum.

## Changed file tree

```text
assets/backgrounds/summit.{svg,webp}          original editable illustration
assets/backgrounds/summit-thumb.webp         optimized preview
assets/backgrounds/LICENSES.md               artwork provenance
data/backgrounds.json                       focal points, shading, shared catalog
core/background-presentation.js             catalog validation and shade defaults
core/image-preview.js                       local transient thumbnail resizing
core/theme.js                               decoded-image layers and cached fallback
components/scenes/index.js                  small scene previews
components/settings/index.js                shared scenery catalog/upload previews
newtab/{index.html,foundation.css,panels.css} background layout and loading treatment
newtab/app.css                              regenerated local stylesheet
scripts/{assets,package}.js                  original SVG retention and release contents
tests/background-presentation.test.js        catalog/shading/asset budget checks
tests/backgrounds-browser.js                 Chrome/Edge acceptance walkthrough
tests/stage2-integrations.js                 current unified Settings entry points
README.md, docs/{ARCHITECTURE,QA,CHANGELOG}.md
docs/qa-results/backgrounds-*.json            current acceptance evidence
docs/screenshots/backgrounds-*.png           desktop, compact, mobile, Flow, scenes, zoom
release/oneflow-1.0.0.zip                     installable archive
release/oneflow-1.0.0.zip.sha256              checksum
release/SCREENSHOTS.json                     final capture inventory
```

## Acceptance checklist

| Check | Result |
|---|---|
| Six bundled images offline at 1440×960, 1280×720, 390×844, 320×640 | PASS Chrome + Edge |
| Focal positions, responsive crop and reachable Start controls | PASS Chrome + Edge |
| Preview stays visible during slow decode; stale completion discarded | PASS Chrome + Edge |
| Injected full-image failure retains the local preview | PASS Chrome + Edge |
| Upload and custom scene survive reload; previews use small images | PASS Chrome + Edge |
| Strong contrast, movable-layout coverage, pure white/photo switching | PASS Chrome + Edge |
| Explicit and system reduced motion suppress image transitions | PASS Chrome + Edge |
| Search/task/timer/Flow/Escape shortcuts and visible keyboard focus | PASS Chrome + Edge |
| Actual 200% tab zoom, modal containment and no horizontal overflow | PASS Chrome + Edge |
| Unified timer/task starts, one countdown, pause/resume/end/break/skip, multi-tab continuity | PASS Chrome + Edge, 9 checks each |
| All tools/Settings sections, drafts, reminders and Notes autosave | PASS Chrome + Edge, 12 groups each |
| Migration, scenes, layout, rituals, local suggestions and encrypted backup | PASS Chrome + Edge |
| Real DNR redirects/override; cleanup on pause, expiry, exit and restart | PASS Chrome + Edge |
| Worker suspension and missing-lease recovery | PASS Chrome + Edge |
| Mocked music/photo connection, download attribution, cached offline photo, audio sleep, backup coordination | PASS Chrome + Edge, 6 groups each |
| Unit tests | PASS 44/44 |
| Manifest, strict CSP, syntax, safe DOM and generated CSS freshness | PASS |
| Eager JavaScript budget | PASS 138.7 KiB / 150 KiB |
| Five cached opens under 300 ms | PASS Chrome: 139, 133, 147, 122, 154 ms; Edge: 132, 134, 138, 156, 155 ms |
| Extracted release archive, offline operation, no host grants/startup network, keyboard/data/language checks | PASS Chrome + Edge, 7 checks each |
| Human assistive technology, arbitrary photo contrast and physical devices | MANUAL REVIEW |

Performance measures `oneflow-ready` with other test browsers closed, after warm-up, in isolated installed Chrome/Edge profiles. It measures usability, not full-image decode completion, and is not a guarantee for every device. Both Stage 3 suites passed all 21 groups; Flow opened in 272 ms in Chrome and 348 ms in Edge. Browser zoom was set to 2 through the browser Tabs API and verified through its actual zoom factor and halved layout viewport, without adding a manifest permission. The intentional failed-image test can produce a failed-resource console message; ordinary panel/Stage 3 regression runs require clean consoles.

The six browser suites passed 64 acceptance groups in each browser (128 total), alongside 44 unit tests. The 158-file archive is 2.90 MB, CRC-checked and loaded in fresh extracted profiles. Its runtime excludes development tools, profiles, screenshots and external AI modules; selected screenshot evidence is supplied separately in the repository. Final source equality and SHA-256 verification confirm the archive matches the saved files.

## Load and test

Refresh the local preview at http://127.0.0.1:4173/newtab/index.html. For extension features, reload ONEFLOW at `chrome://extensions` or `edge://extensions`, then open a fresh new tab. Load `D:\BOOKS\ONEFLOW` unpacked, or extract `release/oneflow-1.0.0.zip` and select its manifest folder. No compilation or dependency installation is needed.

Open Settings → Scenery to try A quiet journey, the five existing landscapes, pure black/white, blur and a local upload. Save an upload as a custom Scene, switch backgrounds and reload offline. Start from a task, pause, enter/leave Flow, and skip a break. Navigate with Tab/Shift+Tab and the shortcuts; try 200% browser zoom. Settings remains the unified home for preferences.

Maintainers can run `node scripts/check.js`, `node --test tests/*.test.js`, and the background, unified-timer, panels, Stage 3, optional-integration and package browser suites with the optional Playwright runtime. Source CSS regeneration is `node scripts/styles.js`; packaging is `node scripts/package.js`. Development tools, test profiles and test credentials are excluded from the release.

## Known issues, manual limitations and decisions

No functional regression was found in the verified paths. This is not a full WCAG certification: NVDA/Narrator announcements and reading order, arbitrary uploaded-picture contrast, physical-device touch, and actual device sleep/wake still require human review. Test all unusual images with Stronger contrast. OS notification delivery, perceived audio/chime quality, real own-key Unsplash/weather and provider playback remain manual; optional integration checks use mocked responses. Native permission prompt accept/decline is not automated. Normal restart and orphaned-session recovery passed; physical process-crash recovery remains unverified because the test environment can retain a Windows browser profile lock.

Storage schemas remain local document version 4 / IndexedDB version 2, with no image-record migration. Existing tasks, drafts, backgrounds, scenes and personal records are preserved. There is no required decision for using the completed interface. Git commits remain pending the author identity requested earlier; source files and release artifacts are saved. Store publication is outside this request. Work stops after this report.


