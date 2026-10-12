# Panel redesign — Stage 1 plan

Scope approved by the user's request to start implementation: shared compact navigation, searchable Tools with favorites/recent tools, and independent layouts for Focus Capsules, Recall Rooms, Idea Garden, Career Sprint and Skill Loops. The remaining demo-board panels are later stages.

Change shared navigation in `core/ui.js`, add a lazy navigation module and local launcher preferences, add reusable collection/tab helpers, and update the five component views. Use existing tokens, storage, timer and Notes integration; regenerate styles.

Main risks: losing unfinished editors during navigation, selecting the wrong record after save, inaccessible tabs, crowded mobile layouts and exceeding the initial-JavaScript budget. Verify these with real extension browser runs, static checks, unit tests and screenshot inspection. No new dependency, permission or remote service is required.
