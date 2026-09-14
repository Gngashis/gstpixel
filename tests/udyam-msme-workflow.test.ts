import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUdyamMsmeBrief } from '@/features/udyam-msme-logic';

test('Udyam/MSME brief preserves broad inputs and flags uncertainty and readiness', () => {
  const brief = buildUdyamMsmeBrief({
    legalStructure: 'Not sure',
    panAvailability: 'Available',
    gstStatus: 'Needs review',
    primaryActivity: 'Providing design services',
    turnoverEstimate: 'Not answered',
    investmentEstimate: 'Approximate amount available',
    clarification: 'Need help reviewing the route',
    readiness: 'help',
  });

  assert.equal(brief.answers[3].value, 'Providing design services');
  assert.deepEqual(brief.uncertain, [
    'Current legal structure',
    'GST registration status',
    'Approximate turnover context',
    'Clarification requested',
    'Information readiness',
  ]);
  assert.ok(brief.nextSteps.some((step) => step.includes('do not enter identity numbers')));
});

test('Udyam/MSME brief defers classification, GST applicability and benefits', () => {
  const brief = buildUdyamMsmeBrief({
    legalStructure: 'Proprietorship',
    panAvailability: 'Available for review',
    gstStatus: 'Registered',
    primaryActivity: 'Manufacturing',
    turnoverEstimate: 'Approximate band supplied',
    investmentEstimate: 'Approximate band supplied',
    clarification: 'Review the current registration route',
    readiness: 'ready',
  });
  const review = brief.reviewItems.join(' ');

  assert.deepEqual(brief.uncertain, []);
  assert.match(review, /does not classify.*Micro, Small or Medium.*approximate inputs/i);
  assert.match(review, /GST applicability.*NIC mapping.*authoritative review/i);
  assert.match(review, /Benefits, eligibility and government outcomes are not determined or promised/i);
  assert.ok(brief.nextSteps.some((step) => /verify the current registration route/i.test(step)));
});
