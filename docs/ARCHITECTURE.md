# Release 1.0.0 architecture (Stage 3)

ONEFLOW loads directly from its Manifest V3 directory. There is no compilation or remotely hosted executable code. The new-tab shell eagerly mounts the clock, unified focus, search, links, quotes and weather surfaces; editors and advanced tools are lazy ES-module imports. Local Chart.js and SortableJS load only when needed. The static budget checker follows the eager import graph and separately scans every module for syntax and unsafe rendering.

The shared event bus coordinates independent widgets. The unified Focus card remains mounted whenever Focus or Timer is enabled. Shared native dialogs retain supported editor views, keep keyboard focus inside and invalidate stale asynchronous opens. Advanced tools live under More. Flow uses a separate native fullscreen dialog and exits on Escape/fullscreen exit.

## State and recovery

Schema 7 adds validated customization settings to the earlier appearance and journal preferences. IndexedDB version 3 adds a wallpapers store while retaining journal, sessions and images. core/storage.js serializes local mutations across tabs and the worker with an origin lock, validates every saved document, and owns chrome.storage.local/sync/session access. Small preferences alone sync. core/db.js owns versioned IndexedDB sessions, gratitude entries and image/video blobs. Drafts remain local. Scenes contain only validated appearance, rhythm, audio and grid preferences, including contrast; applying them never replaces personal task or journal records.

The worker owns timer transitions, alarms, offscreen audio and blocking. A Flow lease in chrome.storage.session distinguishes a suspended worker from a restarted browser. Blocking uses DNR session rules only, and only while a leased Flow has a running, unexpired focus deadline. Pause, break, expiry and exit remove rules. Exit clears rules before history writes. Startup removes orphaned Flow, stops its timer, restores preferences and releases rules. No static or dynamic blocking rules survive browser shutdown. Chrome DNR has no rule TTL, so powered-off devices and suspended browsers cannot execute cleanup until they resume; this is documented rather than treated as a real-time guarantee.

## Boundaries

The blocked page is the only allowed sender for blocked/override messages. Its five-minute override is hostname scoped; stored logs exclude paths and query strings. Domain lists reject credentials, wildcards and executable URLs. Redirects require optional site access requested when enabling the feature. The clean release has no required host permissions. The integration test fixture pregrants hosts solely to automate real browser redirects without accepting a native permission prompt.

Backup restore authenticates optional AES-256-GCM ciphertext before parsing, rejects dangerous object keys and future/malformed schemas, and imports through storage/DB boundaries with rollback. PBKDF2-SHA256 uses 310,000 iterations and random salt/IV. Passphrases are never stored. Cross-store recovery is best effort; a browser termination during a restore is not a transactional guarantee across chrome.storage and IndexedDB.

Diagnostics contain timestamps, error categories, sizes and record counts; no raw errors, task text, journal text, keys or browsing logs are exported. No telemetry is sent. External AI is excluded by the user's decision: its flag is false, implementation modules are absent, and its endpoint is absent from CSP.

## Language and compatibility

The English message catalog is central, with a Hindi sample and English fallback; user content is never translated or interpreted as markup. Browser key names, DOM attributes and storage protocol tokens remain language independent. Hindi is a sample, not a complete localization. Test Chrome and Edge first. Firefox is not certified: Chrome offscreen audio, DNR and permissions behavior need a deliberate compatibility adapter before a Firefox release.

---

# Architecture

## Glass dashboard refinement (0.2.1)

`core/ui.js` owns one centered native dialog and its internal tool navigation. The dashboard behind it is inert. While the dialog stays open, form-based widgets retain detached live DOM, handlers, draft fields, and scroll position. `resumePanel` restores these views without rebuilding controls; `discardPanel` disposes a widget when disabled. Closing the dialog releases all retained views. Draft retention is in-memory for the current open dialog, not persistence across reloads or closing it. Settings categories have separate view keys. Async opening requests use a generation guard so an earlier load cannot override a later tool choice or reopen a closed dialog. Tab cycles inside the popup, Escape closes it, and focus returns to the launcher.

