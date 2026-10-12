# ONEFLOW release checklist

The Design Constitution v2 delegates verification here. This checklist records checks, not an automatic claim of release readiness.

## Per-change gate

- Read the constitution and affected modules; preserve user records, drafts and active deadlines.
- Regenerate source styles with `node scripts/styles.js`; run `node scripts/check.js` and applicable unit tests.
- Run affected real-extension browser workflows in Chrome and Edge. Use separate, disposable fixtures for native host/tab APIs when headless consent cannot run; leave the release manifest optional.
- Inspect desktop 1440px and mobile 390/320px, light/dark themes, keyboard navigation, visible focus and reduced motion over scenic backgrounds.
- Check first-run, empty, filled, denied-access, offline and error recovery states. Render user/provider text safely.
- Verify persistence, cross-tab timer identity and relevant backup round-trips after data/schema changes.
- Record pass/fail/not verified, screenshots and known issues in the stage report. Do not publish without authorization.

## Release gate

- Build a local package, verify checksum/CRC and runtime assets, and load the extracted extension offline.
- Run the current Chrome and Edge acceptance suites; record startup and initial JS against the constitution and fixed project budgets.
- Check native optional consent and real provider availability manually; fixture success does not prove these.
- Firefox remains unverified until an available runtime passes manifest loading, Home, local tool, storage, timer and permission smoke checks.
- Retain unresolved failures in the report. Existing cached-startup outliers and manual-browser gates are not waived by this checklist.
