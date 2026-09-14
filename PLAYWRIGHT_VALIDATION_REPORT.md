# GSTPIXEL Playwright validation report

Validated 15 September 2026 against the current integrated production build using the installed Playwright, Chromium and axe-core setup.

## Result

The current compliance-first production build passed the full regression sweep. All 24 tested routes returned HTTP 200, rendered one main heading, passed exact-width overflow checks, and completed the applicable interaction and accessibility checks. The production build generated 26 static pages.

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
- `/tools/profit-margin`
- `/tools/break-even`
- `/start-business`
- `/digital-studio`
- `/about`
- `/contact`

The browser regression covered 24 routes in total. The generated route count also includes framework-generated pages outside the explicit browser route list.

## Viewport results

All 24 browser-tested routes were checked at exact viewport sizes, producing 96 width checks:

| Viewport | Result |
|---|---|
| 320 × 568 | No horizontal overflow |
| 390 × 844 | No horizontal overflow |
| 768 × 1024 | No horizontal overflow |
| 1440 × 900 | No horizontal overflow |

## Accessibility and keyboard checks

- Full Playwright regression: 24 routes, 96 viewport checks and 0 axe violations.
- Homepage mobile navigation opens, closes with Escape, returns focus to the menu control, and routes correctly.
- Consultation dialog focus containment and Escape close passed.
- GST calculator keyboard submission, invalid-rate focus, reset focus and result behavior passed.
- Profit & Margin calculator arithmetic, margin/markup display and rounding behavior passed direct interaction validation.
- Break-even calculator whole-unit rounding and contribution calculation passed direct interaction validation.
- Trade Licence and Udyam/MSME workflows passed Back, resume, refresh persistence, reset, dedicated localStorage and final CTA checks.
- GST registration, GST return filing, FSSAI, company/formation and Business Support progressive consultation surfaces remained covered by the integrated regression.
- The Start Business planner's duplicate option lacked an accessible label during the sweep; it was corrected and passed the follow-up check.
- Reduced-motion context (`prefers-reduced-motion: reduce`) disabled nonessential CSS animation in the existing harness.

## Console errors

No console or page errors were found across the 24-route production regression.

## Broken links

- No broken internal links were found in the validated route surfaces.
- Related service links, catalog routes, all three calculator routes, Digital Studio, About and Contact resolve in the production build.

## Screenshots produced

- `review/homepage-desktop-validation.png`
- `review/homepage-mobile-validation.png`
- `review/services-overview-validation.png`
- `review/gst-service-validation.png`
- `review/fssai-service-validation.png`
- `review/gst-calculator-validation.png`
- `review/launch-planner-validation.png`

Existing baseline screenshots in `review/` were preserved.

## Exact finding resolved

- **Start Business accessible label:** a duplicate planner option was found without an accessible label. The option was corrected and the follow-up accessibility check passed.

## Validation commands

- `pnpm typecheck` — passed.
- `pnpm test` — passed: 75/75 tests.
- Production Playwright regression — passed for 24 routes and 96 exact-width checks; zero overflow findings, zero console/page errors and zero axe violations.
- `pnpm build` — passed; Next.js generated 26 static pages.

## Recommendation

Continue from the current production build. Preserve the progressive consultation safety boundaries and repeat the full regression after future shared-navigation, backend or client-workspace changes.
