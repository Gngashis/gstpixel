import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTradeLicenceBrief } from '@/features/trade-license-logic';

test('trade licence brief preserves factual context and flags every uncertain area', () => {
  const brief = buildTradeLicenceBrief({
    primaryActivity: 'Not sure',
    premisesUse: 'Retail and storage',
    operatingLocation: 'Needs review',
    premisesStatus: 'Rented premises',
    existingPermissions: 'Not sure',
    businessContext: 'Existing business adding a location',
    clarification: 'Need help identifying what to review',
    readiness: 'help',
  });

  assert.equal(brief.answers[1].value, 'Retail and storage');
  assert.deepEqual(brief.uncertain, [
    'Primary business activity',
    'Operating location',
    'Existing registrations or permissions',
    'Clarification requested',
    'Information readiness',
  ]);
  assert.ok(brief.nextSteps.some((step) => step.includes('do not upload sensitive documents')));
});

test('trade licence brief defers legal requirement, authority, fees and outcomes', () => {
  const brief = buildTradeLicenceBrief({
    primaryActivity: 'Retail sale of household goods',
    premisesUse: 'Customer-facing shop',
    operatingLocation: 'One municipal area',
    premisesStatus: 'Owned premises',
    existingPermissions: 'Business registration available',
    businessContext: 'Existing business',
    clarification: 'Confirm the appropriate review path',
    readiness: 'ready',
  });
  const review = brief.reviewItems.join(' ');

  assert.deepEqual(brief.uncertain, []);
  assert.match(review, /licence need.*authority.*verified local requirements/i);
  assert.match(review, /fees.*deadlines.*renewal rules.*penalties.*not determined/i);
  assert.match(review, /does not submit.*or predict approval/i);
  assert.ok(brief.nextSteps.some((step) => /professional or regulatory review/i.test(step)));
});
