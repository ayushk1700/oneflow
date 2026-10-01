# Stage 2 Report — Focus engine and feature expansion

Version **0.2.0**, verified on **1 October 2026**. Stage 2 implementation is complete. Stage 3 has not started. The remaining human/provider checks are listed explicitly below.

## What was built

| Area | Delivered behavior |
| --- | --- |
| Pomodoro | Custom focus/short/long phases, cycle length, presets, automatic next-phase options, pause/resume/skip/reset, badge, notifications and optional soft chime. Timestamp state and alarms survive dashboard closure and browser restart; open tabs stay synchronized. |
| Task-linked focus | Start from a task, retain the task reference/title in session history, and display sessions/minutes spent per task. Completed and partial sessions use stable IDs in IndexedDB. |
| Sound mixer | Seven original local rain, cafe, fireplace, forest, ocean, white-noise and brown-noise sound beds; native Web Audio loops, layer/master gains, remembered mix and sleep timer. A shared offscreen document keeps sound playing after new tabs close. |
| Music | Explicit Spotify/YouTube playlist connection, network-use disclosure, allowlisted frames, removal when the panel closes. |
| Journal | 100 local prompts, dated entries, immediate streak updates, history, search/date filtering, editing and deletion in IndexedDB. |
| Notes | Multiple autosaved notes, search and safe markdown-lite preview. |
| Habits | Named habits, daily check-ins, editable weekly heatmap, streaks and optional daily reminder alarms. |
| Countdowns | Editable events, calendar-day counting and one pinned dashboard event. |
| Stats and mood | Day/7-day/30-day focus totals, session and task counts, best starting hour, streak, timestamped energy check-ins, lazy local Chart.js and an accessible chart-data table. |
| Break companion | Stretch, 20-20-20 eye rest and reduced-motion-aware breathing guidance. |
| Unsplash | Optional local user key and host grants, search, selection/download tracking, attribution, online image URLs and offline cached blobs. |
| Migration and backup | Local schema 2 and IDB version 2, preservation of Stage 1 records, Stage 1 backup compatibility, all new data included in export/import, and coordination between backups and timer session writes. |

The existing calm dashboard remains the main view. Focus and Sounds have dock controls; **Your day** opens reflection and tracking panels. Unsplash is in **Scenery**. Settings includes every new widget toggle. No account or online service is required for local features.

## File tree

Relevant Stage 2 additions and updates; existing Stage 1 widget folders are retained.

```text
ONEFLOW/
├── manifest.json                         # MV3 0.2.0, permissions and CSP
├── newtab/{index.html,newtab.css,newtab.js}
├── background/
│   ├── service-worker.js                 # alarms, timer, notifications, audio owner
│   └── audio/{index.html,audio.js}
├── core/
│   ├── timer-logic.js                     # pure timestamp transitions
│   ├── timer-engine.js                    # serialized updates and session outbox
│   ├── timer-client.js
│   ├── audio-engine.js
│   ├── stats-logic.js
│   ├── stage2-schema.js
│   ├── features.js                        # lazy feature panels
│   └── {schema,storage,db,backup,theme}.js # migration/integration updates
├── components/
│   ├── timer/       ├── break/       ├── sounds/
│   ├── journal/     ├── notes/       ├── habits/
│   ├── countdowns/  ├── mood/        ├── stats/
│   ├── music/       └── unsplash/         # each has index.js and style.css
│   └── {tasks,settings}/                 # integration updates
├── data/prompts.json
├── assets/sounds/{rain,cafe,fireplace,forest,ocean,white,brown}.wav
├── assets/sounds/LICENSES.md
├── vendor/chart.js/4.4.8/{chart.umd.js,LICENSE.md}
├── vendor/README.md
├── scripts/{check,stage2-assets}.js
├── tests/{stage2,integrations}.test.js
├── tests/{stage2-browser,stage2-integrations}.js
└── docs/
    ├── ARCHITECTURE.md, PERMISSIONS.md, QA.md, STAGE_2_REPORT.md
    ├── qa-results/stage2-*.json
    └── screenshots/stage2-*.png
```

## How to load and test

1. Back up existing data from Settings before upgrading.
2. In Chrome or Edge, open the browser's extensions page and enable Developer mode.
3. Load unpacked from `D:\BOOKS\ONEFLOW`, or reload its existing entry. Review any new permission prompt for alarms, notifications and offscreen audio.
4. Reopen old ONEFLOW tabs, then open Focus, Sounds and Your day. Existing data migrates automatically. No compilation or installation is needed to run the extension.
5. Follow the Stage 2 walkthrough in [QA.md](QA.md). The ordinary local preview cannot demonstrate closed-tab alarms or offscreen playback; use the extension for these.

Dependency-free checks:

```sh
node --test tests/*.test.js
node scripts/check.js
```

