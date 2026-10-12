# Stage Report: scenic dashboard, separate tools and journal

6 October 2026 · ONEFLOW 1.0.0 · storage schema 6 · IndexedDB version 3

## Built

Replaced the split dashboard card with a scenic canvas inspired by Flocus's public interface. Home centers the clock and greeting. Focus shows a large countdown and working Focus/Short break/Long break controls. Ambient clears the workspace, with an optional small clock and live session return button. View changes retain the background-owned timer and unsaved focus form. Phase selection cannot replace a running or paused interval.

Journal occupies the first dock position. Tasks remains a separate tool with task-only behavior. Journal, Tasks, Sounds, Notes, Music, Habits and Stats have dedicated buttons; occasional tools remain accessible through Tools. Each module retains its own lifecycle and data ownership. The shared panel navigation changes tools without inserting their work into another tool.

The journal follows the supplied Journaler reference: a quiet paper canvas, collapsible sidebar, date controls, month/year calendar, search, export, Print all/Print current, metrics and writing focus. Autosave preserves entries in IndexedDB and drafts in local storage. Manual save, light/dark paper, fonts, writing width, text size and prompts are configured in Settings → Journal. Printing uses plain-text content and local print styles; no content is sent remotely.

Settings unifies Appearance, Home/tool visibility, Focus, Journal, Scenery, Reminders, Website blocking, Data & privacy and Help. Appearance adds clock size/weight, panel opacity, scene shading, motion speed, startup view, logo/date/caption visibility and an optional Ambient clock. Existing accent, type, themes, stronger contrast and reduced motion remain available.

Scenery includes original still backgrounds, uploaded images, solid colors, gradients, four offline animated atmospheres and local MP4/WebM video wallpapers. Video files are validated before saving, limited to 16 MB each and two files, played silently, and paused for reduced motion or hidden tabs. Unsupported videos show a bundled still fallback. Wallpapers are included in JSON/encrypted backups; old backups migrate with an empty wallpaper store. Backup input is capped at 128 MB to accommodate the bounded media collection.

## File tree for this stage

```
newtab/
  index.html                 scenic shell, dedicated dock and view controls
  newtab.js                  mounts tools and connects shell actions
  dashboard.css              current dashboard and panel presentation
  app.css                    regenerated local stylesheet bundle
core/
  dashboard-view.js          presentation modes, never a second timer
  live-wallpaper.js           local video lifecycle and pause behavior
  theme.js                   appearance tokens and wallpaper selection
  schema.js                  schema 6 preferences, migration and validation
  db.js                      version 3 adds wallpapers, retains existing stores
  backup.js                  video export/import and old-backup compatibility
  timer-logic.js              safe idle phase selection
components/
  journal/index.js            module lifecycle exports
  journal/workspace.js        date-based writing workspace
  journal/style.css           reference-based paper/sidebar design
  settings/customization.js  appearance, journal and wallpaper preferences
  settings/index.js          unified Settings sections
  sounds/index.js             compact mixer and playback actions
tests/
  dashboard-browser.js        modes, phases, panels, responsive and offline checks
  journal-wallpapers-browser.js journal, preferences, video and backup checks
  schema.test.js              migration and invalid-preference coverage
docs/screenshots/             current dashboard and customization captures
release/oneflow-1.0.0.zip      rebuilt load-unpacked package
```

## Load and test

1. Export a backup from an existing installation.
2. Open `chrome://extensions` or `edge://extensions` and enable Developer mode.
3. Load unpacked from `D:\BOOKS\ONEFLOW`, or extract `release/oneflow-1.0.0.zip` and load that folder. Reload an existing extension and reopen its old dashboard tabs.
4. Open Journal from the first dock button. Write, navigate dates, collapse the sidebar and check Settings → Journal.
5. Open Settings → Appearance and Scenery. Try Aurora glow or upload a local MP4/WebM. Switch Home/Focus/Ambient during a timer; it should keep the same session.

Developer verification uses `node --test tests/*.test.js`, `node scripts/check.js`, `node tests/dashboard-browser.js edge`, `node tests/journal-wallpapers-browser.js chrome`/`edge`, and `node tests/panels-browser.js edge`. Browser scripts use an optional Playwright runtime and isolated disposable profiles. They are not required to load the extension.

## Acceptance checklist

| Check | Result |
| --- | --- |
| MV3 manifest references, strict CSP, safe DOM rendering and JavaScript syntax | PASS |
| Unit coverage for migration, validation, timers, backups and existing features | PASS: 62 tests |
| Initial JavaScript below 150 KiB; journal/settings/video code stays lazy | PASS: 149.7 KiB |
| Home/Focus/Ambient, task draft preservation and timer continuity | PASS: Edge browser walkthrough |
| Real idle short/long breaks and protection of active intervals | PASS |
| Separate tool buttons, retained drafts, all core panels and Settings on 1440/390/320 widths | PASS: panel and dashboard walkthroughs |
| Journal save/date/search/export/metrics and unified journal preferences | PASS: Chrome and Edge browser walkthroughs |
| Print current/all content preparation | PASS: browser print invocation captured; physical printing remains manual |
| Animated wallpaper, clock customization and reduced motion | PASS: Chrome and Edge browser walkthroughs |
| Local video decode/playback, silent playback, backup roundtrip and offline reload | PASS: Chrome and Edge browser walkthroughs |
| No unsolicited outside requests or console/CSP errors in core workflows | PASS |

## Limits and decisions

The interface uses ONEFLOW's branding and original assets. The screenshots guide the layout; Flocus artwork and Journaler application code were not bundled. Uploaded videos depend on the browser's codec support. Reduced motion uses a still frame/fallback. Hindi remains a sample translation with English fallback, including newer labels. Firefox is not certified.

The final sequential Edge check passed eight cached opens: 131–200.5 ms, median 144.9 ms. Cached startup is hardware- and load-dependent. An earlier Edge run while other browser checks were active had a 186.6 ms median with a 770.6 ms outlier; this does not establish a strict sub-300 ms guarantee. Human screen-reader, physical printing, battery and codec/device checks remain manual. Public store publication still needs publisher contact/privacy hosting and beta acceptance from the earlier launch checklist.

No input is required to use this local build. This stage stops after delivery; it does not publish to a store or add an account service.

