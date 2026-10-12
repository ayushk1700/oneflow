# Stage Report — Clear Home, corner controls and Notes menu

10 October 2026

## Outcome

Home no longer has a dark oval behind the clock/focus area. The cause was a radial readability gradient covering most of the center, compounded by broad text shadows. The normal scene now uses a lighter uniform shade, and text has a tight shadow. Uploaded backgrounds retain a stronger uniform safety shade, strong-contrast mode remains available, and pure white/black canvases remain unshaded.

The Notes/task workspace and Sounds have separate bottom-left buttons. Journal remains a minimal top-right entry to its full-page writing space. More has its own control, positioned to avoid mobile overlap.

The current Notes card workspace is preserved, including its existing storage, task/habit integration and other features. A single + button now opens Note, Checklist, Task and Habit choices. Escape dismisses this menu before closing the editor. This work integrates with the newer capture workspace present in the shared checkout; it does not replace its storage implementation.

## Files

```text
newtab/
  dashboard.css              even scene shade, tight text shadow, corner controls
  tokens.css                 shared text-shadow token
  widgets.css, app.css       regenerated source styles
components/notes/
  capture.js                 + creation menu and Escape handling
  capture.css                minimal menu presentation
  style.css                  isolated workspace frame and Markdown styles
  checklist.js               legacy checkbox parser used by note migration
 tests/
  calm-corners-browser.js    current combined Chrome acceptance walkthrough
  notes-checklist.test.js    legacy text/checklist compatibility
  notes-capture-browser.js   updated creation-menu entry points
```

The earlier journal changes and file tree are documented in `docs/JOURNAL_PAGE_REPORT.md`. Existing capture architecture is documented in `docs/NOTES_CAPTURE_REPORT.md`.

## Load and test

Reload ONEFLOW in Chrome's extension manager and open a new tab. A fresh installation can use Developer mode → Load unpacked → `D:\BOOKS\ONEFLOW`.

1. Confirm the clear wallpaper, bottom-left Notes/Sounds buttons and top-right Journal button.
2. Open Notes, press +, and create a note, checklist, task or habit. Return to the cards, reopen an item and reload to check persistence.
3. Resize to 390px or 320px. Open Sounds and Journal and verify the buttons remain accessible.
4. For journal appearance and writing controls, use its own sidebar Settings.

Developer checks: `node scripts/styles.js`, `node scripts/check.js`, `node --test tests/*.test.js`, and `node tests/calm-corners-browser.js` with `ONEFLOW_NODE_MODULES` pointing to Playwright.

## Acceptance

| Check | Result |
| --- | --- |
| Manifest/CSP, JavaScript syntax, safe rendering, generated styles | PASS |
| Unit suite | PASS — 84 tests |
| Initial application JavaScript | PASS — 149.2 KiB / 150 KiB |
| Central radial halo removed | PASS — CSS check and visual inspection |
| Separate corner controls at 1440/390/320px | PASS |
| + menu creates note/checklist/task/habit records | PASS |
| Card reopening, completion, saving and offline persistence | PASS |
| Menu Escape and compact Notes layout | PASS |
| Sounds and full-page Journal remain reachable | PASS |
| Chrome runtime errors in current walkthrough | PASS — none |
| Edge | UNVERIFIED — installed browser crashes at test launch |

Visual evidence: `docs/screenshots/calm-corners-home-1440.png`, `calm-corners-home-320.png`, `calm-corners-notes.png` and `calm-corners-notes-320.png`.

## Known issues and decisions

The older `calm-home-browser.js` walkthrough still tries to use the hidden Home menu while in Focus Mode; it stops there. Its preceding Home layout/navigation checks passed. The new combined walkthrough covers the requested changes directly. No claim is made that all older browser scripts match the newer Notes and Journal navigation.

The workspace entry is now labeled Notes in the newer shared implementation; tasks and habits are available through its + menu. No additional user decisions are needed. Edge verification remains pending. This stage is complete; no further stage was started.
