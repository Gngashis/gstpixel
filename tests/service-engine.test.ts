import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegistrationBrief } from '@/features/service-engine-logic';

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
