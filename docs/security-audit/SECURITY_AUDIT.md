# A. Files reviewed (list)

Audit date: 13 October 2026. Scope: the current, uncommitted working tree at `87a863bc5c55105774e5f69bab54993a921803b2`, plus the existing release archive. This was an audit-only pass. Application files and the release ZIP were not changed. Earlier unfinished design changes remain in place.

- [Complete, per-file inventory: 2,185 files](D:/BOOKS/ONEFLOW/docs/security-audit/FILES_REVIEWED.md).
- [Machine-readable inventory, hashes, scan locations and ZIP entries](D:/BOOKS/ONEFLOW/docs/security-audit/inventory.json).
- [Verification summary and 47 archive/source differences](D:/BOOKS/ONEFLOW/docs/security-audit/verification-summary.json).
- [Browser reproductions](D:/BOOKS/ONEFLOW/docs/security-audit/runtime-checks.json), [reproduction harness](D:/BOOKS/ONEFLOW/docs/security-audit/runtime-probe.mjs), and [Chart.js probe](D:/BOOKS/ONEFLOW/docs/security-audit/chart-probe.json).

Coverage is not uniform: all 596 text files were read by automated pattern/credential scans; all 1,589 binary files were read for hashing, but were **not** individually viewed, played, disassembled, or checked for hidden content. Manually traced security boundaries include the manifest; all extension entry points; storage/schema/import/export modules; timer/blocker/Notes services; Notes rendering, capture and attachments; network clients and player messages; settings, search, links, work-context and media flows; packaging/check/preview scripts; dependency metadata; README and privacy/permissions disclosures. Remaining widget code, CSS, generated data, tests, historic reports and minified libraries received automated coverage, not a claim of exhaustive line-by-line manual review. The request to semantically review every file is therefore **not fully met**; this is a scoped source audit, not a certification.

Text inventory by area: root 5; assets 9; background 7; blocked 3; components 103; core 56; data 5; docs 221; livewallpaper 1; newtab 12; release 2; scripts 22; test-results 56; tests 76; vendor 11; wallpaper 7. The linked inventory enumerates each path.

Excluded: browser test profiles (potential private session data), `node_modules`, raw `.git` internals and this audit output directory. Separately scanned 703 relevant text blobs across all seven reachable Git commits for credential patterns. Unreachable/deleted Git objects, other clones, remote branches not present locally, browser stores/accounts and binary-embedded secrets were not inspected. No matching hardcoded credential was found; this does not prove the absence of arbitrary-format keys.

# B. Executive summary

**Overall risk: Medium. No confirmed Critical or High finding. Do not treat this as release approval.**

Top five issues:

1. A web page can embed the blocker interstitial and induce an override click; the worker accepts the subframe message (S01).
2. Export can generate a backup that the same application refuses to restore (S02).
3. Full deletion leaves browser-session capture data and does not revoke every optional permission (S03).
4. `geolocation` is incorrectly declared optional; its removal throws during full deletion in the tested Chrome build (S04).
5. Release readiness is incomplete: the archive differs from current source, packaging lacks an integrity/check gate, and public-policy/Firefox requirements remain unresolved (S05–S06).

Confirmed in Chrome 155.0.8059.40 using a disposable profile and synthetic records: an embedded blocker button persisted an override; a forged Notes token was rejected; encrypting 46 MiB produced a 64,312,848-byte envelope that decryption rejected; a backup accepted three arbitrary bytes labeled MP4; a session launch record survived reset; geolocation revocation rejected. Blocker state was seeded through application modules; no permission API was mocked. A complete human-consented blocking setup and subsequent real-site navigation were not tested. The embedded click itself and resulting storage write were tested.

All 108 existing unit tests passed, as did manifest references, syntax, current bundle consistency and the repository's DOM-pattern checks. These are useful regression checks, not security proofs. Audit-time hashes show no changes to inventoried application files.

# C. Findings table, sorted by severity

Severity describes the demonstrated impact in this local-first extension. Release gates and defense-in-depth observations are distinguished from remotely exploitable vulnerabilities.

