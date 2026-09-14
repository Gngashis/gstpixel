# GSTPIXEL implementation checkpoint

Updated 14 September 2026. This is a continuing prototype/platform foundation, **not a completed production platform**. No public deployment is authorized.

## Existing, working foundation

- Next.js 16.3.5, React 19.3.0, strict TypeScript, custom CSS tokens and CSS Modules.
- Routes: `/`, `/services/gst`, `/tools`, `/tools/gst-calculator` plus a branded 404.
- Shared buttons, service cards, navigation, sections, native consultation dialog, reduced-effects toggle, reveals, pointer lighting and hero depth.
- Homepage has six service categories, why GSTPIXEL, an interactive desktop/mobile design concept, three tool previews, founder, five-step process, FAQs and consultation CTA.
- GST calculator supports entered rates, inclusive/exclusive calculations, explicit split/IGST representation, validation, reset, accessible live announcements and integer-paise rounding.
- No accounts, client data, uploads, payments, public AI, government integrations or live consultation backend.

## Evidence already obtained

- Production build and strict type check passed before the latest minor header/storage fallback fixes.
- 29 deterministic tests passed, including 400 varied calculation/reconciliation checks.
- Browser: exclusive ₹1,000 at entered 18% → ₹1,180 total, ₹180 tax, ₹90 CGST; inclusive ₹1,180 → ₹1,000 base; IGST ₹180; rate 101 rejected; Reset clears inputs/results and focuses amount; Enter submits.
- Tools: category filtering, empty search and clear filters checked.
- A narrow header overflow was fixed by simplifying the wordmark below 400px. One subsequent narrow check had matching client/scroll width.
- Earlier responsive automation requested several dimensions but the browser applied different CSS widths. Do **not** report these as exact 320/390/768/1440 checks. Exact-width checks remain pending.
- Desktop homepage and calculator visually inspected. Initial browser warning: add `data-scroll-behavior="smooth"` to the root element.
- Local dev server was stopped/lost before the continuation; dependencies are installed. Restart, do not reinstall.

## Current milestone

1. Finish existing responsive/accessibility validation and preview/run documentation.
2. Add a balanced service catalog including FSSAI and a useful intent-to-next-step pathway.
3. Add one real local guided business-launch workflow with editable answers and downloadable roadmap. No invented prices, legal determinations or fake saving/submission.
4. Review actual output, run checks, then checkpoint before extending Digital Studio and other platform modules.

## Ownership and delegation

- Primary agent: design direction, architecture, integration, visual review, difficult bugs and release assessment.
- Preferred implementation partner: installed GitHub Copilot desktop. No Copilot/OpenCode CLI was found on PATH; Copilot desktop was in a GitHub sign-in state during inspection. No work has yet been dispatched there.
- If Copilot remains unavailable, use an explicitly assigned lower-cost coding agent for an isolated module; do not duplicate ownership.
- Browser/Playwright: deterministic route, viewport, form, navigation, focus and regression checks.

## Unresolved business inputs

GSTPIXEL legal/trading details, contact details, founder portrait, approved prices/timelines and production service scope remain unverified. Keep explicit placeholders. Do not transfer the old BENTRADERS GSTIN/address automatically.

## Design decisions and gap questions

- Preserve obsidian, champagne, serif accents, spacious composition and controlled effects. Keep app complexity off the homepage.
- What important workflow is missing? Visitors can see categories but cannot yet turn their intent into a useful next-step plan. Prioritize that continuity over adding more independent animations.
- What would make a visitor remember GSTPIXEL tomorrow? A clear, personalized roadmap they can take away, paired with the distinctive visual identity.
- FSSAI is missing from the current service navigation and must become a first-class service, without inventing regulatory eligibility rules.

## Next command context

Project: `/Users/ai/Documents/Codex/2026-09-14/the-old-bentraders-html-is-being/outputs/gstpixel-prototype`.
Bundled Node: `/Users/ai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.
Bundled pnpm: `/Users/ai/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm`.
Use these with Node’s directory on PATH. `pnpm dev`, `pnpm test`, `pnpm typecheck`, `pnpm build`. Generated AGENTS.md requires reading relevant local Next.js guides before edits.
