import type { IconName } from '@/components/ui';

export const serviceCategories = [
  'Start / Register a Business',
  'GST & Tax Compliance',
  'Food & FSSAI',
  'Licences & Registrations',
  'Ongoing Compliance',
  'Digital Services',
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export const serviceReviewStatuses = ['needs-review', 'verified'] as const;

export type ServiceReviewStatus = (typeof serviceReviewStatuses)[number];

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  category: ServiceCategory;
  kicker: string;
  proposition: string;
  summary: string;
  customerIntent: string;
  informationToCollect: string[];
  documentChecklist: string[];
  nextStep: string;
  relatedSlugs: string[];
  icon: IconName;
  included: string[];
  exclusions: string[];
  steps: { title: string; copy: string }[];
  prepare: string;
  consultationTopic: string;
  href?: string;
  reviewStatus: ServiceReviewStatus;
  reviewNotes?: string;
};

const sharedDocuments = [
  'Business activity and operating location',
  'Applicant or business details to confirm during consultation',
  'Any existing registration or licence information, if applicable',
];

const makeService = (
  service: Pick<Service, 'slug' | 'title' | 'shortTitle' | 'category' | 'kicker' | 'proposition' | 'summary' | 'customerIntent' | 'informationToCollect' | 'documentChecklist' | 'nextStep' | 'relatedSlugs' | 'icon' | 'consultationTopic'>,
): Service => ({
  ...service,
  reviewStatus: 'needs-review' as const,
  included: ['Discuss your business context and intended service outcome', 'Organize the information to review for your circumstances', 'Prepare questions for a focused consultation'],
  exclusions: ['Definitive legal, tax or eligibility conclusions without verified facts', 'Guaranteed approval, registration, processing time or authority outcome', 'Submitting or storing identity documents through this site'],
  steps: [
    { title: 'Describe the context', copy: 'Share the activity, location and current registration position in plain language.' },
    { title: 'Review the questions', copy: 'Separate known information from items that need current official or professional verification.' },
    { title: 'Prepare the brief', copy: 'Keep the relevant information ready for your own review or an agreed next step.' },
  ],
  prepare: 'Bring a short activity description, operating location and the specific question you want to discuss. Do not send identity documents through this site.',
});

