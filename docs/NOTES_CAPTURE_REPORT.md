# Stage Report: Notes and quick capture

10 October 2026 · Implemented in the existing ONEFLOW extension.

## Built

- A black/white Notes workspace, available from the existing Notes entry, the extension toolbar, the `open-notes` command (suggested Alt+Shift+N), and an optional capture context menu.
- An in-page floating extension iframe within a closed shadow root. Pointer and keyboard move/resize, responsive viewport limits, visible focus, Escape, focus restoration and a contained tab sequence. Protected pages fall back to a full extension tab; a missing frame handshake also triggers fallback.
- Plain-text notes, checklists with completion/reordering, task lists and an idempotent **Add to Tasks** action. Search covers text, items, labels and source URLs. Labels, type/location filters, pinning, list/grid, archive, trash/recovery and confirmed permanent deletion are implemented.
- Page/link/selected-text capture without scraping page markup or fetching previews. Uploaded raster images, local canvas drawings, and browser-permitted voice recordings are attached locally. Images are decoded/recompressed; SVG/HTML attachments are rejected. Audio is capped at two minutes; attachments at 8 MB each, 20 per note.
- One-shot local reminder alarms, recreated from durable notes on worker activation. Trashing cancels delivery; notification clicks open the note.
- IndexedDB version 4 stores `notes` and `noteMedia`. Each note has schema version 1 and an optimistic revision. Atomic transactions commit note/media changes together. Conflicts retain the draft and offer **Save a copy**. Storage failures keep edits/attachment blobs in memory for **Retry save**.
- Existing notes migrate idempotently, preserving checklist completion. Source records are removed only after committed copies exist. Notes and media participate in the existing export/import/reset flows. Theme/list preferences stay in `chrome.storage.local` and are included in backups.

## Files

```text
components/notes/
  capture.html             standalone/embedded workspace entry
  capture.js               accessible editor, capture, media and lifecycle
  capture.css              monochrome responsive layout
  index.js                 existing dashboard integration; safe markdown retained
  style.css                dashboard frame geometry
core/
  notes.js                 migration, revisions, atomic saves and task conversion
  notes-schema.js          record/media limits and safe URLs
  db.js                    version 4 stores and transaction boundary
  storage.js               local capture preferences
  backup.js                note/media backup, validation, restore and reset
  diagnostics.js           content-free note/media counts
background/
  notes-service.js         gesture launch, isolated shell, capabilities and reminders
  service-worker.js        registration alongside the existing timer
manifest.json              activeTab/scripting, optional contextMenus, command/frame
newtab/tokens.css          shared monochrome tokens
newtab/app.css             regenerated shared styles
newtab/widgets.css         regenerated component styles
scripts/check.js           updated minimum permission assertion
tests/notes-capture.test.js
tests/notes-capture-browser.js
tests/notes-overlay-browser.js
docs/PERMISSIONS.md
docs/PRIVACY_POLICY.md
docs/DESIGN_CONSTITUTION.md
docs/qa-results/notes-*-report.json
docs/screenshots/notes-*.png
```

## Load and use

1. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, then load/reload `D:\BOOKS\ONEFLOW`. No compilation is needed.
2. On an ordinary HTTP/HTTPS page, click ONEFLOW's toolbar icon. Select text before opening, then choose **Capture page** to save the selection, page title and source URL.
3. Use **Options & privacy → Enable capture context menu** to opt in. Right-click text, a link or the page and choose **Save to ONEFLOW notes**. Disable in the same menu to revoke permission.
4. Set **Open ONEFLOW notes and quick capture** under `chrome://extensions/shortcuts` or `edge://extensions/shortcuts` if the suggested Alt+Shift+N binding is unassigned or conflicts with another shortcut.
5. Inside the editor, use the disclosures for labels/links/reminders and images/drawing/voice. Save drawings explicitly. Stop recordings to attach them. If an embedded microphone is blocked, use **Open full Notes tab**.
6. Use ONEFLOW Settings → Data for export/import. Trashed notes are retained indefinitely until confirmed permanent deletion.

## Acceptance and verification

