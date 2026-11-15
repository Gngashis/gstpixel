import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  isValidGstin,
  validateGstinDetails,
  extractStateCodeFromGstin,
  computeGstinCheckDigit,
  auditExtractedGstInvoice,
  OFFICIAL_GST_STATE_CODES,
  UTGST_STATE_CODES,
} from '../src/domain/ai/gst-verification';
import { parseGstInvoiceFromMarkdown } from '../src/domain/ai/invoice-parser';
import { resolveLlamaCloudApiKey } from '../src/domain/ai/llama-parse-adapter';
import { resolveOpenRouterApiKey, RECOMMENDED_MODELS } from '../src/domain/ai/openrouter-advisor-adapter';
import { GstPixelAiOrchestrator } from '../src/domain/ai/ai-orchestrator';
import { ExtractedGstInvoice } from '../src/domain/ai/types';

test('validateGstinDetails validates official GSTN structural rules and Luhn Mod-36 checksum', () => {
  // 1. Valid GSTIN with authentic check digit
  const validDetails = validateGstinDetails('27AAPFU0939F1ZV');
  assert.equal(validDetails.isValid, true);
  assert.equal(validDetails.checksumValid, true);
  assert.equal(validDetails.stateCode, '27');
  assert.equal(validDetails.stateName, 'Maharashtra');
  assert.equal(validDetails.pan, 'AAPFU0939F');
  assert.equal(validDetails.entityTypeName, 'Partnership Firm / LLP');
  assert.equal(validDetails.errors.length, 0);

  // 2. Compute check digit offline
  const computedChar = computeGstinCheckDigit('27AAPFU0939F1Z');
  assert.equal(computedChar, 'V');

  // 3. Invalid Checksum
  const invalidChecksum = validateGstinDetails('27AAPFU0939F1ZX');
  assert.equal(invalidChecksum.isValid, false);
  assert.equal(invalidChecksum.checksumValid, false);
  assert.ok(invalidChecksum.errors.some((e) => e.includes('Invalid check digit')));

  // 4. Invalid State Code '00'
  const invalidState = validateGstinDetails('00AAPFU0939F1ZV');
  assert.equal(invalidState.isValid, false);
  assert.ok(invalidState.errors.some((e) => e.includes('Invalid State Code')));

  // 5. Invalid PAN Entity Code 'X' (4th char of PAN = index 5 of GSTIN)
  const invalidEntity = validateGstinDetails('27AAPXU0939F1ZV');
  assert.equal(invalidEntity.isValid, false);
  assert.ok(invalidEntity.errors.some((e) => e.includes('Invalid PAN entity code')));

  // 6. Invalid length
  assert.equal(isValidGstin('123'), false);
  assert.equal(isValidGstin(undefined), false);
});

test('State codes and UTGST detection function according to GST Act 2017', () => {
  assert.equal(OFFICIAL_GST_STATE_CODES['19'], 'West Bengal');
  assert.equal(OFFICIAL_GST_STATE_CODES['07'], 'Delhi');
  assert.equal(OFFICIAL_GST_STATE_CODES['27'], 'Maharashtra');
  assert.ok(UTGST_STATE_CODES.has('04')); // Chandigarh
  assert.ok(UTGST_STATE_CODES.has('38')); // Ladakh
  assert.ok(!UTGST_STATE_CODES.has('19')); // West Bengal is SGST
});

test('parseGstInvoiceFromMarkdown extracts structured fields and line items from OCR text', () => {
  const ocrText = `
TAX INVOICE
Invoice No: INV-9981
Date: 2026-11-15
Supplier GSTIN: 27AAPFU0939F1ZV
Place of Supply: 27

| Description | Taxable | Total |
| Cloud Services | 1000.00 | 1180.00 |

Total Taxable: 1000.00
CGST Amount: 90.00
SGST Amount: 90.00
Grand Total: 1180.00
`;

  const parsed = parseGstInvoiceFromMarkdown(ocrText);
  assert.equal(parsed.invoiceNumber, 'INV-9981');
  assert.equal(parsed.supplierGstin, '27AAPFU0939F1ZV');
  assert.equal(parsed.placeOfSupplyState, '27');
  assert.equal(parsed.totalTaxableValue, 1000);
  assert.equal(parsed.totalCgst, 90);
  assert.equal(parsed.totalSgst, 90);
  assert.equal(parsed.grandTotal, 1180);
  assert.equal(parsed.lineItems.length, 1);
  assert.equal(parsed.lineItems[0].taxableValue, 1000);
  assert.equal(parsed.lineItems[0].totalAmount, 1180);
});

