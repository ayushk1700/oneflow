# Stage 5/6 report — calm secondary surfaces

Date: 2026-10-10

## Built

- A shared panel frame for Tasks, Sounds, Notes, Settings, Stats and Notifications: aligned title/close control, consistent navigation, theme surface, border, spacing, radii and control sizing.
- Flatter sections, quieter tab states, consistent empty states and separated destructive actions. Notes deletion, notification clearing and data reset have confirmation; task deletion retains undo in its secondary menu.
- A token-based typography and spacing layer: one default interface font, restrained heading weights, 44px controls, 20px Lucide icons, 8/12/20px radii. Existing explicit user typography preferences remain supported.
- Stats with a focus summary, daily chart, day/week/month windows, session and task counts, streak, planning comparison, accessible daily-data table and working CSV export. Actual partial-session time is included; an unavailable database exposes Retry. Chart loading failure exposes the table instead.
- A local notification inbox with timestamps, read/unread state, mark-all-read, reminder settings and confirmed clearing. History is limited to 40 notices, survives reopening, and deduplicates worker reminders by stable ID. Schema 8 upgrades to 9 without changing existing tasks or timer state.
- A queued toaster that can be dismissed by keyboard, stays operable inside modal dialogs, pauses auto-dismiss on hover/focus, and keeps errors visible until dismissed. Success/status and error announcements use the appropriate live-region roles.
- Rebuilt the local Lucide subset using the already pinned library; no new package, remote code, permission or external request was added.

Journal remains full-screen by the user's explicit choice. Its writing surface is an intentional exception to the standard floating frame; the concurrent Journal work has been preserved.

## Main files

```text
newtab/
  tokens.css                 Shared visual decisions
  system.css                 Final panel/control contract
  app.css, widgets.css       Generated styles
core/
  notifications.js           Persisted local inbox
  toaster.js                 Lazy-loaded toast queue
  schema.js, storage.js      Migration and local-only notice writes
  ui.js, utils.js             Shared icons, confirmation focus and export links
components/
  stats/{index.js,style.css}
  notifications/{index.js,style.css}
  sounds/index.js
  notes/index.js
  tasks/index.js
  settings/data-tools.js
background/
  service-worker.js, focus-service.js  Reminder recording
scripts/
  icons.js, assets.js, styles.js, check.js
assets/icons/lucide.svg
tests/
  schema.test.js
  stats-notifications-browser.js
docs/
  DESIGN_CONSTITUTION.md
  STAGE_5_6_REPORT.md
```

## Verification and acceptance

| Check | Result |
| --- | --- |
| Manifest references, MV3 CSP, safe rendering and JS syntax | PASS |
| Unit suite, including migration and notification bounds | PASS — 79 tests |
| Initial application JavaScript under 150 KiB | PASS — 146.9 KiB |
| Shared computed panel radius, padding, font and background | PASS — Chrome and Edge |
| Tasks, Sounds, Notes, Settings, Stats and Notifications at 1440/390/320px | PASS — no panel overflow |
| Keyboard focus stays in standard dialogs; toast keyboard dismissal | PASS — Chrome and Edge |
| Stats day/week/month, partial time and downloaded CSV agree | PASS — 35 min today, 55 min across the test week |
| Empty Stats and unavailable-history Retry | PASS |
| Notification reload persistence, read state, queue, deduplication and 40-item bound | PASS |
| Cancel and confirmed history clearing | PASS |
| Light/dark visual review and reduced-motion toast | PASS |
| Journal full-screen exception | PRESERVED as requested |
| Manual screen-reader speech and OS reminder delivery | NOT VERIFIED in this run |
| Firefox and sub-300ms startup timing | NOT VERIFIED in this run |

Browser evidence is generated under `test-results/stage56-{chrome,edge}-report.json`, with screenshots alongside. These tests load the real unpacked extension into isolated browser profiles, leaving the user's browser data unchanged. Edge required execution outside the process sandbox after its sandboxed launch crashed.

## Load and test

1. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, then reload ONEFLOW (or choose **Load unpacked** and select `D:\BOOKS\ONEFLOW`).
2. Open a new tab. Check Tasks and Sounds from the dock; open Notes, Stats and Notifications through More → Open all tools. Journal should still fill the tab.
3. In Stats, change the time window and export CSV. In Notifications, inspect read state and cancel/confirm clearing. Test Tab, Shift+Tab, Enter and Escape.
4. For automated checks with Node on PATH:

```powershell
node scripts/styles.js
node --test tests/*.test.js
node scripts/check.js
# ONEFLOW_NODE_MODULES must point to the existing directory containing Playwright.
node tests/stats-notifications-browser.js chrome
node tests/stats-notifications-browser.js edge
```

## Limits and decisions

- This stage introduces no new online dependencies and keeps static/live wallpaper folders unchanged.
- OS notifications still depend on browser/OS permission and quiet-hours settings. The local inbox is available independently.
- Chart failure fallback is implemented; the automated failure test exercises history loading, not failure of the bundled chart script.
- No product decision remains open. Journal's full-screen exception is approved. No next stage was started.
