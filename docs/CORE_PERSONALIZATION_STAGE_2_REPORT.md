# ONEFLOW Stage 2 — Core personalization

Stage 2 extends the Stage 1 settings engine and drawer. The runtime remains plain HTML, CSS and ES modules, with no compilation or remote executable code. Manifest and package version: **1.1.0**.

## A. Files reviewed

The complete inventory is in [PERSONALIZATION_FILES_REVIEWED.md](PERSONALIZATION_FILES_REVIEWED.md), with byte counts and SHA-256 hashes in [personalization-reviewed-files.json](qa-results/personalization-reviewed-files.json). Source review covered the existing modules, settings defaults/validators, manifest, design constitution, tokens, CSS sources, persistence, backups, widgets and tests. Binary hashes record reads rather than individual visual inspection.

The main integration files are `background/service-worker.js`, `background/focus-service.js`, `core/storage.js`, `core/db.js`, `core/customization.js`, `core/customization-schema.js`, `core/customization-runtime.js`, `core/backup.js`, `core/theme.js`, `core/live-wallpaper.js`, `core/message-policy.js`, `components/customization/index.js`, `components/notes/capture.js`, `components/notes/planner.js`, `newtab/tokens.css`, `data/customization-defaults.json` and `manifest.json`.

## B. Implementation plan and resulting structure

1. Migrate the canonical customization object to version 2 and validate every new nested collection.
2. Extend the existing drawer with wallpaper, layout, space and widget controls; retain live preview, saving, search, reset and history.
3. Scope IndexedDB records and local widget data by space; make switches and full backups coordinated operations.
4. Reuse existing widget interfaces for clock, tasks, timer, journal, quotes, links, search and weather.
5. Verify migrations, durable uploads, keyboard layout operations, isolated spaces, worker commands, responsive behavior and accessibility.

New modules:

```text
core/
  database-store.js           IndexedDB implementation behind the existing facade
  personalization-schema.js  Strict Stage 2 preference validation
  personalization-runtime.js Effects, rotation, space picker and scheduling
  background-gradient.js     Lightweight gradient generation
  wallpapers.js              Uploads, URL caching, quota and collections
  personal-layout.js         Responsive geometry, presets and interaction
  spaces.js                  Profiles and isolated local/IndexedDB data
  personal-search.js         Search templates and bang shortcuts
  task-personalization.js    Quick-add, grouping and recurring tasks
  task-schema.js             Task metadata validation
  markdown.js                Safe DOM-based Markdown
components/
  background-effects/index.js
  clock/personalization.js
  layout-editor/index.js
  customization/personalization.js
  customization/personalization.css
  notes/task-views.js
tests/
  personalization.test.js
  personalization-message-policy.test.js
  service-worker-preloads.test.js
  personalization-browser.js
  widget-personalization-browser.js
  customization-stage2-browser.js
  personalization-accessibility.js
```

Existing source styles were regenerated into `newtab/app.css` and `newtab/widgets.css` with the repository style script. No new runtime library or external API was added.

## C. Code and implemented behavior

The complete source changes are supplied as a clear diff in [CORE_PERSONALIZATION_STAGE_2.patch](CORE_PERSONALIZATION_STAGE_2.patch). The implementation is already applied in this checkout.

