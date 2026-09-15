# GSTPIXEL website work bundle

This archive contains the GSTPIXEL website source and the project material produced during the GSTPIXEL/BENTRADERS continuation. The BENTRADERS site was used as a visual reference only; the implementation is a modern Next.js application.

## Included

- `src/` — Next.js pages, React components, CSS Modules, service data, deterministic calculator/planner/registration logic.
- `tests/` — deterministic TypeScript tests.
- `scripts/` — Playwright browser validation harness.
- `review/` — accessibility report, production validation report data and representative screenshots.
- `public/` — brand icon asset.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts` — project setup.
- `PROJECT_STATE.md`, `COMPLIANCE_FIRST_ROADMAP.md`, handoff notes and the architecture blueprint — decisions, scope, boundaries and continuation context.
- `references/` — the GSTPIXEL prompts supplied during this work, preserved as text for context.

## Run locally

From the `gstpixel-prototype` directory:

```text
pnpm install
pnpm dev
```

Then open `http://127.0.0.1:3000`. Validation commands are `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:browser`.

The archive intentionally excludes `node_modules/`, `.next/`, `.git/` and temporary backup files. They are generated or environment-specific and can be recreated from the lockfile.

## Current boundary

This is an implementation bundle for local review. Consultation details, legal identity, approved pricing/timelines, privacy terms, accounts, uploads, payments, government integrations and public deployment remain deferred until verified requirements are supplied.
