# Notes workspace redesign — 11 October 2026

## Built

The Notes entry now opens a full-screen light workspace based on the supplied Notely screenshot. It has a left navigation rail, label list and counts, top search, quick note/checklist/image actions, pinned cards, a pastel note grid, sort and filter controls, a floating creation menu, and a local settings menu. Existing notes, checklists, tasks, habits, reminders, media, autosave, archive, trash, and backup behavior remain connected. Card text uses safe DOM text nodes; image previews load only from local note attachments. Existing dark preference remains available. The injected webpage capture frame adapts to narrow widths and retains keyboard move/resize.

## Changed files

- `components/notes/capture.html`, `capture.js`, `capture.css` — workspace UI and behavior.
- `core/storage.js` — light default and locally stored custom labels in notes preferences schema 2.
- `newtab/tokens.css`, `newtab/system.css`, generated `newtab/app.css` — palette and full-screen dashboard panel.
- `tests/notes-capture-browser.js`, `tests/notes-overlay-browser.js` — updated navigation and layout checks.
- `docs/DESIGN_CONSTITUTION.md` — updated Notes exception for the new reference.

## Load and test

Load `D:\BOOKS\ONEFLOW` as an unpacked extension in Chrome, open a new tab, and choose Notes. The toolbar capture action still opens Notes in a webpage overlay. Run `node scripts/styles.js`, `node scripts/check.js`, `node --test tests/*.test.js`, and the Notes browser scripts with `ONEFLOW_NODE_MODULES` set to the Playwright runtime.

## Acceptance

| Check | Result |
| --- | --- |
| Full-screen Notes workspace from dashboard | Pass — browser assertion confirms viewport bounds |
| Sidebar, search, quick capture, pinned and all-notes grid | Pass — Chrome desktop and narrow screenshots |
| Sort, label creation/filter, grid/list, archive/trash/reminders | Pass — browser interactions |
| Autosave, failure retry, media, recording, backup | Pass — Chrome Notes browser test |
| Webpage overlay isolation, keyboard controls, fallback | Pass — Chrome overlay browser test |
| Manifest/CSP/style check and unit suite | Pass — 84 tests |
| Edge browser run | Unverified — installed Edge exits during headless startup before extension code runs |

## Known issues and decisions

The supplied screenshot is a visual reference; its sample text, photos, and branding were not added to user data. Pinned and all-notes sections show only the user's local records. Existing saved dark preference remains respected; new installations start in light mode. The installed Edge binary crashes during automated startup on this machine, so an Edge manual check is still needed. No product decision requires input.