- **Backgrounds:** solid, linear/radial/conic gradients, animated gradients, local image/video uploads, explicitly permitted HTTP(S) URL caching and six bundled scenes. SVG is bounded, checked and rasterized before storage. Favorites support new-tab, hourly, daily and time-of-day rotation. Blur, brightness, contrast, grain, vignette, tint and mouse parallax use tokens. Rain, snow, particles and starfield pause while hidden; static/reduced-motion preferences suppress animation. Quota displays actual browser usage and local media totals. Upload selection and deletion coordinate with full backups.
- **Layouts:** locked/unlocked editing, pointer drag/resize, snapping, arrow-key alternatives and numeric geometry controls. Separate desktop/small-window layouts, left/right sidebar, per-widget opacity/title/collapse/pin/visibility and six named presets. Users can start with a blank layout and save their own complete presets. Existing tool panels remain accessible through launcher cards.
- **Spaces:** create, rename, duplicate, delete and switch through the header, Alt+Shift+S or time schedule. Each space stores theme, background, layout, tasks and other widget state, work context, Notes preferences and scoped IndexedDB records. Duplicate/deletion and full backup preserve ownership. Manual switching pauses the current timer; scheduled changes defer during active work.
- **Widgets:** six clock styles, time/date/seconds/week-start/time zones; greeting templates/tone/focus prompt; task list/kanban/matrix/today views, priority/tags/dates/subtasks/recurrence and quick-add syntax; configurable focus modes/cycles/auto-start/sounds/volume/notifications; notebooks/Markdown/prompts/reminders/moods; quote categories/custom lists/rotation/author; link folders/icons/grid/list/reorder; custom search engines/templates/bangs; manual/device weather location, units and detail level.
- **Compatibility:** Stage 1 customization migrates without losing saved choices or personal records. Corrupted settings fall back safely. Existing legacy controls feed the same canonical preferences. Settings imports remain bounded and reject unknown fields, unsafe values and missing space references.

### Service-worker error fix

The reported `import() is disallowed on ServiceWorkerGlobalScope` error came from a lazy module path shared with the MV3 worker. The worker now statically imports the IndexedDB implementation and secondary work/Notes schemas, registers them before starting Notes, and uses a static notification import. Window pages retain lazy loading. Regression coverage verifies preloaded helper use and registration order; native Chrome checks verify Notes scheduling, background refresh and timer reset.

Durable settings writes finish before dispatching background refresh. This avoids a cycle between settings saves and worker operations needing the backup lock. An unrelated timer update also no longer rebuilds task controls inside Notes.

The user-deleted `wallpaper/` and `livewallpaper/` folders were not restored. Bundled fallback/gallery paths use the surviving licensed scenes in `assets/backgrounds`. Uploaded videos remain supported.

## D. Settings schema changes

The customization schema is now **2**. Its seven top-level keys are unchanged. Migration fills new defaults, preserves prior choices, and introduces background effects/rotation, responsive layout geometry/presets, widget preferences and space scheduling. Space records have their own versioned registry; large media remains in IndexedDB, outside settings JSON. Export settings exports the canonical object; full backup includes all space records and media.

The following is the complete shipped defaults JSON, also available in [data/customization-defaults.json](../data/customization-defaults.json):

