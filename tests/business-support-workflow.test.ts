import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBusinessSupportBrief } from '@/features/business-support-logic';

test('business support brief organizes context and flags uncertainty', () => {
  const brief = buildBusinessSupportBrief({ businessStage: 'Already operating', supportArea: 'Several areas / not sure', currentRegistrations: "I'm not sure", recordReadiness: 'Need help organizing', recurringContext: 'Not sure yet', preferredNextStep: 'Help deciding where to start', clarification: 'Everything / not sure', readiness: 'help' });
  assert.ok(brief.uncertain.includes('Primary support area'));
  assert.ok(brief.uncertain.includes('Current registration context'));
  assert.ok(brief.uncertain.includes('Information readiness'));
});

test('business support brief defers obligations and service commitments', () => {
  const brief = buildBusinessSupportBrief({ businessStage: 'Recently started', supportArea: 'GST or filing organization', currentRegistrations: 'Current details are available', recordReadiness: 'Organized and available', recurringContext: 'Regular check-ins', preferredNextStep: 'A focused consultation', clarification: 'What information to prepare', readiness: 'ready' });
  assert.ok(brief.reviewItems.some((item) => item.includes('obligations')));
  assert.ok(brief.reviewItems.some((item) => item.includes('fees and timing')));
  assert.ok(brief.reviewItems.some((item) => item.includes('does not submit filings')));
});