| ID | Severity | Category | File:Line | Description | Exploit scenario | Fix |
|---|---|---|---|---|---|---|
| S01 | Medium | Messaging / clickjacking | [manifest.json:52](D:/BOOKS/ONEFLOW/manifest.json:52); [blocked/index.js:20](D:/BOOKS/ONEFLOW/blocked/index.js:20); [service-worker.js:85](D:/BOOKS/ONEFLOW/background/service-worker.js:85); [focus-service.js:119](D:/BOOKS/ONEFLOW/background/focus-service.js:119) | **Confirmed:** the public interstitial initializes in a cross-origin iframe; the worker checks its URL prefix but not `sender.frameId`. Loading the frame also adds a block-log entry. | A site that knows the extension ID embeds the interstitial with a chosen blocked URL. A misleadingly positioned button click grants that hostname a five-minute override. Repeated frames can pollute the bounded log. No reading of Notes or arbitrary code execution was demonstrated. This weakens a focus aid, not a parental-control boundary. | Reject blocker messages unless they come from the exact interstitial document in frame 0; reject framed interstitial initialization before reading storage; bind the requested URL to the actual document/blocked navigation. Keep Notes' deliberate embedding separate. |
| S02 | Medium | Backup availability | [backup.js:13](D:/BOOKS/ONEFLOW/core/backup.js:13); [data-tools.js:27](D:/BOOKS/ONEFLOW/components/settings/data-tools.js:27); [data-tools.js:52](D:/BOOKS/ONEFLOW/components/settings/data-tools.js:52); [crypto-backup.js:46](D:/BOOKS/ONEFLOW/core/crypto-backup.js:46) | **Confirmed:** export is uncapped; UI restore and encrypted input cap files at 60 MiB; the inner backup parser permits 128 MiB. Base64 encryption expands size again. | A user accumulates attachments, exports successfully, then cannot restore after moving browsers or deleting the original. The crypto round-trip failure was reproduced with synthetic text; a full collection of real media of that size was not generated. | Share an explicit format/size budget across export, encryption and import. Refuse an unrecoverable export before marking it successful, or implement a bounded multipart/streaming archive. Test both plain and encrypted round trips at limits. |
| S03 | Medium | Privacy / full reset | [notes-service.js:67](D:/BOOKS/ONEFLOW/background/notes-service.js:67); [backup.js:90](D:/BOOKS/ONEFLOW/core/backup.js:90); [storage.js:88](D:/BOOKS/ONEFLOW/core/storage.js:88); [data-tools.js:85](D:/BOOKS/ONEFLOW/components/settings/data-tools.js:85); [PERMISSIONS.md:46](D:/BOOKS/ONEFLOW/docs/PERMISSIONS.md:46) | **Confirmed:** reset omits `chrome.storage.session`; UI revocation handles origins and geolocation only, not `tabs`/`contextMenus` or the menu. This conflicts with the stated full-delete behavior. | An unconsumed capture launch record can retain a page URL, title and selected text for the browser session after deletion. Its authorization expires after 60 seconds, but expiration does not delete the record. Previously granted optional privileges/menu can also remain. Session retention was reproduced; pre-granted tabs/menu retention follows the code and needs a headed-browser test. | Clear owned session records and leases, remove capture menus, revoke the intersection of actual grants and supported optional permissions, and report cleanup failures without skipping final UI recovery. Test pending capture plus all opt-ins before reset. |
| S04 | Medium | Manifest / permission lifecycle | [manifest.json:24](D:/BOOKS/ONEFLOW/manifest.json:24); [weather/index.js:12](D:/BOOKS/ONEFLOW/components/weather/index.js:12); [data-tools.js:91](D:/BOOKS/ONEFLOW/components/settings/data-tools.js:91) | **Confirmed configuration defect:** Chrome lists `geolocation` among permissions that cannot be optional. Removal rejected in the fresh audit profile, after data reset but before reload. | No attacker is required: Use my location cannot follow the advertised optional-permission flow; deleting all data can end with an error instead of its intended completion. | Prefer city search and remove the unsupported optional-geolocation request/revocation path. If device location must remain, explicitly choose the required-permission tradeoff and update code/disclosures; do not silently broaden install permissions. |
| S05 | Medium | Release integrity | [package.js:5](D:/BOOKS/ONEFLOW/scripts/package.js:5); [package.js:10](D:/BOOKS/ONEFLOW/scripts/package.js:10); [package.js:18](D:/BOOKS/ONEFLOW/scripts/package.js:18); [verification-summary.json:23](D:/BOOKS/ONEFLOW/docs/security-audit/verification-summary.json:23) | **Release gate:** 47 of 316 ZIP entries differ from current source. Packaging recursively includes runtime folders with only an AI-path exclusion, no secret/source-map deny rule, vendor integrity check or mandatory test gate. Forty-nine documentation files also ship. | Maintainers can accidentally distribute an older build or a future `.env`, test fixture or private note placed inside a packaged folder. No such secret file was found in this ZIP. Current differences include unfinished design work and are not evidence of tampering. | Build from an identified clean release revision, enforce an explicit file policy and checks before packaging, verify bundled dependency hashes, and test the exact ZIP. Minimize shipped internal reports. Keep archive hash plus provenance tied to the release. |
| S06 | Medium | Store / cross-browser readiness | [publisher.js:2](D:/BOOKS/ONEFLOW/core/publisher.js:2); [PRIVACY_POLICY.md:54](D:/BOOKS/ONEFLOW/docs/PRIVACY_POLICY.md:54); [manifest.json:10](D:/BOOKS/ONEFLOW/manifest.json:10); [service-worker.js:16](D:/BOOKS/ONEFLOW/background/service-worker.js:16) | **Release gate, not an exploit:** configured public support/privacy URLs are empty. Only a service-worker background is declared; Chrome offscreen APIs are used directly; no Firefox data-consent declaration exists. | Publishing this package as fully Firefox-compatible would leave background features unsupported. Store privacy/public-contact setup is not verifiable from the local package. | Supply real publisher/store details; verify Chrome/Edge privacy declarations. Create and test a separate Firefox manifest/runtime adapter and current data-consent flow, or explicitly limit this release to Chrome/Edge. |
| S07 | Low | Media validation | [backup.js:47](D:/BOOKS/ONEFLOW/core/backup.js:47); [backup.js:63](D:/BOOKS/ONEFLOW/core/backup.js:63); [notes-schema.js:22](D:/BOOKS/ONEFLOW/core/notes-schema.js:22); [customization.js:9](D:/BOOKS/ONEFLOW/components/settings/customization.js:9) | **Confirmed:** backup video and note-media imports trust allowed MIME labels and size without the upload decoder checks. A three-byte `ABC` MP4 backup was accepted. | A malformed shared backup/preset stores unusable media. Excessive decoded dimensions/resource use needs verification; no media-parser exploit or SVG execution was demonstrated. | Validate decoded content, dimensions/duration and aggregate budgets before committing; reject zero/invalid media; use bounded sequential decoding. Reuse upload validation for imports and presets. |
| S08 | Low | Local confidentiality | [storage.js:14](D:/BOOKS/ONEFLOW/core/storage.js:14); [backup.js:19](D:/BOOKS/ONEFLOW/core/backup.js:19); [data-tools.js:28](D:/BOOKS/ONEFLOW/components/settings/data-tools.js:28); [PRIVACY_POLICY.md:32](D:/BOOKS/ONEFLOW/docs/PRIVACY_POLICY.md:32) | **Documented residual risk:** notes and keys are plaintext at the application-storage layer, and a blank passphrase exports readable records and saved integration keys. No app-layer encryption protects the profile. | Someone obtaining the browser profile or a shared readable backup can access private records and reusable provider keys. Ordinary web pages have not been shown to access this storage. | Default to excluding credentials from backups; make inclusion explicit. Prefer encrypted exports when keys are included; offer session-only key storage. Restrict provider keys to supported APIs/quotas. Do not embed a supposed encryption master key in the extension. |
| S09 | Low | Dependency assurance | [vendor/README.md:7](D:/BOOKS/ONEFLOW/vendor/README.md:7); [package.js:19](D:/BOOKS/ONEFLOW/scripts/package.js:19); [chart.umd.js:7](D:/BOOKS/ONEFLOW/vendor/chart.js/4.4.8/chart.umd.js:7); [stats/index.js:80](D:/BOOKS/ONEFLOW/components/stats/index.js:80) | **Assurance gap / latent gadget:** versions are pinned and bundled, but no enforced upstream integrity manifest exists. Bundled Chart.js 4.4.8 reproduces the reported `Chart.defaults.set('__proto__', …)` gadget on its own Defaults prototype. No untrusted path reaches that API in ONEFLOW. | A future feature exposing arbitrary Chart defaults paths could activate the gadget; modified vendor bytes could pass current packaging. This is not a confirmed current application exploit and is not CVE-2020-7746. | Add verified hashes/provenance and recurring advisory checks. Keep chart configuration paths internal; adopt a verified upstream fix when available. Remove unused bundles from release. |
| S10 | Low | Network availability | [pexels.js:13](D:/BOOKS/ONEFLOW/background/pexels.js:13); [dictionary/api.js:30](D:/BOOKS/ONEFLOW/components/dictionary/api.js:30); [weather/index.js:17](D:/BOOKS/ONEFLOW/components/weather/index.js:17); [youtube-search.js:9](D:/BOOKS/ONEFLOW/components/music/youtube-search.js:9); [music/index.js:90](D:/BOOKS/ONEFLOW/components/music/index.js:90) | **Confirmed missing bounds:** JSON bodies are buffered before size limits; YouTube search has cancellation but no deadline and does not locally cap response rows. Other listed clients have deadlines. | A stalled/misbehaving allowed provider can leave search pending or allocate excessive memory. No attacker-controlled arbitrary fetch destination was found in reachable features. | Add common response-byte/deadline limits, cap YouTube rows before mapping, and handle rate-limit retries conservatively. Preserve abort-on-close and plain-text rendering. |
| S11 | Low | Corrupt local state | [storage.js:9](D:/BOOKS/ONEFLOW/core/storage.js:9); [storage.js:95](D:/BOOKS/ONEFLOW/core/storage.js:95); [storage.js:108](D:/BOOKS/ONEFLOW/core/storage.js:108) | **Confirmed code path; preview scope:** localStorage fallback JSON is parsed without local recovery. Initialization resets its promise on error but does not quarantine/recover corrupt bytes. Extension local storage normally supplies objects rather than JSON strings. | Corruption in the web-preview origin can repeatedly prevent startup or opening work/Notes preferences. This does not establish a remote extension XSS vulnerability. | Catch parse/validation failures at the storage boundary, preserve corrupt data for explicit recovery, and offer safe reset/export rather than silently overwriting it. |