| Check | Result |
| --- | --- |
| Manifest loads in real Chrome and Edge | PASS |
| Static CSP, DOM-safety, syntax and generated-style checks | PASS |
| Unit suite | PASS — 84 tests |
| Initial dashboard JS | PASS — 149.2 KiB / 150 KiB; capture remains lazy |
| Autosave/reload, injected storage-failure retry, safe literal markup | PASS — Chrome/Edge |
| Checklist/reorder, tasks, labels/search, pin, archive/trash/recovery | PASS — Chrome/Edge |
| Image, drawing, voice attachment and backup export/parse/restore | PASS — Chrome/Edge; synthetic microphone |
| Concurrent revision rejection | PASS — Chrome/Edge |
| Context-menu permission, listener installation and revocation | PASS — Chrome/Edge |
| Keyboard command declaration | PASS; Chrome sometimes left the suggestion unassigned |
| Toolbar injection, capture, hostile-page CSS isolation | PASS — Chrome/Edge |
| Keyboard move/resize, focus loop/restore, 320px viewport clamp | PASS — Chrome/Edge |
| Forged embedded-frame capability | PASS — rejected before collection initialization |
| Legacy migration, alarm scheduling/cancellation, permanent deletion | PASS — Chrome/Edge |
| Protected browser-page fallback | PASS — Chrome/Edge |
| 1100/390/320 layouts, light/dark, reduced motion | PASS — screenshots inspected |
| Shared-panel regression suite | PASS — Chrome/Edge, six panels and notification flows |
| Older Calm Home browser suite | FAIL — line 95 tries to click hidden `#home-menu` during active Focus Mode; earlier Home/layout/shortcut checks pass. Notes is not exercised at this failure. |
| Native context-menu click, physical global keystroke, actual microphone and OS notification presentation | Manual checks still required on the user's browser/OS |

Run from the repository root:

```powershell
node scripts/styles.js
node scripts/check.js
node --test tests/*.test.js
# Point ONEFLOW_NODE_MODULES at a directory containing Playwright.
node tests/notes-capture-browser.js chrome
node tests/notes-capture-browser.js edge
node tests/notes-overlay-browser.js chrome
node tests/notes-overlay-browser.js edge
node tests/stats-notifications-browser.js chrome
node tests/stats-notifications-browser.js edge
```

The browser tests use disposable `.test-profile` directories. They do not touch the user's everyday browser profile. Overlay tests fulfill a local test fixture through Playwright instead of contacting a website. Edge required execution outside the sandbox in this environment because its sandboxed process crashed before loading the extension.

## Audit behavior and security boundaries

- There is no persistent site content script and no new required host permission. The toolbar/command grants temporary active-tab access. The optional context menu has a separate opt-in permission. No capture runs on startup or on ordinary navigation.
- Before reading notes, a cross-origin frame must redeem a random, single-use, 60-second capability bound to its tab through an extension runtime message. Dashboard frames must have the same extension origin. Forged capabilities are rejected. Webpages get no notes CRUD messaging endpoint.
- The frame owns extension-origin IndexedDB; the webpage sees only an isolated shell. Shell messages accept only the frame's source/origin/token and close/move/resize/readiness verbs. A hostile webpage can still hide/remove/cover a DOM overlay; open the full workspace when a trusted top-level surface is needed.
- Rendering uses DOM text/attributes, never untrusted HTML. Source links accept only credential-free HTTP/HTTPS and open with `noopener noreferrer`. No remote scripts, Google branding, cloud backend, analytics or capture network requests were added.
- Diagnostics export includes note and attachment counts, not note bodies, titles, source URLs or blobs. There is no user-activity audit trail or remote telemetry. Local developer-console messages may report browser errors/fallback reasons. Automated acceptance results are written under `docs/qa-results` without real user records.
- Trash is recoverable indefinitely. Permanent deletion atomically removes a note's attached media. Separately created Tasks entries remain in Tasks. Existing backup size limits still apply (128 MB input), and browser storage can become full; failed saves must be retried before closing.

## Local versus cloud, limits and decisions

All implemented features work with local browser storage. Browser sync for existing small dashboard preferences is unchanged; notes/media/capture preferences do not use it. Collaboration, shared notes, accounts, cross-device synchronization, OCR and transcription are not implemented or presented as working controls. A future explicitly authorized backend can integrate at `core/notes.js`'s async repository boundary, but would need authentication, conflict policy, attachment transport and updated privacy/permission review.

Reminders require a running browser and enabled OS notifications. Missed deadlines are rescheduled at worker activation; these are not guaranteed real-time alarms. Embedded voice recording depends on the webpage's permissions policy and browser support. Unsaved canvas strokes are not attachments until **Save drawing** is pressed. Microphone hardware/OS UI and Firefox were not verified.

No product decision is blocking this stage. The existing unrelated working-tree edits were preserved; no mixed commit was created. The Focus Mode test failure is recorded above and was not folded into this Notes stage.
