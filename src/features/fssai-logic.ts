export type FssaiAnswers = {
  foodBusiness?: string;
  location?: string;
  footprint?: string;
  turnover?: string;
  entity?: string;
  currentLicence?: string;
  readiness?: 'ready' | 'help';
};

export type FssaiBrief = {
  answers: { label: string; value: string }[];
  uncertain: string[];
  structures: string[];
  nextSteps: string[];
  reviewItems: string[];
};

export function buildFssaiBrief(answers: FssaiAnswers): FssaiBrief {
  const fields = [
    ['Nature of food business', answers.foodBusiness],
    ['Operating location / state', answers.location],
    ['Operating footprint', answers.footprint],
    ['Approximate annual turnover band', answers.turnover],
    ['Current business or entity status', answers.entity],
    ['Existing FSSAI registration or licence', answers.currentLicence],
  ] as const;
  const normalized = fields.map(([label, value]) => ({ label, value: value || 'Not answered' }));
  const uncertain: string[] = normalized.filter(({ value }) => /not sure|not answered|need help|not started/i.test(value)).map(({ label }) => label);
  if (answers.readiness === 'help') uncertain.push('Document readiness');
  return {
    answers: normalized,
    uncertain,
    structures: ['Discuss the applicable licence classification and eligibility with a qualified reviewer; this brief does not determine either.'],
    nextSteps: [
      'Review the food activity, location and existing registration context.',
      'Verify the applicable classification, authority route and current requirements before proceeding.',
      answers.readiness === 'help' ? 'Discuss the readiness checklist and what may need to be prepared.' : 'Keep the readiness checklist available for professional review.',
    ],
    reviewItems: [
      'Licence classification, eligibility and jurisdiction require professional or regulatory review.',
      'Turnover, activity, premises and operating footprint must be considered together; no single answer determines an outcome.',
      'This brief does not submit an application or guarantee approval, fees or processing time.',
    ],
  };
}
