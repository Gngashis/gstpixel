export type FormationAnswers = {
  founders?: string;
  activity?: string;
  investment?: string;
  name?: string;
  location?: string;
  existingEntity?: string;
  readiness?: 'ready' | 'help';
};

export type FormationBrief = {
  answers: { label: string; value: string }[];
  uncertain: string[];
  structures: string[];
  nextSteps: string[];
  reviewItems: string[];
};

export function buildFormationBrief(answers: FormationAnswers): FormationBrief {
  const fields = [
    ['Founders / owners', answers.founders],
    ['Business activity', answers.activity],
    ['Possible external investment', answers.investment],
    ['Proposed business name', answers.name],
    ['Operating state / location', answers.location],
    ['Existing entity', answers.existingEntity],
  ] as const;
  const normalized = fields.map(([label, value]) => ({ label, value: value || 'Not answered' }));
  const uncertain: string[] = normalized.filter(({ value }) => /not sure|not answered|need help|none yet/i.test(value)).map(({ label }) => label);
  if (answers.readiness === 'help') uncertain.push('Document readiness');
  const structures = answers.investment === 'Yes' || answers.investment === 'Possibly'
    ? ['Discuss how the intended ownership and capital plan may affect structure options.']
    : ['Discuss proprietorship, partnership, LLP and company options against the actual business context.'];
  return {
    answers: normalized,
    uncertain,
    structures,
    nextSteps: [
      'Review the factual context and identify the structures that warrant professional discussion.',
      'Verify name availability, activity classification and current filing requirements before proceeding.',
      answers.readiness === 'help' ? 'Discuss the readiness checklist and what may need to be prepared.' : 'Keep the readiness checklist available for professional review.',
    ],
    reviewItems: [
      'Entity structure suitability, capital/share structure and director or partner requirements require professional review.',
      'Name availability, object/activity classification and filing requirements must be verified before any filing.',
      'This brief does not reserve a name, submit an application or guarantee incorporation.',
    ],
  };
}
