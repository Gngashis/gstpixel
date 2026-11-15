import { ExtractedGstInvoice, GstInvoiceAuditResult, GstValidationIssue } from './types';

// Official Indian State and Union Territory Codes under GST Act, 2017
export const OFFICIAL_GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu (Legacy)',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Legacy)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

// Union Territories without legislature where UTGST replaces SGST
export const UTGST_STATE_CODES = new Set(['04', '26', '31', '35', '38']);

// Valid PAN 4th Character Entity Types in India
export const VALID_PAN_ENTITY_TYPES: Record<string, string> = {
  C: 'Company',
  P: 'Individual / Proprietorship',
  H: 'Hindu Undivided Family (HUF)',
  F: 'Partnership Firm / LLP',
  A: 'Association of Persons (AOP)',
  T: 'Trust',
  B: 'Body of Individuals (BOI)',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government Entity',
};

// Statutory GST rate slabs in India
export const STATUTORY_GST_RATES = new Set([0, 0.1, 0.25, 1.5, 3, 5, 6, 12, 18, 28]);

const ALPHABET_BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Calculates the official Luhn Mod-36 checksum over a base-36 alphanumeric string.
 * GSTN specification evaluates characters in reverse order with alternating weights of 1 and 2.
 */
export function calculateLuhnMod36Checksum(str: string): number {
  const n = ALPHABET_BASE36.length; // 36
  const values = [...str].reverse().map((ch) => ALPHABET_BASE36.indexOf(ch));
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === -1) return -1;
    if (i % 2 === 0) {
      total += values[i];
    } else {
      const prod = values[i] * 2;
      total += Math.floor(prod / n) + (prod % n);
    }
  }
  return total % n;
}

/**
 * Computes the expected 15th check digit for a 14-character GSTIN prefix.
 */
export function computeGstinCheckDigit(prefix14: string): string | null {
  if (!prefix14 || prefix14.length !== 14) return null;
  const ck = calculateLuhnMod36Checksum(prefix14 + ALPHABET_BASE36[0]);
  if (ck === -1) return null;
  const expectedIndex = (ALPHABET_BASE36.length - ck) % ALPHABET_BASE36.length;
  return ALPHABET_BASE36[expectedIndex];
}

/**
 * Full structural and statutory validation of an Indian GSTIN.
 */
export function validateGstinDetails(gstin?: string): {
  isValid: boolean;
  formatValid: boolean;
  stateCode?: string;
  stateName?: string;
  pan?: string;
  entityType?: string;
  entityTypeName?: string;
  registrationIndex?: string;
  checksumValid: boolean;
  errors: string[];
} {
  const clean = (gstin || '').trim().toUpperCase();
  const errors: string[] = [];

  if (clean.length !== 15) {
    return {
      isValid: false,
      formatValid: false,
      checksumValid: false,
      errors: [`Invalid length: GSTIN must be exactly 15 characters (received ${clean.length}).`],
    };
  }

  // 1. Structure check: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + 'Z' + 1 alphanumeric
  const structuralRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!structuralRegex.test(clean)) {
    errors.push('GSTIN does not conform to the statutory format (2 digits, 10-char PAN, 1 entity code, Z, 1 check digit).');
  }

  // 2. State Code Check
  const stateCode = clean.slice(0, 2);
  const stateName = OFFICIAL_GST_STATE_CODES[stateCode];
  if (!stateName) {
    errors.push(`Invalid State Code '${stateCode}'. Indian GST state codes must be between 01-38, 97, or 99.`);
  }

  // 3. PAN Entity Type Check (4th char of PAN = index 5 of GSTIN)
  const pan = clean.slice(2, 12);
  const entityType = clean[5];
  const entityTypeName = VALID_PAN_ENTITY_TYPES[entityType];
  if (!entityTypeName) {
    errors.push(`Invalid PAN entity code '${entityType}'. Must represent a recognized entity type (C, P, H, F, A, T, B, L, J, G).`);
  }

  // 4. Entity Registration Index
  const registrationIndex = clean[12];
  if (registrationIndex === '0') {
    errors.push("Invalid entity index '0'. Must be 1-9 or A-Z.");
  }

  // 5. Default 14th Character must be 'Z'
  if (clean[13] !== 'Z') {
    errors.push(`Invalid 14th character '${clean[13]}'. Must be 'Z' by statutory definition.`);
  }

  const formatErrorsCount = errors.length;
  const formatValid = formatErrorsCount === 0;

  // 6. Luhn Mod-36 Checksum Validation
  const checksumResult = calculateLuhnMod36Checksum(clean);
  const checksumValid = checksumResult === 0;
  if (!checksumValid) {
    const expectedChar = computeGstinCheckDigit(clean.slice(0, 14));
    errors.push(`Invalid check digit '${clean[14]}'. Expected checksum character is '${expectedChar}'.`);
  }

  return {
    isValid: errors.length === 0,
    formatValid,
    stateCode,
    stateName,
    pan,
    entityType,
    entityTypeName,
    registrationIndex,
    checksumValid,
    errors,
  };
}

