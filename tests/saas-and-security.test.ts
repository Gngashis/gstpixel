import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { sanitizeLogOutput, validatePayloadSafety } from '../src/domain/security/token-guard';
import { SAAS_PLANS, calculateTaxForPlan, GST_RATE_ON_SOFTWARE } from '../src/domain/saas/plans';
import { authService, DEMO_USERS } from '../src/domain/saas/auth-service';
import { invoiceStorageRepository } from '../src/domain/saas/storage-repository';
import { razorpayBillingService, RazorpayBillingService } from '../src/domain/billing/razorpay-service';

test('Security Token Guard redacts API keys and secrets from output', () => {
  const sensitiveText =
    'Error connecting with key sk-or-v1-abcdef0123456789abcdef0123456789 and Llama llx-9876543210fedcba9876543210fedcba and rzp_test_1234567890abcd';
  const sanitized = sanitizeLogOutput(sensitiveText);

  assert.equal(sanitized.includes('sk-or-v1-'), false);
  assert.equal(sanitized.includes('llx-'), false);
  assert.equal(sanitized.includes('rzp_test_'), false);
  assert.equal(sanitized.includes('[REDACTED_CREDENTIAL]'), true);
});

test('Security Token Guard rejects payloads exceeding safety boundaries', () => {
  const smallPayload = '{"invoice": "INV-001"}';
  assert.equal(validatePayloadSafety(smallPayload).safe, true);

  const oversizedPayload = 'x'.repeat(105 * 1024); // 105 KB
  const result = validatePayloadSafety(oversizedPayload, 100 * 1024);
  assert.equal(result.safe, false);
  assert.match(result.error || '', /exceeds safety threshold/);
});

test('SaaS Plans define authoritative Indian pricing and 18% GST calculation', () => {
  assert.equal(SAAS_PLANS.community.monthlyPriceInr, 0);
  assert.equal(SAAS_PLANS.community.invoiceLimitPerMonth, 5);

  assert.equal(SAAS_PLANS.starter.monthlyPriceInr, 499);
  assert.equal(SAAS_PLANS.starter.annualPriceInr, 4990); // 2 months free
  assert.equal(SAAS_PLANS.starter.invoiceLimitPerMonth, 100);

  assert.equal(SAAS_PLANS.pro.monthlyPriceInr, 1499);
  assert.equal(SAAS_PLANS.pro.invoiceLimitPerMonth, 500);

  assert.equal(SAAS_PLANS.enterprise.monthlyPriceInr, 3999);
  assert.equal(SAAS_PLANS.enterprise.invoiceLimitPerMonth, 2500);

  // 18% GST calculation check
  const taxStarter = calculateTaxForPlan(499);
  assert.equal(taxStarter.basePrice, 499);
  assert.equal(taxStarter.gstAmount, 89.82); // 499 * 0.18 = 89.82
  assert.equal(taxStarter.totalWithGst, 588.82);
});

test('Customer Account Auth Service tracks quotas and enforces monthly limits', () => {
  authService.loginAsDemoUser('community_user');
  const user = authService.getCurrentUser();
  assert.equal(user.tier, 'community');
  assert.equal(user.quota.monthlyLimit, 5);

  // Reset quota for testing
  authService.resetQuotaForTest();
  assert.equal(authService.getCurrentUser().quota.usedThisMonth, 0);

  // Use 5 audits
  for (let i = 0; i < 5; i++) {
    const res = authService.recordInvoiceAuditUsage();
    assert.equal(res.success, true);
  }

  assert.equal(authService.getCurrentUser().quota.usedThisMonth, 5);

  // 6th audit must be rejected
  const sixth = authService.recordInvoiceAuditUsage();
  assert.equal(sixth.success, false);
  assert.match(sixth.error || '', /Monthly quota of 5 audits reached/);

  // Upgrade to Starter and verify limit expansion
  authService.upgradeTier('starter', 'monthly');
  assert.equal(authService.getCurrentUser().tier, 'starter');
  assert.equal(authService.getCurrentUser().quota.monthlyLimit, 100);

  // Next audit now succeeds
  const seventh = authService.recordInvoiceAuditUsage();
  assert.equal(seventh.success, true);
  assert.equal(authService.getCurrentUser().quota.usedThisMonth, 6);
});

test('Invoice Storage Repository supports add, search, filter, and delete operations', () => {
  invoiceStorageRepository.resetToSample();
  const initial = invoiceStorageRepository.getAllInvoices();
  assert.equal(initial.length >= 2, true);

  // Add new invoice
  const added = invoiceStorageRepository.addInvoice({
    userId: 'usr_test_99',
    invoiceNumber: 'INV-TEST-999',
    invoiceDate: '15-11-2026',
    supplierGstin: '27AAPFU0939F1ZV',
    supplierName: 'Test Vendor Solutions',
    taxableAmount: 15000,
    taxAmount: 2700,
    grandTotal: 17700,
    auditStatus: 'COMPLIANT',
    issuesCount: 0,
    issues: [],
    rawTextSnippet: 'Sample snippet',
  });

  assert.equal(added.invoiceNumber, 'INV-TEST-999');

  // Search by invoice number
  const searchResult = invoiceStorageRepository.getFilteredInvoices({ searchQuery: '999' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].invoiceNumber, 'INV-TEST-999');

  // Filter by status
  const compliantOnly = invoiceStorageRepository.getFilteredInvoices({ status: 'COMPLIANT' });
  assert.equal(compliantOnly.every((i) => i.auditStatus === 'COMPLIANT'), true);

  // Delete invoice
  const deleted = invoiceStorageRepository.deleteInvoice(added.id);
  assert.equal(deleted, true);

  const afterDelete = invoiceStorageRepository.getFilteredInvoices({ searchQuery: '999' });
  assert.equal(afterDelete.length, 0);
});

test('Razorpay Billing Service enforces staging mode and prepares accurate order values', async () => {
  // STRICT SAFETY INVARIANT: Live billing must be disabled
  assert.equal(RazorpayBillingService.IS_LIVE_BILLING_ACTIVE, false);

  const customer = {
    name: 'Ashis Gurung',
    email: 'ashis@gstpixel.com',
    contact: '9046520548',
    businessName: 'GSTPIXEL',
    gstin: '19AAACS8577K1ZM',
  };

  const starterOrder = razorpayBillingService.prepareSubscriptionOrder('starter', 'monthly', customer);
  assert.equal(starterOrder.amountInr, 588.82); // 499 + 18% GST
  assert.equal(starterOrder.amountPaise, 58882); // in paise
  assert.equal(starterOrder.planId, 'plan_gstpixel_starter_499m');

  // Launch simulated checkout
  const checkoutRes = await razorpayBillingService.launchCheckout('starter', 'monthly', customer);
  assert.equal(checkoutRes.success, true);
  assert.equal(checkoutRes.isSimulated, true);
  assert.match(checkoutRes.subscriptionId || '', /sub_sim_plan_gstpixel_starter/);
});