export const services: Service[] = [
  makeService({
    slug: 'gst-registration', shortTitle: 'GST registration', title: 'GST registration assistance',
    category: 'GST & Tax Compliance', kicker: 'GST & tax compliance / Registration assistance',
    proposition: 'Prepare a clearer brief for discussing GST registration and the information your business may need to review.',
    summary: 'We help organize the questions, business context and information for a considered GST registration discussion.',
    customerIntent: 'I want to understand the next step for GST registration.',
    informationToCollect: ['Nature of the business activity', 'Operating location and business structure', 'Current registration or tax context, if any'],
    documentChecklist: sharedDocuments, nextStep: 'Discuss your GST registration context before any application or submission.',
    relatedSlugs: ['gst-return-filing', 'udyam-msme', 'business-support'], icon: 'document', consultationTopic: 'GST registration assistance',
  }),
  makeService({
    slug: 'gst-return-filing', shortTitle: 'GST return filing', title: 'GST return filing & ongoing GST assistance',
    category: 'GST & Tax Compliance', kicker: 'GST & tax compliance / Ongoing assistance',
    proposition: 'Create a clearer starting brief for recurring GST return and documentation support.',
    summary: 'Discuss your current GST context, records and the kind of recurring assistance you need without assuming a filing outcome.',
    customerIntent: 'I need help understanding or organizing ongoing GST return work.',
    informationToCollect: ['Current GST registration context', 'Nature and volume of business transactions', 'Existing records or prior return workflow'],
    documentChecklist: ['GST registration details, if available', 'Sales and purchase records to discuss', 'Existing return or reconciliation information, if available'],
    nextStep: 'Share the recurring workflow you want reviewed and agree the scope before any filing work.',
    relatedSlugs: ['gst-registration', 'business-support', 'trade-license'], icon: 'calculator', consultationTopic: 'GST return filing and ongoing compliance assistance',
  }),
  makeService({
    slug: 'fssai', shortTitle: 'FSSAI assistance', title: 'Food business registration & licensing assistance',
    category: 'Food & FSSAI', kicker: 'Food & FSSAI / Registration and licensing assistance',
    proposition: 'Understand the route for your food business, with a clearer brief for the next step.',
    summary: 'Food business registration and licensing can feel difficult to place. We help you review the relevant route, organize information and prepare for a considered discussion.',
    customerIntent: 'I run or plan a food activity and want help understanding the registration or licence pathway.',
    informationToCollect: ['Food activity and products or services', 'Operating location and premises context', 'Current registration or licence information, if any'],
    documentChecklist: ['Food business and premises details', 'Applicant or entity details to confirm during consultation', 'Existing food registration or licence information, if applicable'],
    nextStep: 'Discuss the food activity and the route that needs verification; no approval is promised.',
    relatedSlugs: ['gst-registration', 'trade-license', 'business-support'], icon: 'shield', consultationTopic: 'FSSAI registration and licensing assistance',
  }),
  makeService({
    slug: 'trade-license', shortTitle: 'Trade licence assistance', title: 'Trade licence assistance',
    category: 'Licences & Registrations', kicker: 'Licences & registrations / Trade licence',
    proposition: 'Organize the basic context for discussing a local trade licence or related municipal requirement.',
    summary: 'We help you prepare a neutral brief about your activity and premises for a route that must be checked against the relevant authority.',
    customerIntent: 'I want to understand whether a trade licence conversation is relevant to my business.',
    informationToCollect: ['Business activity and premises use', 'Operating location and local authority context', 'Existing permissions or registrations, if any'],
    documentChecklist: sharedDocuments, nextStep: 'Confirm the relevant local route and scope during a consultation before any submission.',
    relatedSlugs: ['fssai', 'udyam-msme', 'gst-registration'], icon: 'shield', consultationTopic: 'trade licence assistance',
  }),
  makeService({
    slug: 'udyam-msme', shortTitle: 'Udyam / MSME registration', title: 'Udyam / MSME registration assistance',
    category: 'Licences & Registrations', kicker: 'Registrations / Udyam and MSME',
    proposition: 'Prepare the business context and information needed to discuss an Udyam or MSME registration route.',
    summary: 'We help organize a registration brief while keeping eligibility and official outcomes for verified review.',
    customerIntent: 'I want help understanding the Udyam or MSME registration process for my business.',
    informationToCollect: ['Business structure and activity', 'Owner or entity details to confirm privately', 'Existing registration context, if any'],
    documentChecklist: ['Business and applicant details to confirm during consultation', 'Existing registration records, if available', 'Information requested by the verified official process'],
    nextStep: 'Discuss the business context and confirm the current official information before proceeding.',
    relatedSlugs: ['gst-registration', 'proprietorship-registration', 'business-support'], icon: 'document', consultationTopic: 'Udyam or MSME registration assistance',
  }),
  ...(['proprietorship', 'partnership', 'llp', 'company'] as const).map((kind) => makeService({
    slug: `${kind}-registration`,
    shortTitle: `${kind[0].toUpperCase()}${kind.slice(1)} registration`,
    title: `${kind[0].toUpperCase()}${kind.slice(1)} registration assistance`,
    category: 'Start / Register a Business',
    kicker: `Start / register a business / ${kind[0].toUpperCase()}${kind.slice(1)}`,
    proposition: `Organize the activity, ownership and documentation questions for a ${kind} registration discussion.`,
    summary: `We help prepare a neutral brief for a ${kind} registration route without making legal or authority determinations.`,
    customerIntent: `We are considering a ${kind} and want help preparing the registration conversation.`,
    informationToCollect: ['Proposed business activity and operating location', 'Ownership, partner or director outline', 'Existing registration context, if any'],
    documentChecklist: ['Business and participant details to confirm privately', 'Existing records, if available', 'Official-process requirements to verify before any filing'],
    nextStep: 'Discuss the proposed structure and verify current official information before proceeding.',
    relatedSlugs: ['gst-registration', 'udyam-msme', 'business-support'],
    icon: 'briefcase',
    consultationTopic: `${kind} registration assistance`,
  })),
  makeService({
    slug: 'business-support', shortTitle: 'Business support', title: 'Practical business support for the next decision',
    category: 'Ongoing Compliance', kicker: 'Ongoing compliance / Business support',
    proposition: 'Make space for a useful conversation when the next registration, licence or compliance step feels hard to organize.',
    summary: 'We help sort the questions, priorities and practical actions that need attention next.',
    customerIntent: 'I have a registration, licence or compliance question and need help organizing the next step.',
    informationToCollect: ['The business question and current context', 'Relevant registrations or licences, if known', 'Decisions or workflows you are tracking'],
    documentChecklist: ['A plain-language question or workflow note', 'Existing records or references to discuss', 'Any official correspondence to review privately, if applicable'],
    nextStep: 'Bring the question for a focused review; scope and any specialist referral are agreed separately.',
    relatedSlugs: ['gst-return-filing', 'gst-registration', 'trade-license'], icon: 'briefcase', consultationTopic: 'business support',
  }),
  makeService({
    slug: 'web-development', shortTitle: 'Web development', title: 'Web development for a clearer digital home',
    category: 'Digital Services', kicker: 'Digital services / Web development',
    proposition: 'Give your business a useful, distinctive place to be found and understood online.',
    summary: 'A website should make your offer clear and help people take the next step.',
    customerIntent: 'I need a website after my business foundations and customer journey are clear.',
    informationToCollect: ['Business purpose and audience', 'Pages, content and website needs', 'Existing brand or digital materials'],
    documentChecklist: ['Business description and content references', 'Brand assets, if available', 'Examples of useful websites or features'],
    nextStep: 'Use the Digital Studio brief to describe the website need before discussing scope.',
    relatedSlugs: ['business-support'], icon: 'website', consultationTopic: 'a website project',
  }),
  makeService({
    slug: 'app-development', shortTitle: 'App development', title: 'App development shaped around how work happens',
    category: 'Digital Services', kicker: 'Digital services / App development',
    proposition: 'Turn a useful idea into a focused mobile or web experience people can actually use.',
    summary: 'Good app work starts with the people using it and the job it needs to make easier.',
    customerIntent: 'I need a digital product after the underlying business need is clear.',
    informationToCollect: ['Users and primary job to be done', 'Platform and feature priorities', 'Existing sketches, feedback or workflows'],
    documentChecklist: ['Problem and user notes', 'Existing product references or sketches', 'Content or workflow material, if available'],
    nextStep: 'Prepare a focused Digital Studio brief before discussing a build scope.',
    relatedSlugs: ['business-support'], icon: 'phone', consultationTopic: 'an app project',
  }),
  makeService({
    slug: 'digital-marketing', shortTitle: 'Digital marketing', title: 'Digital marketing with a useful point of view',
    category: 'Digital Services', kicker: 'Digital services / Digital marketing',
    proposition: 'Connect your business with the right people through thoughtful, measurable next steps.',
    summary: 'Digital marketing works best when the offer, audience and desired action are clear.',
    customerIntent: 'I need marketing support after my offer, audience and business foundations are clear.',
    informationToCollect: ['Business offer and audience', 'Current channels and content', 'The business goal to support'],
    documentChecklist: ['Existing channel links or campaign notes', 'Brand and offer references', 'Any available performance information to discuss'],
    nextStep: 'Clarify the offer and audience before discussing a marketing scope.',
    relatedSlugs: ['business-support', 'web-development'], icon: 'growth', consultationTopic: 'digital marketing for your business',
  }),
];

export const gstService = {
  slug: 'gst', shortTitle: 'GST & compliance', title: 'GST registration & compliance',
  category: 'GST & Tax Compliance' as const, kicker: 'Business foundations / GST assistance',
  proposition: 'Start with clarity around GST registration, documentation and compliance.',
  summary: 'Understand the next questions, prepare relevant information and discuss the right next step.',
  customerIntent: 'I want to discuss GST registration and compliance assistance.',
  informationToCollect: ['Business activity and operating context'],
  documentChecklist: sharedDocuments,
  nextStep: 'Open the existing GST service page for the current overview.',
  relatedSlugs: ['gst-registration', 'gst-return-filing'], icon: 'document' as const, href: '/services/gst',
  reviewStatus: 'needs-review' as const,
};

export const allServices = [...services, gstService] as const;

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getServicesByCategory(category: ServiceCategory) {
  return allServices.filter((service) => service.category === category);
}