Music retains its form but removes the provider frame on suspension and close; resuming never reconnects automatically. Stats dispose their chart on departure and recalculate on re-entry. Task session counters refresh on resume without replacing task drafts. Existing module storage watchers continue to update their own retained views. Widgets still communicate through the event bus and shared UI API.

The dashboard timer uses the existing timestamp engine and exposes start/pause/resume plus progress. Daily focus can start a session with a title and a null task ID; this creates no task record and cannot relabel a running or paused session. Audio status reads saved mixer state and pauses the existing owner. It does not create an audio engine at startup.

Storage initialization now shares the edit lock: first-run migration/default writes cannot overwrite a concurrent initial user edit. Schema versions and permissions are unchanged. The default sage accent applies to new profiles; existing accent choices are preserved.

Shared CSS tokens supply glass surfaces, contrast veils, hard offset shadows, light/dark variants, and reduced-motion overrides. The existing local illustrated backgrounds are retained. No new libraries, remote code, font requests, or permissions were added.

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
## Shared Settings and visual shell

The dock's Focus action and session gear emit `settings:open` with `focus`. Blocking setup emits the same event with `blocking`; ritual and habit timing links use `reminders`. Settings owns seven sections and the mobile section selector. Timer and blocker modules expose preference renderers; they do not create separate settings dialogs. Ritual, habit and backup schedules remain in the existing storage schema and background alarm service.

Focus and blocker forms retain their unsaved values while switching tools. Focus preferences refresh from storage when resumed without unsaved changes; saving preferences preserves a running or paused session. Automatically saved Settings sections rebuild from current storage when reopened. The panel shell releases replaced suspended views and cancels late async tool opens.

`newtab/panels.css` contains the shared tool styling and responsive per-panel layouts. `scripts/styles.js` regenerates `widgets.css` from isolated widget styles, then `app.css` in the order local Tailwind utilities, widgets, base, foundation and panels. The checked-in `app.css` is the only runtime stylesheet request. The checker compares both generated artifacts to their sources. No remote code, runtime CSS compiler or installation is needed.
## Background presentation

`data/backgrounds.json` is the shared local catalog. Each entry has a safe asset identifier, desktop/mobile focal points and a bounded text-zone shade. `core/background-presentation.js` normalizes it and caches the small catalog request. Theme loads the thumbnail immediately, decodes the full image without blocking Home, then fades a decorative image layer over the preview. A revision guard discards stale completions. The placeholder remains if a full image fails. Uploaded/cached blobs retain their original IndexedDB records and backup format; object URLs are revoked when replaced. A permitted Unsplash remote image falls back to its cached blob on failure/offline.

Home shades the left text area and header/footer, compact screens shade the central text area, and a custom layout increases coverage for movable widgets. Flow hides Home's shading and supplies a separate central overlay. Strong contrast raises shading, pure white stays unshaded, and either system or explicit reduced motion removes transitions. Scene previews use the 384×216 bundled thumbnails; upload previews are resized locally on demand with `core/image-preview.js`, released with the view and never added to the saved schema.

## Visual customization studio (schema 7)

The lazy-loaded customizer edits an in-memory settings draft. The runtime applies that draft to shared shell surfaces and restores saved settings on Cancel. Save persists validated settings through core/storage.js; core/studio-presets.js installs referenced media only at Save and rolls newly installed blobs back if persistence fails. Portable designs use a settings allowlist and exclude personal records, keys and automatic-scene location/rules.

core/studio-schema.js owns bounded preferences and schema migration. core/studio-logic.js contains pure scheduling, offline solar calculations and deterministic playlist order. background/studio.js uses the existing worker queue and alarms to apply Scenes and playlists while protecting running deadlines, Flow and manual overrides. Audio phase changes use the existing offscreen sound engine with volume ramps. No extra permissions, external scripts or dependencies are introduced.