Optional automated browser checks require Playwright and installed Chrome/Edge. Set `ONEFLOW_NODE_MODULES` to an existing module directory if needed; tests use isolated profiles, never a personal profile.

```sh
node tests/stage2-browser.js chrome
node tests/stage2-browser.js edge
node tests/stage2-integrations.js
node tests/browser.js chrome
```

## Acceptance and verification

| Requested acceptance item | Result | Evidence and limits |
| --- | --- | --- |
| Timer accurate after closing every dashboard tab and reopening | **PASS** | Real browser alarms completed the saved phase with all dashboard tabs closed; reopening produced exactly one session. A full browser restart preserved the running deadline. Pure tests cover late wake, serialized restart, clock changes, pause/resume and stale tab commands. |
| Phase-change notification with new tab closed | **PASS at API level** | Chrome and Edge accepted the actual notification request with all dashboard tabs closed. OS toast appearance/sound is not visually verified and depends on notification settings. |
| Sound loops without audible gaps; volumes persist | **PARTIAL verification** | Native looping buffers and two active layers verified in the running offscreen AudioContext; volumes survived restart. Source files overlap the loop boundary. A human listening pass for audible seams remains pending. |
| Journal/habits/notes/countdowns persist and export/import | **PASS** | Stage 1 migration, new feature saves, full Stage 2 export/import and browser restart tested in Chrome and Edge. Integration test also covers backup while background services are active. |
| Stats match raw records | **PASS** | Unit tests compare duration sums, completed tasks, sessions, local dates, best hour, streaks and mood against fixtures. Browser verifies lazy chart and data table. |
| Every new permission justified | **PASS** | [PERMISSIONS.md](PERMISSIONS.md) explains alarms, notifications and offscreen; Unsplash hosts remain optional and requested on use. No blocker permissions added. |
| Responsive startup; lazy vendor loading | **PASS for sampled checks** | Final Chrome repeat opens: 108–126 ms; Edge: 118–145 ms. No startup third-party requests, chart script or music frame. Application JS upper bound 126.8 KiB, including lazy application modules and background code; Chart.js excluded. Desktop/mobile screenshots inspected. These are local automated timing samples, not a Lighthouse score or a universal performance guarantee. |
| Unit tests | **PASS** | 24/24; manifest paths, source syntax, CSP/static safe-DOM checks and 500 local quotes also pass. |

Browser integration totals: **17 Chrome checks**, **17 Edge checks**, **6 optional-integration checks**, and **15 Stage 1 regression checks on Chrome**, all passing. No page/console errors in these flows. Tested installed versions: Chrome 154.0.8037.92 and Edge 154.0.4258.48. The final Chrome rerun additionally verifies immediate journal streak refresh after saving.

Saved evidence:

- [Chrome Stage 2](qa-results/stage2-chrome-report.json), [Edge Stage 2](qa-results/stage2-edge-report.json), [optional integrations](qa-results/stage2-integrations-report.json), [Stage 1 regression on Stage 2](qa-results/stage2-regression-chrome-report.json).
- [Dashboard](screenshots/stage2-chrome-dashboard.png), [mobile](screenshots/stage2-chrome-mobile.png), [mixer](screenshots/stage2-chrome-sounds.png), [timer/break](screenshots/stage2-chrome-timer.png), [stats](screenshots/stage2-chrome-stats.png).

## Decisions and known limitations

- Late wake-ups complete the current phase once; an automatic next phase starts when the worker wakes. This avoids fabricating unattended overnight sessions. OS sleep can delay alarms; a closed browser cannot deliver notifications. Detected backward clock jumps rebase remaining time; forward jumps count as elapsed wall time.
- Sound beds are original synthesized ambience, released under CC0, rather than field recordings. Seven 12-second mono WAVs total 2,688,308 bytes. Playback persists while the browser is running; browser restart retains volumes but requires an explicit playback action. Firefox offscreen compatibility is not implemented or tested.
- Provider integration tests use mocked responses/frames. Actual Spotify/YouTube playback, provider login restrictions, and a live user-key Unsplash request still need user-environment verification. No key was supplied or embedded in the repository.
- Stats include partial focus, attribute sessions to their local starting date/hour, and use a rolling 30-day month. Historic Stage 1 task completions have no reliable timestamp and are not invented in dated statistics.
- Backups contain private journal content and any locally saved Unsplash key. They are unencrypted at this stage. Restore pauses timers and stops sound. Timer writes are coordinated, but restoring two storage backends is not fully crash-atomic; close other editing tabs and keep the pre-restore backup.
- Human screen-reader review, physical-device listening and OS notification presentation remain manual checks. The full release audit, localization and packaging belong to Stage 3.

**Decisions needing your input:** none block this implementation. Optional online services require your own connection/key only if you choose to use them. Stage 3 remains unstarted.
