# Stage 1 of 3: Customization Foundation

Implemented in the existing vanilla HTML/CSS/ES-module extension. No framework, runtime library, additional permission, remote code or font service was added. The default dashboard appearance is retained. Stage 2 was not started.

## A. Files reviewed

[Full per-file review inventory](CUSTOMIZATION_FILES_REVIEWED.md) and [399-file source/asset inventory with hashes](qa-results/customization-reviewed-files.json). Text files were read for source/consistency review; binary assets were hashed, not individually inspected. Manually traced storage, schemas, settings, theme/runtime, widget visibility, UI/dialog helpers, imports/reset, the Design Constitution and verification/release scripts. The inventory states this coverage explicitly rather than claiming a line-by-line vendor audit.

## B. Implementation plan and decisions

Extend existing token styles and widget APIs. Add a strict canonical settings engine, then a lazy drawer/runtime adapter. Keep tasks, notes, timer deadlines and media in their existing stores. Bridge existing background/widget/theme controls into the canonical settings so their changes survive reload. Use the existing native modal and confirmation patterns. Validate before live preview and before writing.

New files: core/customization.js, core/customization-schema.js, core/customization-runtime.js, components/customization/index.js and style.css, data/customization-defaults.json, data/customization-themes.json, two local font files and licenses, three Stage 1 tests.

Changed integration files: core/storage.js, core/theme.js, core/backup.js, newtab/newtab.js, newtab/tokens.css, newtab/newtab.css, scripts/styles.js, scripts/check.js, scripts/release-files.json, vendor/README.md and .gitignore. Generated newtab/app.css was refreshed from its sources. Earlier uncommitted dashboard/security work remains present; this report covers the customization stage and does not certify completion of the skipped security stage.

## C. Code and resulting behavior

Full implemented files are available directly in the repository:

- [Settings engine](../core/customization.js): get, set, subscribe, replace, reset(section), reset(), flush, bounded Undo/Redo, importJSON and exportJSON. Saves are debounced 250 ms. Repeated edits of the same field are grouped within 500 ms; discrete preset/reset/import operations create their own history entry. Save failures retain the draft and expose retry.
- [Strict validator and migrations](../core/customization-schema.js): required and unknown keys, nested records, types, ranges, schedules, hex colors, theme bounds and schema versions. Version 0/missing version migrates to 1; future versions are rejected. Enabled custom palette text/muted colors must meet 4.5:1 against the palette background and surface.
- [Token runtime](../core/customization-runtime.js): light/dark/system/scheduled modes, palette, blur, opacity, radius, border, shadows, density, local fonts, text scale, weight, line height and accessibility. Hidden-tab animations pause; schedules refresh each minute in the local timezone.
- [Drawer](../components/customization/index.js) and [styles](../components/customization/style.css): settings menu button or S (outside text inputs), seven sections, setting search, six palettes, named saved palettes, section resets, Undo/Redo and per-opening session Revert. Escape/Close saves and restores keyboard focus.
- [Defaults](../data/customization-defaults.json), [presets](../data/customization-themes.json) and [local font provenance/licenses](../assets/fonts/README.md).

Integration changes: storage.previewSettings publishes the draft synchronously through existing widget APIs; customization.flush writes the canonical object and compatibility aliases through storage.update without replacing personal records. Existing settings changes feed back into the canonical engine. The settings button imports the drawer on demand, and saved customization starts the token runtime before the visible dashboard initializes. Shared body typography now consumes the existing weight/line-height tokens. The drawer stylesheet is included by the existing style-generation script.

All new UI content uses DOM APIs/textContent. Components consume token roles; validated custom colors are assigned to root CSS variables. Settings import has a 64 KiB byte limit and rejects prototype keys, unknown fields, malformed/missing values and future schemas. Settings export contains only customization preferences. Full deletion uses the existing backup/reset boundary after an explicit confirmation. No user CSS execution or SVG upload was added; the existing upload path rejects SVG and accepts bounded raster media.

## D. Settings schema

The canonical settings object is stored at chrome.storage.local.oneflow.settings.customization (localStorage in the preview). Existing aliases remain for widget compatibility; they are not an independently edited Stage 1 settings store. The enclosing application document stays schemaVersion 10; customization has its own schemaVersion 1.

