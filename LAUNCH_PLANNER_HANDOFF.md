# Launch planner handoff

Implemented `/start-business` as a local-only, one-question-at-a-time guided workflow. It collects five bounded answers, validates the optional location, supports keyboard accessible radio/checkbox fieldsets, provides review/edit actions, and generates a deterministic typed roadmap.

Food adds an FSSAI review; every plan includes GST applicability review. Multiple founders add an ownership structure review, and digital selections add relevant optional website, app, or marketing scope steps. The copy consistently frames these as discussion/review steps rather than tax or legal determinations. Preparation asks only for an activity description, location, and ownership outline; it does not request identity documents.

The generated plan can be downloaded as a plain text Blob or copied when browser clipboard access is available. There is no backend, cloud save, transmission, AI claim, fabricated pricing, or timeline. Resetting a completed plan uses an explicit confirmation dialog. Existing `ConsultButton` is used for the consultation handoff.

Checks run: `pnpm test -- tests/launch-plan.test.ts` and `pnpm typecheck`.

The service links for FSSAI, app development, digital marketing, and web development assume the corresponding routes are supplied by the wider project. Browser visual QA and full build were intentionally left to the integrating agent.
