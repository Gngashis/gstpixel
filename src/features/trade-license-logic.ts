export type TradeLicenceAnswers = {
  primaryActivity?: string;
  premisesUse?: string;
  operatingLocation?: string;
  premisesStatus?: string;
  existingPermissions?: string;
  businessContext?: string;
  clarification?: string;
  readiness?: 'ready' | 'help';
};

export type TradeLicenceBrief = {
  answers: { label: string; value: string }[];
  uncertain: string[];
  nextSteps: string[];
  reviewItems: string[];
};

export function buildTradeLicenceBrief(answers: TradeLicenceAnswers): TradeLicenceBrief {
  const fields = [
    ['Primary business activity', answers.primaryActivity],
    ['How the premises will be used', answers.premisesUse],
    ['Operating location', answers.operatingLocation],
    ['Premises status', answers.premisesStatus],
    ['Existing registrations or permissions', answers.existingPermissions],
    ['Business context', answers.businessContext],
    ['Clarification requested', answers.clarification],
  ] as const;
  const normalized = fields.map(([label, value]) => ({ label, value: value || 'Not answered' }));
  const uncertain: string[] = normalized
    .filter(({ value }) => /not sure|not answered|need help|needs review/i.test(value))
    .map(({ label }) => label);
  if (answers.readiness === 'help') uncertain.push('Information readiness');

  return {
    answers: normalized,
    uncertain,
    nextSteps: [
      'Review the activity, premises and operating-location context.',
      'Confirm whether any local permission applies and identify the relevant authority through professional or regulatory review.',
      answers.readiness === 'help'
        ? 'Discuss which current records may help the review; do not upload sensitive documents here.'
        : 'Keep the available business and premises information ready for professional review.',
    ],
    reviewItems: [
      'Licence need, jurisdiction, authority, eligibility and exemptions depend on verified local requirements.',
      'Fees, deadlines, renewal rules, penalties, processing time and document requirements are not determined by this brief.',
      'This brief organizes context only. It does not submit an application or predict approval.',
    ],
  };
}