test('auditExtractedGstInvoice verifies valid intra-state invoice with CGST and SGST', () => {
  const invoice: ExtractedGstInvoice = {
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-11-15',
    supplierGstin: '27AAPFU0939F1ZV', // Maharashtra
    recipientGstin: '27AAPFU0939F1ZV', // Maharashtra (Intra-state)
    lineItems: [
      {
        description: 'Web development services',
        hsnOrSac: '998314',
        taxableValue: 10000,
        gstRate: 18,
        cgstAmount: 900,
        sgstAmount: 900,
        igstAmount: 0,
        totalAmount: 11800,
      },
    ],
    totalTaxableValue: 10000,
    totalCgst: 900,
    totalSgst: 900,
    totalIgst: 0,
    grandTotal: 11800,
    confidenceScore: 0.98,
  };

  const audit = auditExtractedGstInvoice(invoice);
  assert.equal(audit.isValid, true);
  assert.equal(audit.issues.length, 0);
  assert.equal(audit.computedTotals.grandTotal, 11800);
  assert.equal(audit.reconciliationDelta, 0);
});

test('auditExtractedGstInvoice flags intra-state invoice erroneously charging IGST', () => {
  const faultyInvoice: ExtractedGstInvoice = {
    invoiceNumber: 'INV-2026-002',
    supplierGstin: '27AAPFU0939F1ZV',
    recipientGstin: '27AAPFU0939F1ZV',
    lineItems: [
      {
        description: 'Consulting',
        taxableValue: 5000,
        gstRate: 18,
        igstAmount: 900,
        totalAmount: 5900,
      },
    ],
    totalTaxableValue: 5000,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 900,
    grandTotal: 5900,
    confidenceScore: 0.95,
  };

  const audit = auditExtractedGstInvoice(faultyInvoice);
  assert.equal(audit.isValid, false);
  assert.ok(audit.issues.some((i) => i.code === 'INVALID_TAX_HEAD_INTRASTATE'));
});

test('auditExtractedGstInvoice flags arithmetic discrepancies', () => {
  const mismatchInvoice: ExtractedGstInvoice = {
    invoiceNumber: 'INV-2026-003',
    supplierGstin: '27AAPFU0939F1ZV',
    lineItems: [
      {
        description: 'Hardware items',
        taxableValue: 1000,
        gstRate: 18,
        cgstAmount: 90,
        sgstAmount: 90,
        totalAmount: 1180,
      },
    ],
    totalTaxableValue: 2000, // Mismatch
    totalCgst: 90,
    totalSgst: 90,
    totalIgst: 0,
    grandTotal: 2500, // Mismatch
    confidenceScore: 0.9,
  };

  const audit = auditExtractedGstInvoice(mismatchInvoice);
  assert.equal(audit.isValid, false);
  assert.ok(audit.issues.some((i) => i.code === 'LINE_ITEM_TAXABLE_MISMATCH'));
  assert.ok(audit.issues.some((i) => i.code === 'GRAND_TOTAL_MISMATCH'));
});

test('AI service key resolvers securely resolve environment configuration and models', () => {
  const llamaKey = resolveLlamaCloudApiKey();
  assert.ok(llamaKey && llamaKey.startsWith('llx-'));

  const openRouterKey = resolveOpenRouterApiKey();
  assert.ok(openRouterKey && openRouterKey.startsWith('sk-or-'));

  assert.equal(RECOMMENDED_MODELS.FAST_ACCURATE, 'meta-llama/llama-3.3-70b-instruct');
  assert.equal(RECOMMENDED_MODELS.DEEP_REASONING, 'deepseek/deepseek-r1-0528');
  assert.equal(RECOMMENDED_MODELS.BALANCED, 'openai/gpt-4o-mini');
});

test('GstPixelAiOrchestrator performs statutory audit with offline fallback', async () => {
  const orchestrator = new GstPixelAiOrchestrator();
  const sample: ExtractedGstInvoice = {
    supplierGstin: '27AAPFU0939F1ZV',
    lineItems: [
      {
        description: 'Testing',
        taxableValue: 100,
        gstRate: 18,
        cgstAmount: 9,
        sgstAmount: 9,
        totalAmount: 118,
      },
    ],
    totalTaxableValue: 100,
    totalCgst: 9,
    totalSgst: 9,
    totalIgst: 0,
    grandTotal: 118,
    confidenceScore: 1,
  };

  const result = await orchestrator.analyzeInvoice(sample, { generateAdvisory: true });
  assert.ok(result.extracted);
  assert.equal(result.audit.isValid, true);
  assert.ok(result.advisory);
  assert.ok(result.advisory.suggestedActions.length > 0);
});
