export type BusinessSupportAnswers = {
  businessStage?: string;
  supportArea?: string;
  currentRegistrations?: string;
  recordReadiness?: string;
  recurringContext?: string;
  preferredNextStep?: string;
  clarification?: string;
  readiness?: 'ready' | 'help';
};

export type BusinessSupportBrief = {
  answers: { label: string; value: string }[];
  uncertain: string[];
  nextSteps: string[];
  reviewItems: string[];
};

export function buildBusinessSupportBrief(answers: BusinessSupportAnswers): BusinessSupportBrief {
  const fields = [
    ['Business stage', answers.businessStage],
    ['Primary support area', answers.supportArea],
    ['Current registration context', answers.currentRegistrations],
    ['Record readiness', answers.recordReadiness],
    ['Recurring support context', answers.recurringContext],
    ['Preferred next step', answers.preferredNextStep],
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
      'Review the current business stage and the support area described.',
      'Identify which questions need verified compliance, registration or operational review.',
      'Agree a practical next conversation without treating this brief as a filing or service commitment.',
    ],
    reviewItems: [
      'Applicable obligations, filing responsibilities and deadlines require current professional or regulatory review.',
      'Service scope, fees and timing are confirmed individually before work begins.',
      'This brief does not submit filings, monitor government systems or confirm compliance status.',
    ],
  };
}
