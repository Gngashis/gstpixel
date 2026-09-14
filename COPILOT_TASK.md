# Ready-to-paste Copilot task — service catalog

Status: **Not dispatched in Copilot. Assigned to the `service_catalog` coding agent for this milestone. Do not run this task concurrently.** Retained as a complete delegation record and future handoff template.

Continue the existing GSTPIXEL project at `/Users/ai/Documents/Codex/2026-09-14/the-old-bentraders-html-is-being/outputs/gstpixel-prototype`. Read `PROJECT_STATE.md`, `AGENTS.md`, and the relevant local Next.js documentation. The application uses Next.js 16.3.5, React 19.3.0, strict TypeScript, CSS tokens and CSS Modules. Preserve working code and dependencies.

Implement only a balanced service catalog and five additional detail pages. Own only `src/content/services.ts`, `src/app/services/page.tsx`, `src/app/services/[slug]/page.tsx`, `src/features/service-catalog.module.css`, and `SERVICE_CATALOG_HANDOFF.md`. Do not edit the homepage, header, layout, shared components, package files, existing GST page, or another agent’s work.

Create `/services` and `/services/fssai`, `/services/web-development`, `/services/app-development`, `/services/digital-marketing`, `/services/business-support`. Link the existing `/services/gst` as the sixth service. Use typed content, awaited dynamic params, route metadata, static params and branded notFound behavior for unknown slugs. Reuse the existing Icon, ButtonLink, TextLink, ConsultButton, LightCard and Reveal components where suitable.

Preserve the obsidian/champagne design language, spacious composition, serif heading emphasis, refined borders and readable forms. Each service page needs a clear proposition, scope and boundaries, a short process, useful preparation guidance, related tool/planner links and a consultation action. Balance compliance, food-business support and digital services. Do not invent legal rules, eligibility, fees, timelines, client counts, credentials, contacts or government affiliation. Explain FSSAI assistance without promising licensing outcomes. No fake submission or account features.

Do not install dependencies, initialize a replacement app, deploy, change secrets or duplicate another agent’s task. Use the existing local repository. Node is at `/Users/ai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; pnpm is at `/Users/ai/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm`. Add Node’s directory to PATH for commands.

Acceptance: all six catalog links resolve; five new routes are correctly typed and render matching metadata; unknown slugs return notFound; no false business/regulatory claims; layouts work from 320px upward; no changes outside owned files. Run typecheck if other concurrent files are stable, but leave the full production build and browser integration review to the lead agent. Write a concise handoff with files, checks and limitations.
