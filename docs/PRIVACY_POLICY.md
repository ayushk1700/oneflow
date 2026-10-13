# ONEFLOW privacy policy

Version 1.0.1 · Updated 14 October 2026

ONEFLOW stores dashboard data in your browser profile. It has no ONEFLOW account, analytics, advertising, remote diagnostics, or developer-operated collection service. The external AI connection is excluded from this release at the user's request.

## Information stored

Focus Capsules save named snapshots locally: selected note text/checklists, active tasks, focus, timer time remaining, background, sound settings and Scene ID. Optional tab capture saves up to 100 current-window web URLs and titles only on your explicit click. URL paths and queries can be sensitive. Attachments stay in original Notes. Capsule restoration creates separate text/checklist note copies, preserves newer tasks, and only opens missing tabs when requested. Delete capsules individually; revoke optional tab access in Capsules.

Focus Recovery retains one resume note, optional reason and task reference, and can be disabled. Leaving this dashboard never automatically pauses the timer. Focus DNA learning and activation counting are off by default and can be enabled separately. Up to 500 local observations include starting conditions, planned break length, counted switches and outcome. Counts do not contain browsing URLs and do not distinguish research from distraction. Turning learning off stops new observations; Delete learning data disables learning and clears existing samples. Energy blocks and task estimates are manual local data. These features make no remote calls. Full export/import and full deletion include all their records; downloaded backups remain your responsibility.

Local browser storage holds settings, daily focus, tasks, notes, habits, countdowns, moods, scenes, layouts, rituals, unfinished drafts, the most recent focus-session summary and optional integration settings. IndexedDB holds journal entries, focus-session history and cached/uploaded images and user-uploaded video wallpapers. Video wallpapers are stored locally, play silently and do not contact a video provider. The blocker stores up to 200 recent blocked **hostnames and timestamps**; it does not store page content, URL paths or queries. Its log can be cleared separately.

Small preferences—name, theme, accent and widget toggles—use `chrome.storage.sync`. If browser sync is enabled, the browser provider may sync these preferences under its own account and privacy policies. Personal task/journal/session/image records and keys do not use that channel.

## Optional network activity

| Feature | What is sent and when |
| --- | --- |
| Weather | After you grant access and choose a city, Open-Meteo receives a city search or the selected city coordinates. ONEFLOW does not request device geolocation. Existing saved weather locations remain until changed or forgotten. Enabled dashboards refresh expired caches. |
| Pexels | On explicit search, Pexels receives your API key and query. Its media hosts receive preview/download requests. Selected photos/videos and attribution are cached locally for offline use. |
| Spotify/YouTube | A provider iframe loads only after explicit playlist connection. The provider can receive normal player data such as IP address, playlist ID, interaction and provider cookies/login information under its own policies. Leaving the panel removes the frame. |
| Search and quick links | Submitting search invokes the browser’s default search provider; opening a link navigates to your chosen website. The destination’s privacy policy applies. No query history or favicon lookup service is used. |

These services may receive normal network metadata, including your IP address. ONEFLOW's developer does not receive those requests or your records. Blocking uses local browser rules and sends no blocklist or log to a server. Local sounds, built-in scenes, prompts, quotes and backgrounds need no network.

## Controls, retention and backups

Disconnect optional services to clear configuration and revoke access. Turning off a widget stops its refresh/playback behavior; an already-started request can finish. Settings provides full export/import and explicit deletion of local data and synced preferences. Browser-profile removal also removes local data. No automatic remote backup is made.

Readable JSON backups contain private records, with saved integration keys excluded by default. Including saved keys is an explicit checkbox and requires a passphrase. Session-only keys are never exported. Optional encryption happens locally with AES-256-GCM and PBKDF2-SHA256; the passphrase is never saved or transmitted and cannot be recovered. Keep exported files private: deletion does not remove downloads. Plain backup contents are limited to 128 MiB; encrypted envelopes allow the corresponding base64 expansion. Oversized exports are rejected before success is reported.

Diagnostics export is user-initiated and local. It includes version, counts, storage sizes and bounded error categories, excluding content, keys and browsing hostnames. You choose whether to share that file outside ONEFLOW.

Help & feedback creates a local text download containing only the feedback you enter, its selected topic and the extension version. It is not transmitted automatically and contains no automatically attached tasks, journal entries, diagnostics, provider keys or browsing activity. You decide whether and where to share it.

