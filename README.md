# ONEFLOW

A private workspace in every new tab. ONEFLOW is a local-first Manifest V3 extension for Chrome and Edge, written in plain HTML, CSS and vanilla JavaScript. Choose one task, start focusing, and see your progress. No account, compilation or package installation is required to use it.

## Scenic dashboard update

Home, Focus and Ambient share six original muted landscapes with scene-aware text shading. Home centers a lighter clock, greeting, date, daily focus and quiet search. The centered dock opens Tasks, Sounds, Journal, Tools and Options. Music, Stats and other tools remain available inside Tools. Options contains the view switcher, Settings, fullscreen, shortcuts, scenery, weather, quotes and optional links/countdowns. Ambient clears the central shading and keeps the analog clock. Existing Studio layouts can retain explicitly placed widgets and extra dock shortcuts.

The design contract is in `docs/DESIGN_CONSTITUTION.md`. Visual defaults live in `newtab/tokens.css`; `node scripts/styles.js` regenerates the shipped CSS. The source folder loads unpacked without a build. See `docs/CALM_HOME_STAGE_1_2_REPORT.md` for the Stage 1/2 file map, acceptance evidence and loading instructions.

Switching views preserves the session and unsaved focus form. The welcome screen guides scene → task → first session. Completed sessions show time spent, task completion and a direct way to continue. Search uses the browser's default provider. Existing schema 5 data, preferences and deadlines remain intact. New installations start with a violet accent and local daily quotes. See [dashboard stage report](docs/DASHBOARD_REPLACEMENT_REPORT.md). Journal has a full writing workspace with a calendar, autosave, search, export, printing and writing metrics. Settings → Appearance controls type, clock size, panel opacity, shade, visibility and startup view. Settings → Appearance → Wallpapers provides four offline animated atmospheres and up to two local MP4/WebM wallpapers (16 MB each), alongside still images. Journal preferences have their own section in the same Settings hub.

Tools → Help & feedback provides local help, a privacy page, backup guidance and a feedback download that sends nothing automatically. See [release report](docs/MARKET_RELEASE_REPORT.md), [launch checklist](docs/LAUNCH_CHECKLIST.md) and [two-week beta guide](docs/BETA_GUIDE.md). The launch folder contains store screenshots, a promotional image and a silent 20-second walkthrough. Public contact details, hosting, human/device acceptance and participant testing still require the publisher.

## Visual customization studio

Open **Tools → Customize** or **Settings → Appearance → Open visual customization studio**. Preview changes immediately, undo/redo experiments, and Save or Cancel. Tools → Layout opens the same editor directly on layout controls.

Customize independent desktop/mobile layouts, typography, glass surfaces, wallpaper playlists and video speed, dock placement, timer presentation, journal paper/templates, saved sound mixes, automatic Scenes, shortcuts, alerts and accessibility. Design presets include referenced local wallpapers while excluding tasks, notes, journal entries, API keys and location. See the [customization stage report](docs/CUSTOMIZATION_STUDIO_REPORT.md) for verification and limits.

## Install or upgrade

1. Export a backup before upgrading an existing installation.
2. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, and choose Load unpacked.
3. Select `D:\BOOKS\ONEFLOW`, or extract `release/oneflow-1.0.1.zip` and select its extracted folder.
4. Reload an existing entry and review its permission prompt. Reopen older dashboard tabs.
5. Open a new tab, choose a scene and enter your first task, or skip onboarding. Older records migrate automatically to schema 10. Name and theme are optional in Settings.

## Your space

- Clock/greeting, daily focus, search, quick links, original local reflections, optional weather and scenic backgrounds.
- One shared session across Home, Focus and Ambient; floating tool panels, tasks/lists, drafts, task actions/Undo, command search and three-priority queue with estimates.
- Persistent Pomodoro phases, task-linked history, notifications/chime, toolbar badge, shared local sounds and sleep timer.
- Journal, notes, habits, countdowns, mood/energy and local focus charts.
- Five built-in Scenes and custom save/rename/duplicate/delete; save atmosphere, sound mix, rhythm, visibility and layout together.
- Flow Mode: selected scene, fullscreen task/timer/sound view, optional website blocking and exit summary. Previous scene restores on exit.
- Local blocklist or allow-only mode, hostname-only visit log and an explicit five-minute override. Rules apply only to running Flow focus and release on pause, break, expiry, exit or restart.
- Morning/midday/evening rituals with reminders and streaks, grid-snapped drag/resize layout plus keyboard controls, and local suggestions.
- Full local JSON backup/restore, optional passphrase encryption, backup reminders, diagnostic export and storage monitoring.
- Centralized English interface catalog and Hindi sample with English fallback. Light/dark/device themes, reduced motion and stronger contrast.
- One Settings hub: Appearance, Home, Focus, Scenery, Reminders, Website blocking, and Data & privacy. The timer gear opens Focus preferences. Ritual, habit and backup reminder times live in Reminders.
- Optional user-key Pexels and explicit Spotify/YouTube playlist frames. External AI is excluded by your choice.

