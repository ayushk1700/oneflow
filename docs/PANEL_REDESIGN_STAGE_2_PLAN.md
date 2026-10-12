# Panel redesign Stage 2 plan

Scope: First Step Mode, Next-Step Compiler and Focus Recovery. Make each workspace's starting/returning action clear, disclose secondary controls and preserve unfinished entries during tool switching within the same tab.

Files: `components/firststep/index.js`, `components/compiler/index.js`, `components/recovery/index.js`, `core/ui.js`, relevant browser acceptance tests, and this stage's design documentation. Reuse Stage 1 collection helpers and shared tokens; regenerate stylesheet output.

Risks: retained views using stale timer state, losing edited compiler proposals, duplicate task creation, and cramped mobile editors. Verify real timer identity/duration, draft switching, local task creation, filters, offline behavior, both themes and desktop/mobile screenshots in Chrome and Edge. No dependencies, permissions or schema changes.
