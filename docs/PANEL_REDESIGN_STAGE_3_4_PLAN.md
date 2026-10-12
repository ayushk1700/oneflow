# Panel redesign Stages 3 and 4 plan

User requested both stages together. Stage 3 covers Local Focus DNA, Energy Planner, Energy Weather and Priorities. Stage 4 covers Proof of Work, Afterglow and Quiet Web.

Use shared collections and keyboard tabs for independent contexts. DNA leads with its explanation and discloses privacy controls. Planner separates Today, Task effort and Energy pattern; Weather separates Check in, History and Recovery. Priorities separates three selected tasks from searchable available tasks. Projects separate deliverables and report approval; meetings separate overview, actions and follow-up; Quiet Web separates Now, Later and Reference, with explicit browser review and parking controls.

Change the seven component modules, shared retained-view registration and wrapping styles, regenerate CSS, and adapt integration tests to the new navigation. Preserve local schemas, timer identity, opt-ins, report approval and capsule-before-tab-close behavior. No dependency or permission additions.

Risks: hidden editors losing drafts, stale reports, recovery blocks receiving tasks, stale timer actions, unsafe tab parking and narrow layouts. Verify local saves and exports, timer/session behavior, denial paths, offline state, empty/search states, keyboard controls, both themes and 1440/390/320px in Chrome and Edge. Finish with one combined report and stop.
