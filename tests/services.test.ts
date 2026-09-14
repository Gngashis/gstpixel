import test from 'node:test';
import assert from 'node:assert/strict';
import { allServices, getService, getServicesByCategory, serviceCategories } from '@/content/services';

test('compliance-first catalog has every primary category represented', () => {
  for (const category of serviceCategories) {
    assert.ok(getServicesByCategory(category).length > 0, `missing services for ${category}`);
  }
});

test('service slugs and related links are unique and resolvable', () => {
  const slugs = allServices.map((service) => service.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const service of allServices) {
    for (const relatedSlug of service.relatedSlugs) {
      assert.ok(allServices.some((related) => related.slug === relatedSlug), `${service.slug} links to missing ${relatedSlug}`);
    }
    assert.ok(service.customerIntent.length > 0);
    assert.ok(service.nextStep.length > 0);
    assert.ok(service.informationToCollect.length > 0);
    assert.ok(service.documentChecklist.length > 0);
  }
});

test('dynamic service routes exclude the separately rendered GST page', () => {
  assert.ok(getService('gst-registration'));
  assert.equal(getService('gst'), undefined);
});
