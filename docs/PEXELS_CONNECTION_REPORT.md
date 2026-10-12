# Stage Report: Pexels connection handling

Search now runs through the MV3 background worker instead of directly in the dashboard page. The worker reads the latest saved key, verifies real API origin permission, limits requests to fixed photo/video endpoints and sends only structured results/errors back to the extension's new-tab page. No public proxy, new provider or remotely hosted code is used. Network searches run outside the timer/alarm queue.

Clear errors replace generic Failed to fetch: missing website grant, disconnected/reloaded extension tab, offline/network/firewall issues, timeout, invalid key, provider limits and unexpected JSON. A local preview explains that online search needs the installed extension. Keys are never printed in errors or passed through the UI message payload.

Files: background/pexels.js; background/service-worker.js; components/pexels/index.js; tests/pexels-browser.js; tests/pexels-worker.test.js.

Verification: public photo/video endpoints respond HTTP 401 without a key, confirming reachable correct addresses on this machine. Controlled Chrome tests pass through worker messaging, including denied permission, invalid key, rate limit, simulated fetch failure, saved photo/credit, damaged video rejection, valid silent video, backup roundtrip and offline/disconnect. Worker tests reject arbitrary payloads and missing origin grants. Provider permission and network responses are mocked in those account-free tests. No user's key was accessed; original browser/account failure remains unconfirmed.

Load: reload ONEFLOW at chrome://extensions or edge://extensions, close the old ONEFLOW tab and open a new tab. Saved keys are retained. Open Appearance → Wallpapers, search and allow website access. If search still fails, the displayed message now identifies the next check. Human live-account and native permission-prompt checks remain manual. No additional input is required for the code change; never paste a key into chat.
