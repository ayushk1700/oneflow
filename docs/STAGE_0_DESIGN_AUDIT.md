# Stage 0 — Design Audit and Visual Foundation

Date: 9 October 2026

## Outcome

Stage 0 establishes one source of truth for shared visual tokens and records the current visual surface area before the Flocus-inspired calm redesign begins. Runtime behavior and feature availability are intentionally unchanged in this stage.

## Current surface inventory

### Always-visible Home elements

- Brand and top navigation.
- Quote and weather area.
- Greeting, clock, date, and main-focus session setup.
- Search.
- Optional quick links and countdown disclosure.
- Bottom tool dock.
- View switcher for Ambient, Home, and Focus.
- Scene attribution, settings, fullscreen, shortcut, and audio status controls.

### Modes

- Home: clock, greeting, daily focus, search, and optional extras.
- Focus: timer and active session controls.
- Ambient: background-first mode with an ambient clock/session return affordance.

### Secondary surfaces

- Tasks, Sounds, Notes, Habits, Countdown, Stats, Journal, Music, Scenes, Settings, Commands, Day, and customization tools.
- First-run onboarding, empty states, error states, and confirmation states.

## Findings before Stage 0

1. `newtab/app.css` was assembled from three files that each declared shared `:root` tokens: `newtab.css`, `foundation.css`, and `dashboard.css`.
2. The final visual result depended on stylesheet order rather than one documented design system.
3. Radius, panel, glass, text, shadow, action, and spacing values were defined more than once.
4. Clock customization defaults were mixed into dashboard composition rules.
5. The generated application stylesheet was valid, but its cascade made future visual changes risky and difficult to review.

## Stage 0 changes

- Added `newtab/tokens.css` as the canonical shared token source.
- Merged the effective current values into the canonical token file to avoid changing runtime appearance during the audit.
- Removed duplicate base token blocks from `newtab/newtab.css`, `newtab/foundation.css`, and `newtab/dashboard.css`.
- Moved the default clock, panel opacity, overlay, and wallpaper motion values into the token file.
- Updated `scripts/styles.js` and `scripts/check.js` so generated CSS includes and verifies the token source.
- Added a static check that prevents shared base tokens from returning to layout stylesheets.
- Added `docs/DESIGN_CONSTITUTION.md` as the review contract for future visual changes.

## Baseline evidence

The existing browser captures remain the visual baseline for later comparison:

- `docs/screenshots/dashboard-chrome-home.png`
- `docs/screenshots/dashboard-chrome-focus-ready.png`
- `docs/screenshots/dashboard-chrome-ambient.png`
- `docs/screenshots/dashboard-chrome-home-390.png`
- `docs/screenshots/dashboard-chrome-settings.png`

## Stage 0 acceptance checklist

- PASS: shared tokens have one canonical source.
- PASS: generated `app.css` includes the token source before component and layout styles.
- PASS: base layout styles no longer define their own `:root` token block.
- PASS: existing runtime CSS selectors and data attributes remain in place.
- PASS: design constitution documents the rules for old and new elements.
- PENDING: visual composition changes; these belong to later stages.
