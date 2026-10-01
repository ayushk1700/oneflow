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
