# GSTPIXEL Playwright validation report

Validated 14 September 2026 against the current production build using the installed Playwright, Chromium and axe-core setup. No application code was changed during this pass.

## Result

The current compliance-first production build is safe to continue from for the existing route tree. All implemented routes returned HTTP 200, rendered one main heading, passed exact-width overflow checks, and passed the existing interaction/accessibility checks. One route requested for validation is not implemented: `/digital-studio` returns HTTP 404. The current Digital Studio-related homepage interaction remains covered by the existing browser harness, but there is no standalone Digital Studio route in the current source/build.

## Routes tested

Successful routes:

- `/`
- `/services`
- `/services/gst`
- `/services/gst-registration`
- `/services/gst-return-filing`
- `/services/fssai`
- `/services/trade-license`
- `/services/udyam-msme`
- `/services/proprietorship-registration`
- `/services/partnership-registration`
- `/services/llp-registration`
- `/services/company-registration`
- `/services/business-support`
- `/services/web-development`
- `/services/app-development`
- `/services/digital-marketing`
- `/tools`
- `/tools/gst-calculator`
- `/start-business`

Not implemented:

- `/digital-studio` — HTTP 404. This was reported only; no route was added during validation.

## Viewport results

All successful routes were checked at exact viewport sizes:

| Viewport | Result |
|---|---|
| 320 × 568 | No horizontal overflow |
| 390 × 844 | No horizontal overflow |
| 768 × 1024 | No horizontal overflow |
| 1440 × 900 | No horizontal overflow |

## Accessibility and keyboard checks

- Existing expanded Playwright harness: 11-route baseline, 44 viewport checks, 0 axe violations.
- Fresh production-server sweep: 0 axe violations on the homepage.
- Homepage mobile navigation opens, closes with Escape, returns focus to the menu control, and routes correctly.
- Consultation dialog focus containment and Escape close passed.
- GST calculator keyboard submission, invalid-rate focus, reset focus and result behavior passed.
- Reduced-motion context (`prefers-reduced-motion: reduce`) disabled nonessential CSS animation in the existing harness.

## Console errors

No console or page errors were found on valid implemented routes.

The first sweep was pointed at an already-running stale development server. It reported 404s for the newly added compliance routes because that process predated the current build. A fresh production server on an isolated port returned HTTP 200 for every implemented compliance route. The only remaining 404 console entries were the reproducible missing `/digital-studio` route.

## Broken links

- No broken internal links were found in the services overview crawl (21 unique internal links checked).
- Related service links and catalog routes resolve in the production build.
- `/digital-studio` is a missing route rather than a broken link discovered from the current services overview.

## Screenshots produced

- `review/homepage-desktop-validation.png`
- `review/homepage-mobile-validation.png`
- `review/services-overview-validation.png`
- `review/gst-service-validation.png`
- `review/fssai-service-validation.png`
- `review/gst-calculator-validation.png`
- `review/launch-planner-validation.png`

Existing baseline screenshots in `review/` were preserved.

## Exact bugs / findings

1. **Missing Digital Studio route:** `/digital-studio` returns 404. The source route inventory contains no `src/app/digital-studio/page.tsx`; only the existing homepage/studio-preview interaction is present. No code change was made because this pass was limited to validation and the user explicitly prohibited redesign or unrelated implementation.
2. **Stale dev-server artifact:** the pre-existing process on port 3000 did not reflect the current compliance route build. This was resolved for validation by starting the production server on port 3001; it is not a source defect.

## Validation commands

- `pnpm test:browser` — passed: 11 routes, 44 exact-width checks, zero accessibility violations, no errors.
- Custom production Playwright sweep — passed for all 19 implemented routes; zero overflow findings, zero valid-route console errors, zero axe findings.
- `pnpm build` — passed; Next.js generated 21 static routes.

## Recommendation

Continue from the current production build for the compliance-first route work. Track `/digital-studio` as the only reproducible route gap before claiming the full requested route inventory is complete; do not infer a standalone Digital Studio page from the homepage preview.
