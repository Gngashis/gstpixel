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

export type GstReturnFilingAnswers = {
  filingPeriod?: string;
  frequency?: string;
  businessActivity?: string;
  salesType?: string;
  purchaseRecords?: string;
  salesRecords?: string;
  nilReturnExpectation?: string;
  clarification?: string;
};

export type GstReturnFilingBrief = RegistrationBrief;

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

export function buildGstReturnFilingBrief(answers: GstReturnFilingAnswers): GstReturnFilingBrief {
  const fields = [
    ['Filing period', answers.filingPeriod],
    ['User-stated filing frequency', answers.frequency],
    ['Primary business activity', answers.businessActivity],
    ['Main sales context', answers.salesType],
    ['Purchase-record readiness', answers.purchaseRecords],
    ['Sales-record readiness', answers.salesRecords],
    ['User-stated Nil return expectation', answers.nilReturnExpectation],
    ['Clarification requested', answers.clarification],
  ] as const;
  const normalized = fields.map(([label, value]) => ({ label, value: value || 'Not answered' }));
  const uncertain = normalized
    .filter(({ value }) => /not sure|not answered|need help|needs review/i.test(value))
    .map(({ label }) => label);

  return {
    answers: normalized,
    uncertain,
    nextSteps: [
      'Review the filing period and the sales and purchase records described.',
      'Verify the applicable return, filing position and current requirements before any filing action.',
      'Discuss missing or uncertain records during professional review.',
    ],
    reviewItems: [
      'A user-stated Nil return expectation is recorded as context and is not a filing conclusion.',
      'Eligibility, liability, deadlines, penalties and tax treatment require professional or regulatory review.',
      'This brief does not calculate tax, submit a return or confirm government acceptance.',
    ],
  };
}
