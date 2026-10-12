# ONEFLOW launch package

Engineering acceptance is maintained in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). This file covers publisher materials and store-submission preparation; it does not replace those engineering gates.

Positioning: **A private workspace in every new tab.**
Initial audience hypothesis: students who want an easy, calm place to start focused study. The product continues to support everyday work without forcing an audience choice.

## Prepared materials
- STORE_LISTING.md: title, short description, benefit-led listing and permission explanations.
- launch/chrome-start-easily.png, chrome-stay-focused.png, chrome-see-progress.png: 1280×800 screenshots from a disposable profile with sample study content.
- launch/chrome-onboarding.png and chrome-mobile.png: additional first-run and responsive evidence.
- launch/oneflow-demo.webm: silent 20-second walkthrough assembled from actual UI captures; no real user data.
- launch/promo-440x280.png: branded promotional image built from bundled artwork and the existing logo.
- launch/privacy.html: offline-readable policy, generated from PRIVACY_POLICY.md.
- launch/support.html: static help and recovery guide.
- BETA_GUIDE.md: recruitment, consent, two-week protocol, interview questions and decision criteria.
- MARKET_RELEASE_REPORT.md: actual verification, limitations and file map.

## Publisher configuration
Set the real HTTPS support/contact destination and privacy-policy destination in core/publisher.js. A support website may contain the publisher’s email; no address is invented by the build. The in-app Help panel hides missing public links and still provides working local help and feedback download.

Run `node scripts/launch-pages.js` to generate static pages. Use `node scripts/launch-pages.js --release` to require both publisher URLs before preparing a public submission. Host privacy.html and support.html on your chosen HTTPS host, then verify they load while signed out. The generator performs no upload or publishing.

Regenerate clean store screenshots with `node scripts/launch-captures.js` and the walkthrough/promo with `node scripts/launch-demo.js` (both use the optional Playwright test runtime). The market browser tests write QA screenshots to the same launch folder; run launch-captures last before submitting assets.

## Before store submission
1. Complete the remaining human/device checks in MARKET_RELEASE_REPORT.md. Record actual browser and OS versions and outcomes.
2. Review the listing and privacy declarations against all enabled optional services. Core use is offline; web searches and connected providers need the internet.
3. Verify support and privacy links, icons, screenshots and demo. Screenshots use sample data; they are not usage statistics or testimonials.
4. Rebuild with `node scripts/package.js`, then load and test the extracted zip in both target browsers. Verify the checksum before sharing.
5. Submit through your own publisher account. Store review and acceptance are not guaranteed by local tests. Do not claim Firefox support without testing its API differences.
6. Run the two-week pilot and evaluate its results before expanding integrations or monetization.

## Demo narrative
“Choose your space. Write one small task. Start focusing. Pause when you need to. Your work stays on your device.”

The clip demonstrates actual controls through six timed UI captures. Completion/progress screenshots use a deliberately advanced timer in the disposable test profile, not an observed 25-minute study session. Asset dimensions follow [Chrome’s image guidance](https://developer.chrome.com/docs/webstore/images); recheck the publisher portal at submission time.