```json
{
  "schemaVersion": 1,
  "theme": {
    "mode": "dark",
    "accent": "#c9d9b5",
    "preset": "default",
    "paletteEnabled": false,
    "palette": {
      "background": "#111a17",
      "surface": "#1c2522",
      "text": "#f5f3ea",
      "muted": "#c4cfc6",
      "border": "#526259"
    },
    "schedule": {
      "light": "07:00",
      "dark": "19:00"
    },
    "glass": {
      "blur": 24,
      "opacity": 94,
      "border": 16,
      "shadow": 50
    },
    "shape": {
      "radius": 24,
      "borderThickness": 1
    },
    "typography": {
      "family": "system",
      "scale": 1,
      "weight": 400,
      "lineHeight": 1.5
    },
    "customThemes": []
  },
  "background": {
    "kind": "bundled",
    "id": "still-ec30a7337910c6ec",
    "blur": 0,
    "rotate": false,
    "color": "#293c36"
  },
  "layout": {
    "density": "comfortable"
  },
  "widgets": {
    "clock": true,
    "focus": true,
    "search": true,
    "links": false,
    "quotes": true,
    "weather": true,
    "tasks": true,
    "timer": true,
    "sounds": true,
    "journal": true,
    "notes": true,
    "habits": true,
    "countdowns": false,
    "stats": true,
    "mood": true,
    "music": true
  },
  "behavior": {
    "zen": false,
    "clock24": false,
    "startupView": "home"
  },
  "accessibility": {
    "highContrast": false,
    "reduceMotion": false,
    "largeText": false,
    "dyslexia": false
  }
}
```

Saved theme records contain name, resolved light/dark mode, accent and the five-color palette. Other appearance controls remain global preferences. Resetting a section restores its checked-in defaults; Reset all affects customization preferences. Clear all data is a separate confirmed deletion of app data/media/temporary records and optional grants.

## E. Verification and regression checklist

Automated results:

- PASS: all 122 unit tests.
- PASS: manifest references, MV3 CSP, JavaScript syntax, DOM safety checks and generated CSS consistency.
- PASS: design lint, 190 authored files, zero violations.
- PASS: initial static application module graph 149.5 KiB / 150 KiB budget. Saved customization loads additional runtime modules on demand; this is not a total-network-byte or 300 ms timing claim.
- PASS: [real unpacked Chrome browser regression](qa-results/customization-stage1-chrome.json): modal/S shortcut, keyboard focus, immediate accent changes, Undo/Redo/Revert, six themes, custom palette save/apply/delete, consumed glass/typography/density tokens, search, Zen restore, local font load, export download, actual valid/malicious file inputs, 320px layout, browser process restart, reload, legacy-control persistence, clear-data confirmation/cancel, canonical and full-storage corruption recovery, no uncaught page errors.
- PASS: Lighthouse 12.8.2 accessibility snapshots on the real chrome-extension page: **Home 100; customization drawer 100**. [JSON summary](qa-results/customization-lighthouse.json), [Home HTML report](qa-results/customization-lighthouse-home.html), [drawer HTML report](qa-results/customization-lighthouse-drawer.html). These are snapshot accessibility measurements, not a Lighthouse performance-navigation run or a guarantee for every custom combination.
- PASS: [320px drawer screenshot](screenshots/customization-stage1-320.png) visually inspected with high contrast, large text and OpenDyslexic enabled.

Load/test manually: Chrome > Extensions > Developer mode > Load unpacked > select the ONEFLOW repository root. Reload the extension, open a new tab, open More > Settings or focus a non-editable control and press S. No compilation is needed to run the checked-in extension.

Manual regression checklist:

- [ ] Change every Appearance slider/select; close, open a new tab and restart Chrome.
- [ ] Switch light/dark/system/scheduled themes; verify both schedule boundaries with your system clock.
- [ ] Check preset and custom palette readability over your wallpapers; try an invalid low-contrast palette and verify the explanation.
- [ ] Hide/show Clock, Focus, Search, Links, Quotes, Weather, Notes/Tasks/Habits, Timer, Sounds, Journal, Countdowns, Stats, Mood and Music; verify Zen can be exited with S. Notes/Tasks/Habits share the existing workspace launcher; Focus/Timer share the focus surface.
- [ ] Export/import settings, try an unknown key/malformed file, reset each section, Undo/Redo and Revert within one drawer opening.
- [ ] Verify Tab/Shift+Tab, visible focus, Escape, reduced motion, large text, high contrast and both local fonts; perform a screen-reader walkthrough.
- [ ] In a disposable profile with synthetic data, confirm full deletion and check tasks, notes, cached media, recovery copies and optional grants are gone. Confirmation/cancel is browser-tested; the destructive path reuses the existing reset service.
- [ ] Recheck task creation/completion, task-linked timer/pause/resume, journal autosave, audio, scene changes, wallpaper uploads, weather offline failure and existing Studio layouts. The unit suite covers underlying storage/timer behavior; this stage did not replay every historic UI suite.

## F. Known limitations and deferred work

Chrome was verified. Edge/Firefox are not claimed as tested for this stage. Human screen-reader testing, full destructive-delete walkthrough and exhaustive combinations of custom settings remain manual checks. A storage quota failure keeps a draft in the current tab; export or retry before closing it. Undo/Redo history is per page, with a maximum of 60 entries; Revert uses the snapshot from the current drawer opening. Scheduled themes use the browser's local time and update at minute intervals.

Saved custom themes are color palettes/mode/accent, not copies of every typography/glass/layout preference. Existing Studio layout edits and upload tools are retained behind the drawer launchers and continue using their existing advanced data model; a complete migration of those pre-existing advanced controls is outside this foundation. Later customization stages can extend the canonical layout/background schemas. No new cloud sync, provider integration, remote font loading, build process or publishing-policy work was added.
