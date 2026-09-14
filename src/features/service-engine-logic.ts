export type RegistrationAnswers = {
  activity?: string;
  supply?: string;
  turnover?: string;
  structure?: string;
  clarification?: string;
  readiness?: 'ready' | 'help';
};

export type RegistrationBrief = {
  answers: { label: string; value: string }[];
  uncertain: string[];
  nextSteps: string[];
  reviewItems: string[];
};

export function buildRegistrationBrief(answers: RegistrationAnswers): RegistrationBrief {
  const fields = [
    ['Primary business activity', answers.activity],
    ['Customer supply footprint', answers.supply],
    ['Approximate annual turnover range', answers.turnover],
    ['Current business structure', answers.structure],
    ['Clarification', answers.clarification],
  ] as const;
  const labels = fields.map(([label, value]) => ({ label, value: value || 'Not answered' }));
  const uncertain: string[] = labels.filter(({ value }) => /not sure|not answered|need help/i.test(value)).map(({ label }) => label);
  if (answers.readiness === 'help') uncertain.push('Document readiness');
  return {
    answers: labels,
    uncertain,
    nextSteps: [
      'Review the answers and confirm the business context.',
      'Verify the applicable GST registration requirement before filing.',
      answers.readiness === 'help' ? 'Discuss the readiness checklist and what may need to be prepared.' : 'Keep the readiness checklist available for professional review.',
    ],
    reviewItems: [
      'Thresholds, notifications, exemptions and compulsory-registration exceptions may affect the requirement.',
      'A professional review is required before any filing or conclusion.',
      'This brief does not submit an application or guarantee an outcome.',
    ],
  };
}
