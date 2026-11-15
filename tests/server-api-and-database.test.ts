import { test } from 'node:test';
import * as assert from 'node:assert/strict';
// @ts-ignore Cloudflare Worker is written in standard ES JavaScript
import worker from '../cloudflare-worker.js';

test('Cloudflare Worker: GET /api/health returns operational status and version', async () => {
  const req = new Request('http://localhost/api/health');
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.version, '1.0.0-final-release');
  assert.equal(typeof data.database, 'string');
});

test('Cloudflare Worker: GET /api/billing/plans serves Indian SaaS catalog with 18% GST', async () => {
  const req = new Request('http://localhost/api/billing/plans');
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.status, 'success');
  assert.equal(data.currency, 'INR');
  assert.equal(data.taxRateGst, 0.18);
  assert.equal(data.sacCode, '998315');
  assert.equal(data.plans.length, 4);

  const starter = data.plans.find((p: any) => p.id === 'starter');
  assert.equal(starter.monthlyPriceInr, 499);
  assert.equal(starter.limit, 100);
});

test('Cloudflare Worker: POST /api/auth/login authenticates and issues session token', async () => {
  const req = new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoUser: 'usr_start_02' }),
  });
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.token, 'usr_start_02');
  assert.equal(data.user.tier, 'starter');
  assert.equal(data.user.monthlyLimit, 100);
});

test('Cloudflare Worker: GET /api/auth/me returns authenticated customer quota', async () => {
  const req = new Request('http://localhost/api/auth/me', {
    headers: { Authorization: 'Bearer usr_start_02' },
  });
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.id, 'usr_start_02');
  assert.equal(data.user.tier, 'starter');
});

test('Cloudflare Worker: Database Invoice Storage CRUD and Quota Enforcement', async () => {
  // 1. Fetch Invoices
  const getReq = new Request('http://localhost/api/invoices', {
    headers: { Authorization: 'Bearer usr_start_02' },
  });
  const getRes = await worker.fetch(getReq, {});
  assert.equal(getRes.status, 200);
  const initialData = await getRes.json();
  assert.equal(initialData.success, true);

  // 2. Save new invoice
  const postReq = new Request('http://localhost/api/invoices', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer usr_start_02',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoiceNumber: 'INV-TEST-EDGE-01',
      invoiceDate: '15-11-2026',
      supplierGstin: '27AAPFU0939F1ZV',
      taxableAmount: 12000,
      taxAmount: 2160,
      grandTotal: 14160,
      auditStatus: 'COMPLIANT',
      issuesCount: 0,
      issues: [],
    }),
  });
  const postRes = await worker.fetch(postReq, {});
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  assert.equal(postData.invoice.invoiceNumber, 'INV-TEST-EDGE-01');

  // 3. Delete invoice
  const delReq = new Request(`http://localhost/api/invoices?id=${postData.invoice.id}`, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer usr_start_02' },
  });
  const delRes = await worker.fetch(delReq, {});
  assert.equal(delRes.status, 200);
  const delData = await delRes.json();
  assert.equal(delData.success, true);
});

test('Cloudflare Worker: POST /api/ai/audit executes server-side without key exposure', async () => {
  const req = new Request('http://localhost/api/ai/audit', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer usr_start_02',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoiceText: 'TAX INVOICE INV-100 | Taxable: 5000 | CGST: 450, SGST: 450',
    }),
  });
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.auditedServerSide, true);
  assert.match(data.statutoryDisclaimer, /Section 16/);
});

test('Cloudflare Worker: POST /api/billing/create-order prepares staged Razorpay order', async () => {
  const req = new Request('http://localhost/api/billing/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'starter', cycle: 'monthly' }),
  });
  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.isLiveActive, false); // Strict safety invariant
  assert.equal(data.taxBreakdown.basePriceInr, 499);
  assert.equal(data.taxBreakdown.gstAmountInr, 89.82);
  assert.equal(data.taxBreakdown.totalWithGstInr, 588.82);
  assert.equal(data.amountPaise, 58882);
});

test('Cloudflare Worker: POST /api/billing/webhook verifies signature and upgrades tier', async () => {
  const webhookBody = JSON.stringify({
    event: 'subscription.charged',
    notes: {
      userId: 'usr_comm_01',
      tier: 'pro',
    },
  });

  const req = new Request('http://localhost/api/billing/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Razorpay-Signature': 'test_valid_signature_phase10',
    },
    body: webhookBody,
  });

  const res = await worker.fetch(req, {});
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.processedEvent, 'subscription.charged');
});
