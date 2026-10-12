# Market-readiness QA — 2026-10-05

Current acceptance is recorded in MARKET_RELEASE_REPORT.md. Run `node --test tests/*.test.js`, `node scripts/check.js`, and `node tests/market-browser.js chrome` / `edge`. The market suite covers real first-run activation, default-provider search, cross-tab and offline continuity, session completion/continuation, encrypted recovery, local feedback, privacy page, narrow layouts, shortcuts and eight cached startup samples. The `search` permission is required and storage schema is now 5. Public links need actual publisher details in core/publisher.js. A real two-week pilot and assistive-technology/device checks are not replaced by automated results.

# Stage 3 release QA — 2026-10-03

Run these with Node and the optional development Playwright runtime (ONEFLOW_NODE_MODULES points to its installed node_modules directory). Runtime extension code has no dependency on that tooling.

1. node scripts/check.js — manifest references, strict CSP, all-source syntax, safe DOM checks, 500 unique local quotes and eager JS size.
2. node --test tests/*.test.js — 44 unit/storage checks, including background metadata/assets, schema migrations, timer transitions, malformed imports, scene boundaries, domain rules, encryption authentication and language fallback.
3. node tests/stage3-browser.js chrome and edge — isolated profiles, migrations, scene save/apply/undo, keyboard layout, ritual/alarm, suggestions, fullscreen timing, real DNR redirect/override/expiry, pause/resume/exit, worker suspension, browser restart, missing session lease, encrypted restore, diagnostics, repeated opens and mobile width.
4. node scripts/package.js — deterministic runtime-only zip and SHA-256; no personal/test profiles or credentials.
5. node tests/package-browser.js chrome and edge — CRC-checked extraction, clean manifest, no host grants/startup network, offline keyboard tasks, plain text rendering, daily completion, Focus-disabled timer controls, dock bounds, command keyboard focus, Hindi shell and console errors.

The Stage 3 redirect tests copy the extension into an isolated fixture and add required test host grants. They exercise actual browser DNR rules, not a mock. The release manifest is tested separately with zero host grants. Native permission acceptance/rejection remains a manual check. Existing Stage 1/2 reports are historical evidence; their UI-specific scripts may require selector updates for the unified card and More dock.

## Required manual acceptance before store publication

- Enable blocklist access through the actual permission prompt; decline it and verify the dashboard remains usable. Test an allow-only list, subdomains and removing permission through browser settings. Browser-internal pages and non-HTTP(S) addresses are outside blocking scope.
- In an isolated profile, forcibly terminate the browser during Flow and relaunch. Normal restart and missing-lease recovery pass automatically; physical process-crash verification could not complete because CDP Browser.crash left a Windows profile lock.
- Review notification permission and actual OS toasts, audible chime, sound mixing and seamless loops. Headless tests do not verify perceived audio quality.
- Use NVDA/Narrator, 200% zoom, and keyboard navigation across every tool. Verify daily rollover and real device sleep/wake. Automated modal focus and reduced-motion CSS checks do not certify a full WCAG audit.
- Review contrast over bright uploads and each theme/accent, actual weather/location prompts, own-key Unsplash and optional playlist embed behavior. No personal provider keys are used during this build.
- Restore a large image-bearing encrypted backup in a disposable profile; preserve your own backup before destructive testing. Verify forgotten-passphrase messaging.
- Provide publisher identity/contact and a public privacy-policy URL, resize/capture screenshots to current portal requirements, review store declarations, then upload manually. This build does not publish an extension.

---

# Stage 1 QA

Run `node --test tests/*.test.js`, `node scripts/check.js`, and optional `node tests/browser.js chrome` / `edge`. Automated results and limitations are recorded in `STAGE_1_REPORT.md`.

## Manual user acceptance

1. Load unpacked with Developer mode; check the extensions page for manifest warnings and the new-tab console for errors. Open a second tab.
2. Complete onboarding, then reset and skip it; neither route should request permissions.
3. Change name, theme, font, clock format, accent, and units. Check each panel and keyboard focus with dark/light/device themes.
4. Set, edit, and check daily focus. With reduced motion enabled (device and setting separately), confirm there is no celebration animation. Leave a tab open across local midnight and verify a fresh focus prompt.
5. Add two lists and tasks. Edit, complete, drag reorder, use up/down buttons, cancel deletion, confirm deletion, rename a list, and delete a list. Last list cannot be deleted. Try concurrent additions in two tabs.
6. Add, edit, and remove quick links. Verify local first-letter icons and reject javascript/data/file URLs. Test the three search engines through explicit search submissions.
7. Refresh/favorite quotes; reopen the favorites panel after restart. Quotes work offline. Entries are original ONEFLOW reflections, not attributed historical quotations.
8. Open weather. Deny permissions: show a friendly explanation. Retry, accept and search a city; verify city disambiguation. Try geolocation accept/deny/unavailable. Confirm temperature conversions, cached weather offline, and forget-location revocation. Inspect network requests for only the two documented API hosts.
9. Try all five backgrounds, solid, gradient, blur, daily rotation, and uploads. Reject SVG, oversized, and corrupt uploads. Remove the active upload and verify the bundled fallback. Check all screens over a pure-white and a pure-black image.
10. Disable and re-enable every widget. Its display and dock control must disappear; disabled weather stops its timer. `N` does nothing with tasks disabled; `/` does nothing with search disabled.
11. Export data with an upload, change/delete sample content, then import. Everything, including image content and favorites, must return. Reject future-schema, duplicate-ID, orphan-task, hostile URL, missing-image, and malformed backups without changing existing data. Back up before restore and close other editing tabs.
12. Delete all data only in a disposable profile; verify local and IndexedDB records reset, sync preferences cleared, and weather permissions revoked.
13. Navigate keyboard-only: visible focus, tab through every form, reorder tasks, submit with Enter, close dialogs with Escape, return focus to opener. Verify dialog focus does not escape. Check text input does not trigger shortcuts.
14. Screen-reader pass (NVDA or Narrator): title and labels, task checkbox state, dialog announcement, toast live region, and clock not announced every second. This requires human assistive-technology review.
15. Check desktop (1440×960), compact laptop (1280×720), mobile preview (390×844), and browser 200% zoom. Confirm no horizontal overflow or unreachable actions.
16. Close the entire browser and reopen: local document, uploads, favorites, and settings persist. Measure `performance.getEntriesByName('oneflow-ready')[0].startTime` over five repeat opens with DevTools closed.

## Upgrade coverage

Schema-0 fixture → version 1 fills missing defaults while preserving existing tasks/name. A future schema must refuse to downgrade. IDB v1 retains unused journal/session stores for future migration. Stage 2/3 migrations and cross-browser portability are not claimed by this Stage 1 build.

## Stage 2 walkthrough and results

The sections above describe the historical Stage 1 baseline. Stage 2 results and limitations are recorded in [STAGE_2_REPORT.md](STAGE_2_REPORT.md). Use a disposable profile for destructive backup/reset testing.

1. Upgrade an existing Stage 1 profile. Confirm its tasks, settings, image and journal records remain. Test importing a Stage 1 backup and rejecting a future schema without resetting data. Automated migration fixtures and validation tests pass.
2. In Focus, try custom phase durations, presets, cycle lengths and both automatic-start flags. Start/pause/resume, skip/reset, then start from a task. Reopen Tasks to inspect recorded session counts. Pure transition tests and browser start/pause/resume/task-link checks pass.
3. Open two dashboards and pause from one. Check the other updates. Close all dashboard tabs while a phase runs, then reopen after its deadline: one session and the correct next phase should appear. Restart the browser during a running phase. These automated Chrome/Edge checks pass. Separately inspect the toolbar badge and the visible OS notification with system notifications enabled.
4. Enable the soft chime. Listen through a phase change. Play each sound, mix several, adjust each gain and the master, and listen across at least three 12-second loop boundaries. Close all dashboard tabs and confirm playback continues; reopen and stop it. Check restart retains volumes without autoplay. Running layers, saved gains and sleep expiry pass automated checks; subjective seam/chime listening remains pending.
5. Create today's journal entry and verify its streak updates immediately. Search and date-filter history, edit an earlier entry and delete a disposable entry. The save/search/migration path and immediate streak update pass; review editing/deletion through the UI as part of human acceptance.
6. Create multiple notes, search, edit and reopen. Preview headings, emphasis, bullets and code; HTML must remain literal text. Automated autosave and non-executable preview checks pass.
7. Add habits, toggle this week's cells, inspect streaks and configure a daily reminder. Check the reminder in the OS and disable it again. Saved check-ins, heatmap and alarm creation pass; visible OS delivery is a manual check.
8. Create/edit/delete countdowns, pin one, and confirm calendar-day behavior around midnight/month/year boundaries. Save/pin and pure date calculations pass.
9. Record different energy levels. Complete and interrupt sample focus sessions; compare raw records against Today, Last 7 days and Last 30 days. Expand chart data. Unit aggregation, mood persistence and lazy chart loading pass.
10. Inspect break stretches, eye-rest text and breathing animation; enable reduced motion and verify the animation stops. Keyboard-test new controls and use a screen reader to confirm the timer is not announced each second. Human assistive-technology review remains pending.
11. Open Music: no provider frame should load until Connect & load. Test valid Spotify/YouTube playlists, invalid hosts/URLs, and closing the panel. In Scenery, explicitly connect a user Unsplash key, search/select a photo and verify photographer attribution; reload offline. Mocked connection boundaries, download tracking and offline-cache checks pass. Real provider playback/key tests remain pending.
12. Disable/re-enable each new widget; disabling Sounds must stop playback. Export every new collection, change data and restore, then restart. Verify paused timer, stopped audio and retained records. Automated Stage 2 roundtrip and Sounds disable checks pass; retain a pre-restore backup.
13. Inspect desktop/mobile layout and new-tab console; check startup has no online calls without opt-in and no eager chart/music resources. Automated responsive/startup/error checks pass. Repeat keyboard-only navigation, 200% zoom and the full Stage 1 walkthrough for release acceptance.

Automated commands: `node --test tests/*.test.js`, `node scripts/check.js`, `node tests/stage2-browser.js chrome`, `node tests/stage2-browser.js edge`, `node tests/stage2-integrations.js`, and `node tests/browser.js chrome`. Browser tests require Playwright as described in README and generate fresh isolated profiles. Saved Stage 2 evidence is under `docs/qa-results/stage2-*.json`; original Stage 1 reports are preserved separately.
## Focus, panels and unified Settings acceptance

Run `node tests/panels-browser.js chrome` and `node tests/panels-browser.js edge` with the optional Playwright runtime configured. The walkthrough opens all tools and all seven Settings sections at 1440, 390 and 320 pixel widths with real saved task, note, habit and countdown fixtures. It verifies the dock/gear routes, retained drafts, unchanged active deadline on preference save, ritual/habit alarm creation, Notes autosave, blocking setup without grants while disabled, fullscreen continuity, light Settings, keyboard containment, no console/CSP errors, and offline reload without external calls.

For manual acceptance, inspect reading comfort, imagery and contrast on your uploaded backgrounds; navigate every form with a keyboard and a screen reader. Check physical-device touch targets, actual browser zoom, OS notification delivery and sound quality. Automated responsive checks do not certify a full WCAG audit. See `FOCUS_PANELS_REPORT.md` for this stage's verified results and any performance limit.
## Background presentation and final release acceptance

Run `node tests/backgrounds-browser.js chrome` and `node tests/backgrounds-browser.js edge`. All six local images are checked offline at 1440×960, 1280×720, 390×844 and 320×640, with crop metadata, no overflow and accessible Start controls. The suite tests stale completions, an injected full-image failure, uploaded image/scene persistence and small previews, solid/photo switching, strong contrast, layout shading, explicit/system reduced motion, shortcuts, visible focus, dialog containment and actual 200% tab zoom via the browser Tabs API. The injected image failure intentionally produces a failed-resource console entry; release regression runs require clean consoles.

Run unified timer, panels, Stage 3, optional-integration and extracted-package suites in Chrome and Edge. Stage 3 measures five cached opens with the other test browsers closed. Optional provider tests use fixture responses, not real keys or playback. See `BACKGROUNDS_RELEASE_REPORT.md` and `docs/qa-results/backgrounds-*.json` for final evidence. Human screen-reader use, arbitrary upload contrast, touch devices, audio listening, OS notifications, real-provider connection and physical crash recovery are not certified by these checks. Browser 200% zoom is now covered automatically; assistive-technology reading order remains a human check.

## Current journal and wallpaper checks

Run node tests/dashboard-browser.js edge and node tests/journal-wallpapers-browser.js chrome / edge with the optional Playwright runtime configured. They verify separate tools, journal calendar navigation and autosave/manual save, local export, print-content preparation, metrics, unified preferences, responsive layouts, appearance controls, animated backgrounds, silent local WebM playback, reduced motion, media backup roundtrips and offline persistence. Physical printing, screen-reader usability and video codec/device coverage remain manual. Earlier home/sketch scripts document historical interfaces.

