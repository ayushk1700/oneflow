# Architecture

## Stage 2 additions

The original Stage 1 design below is retained as historical context. Version 0.2.0 upgrades the local document to schema 2 and IndexedDB to version 2 without replacing existing stores. IDB adds date/start indexes to journal and session stores. New state is validated in `core/stage2-schema.js`; old local documents receive defaults. Stage 1 JSON backups remain importable.

`core/timer-logic.js` is pure and unit-tested. Active phases have persisted start/deadline timestamps and a revision. Tabs send commands to `background/service-worker.js`; stale revisions cannot duplicate starts. `core/timer-engine.js` holds an origin lock and saves session records through a persisted outbox. Each session has a stable ID, so replay after a worker interruption overwrites the same ID. It logs actual active focus duration and completed/partial status, preserving task ID/title even if the task is later deleted. Pauses preserve remaining duration. Late wake-ups finish only the current phase; automatic next phases start at wake time, avoiding invented overnight work. Clock changes are interpreted as wall time: detected backward jumps rebase the deadline, forward jumps count as elapsed. Small corrections between observations are inherently indistinguishable from normal elapsed time.

The worker registers listeners at module top level, recreates alarms whenever activated, and owns deadline alarms, a minute badge pulse, habit reminders, notifications, and audio sleep stops. Browser alarms may run late while the OS sleeps; they cannot wake a powered-down computer. Timer deadlines remain authoritative. The notification icon uses an absolute extension URL. Browser restart pauses audio but preserves timer state. A toolbar click opens a dashboard.

One offscreen AUDIO_PLAYBACK document owns local audio for all new tabs. It loads only on explicit sound playback or an enabled chime. `core/audio-engine.js` decodes locally bundled WAVs lazily, runs native looping AudioBufferSourceNodes through per-layer and master gains, and synthesizes the chime. Original sound files and their provenance are documented in `assets/sounds/LICENSES.md`. No recorded speech or third-party audio is shipped. The ordinary browser preview uses the same engine in the page; it cannot provide closed-tab playback/notifications.

`core/features.js` loads reflection/tracking/music/stats panels on demand. The timer pill and pinned countdown stay compact on the dashboard. Journal/session data uses IDB; notes/habits/events/moods use local settings storage. Notes format only safe text nodes. Stats aggregate records by local start date, include partial work, and expose an accessible data table alongside the lazy-loaded chart. A month is a rolling 30-day window. Historic Stage 1 tasks lack completion timestamps and therefore do not invent dated completion statistics.

Backup operations acquire the timer lock before reading both storage backends, so a completed session cannot fall between IDB and outbox snapshots. Restore acquires the same lock, transactionally replaces IDB, rolls back IDB if the local write fails, then reschedules background services. Cross-backend restore is still not fully crash-atomic. It pauses restored timers and stops sound to avoid silently resuming an old session. Close other editing tabs when restoring. Backups include all private records and the locally held Unsplash key; the UI explicitly warns that exports are unencrypted.

Music is an explicit iframe connection to allowlisted provider playlist paths, removed on panel close. No provider SDK script executes in the extension. Unsplash uses the user's local key, optional host permissions, API-returned image URLs online, required selection download events, photographer/Unsplash attribution, and cached blobs offline. The static CSP limits external frames, image domains, and API origins. Mocked provider tests exercise these boundaries without real credentials.

## Original Stage 1 foundation

## Startup and boundaries

`newtab/index.html` paints the local background and frame immediately. Its one external ES-module script initializes storage, theme, and isolated widgets. `oneflow-ready` marks core interactivity, without waiting for optional weather or quotes. Every widget folder exports `init()`, `render()`, and `destroy()` and has its own stylesheet. A setting toggle calls destroy and hides the root; re-enabling reinitializes it. The dock exposes tasks, quick links, backgrounds, and settings progressively.

`core/events.js` is a small publish/subscribe bus for opening panels, new-task requests, errors, and toasts. Widgets never reach into each other's DOM. The native `<dialog>` provides modality, focus trapping, Escape behavior, and a labeled title. `core/ui.js` owns only shared UI. `core/state.js` tracks ephemeral panel state. The empty service-worker lifecycle listener deliberately requests no alarms or notifications in Stage 1.

## Persistence

All browser storage access goes through `core/storage.js`. One versioned local document stores settings, focus, lists, tasks, links, favorites, and cached weather. `core/schema.js` centralizes fresh defaults, migrations, and validation. `navigator.locks` serializes fresh read-modify-write operations across extension tabs. Chrome storage change events update other tabs; each widget watches only the fields it needs so unrelated edits do not rerender its inputs. Quota failures surface as toasts; saved data is not silently reset.

Small preferences (name, theme, accent, visibility flags) are debounced and deduplicated into a single `chrome.storage.sync` item. They seed a new device on first run. Local data is authoritative after initialization: this is deliberately not a full real-time cloud synchronization engine. Sync errors never prevent local saves.

`core/db.js` exclusively owns IndexedDB version 1, with `journal`, `sessions`, and `images` stores keyed by `id`. Journal and session stores are ready for Stage 2 but their UI is out of scope. Original PNG/JPEG/WebP uploads are decoded and recompressed to WebP, bounded to 2400×1600, and saved as blobs. Object URLs are revoked when the background changes. Schema 0 local documents migrate non-destructively to version 1; unknown future versions produce a recovery error instead of resetting content.

## Backup

`core/backup.js` exports both storage backends. Image blobs become explicit base64 data URLs only in the download. Import checks the envelope, schema, settings, lists, referential integrity, URLs, duplicate IDs, numeric bounds, image type/size/decode, and selected-image existence before touching storage. IDB replacement uses one transaction; a local-storage write failure triggers IDB rollback. Import is intended for a user-controlled maintenance operation; close other editing tabs before restoring. JSON backups are unencrypted and contain personal data. Optional encryption is Stage 3.

## Security and performance

No remote code, inline scripts, eval, injected user HTML, external fonts, favicon services, analytics, or account services. CSP restricts scripts/styles to self, prohibits frames and objects, and allows only Open-Meteo endpoints for optional weather. Search is intentional top-level form navigation. Quick links allow only credential-free http/https. Lucide is a local SVG subset; SortableJS loads on first task panel opening, and confetti only after a completed focus when reduced motion is off.

Background WebPs and thumbnails are checked in. Only the active background is loaded on startup; picker thumbnails use lazy loading. Core application JavaScript remains below 150 KiB without a build. Readability uses a conservative two-layer scrim over any image, including pure white uploads. Normal foreground colors over the worst-case scrim and panel surfaces are checked separately. User accent colors choose black or white foreground from luminance.

## Upstream references

- [Chrome permission declarations](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Chrome optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions)
- [Manifest CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)
- [Open-Meteo weather](https://open-meteo.com/en/docs) and [geocoding](https://open-meteo.com/en/docs/geocoding-api)
- [Chrome DevTools unpacked extension loading](https://chromedevtools.github.io/devtools-protocol/tot/Extensions/)
