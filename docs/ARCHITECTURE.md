# Stage 1 architecture

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
