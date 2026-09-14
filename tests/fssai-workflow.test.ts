import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFssaiBrief } from '@/features/fssai-logic';

test('FSSAI brief keeps intake factual and flags uncertain answers', () => {
  const brief = buildFssaiBrief({ foodBusiness: 'I’m not sure', footprint: 'Single premises', turnover: 'Above a higher band', currentLicence: 'Not sure', readiness: 'help' });
  assert.ok(brief.uncertain.includes('Nature of food business'));
  assert.ok(brief.uncertain.includes('Operating location / state'));
  assert.ok(brief.uncertain.includes('Existing FSSAI registration or licence'));
  assert.ok(brief.uncertain.includes('Document readiness'));
  assert.ok(brief.reviewItems.some((item) => item.includes('classification')));
});

test('FSSAI brief never determines classification from turnover', () => {
  const brief = buildFssaiBrief({ foodBusiness: 'Manufacturing or processing', location: 'One state / location', footprint: 'Single premises', turnover: 'Above a higher band', entity: 'An entity already exists', currentLicence: 'No, not yet', readiness: 'ready' });
  assert.ok(brief.structures[0].toLowerCase().includes('does not determine'));
  assert.ok(brief.reviewItems.some((item) => item.includes('no single answer determines')));
  assert.ok(brief.reviewItems.some((item) => item.includes('does not submit')));
});
