# Search and dictionary stage report

## Built

Tools now includes Search & learn with Web search and Dictionary. Web search supports Google, Bing and DuckDuckGo and opens encoded queries in a new tab, preserving the dashboard. The existing dashboard search remains available. The dictionary presents English definitions, phonetics, examples and related words inside the shared accessible panel. Both tools are also available through the command finder.

The dictionary uses Free Dictionary API's documented English endpoint, with access requested only on lookup. No API key or account is required. Responses are bounded and rendered as plain text. Up to 30 successful results remain in this dashboard tab's memory, enabling offline repeat lookups. Invalid input, denied access, missing words, offline requests, malformed responses, timeouts and connection failures receive useful messages. Switching tools cancels pending lookups and retains the input; closing the panel cleans up its request. Clear words & disconnect empties session results and requests access revocation.

Music's YouTube API key & search connection section is now expanded by default, with a visible password field. This key enables song search; loading a song URL does not require a key. The prior live playback limitation remains: this environment blocked YouTube access, so actual streaming still needs a real-browser check.

## Changed file tree

- components/websearch/index.js
- components/dictionary/{index.js,api.js,style.css}
- components/commands/index.js and components/music/index.js
- core/features.js and core/ui.js
- manifest.json
- scripts/widget-styles.json, scripts/package.js
- newtab/widgets.css and newtab/app.css (generated)
- docs/PERMISSIONS.md, PRIVACY_POLICY.md and this report
- tests/dictionary.test.js, lookup-browser.js and updated music-api-browser.js

## Load and acceptance

Reload ONEFLOW at chrome://extensions or edge://extensions. Open Tools → Web search; choose a provider and submit. Open Tools → Dictionary; enter an English word, select Look up word and approve the dictionary-only access. Repeat a successful word offline to test session reuse. Escape closes the dialog. Open Music to find the expanded YouTube API key field.

- PASS: 53 unit tests, including input bounds and malformed dictionary responses.
- PASS: manifest/CSP references, syntax, safe DOM and generated styles checks; initial application JavaScript remains below 150 KiB.
- PASS: Chrome and Edge controlled browser checks verify query encoding, isolated search tabs, denied access, safe dictionary rendering, offline repeat lookups, mobile width and Escape.
- PASS: music regression with a simulated YouTube provider and simulated search consent/results.
- PASS: extracted release smoke checks in Chrome and Edge.

Browser dictionary tests simulate provider responses and permission consent. Live dictionary service availability and the actual permission dialog still need a check in an unrestricted browser. This is an English online dictionary with a temporary session cache, not a complete offline dictionary. Search results use the provider's page; they are not embedded or scraped. No pronunciation audio, new dependency, required permission or persistent search history was added.

Source: https://dictionaryapi.dev/ documents the English endpoint and response structure.