Chrome's current documentation explicitly excludes geolocation from optional permissions. [Chrome permission rules](https://developer.chrome.com/docs/extensions/reference/api/permissions).

Firefox requires a different supported background entry, and new submissions must declare data transmission under its built-in consent system. A declaration of `none` should not be copied blindly when weather/search/player providers receive information. [Firefox background support](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background), [Firefox consent requirements](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/).

Chrome requires privacy disclosure even for locally handled user data; the actual developer-console form and hosted policy were unavailable. Edge submission also includes privacy information. [Chrome privacy requirements](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), [Edge publishing requirements](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension).

## Supporting inventories and negative findings

**DOM injection:** automated scans found no authored runtime `innerHTML`, `outerHTML` assignment, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` or remote script import. The only vendor `outerHTML` occurrence is a **read used in a Lucide warning**, not an HTML assignment (`vendor/lucide/0.468.0/lucide.min.js:8`); Lucide is used by asset generation, not loaded by current extension entry points. `el()` adds listener functions and appends strings as text ([utils.js:3](D:/BOOKS/ONEFLOW/core/utils.js:3)). `onclick:` objects are DOM listeners, not inline HTML event-handler attributes. Notes Markdown uses DOM construction ([notes/index.js:8](D:/BOOKS/ONEFLOW/components/notes/index.js:8)); imports reject prototype keys ([backup.js:30](D:/BOOKS/ONEFLOW/core/backup.js:30)). No jQuery runtime is present. Static scanning is not a proof against every computed sink.

**Links and frames:** general saved links and note URLs accept HTTP/HTTPS and reject credentials ([schema.js:102](D:/BOOKS/ONEFLOW/core/schema.js:102), [notes-schema.js:4](D:/BOOKS/ONEFLOW/core/notes-schema.js:4)). HTTP navigation is intentionally allowed; this is not an insecure API request. External blank-target links use `noopener` and/or `noreferrer`; `noreferrer` also protects the opener, so it is not a tabnabbing finding merely because both words are absent. The local policy link uses `noopener` ([support/index.js:32](D:/BOOKS/ONEFLOW/components/support/index.js:32)). Music reconstructs known provider URLs and sandboxes the player ([music/index.js:10](D:/BOOKS/ONEFLOW/components/music/index.js:10), [music/index.js:71](D:/BOOKS/ONEFLOW/components/music/index.js:71)). Its `allow-popups` could be narrowed if playback still works; this is hardening, not a demonstrated exploit.

**Messages:** Notes authorization validates extension sender, exact document URL, token, expiry and tab; consumes the grant before reading notes ([notes-service.js:99](D:/BOOKS/ONEFLOW/background/notes-service.js:99), [capture.js:259](D:/BOOKS/ONEFLOW/components/notes/capture.js:259)). The parent-shell listener checks source, origin and token ([notes-service.js:40](D:/BOOKS/ONEFLOW/background/notes-service.js:40)). The frame's wildcard `postMessage` sends only token/control coordinates, not note data ([capture.js:34](D:/BOOKS/ONEFLOW/components/notes/capture.js:34)); a malicious parent can see those controls, but a consumed grant is not a demonstrated replay path. YouTube messages check source/origin and bound string length ([youtube-player.js:10](D:/BOOKS/ONEFLOW/components/music/youtube-player.js:10)). Generic worker/audio actions primarily trust extension ID ([service-worker.js:72](D:/BOOKS/ONEFLOW/background/service-worker.js:72), [audio.js:3](D:/BOOKS/ONEFLOW/background/audio/audio.js:3)); explicit per-action document/frame allowlists and payload schemas are recommended defense in depth. There is no external messaging declaration or page bridge to those generic actions in the reviewed manifest/code.

**Permission use:** storage persists records; alarms handle timer/reminders; notifications display configured reminders; offscreen owns local audio; DNR implements blocking; search delegates to the browser provider; activeTab/scripting inject the invoked capture shell. Optional tabs handles explicit capsule/Quiet Web reads; contextMenus enables capture. Evidence: [PERMISSIONS.md:3](D:/BOOKS/ONEFLOW/docs/PERMISSIONS.md:3), verified against [service-worker.js:15](D:/BOOKS/ONEFLOW/background/service-worker.js:15), [focus-service.js:9](D:/BOOKS/ONEFLOW/background/focus-service.js:9), [search.js:10](D:/BOOKS/ONEFLOW/core/search.js:10), [notes-service.js:63](D:/BOOKS/ONEFLOW/background/notes-service.js:63), [work-context.js:18](D:/BOOKS/ONEFLOW/core/work-context.js:18). Broad **optional** HTTP/HTTPS hosts support arbitrary blocker choices, especially allow-only mode ([blocker-logic.js:34](D:/BOOKS/ONEFLOW/core/blocker-logic.js:34)); they are not an all-sites installation grant. No history/cookies/webRequest/debugger permission is requested. Notifications are a candidate for optional consent after adding guards to all callers; DNR must not simply be moved to optional permissions.

**Storage inventory:**

| Store | Data and protection | Evidence |
|---|---|---|
| `chrome.storage.local` / preview `localStorage` | `oneflow`: settings/name/location/cache, tasks, focus, links, habits, countdowns, notes migration data, drafts, moods, scenes/layouts/automation, timer/outbox/history summaries, blocker hosts/log/overrides, notifications, integration keys and preferences. `focusWork`: capsules with selected note/task snapshots and optional full tab URLs/titles, recovery, learning/planning and workspace records. `notesPreferences`: view/theme/labels. Application-layer plaintext. | [storage.js:4](D:/BOOKS/ONEFLOW/core/storage.js:4), [schema.js:9](D:/BOOKS/ONEFLOW/core/schema.js:9), [storage.js:93](D:/BOOKS/ONEFLOW/core/storage.js:93), [storage.js:107](D:/BOOKS/ONEFLOW/core/storage.js:107) |
| `chrome.storage.sync` | Name/theme/accent/widget toggles only; browser account may sync them. Debounced, with errors handled. | [storage.js:74](D:/BOOKS/ONEFLOW/core/storage.js:74), [PRIVACY_POLICY.md:15](D:/BOOKS/ONEFLOW/docs/PRIVACY_POLICY.md:15) |
| `chrome.storage.session` | Flow lease and temporary capture token, tab ID, expiry and selected page title/URL/text; expired records are not automatically erased. | [storage.js:88](D:/BOOKS/ONEFLOW/core/storage.js:88), [notes-service.js:67](D:/BOOKS/ONEFLOW/background/notes-service.js:67) |
| IndexedDB `oneflow`, version 5 | `journal`, `sessions`, `images`, `wallpapers`, `notes`, `noteMedia`, `focusSamples`; local blobs and private text, no app encryption. | [db.js:2](D:/BOOKS/ONEFLOW/core/db.js:2), [db.js:8](D:/BOOKS/ONEFLOW/core/db.js:8) |
| Memory | Dictionary cache up to 30 lookups; current search/player state, editor drafts, blobs and audio; no custom dictionary history store. | [dictionary/index.js:4](D:/BOOKS/ONEFLOW/components/dictionary/index.js:4), [capture.js:11](D:/BOOKS/ONEFLOW/components/notes/capture.js:11) |
| Cookies / files | No extension cookie API use or analytics found. Third-party player frames can use provider-controlled browser state. Readable/encrypted backups, CSV, feedback and diagnostic downloads are user-initiated files outside reset control. | [music/index.js:71](D:/BOOKS/ONEFLOW/components/music/index.js:71), [utils.js:32](D:/BOOKS/ONEFLOW/core/utils.js:32), [PRIVACY_POLICY.md:23](D:/BOOKS/ONEFLOW/docs/PRIVACY_POLICY.md:23) |

Encryption uses random 16-byte salt, 12-byte IV, PBKDF2-SHA256/310,000 iterations and AES-256-GCM; authentication failure is caught ([crypto-backup.js:4](D:/BOOKS/ONEFLOW/core/crypto-backup.js:4), [crypto-backup.js:24](D:/BOOKS/ONEFLOW/core/crypto-backup.js:24)). This protects exported files when a suitable passphrase is chosen, not the active browser profile. Import parses and validates before writing, and restores earlier stores on second-backend failure; Notes preferences and follow-up messaging sit outside that rollback block ([backup.js:76](D:/BOOKS/ONEFLOW/core/backup.js:76)). Fault-injection tests for that final phase remain necessary.

**Network inventory:** all reachable API endpoints are HTTPS. No authored XHR, WebSocket, EventSource, beacon, analytics or remote-font loader was found. The complete fetch-location scan is in `inventory.json`.

| Destination | Data / trigger | Evidence |
|---|---|---|
| Open-Meteo API and geocoding | City search or coordinates after setup; enabled weather cache refresh. Explicit permission; credentials omitted; 10-second deadline. | [weather/index.js:14](D:/BOOKS/ONEFLOW/components/weather/index.js:14), [weather/index.js:28](D:/BOOKS/ONEFLOW/components/weather/index.js:28) |
| Pexels API / images / videos | Explicit query and saved API key in API Authorization header; thumbnail GETs and chosen media download. Fixed API, exact media-host allowlist, bounded streaming downloads. | [pexels.js:2](D:/BOOKS/ONEFLOW/background/pexels.js:2), [pexels/index.js:9](D:/BOOKS/ONEFLOW/components/pexels/index.js:9), [pexels/index.js:27](D:/BOOKS/ONEFLOW/components/pexels/index.js:27) |
| Google YouTube Data API | Explicit search query and user key in the query string, as used by this client. No secret logging found. Provider/proxy logs could retain query parameters. | [youtube-search.js:6](D:/BOOKS/ONEFLOW/components/music/youtube-search.js:6), [music/index.js:80](D:/BOOKS/ONEFLOW/components/music/index.js:80) |
| Free Dictionary API | Explicit normalized English word; no credentials/referrer; memory cache only. | [dictionary/api.js:22](D:/BOOKS/ONEFLOW/components/dictionary/api.js:22), [dictionary/index.js:29](D:/BOOKS/ONEFLOW/components/dictionary/index.js:29) |
| Spotify / YouTube no-cookie iframe | Explicit player connection; provider receives ordinary player metadata/IP and potentially its own cookies. Remote code runs in the cross-origin provider frame, not as an extension script. | [music/index.js:71](D:/BOOKS/ONEFLOW/components/music/index.js:71), [PRIVACY_POLICY.md:23](D:/BOOKS/ONEFLOW/docs/PRIVACY_POLICY.md:23) |
| Browser search / user links | Submitted query through `chrome.search.query`; ordinary navigation to validated HTTP/HTTPS links. | [search.js:5](D:/BOOKS/ONEFLOW/core/search.js:5), [schema.js:102](D:/BOOKS/ONEFLOW/core/schema.js:102) |
| Local packaged fetches | Quotes, scenes, wallpaper catalogs and WAV audio use relative extension URLs; no third-party request. | [quotes/index.js:21](D:/BOOKS/ONEFLOW/components/quotes/index.js:21), [scenes.js:49](D:/BOOKS/ONEFLOW/core/scenes.js:49), [background-presentation.js:22](D:/BOOKS/ONEFLOW/core/background-presentation.js:22), [audio-engine.js:19](D:/BOOKS/ONEFLOW/core/audio-engine.js:19) |
| Dormant Unsplash module | Still shipped; calls exact HTTPS Unsplash API/image hosts, but current Settings loads Pexels and CSP excludes Unsplash. Not a current reachable service or confirmed key leak. Remove dead integration code/disclosures deliberately. | [unsplash/index.js:7](D:/BOOKS/ONEFLOW/components/unsplash/index.js:7), [settings/index.js:176](D:/BOOKS/ONEFLOW/components/settings/index.js:176), [manifest.json:47](D:/BOOKS/ONEFLOW/manifest.json:47) |

**Dependencies and advisory checks:** source URLs are recorded here as provenance, not runtime imports. No remote script, stylesheet or font is loaded by the extension entry points. SRI on a CDN script is therefore not the right fix; enforce checked-in vendor hashes at build/review time.

| Library | Version / source | Actual use and check result |
|---|---|---|
| SortableJS | 1.15.6 — https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js | Bundled but no current authored runtime reference found; README's task-panel load claim is stale. No applicable advisory established by this search; comprehensive registry check incomplete. |
| canvas-confetti | 1.9.3 — https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js | Bundled but no current authored runtime reference found. No applicable advisory established; comprehensive check incomplete. |
| Chart.js | 4.4.8 — https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js | Runtime lazy load at `components/stats/index.js:72`. CVE-2020-7746 applies to versions below 2.9.4, so not this bundle. The newer Defaults-path issue reproduces locally but has no traced untrusted caller here. |
| Lucide | 0.468.0 — https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js | Asset-generation input (`scripts/assets.js`), with local SVG icons used at runtime. Full JS bundle still ships unnecessarily. No applicable advisory established; comprehensive check incomplete. |
| Tailwind CSS | 3.4.17 — https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.17 | Checked-in local CSS; compiler is not a runtime dependency. Compiler tooling is not locked/attested by package.json. No applicable runtime advisory established. |

Sources: [reviewed Chart.js CVE version range](https://github.com/advisories/GHSA-h68q-55jf-x68w), [upstream Defaults-path issue](https://github.com/chartjs/Chart.js/issues/12265). The latter is an upstream issue report, not a claimed assigned CVE or confirmation that a newer version fixes it. The local probe shows inherited pollution of Chart's Defaults prototype, with `Object.prototype` unaffected.

`package.json:1` contains scripts but no npm dependency graph; no lockfile exists to audit. `npm` was unavailable on PATH, and an OSV query attempt failed to connect. The fallback was a targeted public-advisory search plus local vendor/sink review and the Chart probe. This is **not a clean comprehensive npm/OSV audit**. Sharp/Playwright are maintainer tools outside the shipped package, with no reproducible project-level tooling lock. No dependencies were installed or upgraded.

# D. Critical and High code corrections

**N/A — no confirmed Critical or High findings.** No vulnerable/corrected pair is presented as a high-severity fix. The changes proposed in C and F are recommendations only; none was applied to application code.

# E. Checklist results

PASS means no finding in the reviewed scope, not a guarantee against undiscovered issues. FAIL can denote a configuration, privacy, robustness or release-readiness defect rather than an exploitable attack.

| # | Section | Result | One-line evidence |
|---|---|---|---|
| 1 | Manifest & permissions | FAIL | Unsupported optional geolocation and public blocker frame boundary: `manifest.json:24`, `manifest.json:52`; MV3/minimum 120/local script CSP otherwise present. |
| 2 | XSS & DOM injection | PASS | No untrusted HTML/eval sink traced; DOM strings append as text at `core/utils.js:3`; Notes uses DOM rendering and backup prototype-key rejection at `core/backup.js:30`. |
| 3 | Third-party/CDN dependencies | FAIL | Local pinned libraries at `vendor/README.md:7`, but no verified integrity/advisory gate in `scripts/package.js:19`; comprehensive CVE check unavailable, S09. |
| 4 | Data storage & privacy | FAIL | Reset omits capture session records (`core/backup.js:90` versus `background/notes-service.js:67`); uncapped backup export versus 60-MiB restore (`components/settings/data-tools.js:52`). |
| 5 | Secrets & API keys | PASS | No credential-pattern matches in current text or reachable Git text; APIs read user-supplied keys (`background/pexels.js:6`, `components/music/index.js:78`); plaintext retention risk remains S08. |
| 6 | Network & API usage | FAIL | Fixed HTTPS endpoints and text handling, but JSON byte caps/deadline gaps remain (`components/music/youtube-search.js:9`, `background/pexels.js:13`). |
| 7 | Messaging & internals | FAIL | Blocker accepts authenticated extension subframes (`background/service-worker.js:85`); forged Notes grant rejected by `background/notes-service.js:104`. |
| 8 | Navigation & clickjacking | FAIL | Blocker iframe override reproduced (`blocked/index.js:20`); saved-link schemes constrained by `core/schema.js:102`. |
| 9 | Media/files/input | FAIL | Imported MP4 content not decoded (`core/backup.js:63`); three-byte file accepted; uploads allow only raster/video/audio types, not SVG. |
| 10 | Security-related code quality | FAIL | Restore/export mismatch and corrupt fallback recovery gaps (`core/backup.js:9`, `core/storage.js:12`); no reachable application prototype-pollution exploit established. |
| 11 | Store/policy compliance | FAIL | Public publisher URLs blank (`core/publisher.js:2`), no Firefox background/consent adaptation (`manifest.json:10`); actual store submissions unavailable. |
| 12 | Build/packaging/release | FAIL | ZIP is clean of requested forbidden file classes now, but 47 entries differ and recursive inclusion lacks gates (`scripts/package.js:10`, `docs/security-audit/verification-summary.json:19`). |

# F. Hardened manifest.json and CSP recommendation

This is a **proposed Chrome/Edge manifest**, saved separately as [manifest.recommended.json](D:/BOOKS/ONEFLOW/docs/security-audit/manifest.recommended.json). It is not installed, not a drop-in repair, and does not claim Firefox compatibility. It assumes the following accompanying fixes are approved and implemented:

- Use city search for weather; remove unsupported optional-geolocation controls and cleanup calls. Retaining device location instead requires an explicit product decision about required geolocation access.
- Move notifications to optional permission and add consent/denial guards around every notification caller, including background habit/ritual/Notes paths (`service-worker.js:56`, `focus-service.js:194`, `notes-service.js:129`). A manifest-only move would break those paths.
- Keep optional HTTP/HTTPS hosts for user-selected blocking. Narrow the blocker WAR from `<all_urls>` to web schemes. Preserve Notes' web embedding and validate its launch capability.
- Add the **top-level blocker guard in S01**. A global `frame-ancestors 'self'` would break the deliberately embedded Notes workspace; it is therefore not included. `frame-src` controls child frames, not who may frame the extension. A manifest alone cannot provide different ancestor policies for these two pages. If Notes moves to a tab-only UI, remove its public resource entry and add a restrictive ancestor policy then.
- Forbid native form submissions: current search uses an intercepted form and the browser search API (`components/search/index.js:8`, `core/search.js:10`). Keep font/worker/script sources local and script attributes forbidden. Regression-test music, capture and search against the proposed CSP before release.

```json
{
  "manifest_version": 3,
  "name": "ONEFLOW — Private Focus & Study Timer",
  "version": "1.0.0",
  "description": "A private workspace in every new tab. Pick a task, start focusing, and see your progress. Works offline. No account needed.",
  "minimum_chrome_version": "120",
  "chrome_url_overrides": { "newtab": "newtab/index.html" },
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  "permissions": [
    "storage", "alarms", "offscreen", "declarativeNetRequest",
    "search", "activeTab", "scripting"
  ],
  "optional_permissions": ["notifications", "tabs", "contextMenus"],
  "optional_host_permissions": [
    "http://*/*",
    "https://*/*",
    "https://api.open-meteo.com/*",
    "https://geocoding-api.open-meteo.com/*",
    "https://www.googleapis.com/*",
    "https://api.dictionaryapi.dev/*",
    "https://api.pexels.com/*",
    "https://images.pexels.com/*",
    "https://videos.pexels.com/*"
  ],
  "icons": {
    "16": "assets/icons/icon-16.png",
    "32": "assets/icons/icon-32.png",
    "48": "assets/icons/icon-48.png",
    "128": "assets/icons/icon-128.png"
  },
  "content_security_policy": {
    "extension_pages": "default-src 'self'; script-src 'self'; script-src-attr 'none'; object-src 'none'; base-uri 'none'; style-src 'self'; font-src 'self'; worker-src 'self'; img-src 'self' blob: data: https://images.pexels.com; media-src 'self' blob:; connect-src 'self' https://api.pexels.com https://images.pexels.com https://videos.pexels.com https://api.dictionaryapi.dev https://www.googleapis.com https://api.open-meteo.com https://geocoding-api.open-meteo.com; frame-src 'self' https://open.spotify.com https://www.youtube-nocookie.com; form-action 'none';"
  },
  "action": { "default_title": "ONEFLOW notes · Alt+Shift+N" },
  "web_accessible_resources": [
    {
      "resources": ["blocked/index.html"],
      "matches": ["http://*/*", "https://*/*"]
    },
    {
      "resources": ["components/notes/capture.html"],
      "matches": ["http://*/*", "https://*/*"]
    }
  ],
  "commands": {
    "open-notes": {
      "suggested_key": { "default": "Alt+Shift+N" },
      "description": "Open ONEFLOW notes and quick capture"
    }
  }
}
```

No external messaging or content-script declaration is added. Dynamic public-resource URLs may reduce stable-ID fingerprinting, but require compatibility testing with DNR redirects and Notes' exact sender checks; they are not enabled speculatively. Current relevant behavior is described in [Chrome WAR documentation](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources) and [Chrome CSP documentation](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy).

# G. Prioritized remediation plan

**Fix now, before release**

1. S01: reject framed blocker operations at the worker and page boundaries; test malicious framing and normal redirects.
2. S02: make every successful exported backup restorable; test actual large notes/media collections, both encrypted and readable.
3. S03–S04: finish full deletion across session/local/sync/IDB, menus and supported grants; resolve geolocation honestly; verify failure handling.
4. S05–S06: build and test the exact release revision/archive; provide public policy/support details; state Chrome/Edge-only support until Firefox adapters/consent have been tested. The existing ZIP SHA-256 is `20b19bd37e4c062c800676420ca5e727fa8b1d833fe0bb1d38e4414ec538443c`; it is an inventory fact, not approval to distribute.

**Fix soon**

5. S07–S10: validate imported media, default to credential-free export, pin/verify vendor provenance, bound JSON responses and search deadlines. Add action-specific sender/payload checks to the worker/audio owner; limit storage access to trusted extension contexts where compatible with the capture shell.
6. Remove dormant Unsplash code, unused vendor bundles and obsolete README claims (`README.md:42`, `README.md:44`); update `docs/PERMISSIONS.md:36`, which still describes fixed-provider search forms.
7. Make notification permission optional with complete callers/denial behavior, then test the proposed manifest and CSP. Do not install only the proposed JSON.

**Nice to have**

8. S11: recover corrupt preview storage without overwriting it. Minimize internal documentation in the ZIP. Harden the loopback preview server to serve only intended assets and verify Host/Origin handling (`scripts/preview.js:8`); possible DNS-rebinding implications require testing and are not claimed as a production extension exploit.
9. Add media decoded-size budgets, import rollback fault injection, session-token cleanup on expiry/tab-close, and a reproducible maintainer-toolchain lock/SBOM.

Decisions needed for the later fix pass: retain device geolocation with required access or use city search only; whether Firefox is a release target now; real public publisher URLs. No decision is required to read this audit, and no fixes have been started.

# H. Things not verified and manual tests

**Limitations:** this was not an exhaustive manual read of every text line or a visual review of every binary asset. No full upstream-source comparison, executable disassembly, fuzz campaign, entropy-complete secret audit, OSV/npm audit, remote Git-history audit or malware scan was completed. No real API key or personal browser profile was used. No live third-party requests with user credentials, provider cookie behavior, CORS across every browser, permission-denial prompt sequence, policy-host availability, store-dashboard disclosure, actual store acceptance or Firefox runtime was verified. Edge was not retested for this security pass. Chrome 120 compatibility was not exercised; the disposable runtime was Chrome 155. Earlier repository QA files were not accepted as fresh evidence.

Two initial permission-setup attempts stalled in headless automation and were stopped. One synthetic timer-state setup was invalid and was corrected to start the timer through the application engine. These harness failures are not product vulnerabilities. The final reproduction results are in `runtime-checks.json`; blocker permission grants and real navigation after override still need a headed-browser test.

The three-byte video test validates parser acceptance, not browser exploitation. The oversized-crypto test validates the envelope limit, not a complete real-media backup round trip. Chart's gadget required direct API invocation in an isolated VM; it was not triggered through app input. Full-reset session retention and geolocation-removal failure were reproduced; pre-granted tabs/contextMenus retention requires the real opt-in sequence. Source inspection confirms their omission from reset.

**Load and test:** use a disposable Chrome/Edge profile, load `D:\BOOKS\ONEFLOW` via the browser's extension developer mode, inspect extension errors and the service-worker console, and use synthetic data. Do not test destructive reset/import against your everyday collection. After fixes, repeat against the unpacked contents of the exact candidate ZIP, not only the source directory.

| Test | Procedure | Safe result |
|---|---|---|
| Text XSS | Paste the payloads below separately into name, focus, task/list names, Notes title/body/checklist/labels, journal/reflections, habits/countdowns, scenes, recovery/capsules, workspace text, tool search and feedback; save, reopen, reload, export/import. | Literal text or a clear validation rejection; no injected element, alert, handler execution or unexpected request. |
| URL fields | Use the scheme payloads below in quick links, Notes source, capsule/workspace/evidence links and music links. | Executable/privileged schemes rejected; music accepts only reconstructed supported HTTPS providers. |
| Provider responses | Intercept dictionary/weather/Pexels/YouTube responses in a test harness; insert markup into text, wrong types, null rows, huge bodies, hostile redirect targets, 401/429/500 and stalled bodies. | Text only; bounded work and clear recoverable errors; no key forwarded to an unapproved origin. |
| Message/frame boundary | Embed blocker and forged Notes URLs from a local test site; try wrong token/tab/source, expired/replayed grants, subframe messages and sender URL suffixes. Open a legitimate capture afterward. | Blocker cannot mutate state from a subframe; forged Notes cannot read/render records; valid one-use capture still works. |
| Full deletion | Enable every optional feature, leave an unconsumed capture launch record, save synthetic attachments, reset, restart, inspect all stores/grants/menus/alarms. | No private records or pending grants/session capture data remain; UI reports success only after cleanup, and failures are actionable. Downloaded files are explicitly outside deletion. |
| Backups/media | Plain/encrypted backups at 59/60/61 MiB and media-rich collections; wrong password/truncated GCM; invalid JSON/prototype keys; forged MIME/empty files/SVG, high dimensions and corrupt videos. | Every successful export round-trips; invalid data rejected before replacement; no silent partial restore or runaway memory. |
| Races and failures | Edit from two tabs; restore/reset with editors open; inject quota/IDB/notes-preferences/message failures; suspend/restart worker during capture and blocking. | Defined conflict/error behavior, no stale resurrection of deleted records, and no falsely reported complete restore. |
| Network privacy | In DevTools, record first run, idle, offline use, then opt into each service separately. Check service-worker and iframe traffic too. | No unsolicited analytics/fonts/provider traffic; only disclosed endpoints when needed; disconnect prevents future refresh/player requests. |
| Packaging/store | Inspect exact ZIP file list/hashes; compare manifest and source; load Chrome/Edge; run Firefox variant tests separately; verify public policy/contact and developer-console answers. | Reproducible identified release with no secrets/tests/profiles/maps/internal notes, accurate permissions and disclosures, and support claims matching tested browsers. |

Text payloads (use synthetic records):

```text
<img src=x onerror=alert(1)>
"><svg onload=alert(1)>
</textarea><img src=x onerror=alert(1)>
<script>alert(1)</script>
[open](javascript:alert(1))
```

URL payloads:

```text
javascript:alert(1)
data:text/html,<script>alert(1)</script>
file:///C:/Windows/win.ini
https://trusted.example@attacker.invalid/
```

Prototype-key test: add `"__proto__": {"auditPolluted": true}` as an own JSON property in a copy of a valid backup; repeat with `constructor` and `prototype`. Expected: import rejection before any storage mutation, and no inherited `auditPolluted` property. Import errors should not leak private backup content into logs.

Search fields may intentionally send literal text to their disclosed provider after you submit; that alone is not XSS. Avoid submitting private payload content to live providers. CSP may prevent an injected handler from firing, so absence of an alert alone is insufficient: verify there is no injected `<img>`, `<svg>` or `<script>` node and no unexpected request.

Audit artifacts only were created under `docs/security-audit/`, plus disposable test profiles. Application code, manifest, existing release ZIP and prior design work were left unchanged. This report ends the audit pass; remediation awaits your approval.
