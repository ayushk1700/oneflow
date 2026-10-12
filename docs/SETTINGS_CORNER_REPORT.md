# Stage Report — Minimal corner settings

11 October 2026

Settings now sits in the bottom-right corner as a local sliders icon. More sits beside it as an ellipsis icon. Both retain hover labels, accessible names, visible keyboard focus and 44px touch targets. Notes and Sounds remain at the bottom-left. Wallpaper attribution sits above the corner controls to avoid overlap.

## Files

```text
newtab/index.html       move the existing Settings button; simplify More
newtab/dashboard.css    shared-token corner layout and icon controls
newtab/app.css          regenerated stylesheet
```

## Load and test

Reload ONEFLOW in the browser extensions manager and open a fresh new tab. Click the bottom-right sliders icon to open Settings. Press Escape to return focus to it. The neighbouring ellipsis opens More. No compilation is required to load unpacked from `D:\BOOKS\ONEFLOW`.

## Acceptance

- PASS: Chrome loaded the unpacked extension without page errors.
- PASS: 1440px, 390px and 320px layouts; controls remain separate and within the viewport.
- PASS: settings icon opens the existing Settings panel; Enter activates it and Escape restores focus.
- PASS: More menu fits the viewport; each corner icon has a 44px target.
- PASS: dark scenic background, light/white canvas, reduced motion and saved Studio dock positioning.
- PASS: manifest/CSP/syntax/safe-DOM checks and all 84 unit tests.
- PASS: generated styles rebuilt; initial JavaScript stays at 149.2 KiB of the 150 KiB budget.

Screenshot: `docs/screenshots/settings-corner-320.png` (desktop and 390px captures are beside it).

No known issues in the changed controls. This change was browser-tested in Chrome; Edge was not rerun. No decisions require user input. No next stage was started.