**Tools** opens tracking tools, Scenes, blocking, rituals, layout, suggestions, Settings and Scenery. No permission or online connection is requested during onboarding. Blocking setup asks only for selected domain access in blocklist mode; allow-only needs all HTTP/HTTPS sites. Capture injects an isolated shell only after an explicit toolbar/shortcut action. No persistent content script, browsing-history reading or analytics.

Tools share translucent surfaces, accent highlights and responsive layouts. Tasks, Sounds and Notes open as floating sheets on desktop; mobile gives panels more room. Notes uses a sidebar/editor layout on desktop; Settings uses a section sidebar on desktop and a compact section picker on mobile. Flow Mode expands the same timer over the selected scenery, with sound controls under a disclosure. Leaving Flow keeps the current timer; End session ends it. The fullscreen corner button only changes the browser display and does not enable Flow blocking.

`N` opens a task, `Space` starts/pauses focus, `F` enters Flow, `/` focuses search, `Esc` closes a panel/leaves Flow, and `Ctrl/Cmd+K` opens commands. Ordinary shortcuts pause while typing. The browser can refuse fullscreen; the Flow view still fills the tab.

## Data and limits

Records live in browser storage and IndexedDB. Only name/theme/accent/widget toggles use browser-managed settings sync. Backups contain private records and exclude service keys by default. Explicit key inclusion requires a passphrase; session-only keys are never exported. A lost passphrase cannot be recovered. Restore pauses timers and turns off Flow/audio. Close other editing tabs and retain a pre-restore backup.

Timer deadlines survive worker suspension. OS sleep can delay alarms; a closed browser cannot play sounds or deliver notifications. The next automatic phase begins when the worker wakes rather than inventing overnight work. Blocking is a focus aid for new GET page navigations, not a security boundary; existing loaded pages are not closed. Browser restart releases orphaned Flow and never silently reinstalls its session rules.

## Development, checks and packaging

Node 20+ runs dependency-free checks and packaging:

```sh
node --test tests/*.test.js
node scripts/check.js
node scripts/package.js
node scripts/preview.js
```

The zip uses scripts/release-files.json, rejects unexpected files/symlinks, runs checks/tests and verifies vendor/integrity.json before packaging. It excludes development files, tests, profiles, Git data, internal reports, dormant Unsplash/AI code and unused library bundles. A checksum and screenshot inventory are written beside it. Local preview is `http://127.0.0.1:4173/newtab/index.html`; it uses localStorage and cannot demonstrate extension-only blocking or closed-tab services.

Optional browser tests use Playwright and installed Chrome/Edge. Set `ONEFLOW_NODE_MODULES` to a supplied package directory:

```sh
node tests/stage3-browser.js chrome
node tests/stage3-browser.js edge
node tests/package-browser.js chrome
node tests/package-browser.js edge
node tests/refinement-browser.js
node tests/panels-browser.js chrome
node tests/panels-browser.js edge
node tests/backgrounds-browser.js chrome
node tests/backgrounds-browser.js edge
node tests/stage2-integrations.js chrome
node tests/stage2-integrations.js edge
node tests/backgrounds-browser.js chrome
node tests/backgrounds-browser.js edge
node tests/stage2-integrations.js chrome
node tests/stage2-integrations.js edge
node tests/backgrounds-browser.js chrome
node tests/backgrounds-browser.js edge
node tests/stage2-integrations.js chrome
node tests/stage2-integrations.js edge
```