export function isValidGstin(gstin?: string, strictChecksum = false): boolean {
  const result = validateGstinDetails(gstin);
  return strictChecksum ? result.isValid : result.formatValid;
}

export function extractStateCodeFromGstin(gstin?: string): string | null {
  const res = validateGstinDetails(gstin);
  return res.stateCode || null;
}

/**
 * Audits an extracted invoice against Indian GST statutory and mathematical invariants.
 */
export function auditExtractedGstInvoice(invoice: ExtractedGstInvoice): GstInvoiceAuditResult {
  const issues: GstValidationIssue[] = [];

  // 1. Supplier GSTIN Validation
  if (!invoice.supplierGstin) {
    issues.push({
      severity: 'error',
      code: 'MISSING_SUPPLIER_GSTIN',
      message: 'Supplier GSTIN is missing from invoice. Input Tax Credit (ITC) cannot be claimed without supplier GSTIN.',
      field: 'supplierGstin',
    });
  } else {
    const supValidation = validateGstinDetails(invoice.supplierGstin);
    if (!supValidation.isValid) {
      issues.push({
        severity: 'error',
        code: 'INVALID_SUPPLIER_GSTIN',
        message: `Supplier GSTIN '${invoice.supplierGstin}' validation issues: ${supValidation.errors.join(' ')}`,
        field: 'supplierGstin',
      });
    }
  }

  // 2. Recipient GSTIN Validation (B2B transactions)
  let recipientState: string | undefined;
  if (invoice.recipientGstin && invoice.recipientGstin.trim()) {
    const recValidation = validateGstinDetails(invoice.recipientGstin);
    if (!recValidation.isValid) {
      issues.push({
        severity: 'warning',
        code: 'INVALID_RECIPIENT_GSTIN',
        message: `Recipient GSTIN '${invoice.recipientGstin}' validation issues: ${recValidation.errors.join(' ')}`,
        field: 'recipientGstin',
      });
    }
    recipientState = recValidation.stateCode;
  }

  // 3. Place of Supply & Tax Head Verification (Intra-state vs Inter-state)
  const supplierState = extractStateCodeFromGstin(invoice.supplierGstin);
  const posState = invoice.placeOfSupplyState || recipientState;

  if (supplierState && posState) {
    const isIntraState = supplierState === posState;
    const isUt = UTGST_STATE_CODES.has(supplierState);
    const stateTaxHead = isUt ? 'UTGST' : 'SGST';

    if (isIntraState) {
      // Intra-state MUST levy CGST + SGST/UTGST
      if (invoice.totalIgst > 0.05) {
        issues.push({
          severity: 'error',
          code: 'INVALID_TAX_HEAD_INTRASTATE',
          message: `Intra-state supply (State ${supplierState}) must levy CGST + ${stateTaxHead}, not IGST (₹${invoice.totalIgst.toFixed(2)} charged).`,
          field: 'totalIgst',
        });
      }
      const cgstSgstDiff = Math.abs(invoice.totalCgst - invoice.totalSgst);
      if (cgstSgstDiff > 0.05) {
        issues.push({
          severity: 'error',
          code: 'CGST_SGST_ASYMMETRY',
          message: `CGST (₹${invoice.totalCgst.toFixed(2)}) and ${stateTaxHead} (₹${invoice.totalSgst.toFixed(2)}) must be identical in rate and amount for intra-state supply.`,
          field: 'totalCgst',
        });
      }
    } else {
      // Inter-state MUST levy IGST
      if ((invoice.totalCgst > 0.05 || invoice.totalSgst > 0.05) && invoice.totalIgst < 0.05) {
        issues.push({
          severity: 'error',
          code: 'INVALID_TAX_HEAD_INTERSTATE',
          message: `Inter-state supply (Supplier ${supplierState} -> POS ${posState}) must levy IGST, not CGST/SGST.`,
          field: 'totalIgst',
        });
      }
    }
  }

  // 4. Line Items Statutory Rate Check & Arithmetic Summation
  let lineItemsTaxable = 0;
  let lineItemsCgst = 0;
  let lineItemsSgst = 0;
  let lineItemsIgst = 0;

  for (const item of invoice.lineItems) {
    lineItemsTaxable += item.taxableValue;
    lineItemsCgst += item.cgstAmount ?? 0;
    lineItemsSgst += item.sgstAmount ?? 0;
    lineItemsIgst += item.igstAmount ?? 0;

    // Check statutory rate
    if (!STATUTORY_GST_RATES.has(item.gstRate)) {
      issues.push({
        severity: 'warning',
        code: 'NON_STANDARD_GST_RATE',
        message: `Line item '${item.description}' has non-standard GST rate of ${item.gstRate}%. Verify notification or exemption.`,
        field: 'lineItems',
      });
    }

    // Line item internal arithmetic check
    const expectedLineTax = (item.cgstAmount ?? 0) + (item.sgstAmount ?? 0) + (item.igstAmount ?? 0);
    const expectedLineTotal = item.taxableValue + expectedLineTax;
    if (Math.abs(expectedLineTotal - item.totalAmount) > 0.1) {
      issues.push({
        severity: 'error',
        code: 'LINE_ITEM_TOTAL_MISMATCH',
        message: `Line item '${item.description}' arithmetic mismatch: Taxable (₹${item.taxableValue}) + Tax (₹${expectedLineTax}) != Total (₹${item.totalAmount}).`,
        field: 'lineItems',
      });
    }
  }

  const computedTotalTax = lineItemsCgst + lineItemsSgst + lineItemsIgst;
  const computedGrandTotal = lineItemsTaxable + computedTotalTax;

  const declaredTaxable = invoice.totalTaxableValue;
  const declaredGrandTotal = invoice.grandTotal;

  // 5. Total Taxable Reconciliation
  if (invoice.lineItems.length > 0) {
    const taxableDiff = Math.abs(lineItemsTaxable - declaredTaxable);
    if (taxableDiff > 0.1) {
      issues.push({
        severity: 'error',
        code: 'LINE_ITEM_TAXABLE_MISMATCH',
        message: `Sum of line items taxable value (₹${lineItemsTaxable.toFixed(2)}) does not match declared total taxable value (₹${declaredTaxable.toFixed(2)}).`,
        field: 'totalTaxableValue',
      });
    }
  }

  // 6. Grand Total Reconciliation
  const grandTotalDelta = Math.abs(computedGrandTotal - declaredGrandTotal);
  if (grandTotalDelta > 0.1) {
    issues.push({
      severity: 'error',
      code: 'GRAND_TOTAL_MISMATCH',
      message: `Computed grand total (₹${computedGrandTotal.toFixed(2)}) differs from declared grand total (₹${declaredGrandTotal.toFixed(2)}) by ₹${grandTotalDelta.toFixed(2)}.`,
      field: 'grandTotal',
    });
  }

  const isValid = !issues.some((issue) => issue.severity === 'error');

  return {
    isValid,
    issues,
    computedTotals: {
      taxableValue: Math.round(lineItemsTaxable * 100) / 100,
      cgst: Math.round(lineItemsCgst * 100) / 100,
      sgst: Math.round(lineItemsSgst * 100) / 100,
      igst: Math.round(lineItemsIgst * 100) / 100,
      totalTax: Math.round(computedTotalTax * 100) / 100,
      grandTotal: Math.round(computedGrandTotal * 100) / 100,
    },
    reconciliationDelta: Math.round(grandTotalDelta * 100) / 100,
  };
}