```json
{
  "schemaVersion": 2,
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
    "id": "alpine",
    "blur": 0,
    "rotate": false,
    "color": "#293c36",
    "url": "",
    "gradient": {
      "type": "linear",
      "angle": 135,
      "stops": [
        {
          "color": "#293c36",
          "position": 0
        },
        {
          "color": "#111a17",
          "position": 100
        }
      ]
    },
    "effects": {
      "brightness": 100,
      "contrast": 100,
      "grain": 0,
      "vignette": 0,
      "overlayTint": "#000000",
      "overlayOpacity": 0,
      "parallax": 0
    },
    "ambient": {
      "type": "none",
      "intensity": 30
    },
    "performance": {
      "static": false
    },
    "rotation": {
      "mode": "off",
      "pool": []
    }
  },
  "layout": {
    "density": "comfortable",
    "enabled": false,
    "locked": true,
    "snap": 4,
    "sidebar": "right",
    "desktop": {},
    "mobile": {},
    "widgetStyle": {
      "clock": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "focus": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "search": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "links": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "quotes": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "weather": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "tasks": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "timer": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "sounds": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "journal": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "notes": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "habits": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "countdowns": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "stats": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "mood": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "music": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      },
      "greeting": {
        "opacity": 100,
        "title": true,
        "collapsed": false,
        "pinned": false
      }
    },
    "presets": []
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
    "music": true,
    "greeting": true,
    "preferences": {
      "clock": {
        "style": "digital",
        "seconds": false,
        "dateFormat": "long",
        "weekStart": 0,
        "timeZones": []
      },
      "greeting": {
        "name": "",
        "template": "{timeOfDay}{name}",
        "tone": "calm",
        "focusPrompt": "What will you focus on today?"
      },
      "tasks": {
        "view": "today",
        "sort": "manual",
        "group": "none",
        "completionAnimation": true,
        "carryOver": true
      },
      "timer": {
        "focus": 25,
        "short": 5,
        "long": 15,
        "cycles": 4,
        "autoFocus": false,
        "autoBreak": false,
        "sound": "none",
        "volume": 50,
        "notifications": true,
        "modes": [
          {
            "name": "Classic",
            "focus": 25,
            "short": 5,
            "long": 15
          },
          {
            "name": "Extended",
            "focus": 52,
            "short": 17,
            "long": 25
          },
          {
            "name": "Deep",
            "focus": 90,
            "short": 20,
            "long": 30
          }
        ]
      },
      "journal": {
        "markdown": false,
        "notebooks": [
          "Journal"
        ],
        "notebook": "Journal",
        "prompts": [],
        "promptPack": "gratitude",
        "reminder": "",
        "moodTags": [
          "calm",
          "energized",
          "tired"
        ]
      },
      "quotes": {
        "categories": [
          "focus",
          "life",
          "creativity",
          "gratitude"
        ],
        "custom": [],
        "rotation": "daily",
        "author": true
      },
      "links": {
        "view": "grid",
        "iconSize": 24,
        "folder": "All"
      },
      "search": {
        "engine": "browser",
        "template": "https://www.google.com/search?q={query}",
        "bangs": [
          {
            "bang": "g",
            "template": "https://www.google.com/search?q={query}"
          },
          {
            "bang": "ddg",
            "template": "https://duckduckgo.com/?q={query}"
          }
        ],
        "position": "default",
        "style": "glass"
      },
      "weather": {
        "units": "celsius",
        "location": "manual",
        "detail": "simple"
      }
    }
  },
  "behavior": {
    "zen": false,
    "clock24": false,
    "startupView": "home",
    "spaceId": "default",
    "spaceSchedule": [],
    "spaceHotkey": true
  },
  "accessibility": {
    "highContrast": false,
    "reduceMotion": false,
    "largeText": false,
    "dyslexia": false
  }
}
```

## E. Verification and regression checklist

Automated acceptance results:

| Check | Result | Evidence |
| --- | --- | --- |
| Unit and migration suite | PASS: 130 tests, zero failures | `node --test tests/*.test.js` |
| Manifest references, CSP, syntax and safe rendering | PASS | `node scripts/check.js` |
| Eager JavaScript budget | PASS: 143.5 KiB / 150 KiB | Static import graph |
| Design tokens | PASS: 207 authored files, zero violations | `node scripts/design-lint.js` |
| Pinned vendor/license integrity | PASS: 5 entries | `node scripts/check-vendor.js` |
| Layout from scratch, preset save, keyboard/pointer geometry, restart | PASS | [Chrome core checks](qa-results/personalization-stage2-chrome.json) |
| Media validation, real quota, scoped persistence, backup and deletion isolation | PASS | [Chrome core checks](qa-results/personalization-stage2-chrome.json) |
| Widget controls, linked timer and worker commands | PASS: 11 checks, no page errors | [Widget checks](qa-results/personalization-stage2-widgets.json) |
| Stage 1 drawer/import/export/corruption regression | PASS: 20 checks | [Drawer regression](qa-results/customization-stage2-chrome.json) |
| Edge core workflows | PASS: 16 checks, no page errors | [Edge checks](qa-results/personalization-stage2-edge.json) |
| Cached new tab under one second; no layout shift | PASS: Chrome 533.1 ms; Edge 616.8 ms; CLS 0 | Core browser reports |
| Lighthouse accessibility at least 90 | PASS: 100 home, drawer, dark layout and light layout | [Accessibility results](qa-results/personalization-lighthouse.json) |

