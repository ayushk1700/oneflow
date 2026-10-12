# Sketch UI Stage Report — October 4, 2026

## Built

ONEFLOW now follows the supplied sketches: one centered clock/focus workspace; brand and weather at the top corners; search directly below; two quiet round Focus/Music controls at bottom-left and Settings at bottom-right.

The clock and focus session retain their isolated module lifecycles and shared background timer. They share one visual surface with a light divider on desktop and a vertical arrangement on mobile. Active focus and break states retain their countdown, progress and real session actions. Existing daily completion, drafts, timer history and keyboard shortcuts remain available.

Tasks and secondary tools open from Tasks & tools in the workspace header. Quick links, dates and the quote live behind a small disclosure under search. Settings uses a wide centered overlay with its existing categories, close control, internal scrolling, inert background and focus restoration. Music uses a large immersive panel with playlist information/connection on the left and actual local Rain/Forest/Ocean soundscape actions on the right. Provider frames load only after Connect; closing or switching still removes playback frames.

Shared radius, spacing, thin borders, type hierarchy, monochrome primary actions and local SVG icons make the views consistent. Light theme, reduced motion, optional widgets and stronger image contrast continue to work. Legacy saved dashboard layout data is preserved, but the clock/focus grouping now stays fixed inside the central workspace to match this design.

## Changed file tree

```
newtab/index.html        central workspace and corner launchers
newtab/newtab.js         two launchers and tools/settings actions
newtab/sketch.css        sketch composition, responsive and music styles (new)
newtab/app.css           regenerated local stylesheet
core/features.js        Tasks and Ambient sounds in tool directory
components/music/       immersive provider/local soundscape view
scripts/styles.js       include sketch source in generated CSS
scripts/check.js        verify generated stylesheet consistency
tests/sketch-browser.js Chrome/Edge sketch interaction checks (new)
tests/package-browser.js updated shell assertion for relocated Tasks
docs/SKETCH_UI_REPORT.md this report
release/                rebuilt extension archive and checksum
```

## Acceptance

- PASS: 44 unit tests, including timer history, custom durations, migrations, scene validation, blocking, encryption, background presentation and storage initialization.
- PASS: manifest/CSP references, source syntax, safe DOM rendering and generated CSS consistency. Initial eager JavaScript: 139.1 KiB / 150 KiB.
- PASS in Chrome and Edge: centered single workspace, clock/focus present once, two left corner launchers and right Settings control, titled timer start/pause, spacious Settings and launcher focus restoration, Music disconnected until explicit action, actual local soundscape state, secondary task creation, mobile width, light theme, no page errors.
- PASS in Chrome and Edge: extracted package smoke checks for offline loading, no startup website grants/requests, safe task entry, timer access when Focus is disabled, dock fitting, keyboard dialog/Escape and Hindi fallback.
- Reviewed desktop home/focus/settings/music and mobile home/music/light screenshots under test-results/sketch-<browser>-*.png. Structured results are test-results/sketch-<browser>-report.json.

## Load and test

Reload the existing unpacked extension and open a fresh new tab, or extract release/oneflow-1.0.0.zip and load the extracted folder through Chrome/Edge extension developer mode. Export a backup before replacing an installation. No compilation is needed to run the shipped extension.

Verification commands: `node --test tests/*.test.js`, `node scripts/check.js`, `node tests/sketch-browser.js chrome` / `edge`, and `node tests/package-browser.js chrome` / `edge`. Browser tests use the supplied Playwright directory via ONEFLOW_NODE_MODULES. Edit source styles and run `node scripts/styles.js` when changing the consolidated stylesheet.

## Known limits and decisions

The music view cannot invent track metadata, artwork, external search results or an application-owned queue from a playlist iframe. The connected provider supplies those playback features. Local soundscape choices are real audio actions, not a fake queue. Playback audibility, provider credentials/availability, screen-reader testing and measured contrast still need human checks. Small new interface labels use English fallback.

Earlier four-dock and split-home browser scripts describe superseded UI arrangements; sketch-browser.js is the acceptance test for this shell. Blocking and backup behavior was preserved rather than reimplemented in this stage. No new dependency, permission, account or external service was added. The release remains local; nothing was published. No user decision is required for this implementation.
