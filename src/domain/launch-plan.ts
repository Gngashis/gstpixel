export const activities = ['food', 'retail', 'professional-services', 'digital', 'other'] as const;
export const stages = ['idea', 'starting', 'operating'] as const;
export const founderChoices = ['solo', 'multiple', 'unsure'] as const;
export const digitalChoices = ['website', 'app', 'marketing', 'not-sure'] as const;
export type Activity = typeof activities[number];
export type Stage = typeof stages[number];
export type FounderChoice = typeof founderChoices[number];
export type DigitalNeed = typeof digitalChoices[number];
export type LaunchAnswers = { activity: Activity; stage: Stage; location: string; founders: FounderChoice; digitalNeeds: DigitalNeed[] };
export type PlanItem = { title: string; detail: string; href?: string; label?: string };
export type LaunchPlan = { title: string; intro: string; items: PlanItem[]; preparation: string[]; note: string };

export function buildLaunchPlan(answers: LaunchAnswers): LaunchPlan {
  const items: PlanItem[] = [];
  if (answers.stage === 'idea') items.push({ title: 'Shape the first operating brief', detail: 'Turn the idea into a clear activity description, audience and first operating assumptions.' });
  if (answers.stage === 'starting') items.push({ title: 'Prepare the launch sequence', detail: 'Order the reviews, setup decisions and customer-facing work around your intended opening.' });
  if (answers.stage === 'operating') items.push({ title: 'Review the current setup', detail: 'Use your existing activity and records to identify the next practical improvement.' });
  if (answers.founders === 'multiple') items.push({ title: 'Review the ownership structure', detail: 'Compare suitable business structure options for multiple founders with a qualified adviser.' });
  items.push({ title: 'Review GST applicability', detail: 'Discuss how GST rules may relate to your activity, stage and operating context. This is a review step, not a definitive determination.', href: '/services/gst', label: 'Explore GST assistance' });
  if (answers.activity === 'food') items.push({ title: 'Review food business requirements', detail: 'Discuss whether an FSSAI review is relevant to the food activity you described.', href: '/services/fssai', label: 'Explore FSSAI assistance' });
  if (answers.digitalNeeds.includes('website')) items.push({ title: 'Scope a website', detail: 'Clarify the audience, pages, content and next action your website should support.', href: '/services/web-development', label: 'Explore web development' });
  if (answers.digitalNeeds.includes('app')) items.push({ title: 'Scope an app', detail: 'Map the users, core workflow and smallest useful first release before estimating a build.', href: '/services/app-development', label: 'Explore app development' });
  if (answers.digitalNeeds.includes('marketing')) items.push({ title: 'Plan digital visibility', detail: 'Choose a practical starting mix of content, search and campaign activity for your audience.', href: '/services/digital-marketing', label: 'Explore digital marketing' });
  return { title: 'A considered next path', intro: 'Your answers point to a short sequence for discussion. Each item is a review step; applicability depends on your full circumstances.', items, preparation: ['A plain-language description of your activity', 'Your operating location or locations', 'How ownership is intended to work'], note: 'Costs and timelines: discuss after the scope review. No ID upload is needed for this planner.' };
}
