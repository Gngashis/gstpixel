import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { parseGstInvoiceFromMarkdown } from '../src/domain/ai/invoice-parser';
import { auditExtractedGstInvoice, validateGstinDetails } from '../src/domain/ai/gst-verification';
import { ExtractedGstInvoice } from '../src/domain/ai/types';

test('Invoice Auditor handles completely malformed document without crashing', () => {
  const noise = `
    Some random grocery list
    Apples, Oranges, Bananas
    No GSTIN, no taxes, no tables.
    Call mom at 555-1234
  `;

  const parsed = parseGstInvoiceFromMarkdown(noise);
  assert.equal(parsed.supplierGstin, undefined);
  assert.equal(parsed.grandTotal, 0);
  assert.equal(parsed.lineItems.length, 0);

  const audit = auditExtractedGstInvoice(parsed);
  assert.equal(audit.isValid, false);
  assert.ok(audit.issues.some((i) => i.code === 'MISSING_SUPPLIER_GSTIN'));
});

test('Invoice Auditor detects missing supplier GSTIN and flags ITC ineligibility', () => {
  const doc = `
    TAX INVOICE
    Invoice No: INV-001
    Date: 2026-11-15
    Total Taxable: 5000.00
    CGST Amount: 450.00
    SGST Amount: 450.00
    Grand Total: 5900.00
  `;

  const parsed = parseGstInvoiceFromMarkdown(doc);
  const audit = auditExtractedGstInvoice(parsed);

  assert.equal(audit.isValid, false);
  const missingIssue = audit.issues.find((i) => i.code === 'MISSING_SUPPLIER_GSTIN');
  assert.ok(missingIssue);
  assert.ok(missingIssue.message.includes('Input Tax Credit (ITC) cannot be claimed'));
});

test('Invoice Auditor flags asymmetric CGST and SGST on intra-state supply', () => {
  const invoice: ExtractedGstInvoice = {
    invoiceNumber: 'INV-ASYMMETRIC',
    supplierGstin: '27AAPFU0939F1ZV', // Maharashtra
    recipientGstin: '27AAPFU0939F1ZV', // Maharashtra (Intra-state)
    lineItems: [
      {
        description: 'Consulting',
        taxableValue: 10000,
        gstRate: 18,
        cgstAmount: 900, // 9%
        sgstAmount: 600, // 6% - Asymmetric error!
        totalAmount: 11500,
      },
    ],
    totalTaxableValue: 10000,
    totalCgst: 900,
    totalSgst: 600,
    totalIgst: 0,
    grandTotal: 11500,
    confidenceScore: 0.95,
  };

  const audit = auditExtractedGstInvoice(invoice);
  assert.equal(audit.isValid, false);
  assert.ok(audit.issues.some((i) => i.code === 'CGST_SGST_ASYMMETRY'));
});

test('Invoice Auditor handles UTGST in Union Territory without legislature (Ladakh 38)', () => {
  const invoice: ExtractedGstInvoice = {
    invoiceNumber: 'INV-LADAKH-01',
    supplierGstin: '38AAACS8577K1ZM', // Ladakh (UTGST with valid check digit M)
    placeOfSupplyState: '38',
    lineItems: [
      {
        description: 'Solar heating installation in Leh',
        taxableValue: 50000,
        gstRate: 12,
        cgstAmount: 3000,
        sgstAmount: 3000, // representing UTGST
        totalAmount: 56000,
      },
    ],
    totalTaxableValue: 50000,
    totalCgst: 3000,
    totalSgst: 3000,
    totalIgst: 0,
    grandTotal: 56000,
    confidenceScore: 0.98,
  };

  const audit = auditExtractedGstInvoice(invoice);
  // Should accept valid intra-UT supply with matching CGST + UTGST
  assert.equal(audit.isValid, true);
  assert.equal(audit.computedTotals.grandTotal, 56000);
});

test('Invoice Auditor flags non-standard GST rates on line items', () => {
  const invoice: ExtractedGstInvoice = {
    supplierGstin: '27AAPFU0939F1ZV',
    lineItems: [
      {
        description: 'Arbitrary service fee',
        taxableValue: 1000,
        gstRate: 13.5, // Non-standard in India (standard slabs: 0, 0.1, 0.25, 1.5, 3, 5, 6, 12, 18, 28)
        cgstAmount: 67.5,
        sgstAmount: 67.5,
        totalAmount: 1135,
      },
    ],
    totalTaxableValue: 1000,
    totalCgst: 67.5,
    totalSgst: 67.5,
    totalIgst: 0,
    grandTotal: 1135,
    confidenceScore: 0.9,
  };

  const audit = auditExtractedGstInvoice(invoice);
  const rateWarning = audit.issues.find((i) => i.code === 'NON_STANDARD_GST_RATE');
  assert.ok(rateWarning);
  assert.equal(rateWarning.severity, 'warning');
  assert.ok(rateWarning.message.includes('13.5%'));
});

test('Invoice Auditor detects line item internal arithmetic mismatch', () => {
  const invoice: ExtractedGstInvoice = {
    supplierGstin: '27AAPFU0939F1ZV',
    lineItems: [
      {
        description: 'Hardware tools',
        taxableValue: 1000,
        gstRate: 18,
        cgstAmount: 90,
        sgstAmount: 90,
        totalAmount: 1500, // Should be 1180, deliberately wrong
      },
    ],
    totalTaxableValue: 1000,
    totalCgst: 90,
    totalSgst: 90,
    totalIgst: 0,
    grandTotal: 1500,
    confidenceScore: 0.85,
  };

  const audit = auditExtractedGstInvoice(invoice);
  assert.equal(audit.isValid, false);
  assert.ok(audit.issues.some((i) => i.code === 'LINE_ITEM_TOTAL_MISMATCH'));
});
