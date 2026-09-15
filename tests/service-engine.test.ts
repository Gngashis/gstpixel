import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGstReturnFilingBrief, buildRegistrationBrief } from '@/features/service-engine-logic';
import { buildFormationBrief } from '@/features/company-registration-logic';

test('registration brief preserves answers and flags uncertainty without legal conclusions', () => {
  const brief = buildRegistrationBrief({ activity: "I'm not sure", supply: 'Across state borders', turnover: 'Above ₹50 lakh', structure: 'Not registered / not sure', readiness: 'help' });
  assert.equal(brief.answers[0].value, "I'm not sure");
  assert.ok(brief.uncertain.includes('Primary business activity'));
  assert.ok(brief.uncertain.includes('Current business structure'));
  assert.ok(brief.uncertain.includes('Document readiness'));
  assert.ok(brief.reviewItems.some((item) => item.includes('exceptions')));
  assert.ok(brief.reviewItems.every((item) => !/required|eligible|guaranteed/i.test(item) || item.includes('required')));
});

test('registration brief offers professional review as the next step', () => {
  const brief = buildRegistrationBrief({ activity: 'Providing services', supply: 'Primarily within one state', turnover: 'Below ₹20 lakh', structure: 'Proprietorship', readiness: 'ready' });
  assert.deepEqual(brief.uncertain, ['Clarification']);
  assert.ok(brief.nextSteps.some((step) => step.includes('Verify')));
  assert.ok(brief.reviewItems.some((item) => item.toLowerCase().includes('professional review')));
});

test('formation brief stays factual and defers structure decisions', () => {
  const brief = buildFormationBrief({ founders: 'Two or more', activity: 'Providing services', investment: 'Possibly', name: 'I have a name to discuss', location: 'One state / location', existingEntity: 'No, this is new', readiness: 'help' });
  assert.equal(brief.uncertain[0], 'Document readiness');
  assert.ok(brief.structures[0].includes('capital plan'));
  assert.ok(brief.reviewItems.some((item) => item.includes('Name availability')));
  assert.ok(brief.reviewItems.some((item) => item.includes('does not reserve a name')));
});

test('GST return filing brief keeps the user-stated Nil expectation as review context', () => {
  const brief = buildGstReturnFilingBrief({ filingPeriod: 'A recent quarter', frequency: 'Quarterly', businessActivity: 'Selling goods', salesType: 'A mix of both', purchaseRecords: 'Partly organized', salesRecords: 'Organized and available', nilReturnExpectation: 'I expect a Nil return', clarification: 'The filing position for this period' });
  assert.equal(brief.answers[6].value, 'I expect a Nil return');
  assert.ok(brief.reviewItems.some((item) => item.includes('not a filing conclusion')));
  assert.ok(brief.reviewItems.some((item) => item.includes('does not calculate tax')));
});

test('GST return filing brief flags missing records and defers filing conclusions', () => {
  const brief = buildGstReturnFilingBrief({ filingPeriod: 'Another period / not sure', frequency: "I'm not sure", purchaseRecords: 'Not ready', salesRecords: 'Partly organized', nilReturnExpectation: "I'm not sure", clarification: 'Everything / not sure' });
  assert.ok(brief.uncertain.includes('Filing period'));
  assert.ok(brief.uncertain.includes('User-stated Nil return expectation'));
  assert.ok(brief.reviewItems.some((item) => item.includes('deadlines')));
  assert.ok(brief.nextSteps.some((item) => item.includes('Verify')));
});
