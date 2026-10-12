# ONEFLOW Stage 3–4 Report

Date: 2026-10-10

## What was built

Stage 3 rebuilds Focus Mode as a quiet transition:

- Hides the clock/greeting, search, quote, weather, links, countdowns, attribution, and session setup extras while Focus Mode is active.
- Keeps the active task title, lightweight large timer, progress bar, primary pause/resume action, finish action, Sounds access, and Exit Focus.
- Adds `Escape` support for leaving Focus Mode and retains the existing Space pause/resume shortcut.
- Keeps timer state in the existing background-owned session engine.

Stage 4 consolidates progressive disclosure:

- The permanent dock now contains Tasks, Sounds, Journal/Notes, and More.
- The former separate Tools cluster was removed.
- More contains view switching, Settings, fullscreen, shortcuts, scenery, weather, quick links, and an All tools entry for secondary features such as Habits, Countdown, Stats, Scenes, and Integrations.
- Dock controls share one position and consistent labels, titles, focus treatment, and active state.
- The dock fades and becomes non-interactive during Focus Mode.

## Files changed

- `newtab/index.html` — Focus exit control and single More disclosure.
- `newtab/newtab.js` — primary dock generation, More routing, Focus sounds/exit events, keyboard behavior, active state.
- `components/session-view/index.js` — Focus sounds action, finish labeling, keyboard metadata.
- `newtab/dashboard.css` / `newtab/app.css` — quiet Focus presentation, responsive layout, dock transition.
- `tests/stage34-browser.js` — focused Chrome acceptance coverage.
- `tests/stage3-browser.js` and `tests/calm-home-browser.js` — updated selectors for the new More model.

## Verification

- Static manifest/CSP/syntax/safe-DOM/performance check: PASS.
- Initial JavaScript budget: 144.2 KiB / 150 KiB.
- Unit suite: 77/77 passing.
- Focused Chrome browser acceptance: PASS.
  - Focus Mode hides unrelated features.
  - Active task/timer/actions remain available.
  - Space pauses/resumes and Escape exits.
  - Dock hides during Focus Mode.
  - Home dock exposes Tasks, Sounds, Journal, and More.
  - More opens the full tool directory.

## Known notes

- The comprehensive Stage 3 browser flow contains many older feature checks; its navigation selectors were updated to the current More/Suggestions labels. The focused Stage 3–4 acceptance runner is the authoritative verification for this implementation.
- No live wallpaper media was added; existing wallpaper-folder behavior is unchanged.

## How to test

Load `D:\BOOKS\ONEFLOW` as an unpacked Manifest V3 extension in Chrome or Edge, open a new tab, start a focus session, and verify the Focus/More behaviors above. The focused runner is:

```text
tests/stage34-browser.js chrome
```
