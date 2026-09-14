export type UdyamMsmeAnswers = {
  legalStructure?: string;
  panAvailability?: string;
  gstStatus?: string;
  primaryActivity?: string;
  turnoverEstimate?: string;
  investmentEstimate?: string;
  clarification?: string;
  readiness?: 'ready' | 'help';
};

export type UdyamMsmeBrief = {
  answers: { label: string; value: string }[];
  uncertain: string[];
  nextSteps: string[];
  reviewItems: string[];
};

export function buildUdyamMsmeBrief(answers: UdyamMsmeAnswers): UdyamMsmeBrief {
  const fields = [
    ['Current legal structure', answers.legalStructure],
    ['PAN availability', answers.panAvailability],
    ['GST registration status', answers.gstStatus],
    ['Primary business activity', answers.primaryActivity],
    ['Approximate turnover context', answers.turnoverEstimate],
    ['Approximate investment context', answers.investmentEstimate],
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
      'Review the entity, activity and broad financial context supplied.',
      'Verify the current registration route, activity mapping and any entity-specific requirements before proceeding.',
      answers.readiness === 'help'
        ? 'Discuss which current records may help the review; do not enter identity numbers or upload documents here.'
        : 'Keep the available business information ready for professional review.',
    ],
    reviewItems: [
      'This brief does not classify the business as Micro, Small or Medium from approximate inputs.',
      'GST applicability, activity or NIC mapping, identity requirements and document rules require current authoritative review.',
      'Benefits, eligibility and government outcomes are not determined or promised by this brief.',
    ],
  };
}
