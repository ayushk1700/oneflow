# Journal page stage report

10 October 2026

## Built

- Moved Journal from the bottom dock to a minimal bookmark button at the top right of Home. It respects the Journal widget toggle, stays out of Focus/Ambient, and restores keyboard focus on exit.
- Journal fills the entire tab, including when Studio is enabled. The writing surface contains only a day/date heading and the writing area.
- Removed the journal header, footer actions, prompts, print actions, metrics and template insertion controls. Existing saved entries and template preferences are retained.
- Kept a collapsible sidebar with Back to home, Search, calendar and Settings. On small screens it starts collapsed.
- Added journal-only settings in the sidebar: appearance, typeface, size, writing width, autosave and export. Manual-save mode exposes its save action in the sidebar.
- Preserved local drafts, calendar navigation, offline persistence, safe text rendering, native keyboard trapping and Escape dismissal.

## Changed file tree

```text
components/journal/
  workspace.js                 full-page journal and minimal navigation
  settings.js                  journal-only settings
  style.css                    responsive paper layout
core/
  ui.js                        focus the page heading when present
  studio-runtime.js            stop injecting template controls
newtab/
  index.html                   top-right Journal button
  newtab.js                    entry point and widget visibility
  dashboard.css                quiet button; remove legacy journal frame
  system.css                   explicit full-viewport journal geometry
  widgets.css, app.css         regenerated styles
 tests/
  journal-fullscreen-browser.js   dedicated journal acceptance walkthrough
  calm-home-browser.js           updated dock and current tool-button labels
  studio-browser.js              verify paper without template insertion
```

## Load and test

Reload ONEFLOW in Chrome's extensions manager, then open a fresh new tab. For a fresh installation, enable Developer mode and choose Load unpacked with `D:\BOOKS\ONEFLOW`.

Click Journal in the top-right corner. Write a line, return Home and reopen it. Try Search, the calendar, Settings, dark appearance and sidebar collapse. Escape returns Home. Resize the window to check the compact writing layout.

Developer verification: `node scripts/styles.js`, `node scripts/check.js`, `node --test tests/*.test.js`, and `node tests/journal-fullscreen-browser.js chrome` (set `ONEFLOW_NODE_MODULES` to a directory containing Playwright).

## Acceptance

| Check | Result |
| --- | --- |
| Manifest references, CSP, syntax, safe DOM and generated CSS | PASS |
| Unit suite | PASS — 79 tests |
| Initial application JavaScript | PASS — 147.9 KiB / 150 KiB |
| Chrome extension loading and full-tab journal | PASS |
| Date and writing only; no printing/header/footer/template controls | PASS |
| Own settings, light/dark/auto and typography | PASS |
| Autosave/manual save, search, calendar and real JSON export | PASS |
| Keyboard focus, immediate close/reopen and offline persistence | PASS |
| 1280/700/390/320px layouts and compact settings | PASS |
| No external requests or browser page errors | PASS |
| Edge | UNVERIFIED — installed Edge crashes during test-browser launch before extension loading |

## Decisions and limits

The top-right entry point and full-page journal are explicit user-requested exceptions to the previous dock and shared-panel layout. No new dependencies, permissions, remote services or data migrations were added. Browser fullscreen is not requested; the journal fills the new-tab viewport.

Older combined journal/wallpaper browser scripts still describe the removed printing/template UI; the dedicated journal acceptance script is the current reference for this feature. Edge validation remains pending because its test browser cannot launch. No decisions require user input.