The browser harness loads the approved runtime files into disposable local profiles. QA packages, profiles and fixtures are excluded from runtime and packaging.

Browser checks require a local Playwright installation referenced by `ONEFLOW_NODE_MODULES`, runtime files copied according to `scripts/release-files.json` into `.qa-tools/stage2-extension`, and a valid MP4 fixture at `.qa-tools/test-video.mp4`. Lighthouse additionally uses isolated `.qa-tools` dependencies. These are developer-only checks; loading the extension itself requires none of them.

Manual regression checklist when loading the unpacked extension:

- Open `chrome://extensions` or `edge://extensions`, enable Developer mode and Load unpacked from `D:\BOOKS\ONEFLOW`. For an existing installation, press Reload; clear old logged errors, then open a fresh new tab.
- Press S; change a gradient stop, accent, density and typography. Confirm live preview, Undo/Redo, section reset and persistence after closing/reopening the browser.
- Upload a permitted image and video, favorite them, enable rotation and check the quota meter. Try an active SVG and an oversized file; verify a clear rejection.
- Apply Dashboard, unlock editing, drag and resize a card. Use arrow keys and numeric fields for the same operations. Pin a card, save a preset and verify the small-window layout.
- Create Work and Study. Add distinct tasks, notebooks and wallpapers; switch and restart. Duplicate one, then delete the copy and verify the others remain intact.
- Add `buy milk #home !high tomorrow @weekly`; try all four views, complete it and verify exactly one next occurrence. Start/reset its linked timer from Notes.
- Check all six clock styles, saved time zones, greeting template, timer presets, safe Markdown, quote filtering, link keyboard ordering and bang searches.
- Confirm weather makes no device-location request at startup. Click Use device location and verify native consent and live Open-Meteo behavior. Try a wallpaper URL and verify the native selected-origin permission prompt.
- Hide the tab and enable static/reduced-motion modes; verify animated effects/video stop. Check visible focus, keyboard-only controls, contrast and a narrow viewport.
- Export/import settings and a full backup. Try malformed JSON, unknown keys, prototype keys, future schema and oversized input. Verify rejection and retained data. Reset all and cancel clear-all confirmation before testing an intentional erase in a disposable profile.
- Confirm existing Flow Mode, sounds, scenes, habits, countdowns, search, notifications, Notes capture and statistics still open and operate.

## F. Known limitations and deferred work

- Stage 2's one-second acceptance target passes. The older repository aspiration of 300 ms is not met by the recorded Chrome/Edge measurements; it is not reported as a pass.
- Space scheduling and wallpaper rotation require an open ONEFLOW tab. Only the active space's reminders are scheduled. A busy timer/editor can defer scheduled switching.
- Weather coordinates and remote wallpaper responses were tested with controlled fixtures. Native permission prompts and live provider failures still require the manual consent/network checks above.
- Limits: 10 spaces, 20 saved layouts, 20 notebooks, 30 uploaded images and 10 videos per space; image/video upload caps are 8/16 MiB, with SVG capped at 1 MiB. Settings JSON is capped at 512 KiB; full backup at 128 MiB. Available browser quota can impose lower practical limits.
- English personalization labels/word-clock are provided. Firefox was not verified in this stage. The actual system font rendering depends on the OS; bundled Atkinson and existing local font options require no CDN.
- Full Notes panels remain separate tools rather than embedded editable widgets in every layout card. Dashboard-owned Notes can control the shared timer; website/standalone capture frames retain the existing restricted permissions.
- Required geolocation was added with the user's explicit approval because Chrome does not support optional geolocation. Device access occurs only from the explicit control.
- A hosted HTTPS privacy-policy URL is still needed for public store release. This is independent of the completed local Stage 2 implementation. No Stage 3 work or Stage 2 GitHub push was performed.
