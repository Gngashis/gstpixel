# Compliance-first roadmap

Updated 14 September 2026. This is a planning document for the GSTPIXEL prototype, not regulatory advice or a public service promise.

## Current service architecture

The service catalog now groups services into:

- **Start / Register a Business:** proprietorship, partnership, LLP and company registration assistance.
- **GST & Tax Compliance:** GST registration assistance, GST return filing and ongoing GST assistance, plus the existing GST overview route.
- **Food & FSSAI:** FSSAI registration and licensing assistance.
- **Licences & Registrations:** trade licence assistance and Udyam / MSME registration assistance.
- **Ongoing Compliance:** business support for organizing registration, licence and compliance questions.
- **Digital Services:** web development, app development and digital marketing as secondary services.

Existing routes include `/services`, `/services/gst`, and dynamic detail routes for each catalog service. The existing `/start-business`, GST calculator, tools and Digital Studio remain separate functional surfaces.

## Missing or deferred categories

The catalog is intentionally descriptive rather than an authority directory. Possible future categories include:

- Additional local or sector-specific licences, only after the relevant jurisdiction and authority are verified.
- Recurring bookkeeping, payroll, accounting or tax workflows, only after GSTPIXEL confirms its actual scope and qualified delivery model.
- Import/export, labour, professional-tax and other registrations, only after the exact service boundary and current official requirements are researched.
- A document collection or client portal, which requires a real privacy, storage, consent and security design before implementation.

## Recommended priority

1. Build a compliance-first intake that identifies business activity, location, structure, current registrations and the user’s intended next step without deciding eligibility.
2. Build separate, deterministic workflows for GST registration, GST return assistance, FSSAI, trade licence and Udyam/MSME questions.
3. Add a registration-structure comparison workflow for proprietorship, partnership, LLP and company discussions.
4. Add recurring-compliance reminders or task tracking only after verified filing responsibilities and a real notification/data model exist.
5. Keep Digital Studio discoverable but secondary to registration and compliance journeys.

## Future customer-intake workflows

The next intake should collect only bounded, user-provided context:

- business activity and plain-language description;
- operating location and relevant local context;
- current or intended business structure;
- registrations or licences already held, if any;
- the service question and preferred next step;
- an explicit consent boundary before any future document exchange.

The workflow should produce a reviewable question brief, not a legal conclusion, eligibility decision, filing date, fee quote or approval prediction. It should not upload documents, claim government affiliation or simulate submission.

## Verification required before publication

The following must be confirmed with current, authoritative business/regulatory information before being presented as facts:

- jurisdiction-specific eligibility, thresholds, exemptions and document requirements;
- official application routes, filing dates, renewal duties and authority names;
- GSTPIXEL’s actual fees, turnaround commitments, service coverage and escalation/referral model;
- legal identity, contact details, credentials, privacy terms and any document-handling process;
- whether GSTPIXEL provides filing, review, bookkeeping or only preparation/coordination assistance.

Until verified, the catalog uses neutral placeholders and states that scope, fees, timing and authority outcomes are discussed or checked individually.