## Permissions and support

Dictionary lookups send the submitted English word to Free Dictionary API (`api.dictionaryapi.dev`) after optional access is approved. Up to 30 results are kept in this tab's memory for offline reuse; no dictionary history is saved to storage or backups. Clear words & disconnect removes the memory cache and requests permission revocation. Provider policies apply. Web search sends the submitted query through your browser’s default search provider; ONEFLOW does not save search history. Opening either tool makes no third-party request.

Optional YouTube song search sends your query and entered API key to Google's YouTube Data API when you press Search songs. Saving the key is optional and local; backups exclude saved keys unless you explicitly include them in an encrypted export. Forget search key removes it and requests access revocation. Loading a song contacts YouTube through its visible player; provider privacy policies apply. ONEFLOW does not extract audio or track listening activity.

[PERMISSIONS.md](PERMISSIONS.md) explains each permission and opt-in trigger. No history, cookies, persistent tabs-reading or broad required host permission is requested. Notes uses temporary active-tab access and scripting after you invoke capture. Blocking requests optional access on enable; allow-only mode explicitly asks for all HTTP/HTTPS sites.

## Notes and quick capture

Notes and their image, drawing and voice attachments are stored in IndexedDB in this browser profile. Existing notes migrate from local storage when Notes first opens. View/theme preferences stay in local storage, without browser sync. The capture toolbar reads only the invoked page's title, URL and selected plain text into a temporary browser-session launch record; Capture page saves it as a note. The optional context menu saves only the page, link or selection you explicitly choose. Capture never fetches the source page, remote images or link previews.

Microphone recording requires an explicit action and browser permission. Audio is local, capped at two minutes and 8 MB per attachment, with no transcription or transmission. Notes and attachments are included in local export/import and full reset. Trashed notes remain recoverable indefinitely until you explicitly delete them forever. Permanent deletion removes their attachments; independently copied task-inbox entries remain until removed from Tasks. Browser profile deletion/uninstall removes local records. Reminders may show the note title in a system notification.

Cloud collaboration and cross-device note synchronization are not implemented. No backend, account or hidden upload is present.

Support contact supplied by the publisher: aayush31500@gmail.com. Contact support opens your mail application; no email or feedback is sent automatically. Public distribution still requires this policy to be hosted at the actual store-listed HTTPS URL. Public packaging refuses to build until that URL is configured.

Optional Pexels search sends your query and API key on explicit search. Previews and media downloads use its image/video hosts; selected backgrounds and attribution are cached locally. Use key for this session keeps a key only in browser-session storage. Save Pexels key explicitly retains it locally. Backups exclude keys by default; saved keys can be included only in an explicitly selected encrypted export. Disconnect clears local/session keys and requests provider-grant revocation, retaining wallpapers.


# Personal workspaces

Tool favorites and the six most recently opened tools are stored locally after your explicit actions. They help organize the launcher, are included in work backups, and are removed by full reset. They do not record browsing activity or send usage information anywhere.

Subject material, recall confidence, ideas, meeting notes, career progress, project evidence and energy check-ins stay on this device and are created by explicit actions. Offline rules generate editable suggestions; no text is sent to AI services. Confidence and energy are self-reported, not measured ability or health.

Quiet Web reads current-window tab titles and HTTP(S) links only after optional permission and explicit review. Only chosen categories are persisted. Parking saves a capsule before closing still-matching inactive tabs. It does not monitor browsing or read page contents. Its cost estimate uses your chosen seconds per extra tab.

Proof of Work creates a local CSV only on request and includes only individually approved lines. There is no automatic reporting or client sharing. Workspaces are included in backups and full reset. Removing a workspace record leaves linked Notes and original session history independently available.



Full deletion clears local/IndexedDB/synced records, temporary capture records and session keys, displayed system notifications, capture menus and granted optional website/tabs/context-menu/notification access. Open Notes editors are invalidated after replacement to prevent stale saves. A random replacement marker remains in session storage without personal content. Capture launch records are also removed when their tab closes or their expiry alarm runs; browser/OS scheduling can delay expiry cleanup. Preview-only corrupted JSON is preserved locally for explicit recovery, and full deletion removes those copies.
