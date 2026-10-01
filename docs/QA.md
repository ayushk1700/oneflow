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