Tests use disposable `.test-profile` folders. Stage 3 DNR tests pre-grant website access in an isolated fixture; the real package retains optional host grants and is loaded separately. The crash test crashes only its isolated browser. Generated evidence is in `test-results`; selected release evidence is preserved under `docs`.

Keep widget lifecycles isolated and storage access inside `core/storage.js`/`core/db.js`. Use text-safe rendering and validated imports. Vendor executable libraries locally and record source/version/license. The localization extraction helper uses the optional Playwright parser; generated catalogs already ship.

See [Stage 3 report](docs/STAGE_3_REPORT.md), [QA](docs/QA.md), [Architecture](docs/ARCHITECTURE.md), [Permissions](docs/PERMISSIONS.md), [Privacy](docs/PRIVACY_POLICY.md) and [Store listing](docs/STORE_LISTING.md). Public publication requires publisher contact/policy hosting and the remaining human checks. No upload or store publication is performed by this task.

## Unified timer update

Daily focus, task sessions and breaks now share one timer view. Choose a task or enter a focus and duration, then Start focus. Focus opens duration/settings only. Fullscreen expands the current session; Leave Flow returns to the same running or paused timer. Use End session to finish it. See [UNIFIED_TIMER_REPORT.md](docs/UNIFIED_TIMER_REPORT.md) for changes and current verification.

The subsequent focus/panel redesign and unified Settings implementation are recorded in [FOCUS_PANELS_REPORT.md](docs/FOCUS_PANELS_REPORT.md). Regenerate the checked-in `widgets.css` and `app.css` with `node scripts/styles.js` after changing any source stylesheet.

## Visual foundation and home transformation

The current dashboard centers its clock and timer directly over the scenery. Photo/Pure Black/Pure White choices remain in Settings → Appearance → Wallpapers. Tailwind 3.4.17 ships locally; no CDN or compilation is needed to run the extension. Component CSS is consolidated with `node scripts/styles.js` after edits. `newtab/dashboard.css` supplies the current interface; the earlier home and sketch reports describe historical designs. See [DASHBOARD_REPLACEMENT_REPORT.md](docs/DASHBOARD_REPLACEMENT_REPORT.md) for this stage.

Six original landscapes load offline, including **A quiet journey**, an illustration with a warm summit and quiet foreground. Choose one in Settings → Appearance → Wallpapers. Backgrounds use small previews, a decoded-image fade and crops suited to desktop/mobile; shading protects the text area while leaving more of the scenery visible. Stronger contrast and custom layouts increase the coverage. Flow has its own shading without stacking Home's overlay. Existing uploaded/cached photos remain available; small previews are generated locally. Existing selections are preserved. See [background and release report](docs/BACKGROUNDS_RELEASE_REPORT.md) for final checks and manual accessibility limits.




Pexels photos and videos: Settings → Appearance → Wallpapers. Save your own Pexels API key, choose Photos or Videos and search. Selected media works offline. See [Pexels stage report](docs/PEXELS_REPORT.md).


Workspace groups Tasks, Notes and Habits in one tabbed panel. Tools opens the expanded tool page; Journal uses shared panel navigation and styling. See [Workspace stage report](docs/WORKSPACE_REPORT.md).


## Security update 1.0.1

Weather uses city search without device-location permission. System notifications are optional; allow them in Settings → Reminders. Backups support 128 MiB of plain content plus encrypted-envelope expansion, validate media before restoring, and omit keys by default. Pexels also offers session-only keys. Full deletion removes capture/session data, optional grants and menus; open Notes editors are invalidated after replacement. Corrupt preview JSON is preserved for explicit recovery in Data & privacy.

Local candidate: node scripts/package.js. Public release: node scripts/package.js --release, requiring configured contact/hosted privacy URL and a clean Git revision. Support: aayush31500@gmail.com. Public policy hosting still needs the publisher. Chrome and Edge are the tested targets; this package makes no Firefox compatibility claim. See docs/SECURITY_REMEDIATION_REPORT.md for verification and remaining limits.

## Customization foundation (Stage 1 of 3)

Open More > Settings, or press S outside an input, for live themes, local fonts, widget visibility, Zen mode, reversible changes and settings JSON import/export. See [the Stage 1 report](docs/CUSTOMIZATION_FOUNDATION_STAGE_1_REPORT.md) for the versioned schema, reviewed files, browser checks and regression checklist. The checked-in extension still runs without a build step.
