'use client';

import { useState, type FormEvent } from 'react';
import { parseGstInvoiceFromMarkdown } from '@/domain/ai/invoice-parser';
import { auditExtractedGstInvoice, validateGstinDetails } from '@/domain/ai/gst-verification';
import { ExtractedGstInvoice, GstInvoiceAuditResult } from '@/domain/ai/types';
import { Arrow, Icon } from '@/components/ui';
import ui from '@/components/ui.module.css';
import s from './invoice-auditor.module.css';

function formatInr(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

const SAMPLE_INVOICE_VALID = `TAX INVOICE
Invoice No: INV-2026-081
Date: 15-11-2026
Supplier GSTIN: 27AAPFU0939F1ZV
Place of Supply: 27 (Maharashtra)

| Description | Taxable | Total |
| Web Platform Development | 10000.00 | 11800.00 |

Total Taxable: 10000.00
CGST Amount: 900.00
SGST Amount: 900.00
Grand Total: 11800.00`;

const SAMPLE_INVOICE_TAX_ERROR = `TAX INVOICE
Invoice No: INV-2026-092
Date: 15-11-2026
Supplier GSTIN: 27AAPFU0939F1ZV
Recipient GSTIN: 27AAPFU0939F1ZV
Place of Supply: 27 (Intra-state Maharashtra)

Total Taxable: 5000.00
IGST Amount: 900.00
Grand Total: 5900.00`;

const SAMPLE_INVOICE_ARITHMETIC_ERROR = `TAX INVOICE
Invoice No: INV-2026-103
Date: 15-11-2026
Supplier GSTIN: 27AAPFU0939F1ZV

| Description | Taxable | Total |
| Cloud Hosting Services | 2000.00 | 2360.00 |

Total Taxable: 2000.00
CGST Amount: 180.00
SGST Amount: 180.00
Grand Total: 2800.00`;

export function InvoiceAuditor() {
  const [invoiceText, setInvoiceText] = useState(SAMPLE_INVOICE_VALID);
  const [extracted, setExtracted] = useState<ExtractedGstInvoice | null>(null);
  const [auditResult, setAuditResult] = useState<GstInvoiceAuditResult | null>(null);

  function runAudit(textToAnalyze: string) {
    if (!textToAnalyze.trim()) {
      setExtracted(null);
      setAuditResult(null);
      return;
    }
    const ext = parseGstInvoiceFromMarkdown(textToAnalyze);
    const audit = auditExtractedGstInvoice(ext);
    setExtracted(ext);
    setAuditResult(audit);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runAudit(invoiceText);
  }

  function loadSample(sample: string) {
    setInvoiceText(sample);
    runAudit(sample);
  }

  function handleReset() {
    setInvoiceText('');
    setExtracted(null);
    setAuditResult(null);
  }

  const supplierGstinDetails = extracted?.supplierGstin
    ? validateGstinDetails(extracted.supplierGstin)
    : null;

  return (
    <div className={s.shell}>
      <form onSubmit={handleSubmit} className={s.form}>
        <div className={s.panelTitle}>
          <span className="eyebrow">Input & OCR Payload</span>
          <span>01</span>
        </div>

        <div className={s.presets}>
          <span style={{ fontSize: '12px', color: '#9da2af', alignSelf: 'center' }}>Test Samples:</span>
          <button type="button" onClick={() => loadSample(SAMPLE_INVOICE_VALID)}>
            Valid Intra-State
          </button>
          <button type="button" onClick={() => loadSample(SAMPLE_INVOICE_TAX_ERROR)}>
            Tax Head Error (IGST)
          </button>
          <button type="button" onClick={() => loadSample(SAMPLE_INVOICE_ARITHMETIC_ERROR)}>
            Math Mismatch
          </button>
        </div>

        <div className={s.field}>
          <label htmlFor="invoice-text">Paste GST Invoice Text or OCR Markdown</label>
          <div className={s.textareaWrap}>
            <textarea
              id="invoice-text"
              value={invoiceText}
              onChange={(e) => setInvoiceText(e.target.value)}
              placeholder="Paste raw invoice text, OCR output, or markdown..."
            />
          </div>
        </div>

        <div className={s.formActions}>
          <button type="submit" className={`${ui.button} ${ui.primary}`}>
            Audit Invoice <Arrow />
          </button>
          <button type="button" className={s.reset} onClick={handleReset}>
            Clear Text
          </button>
        </div>
      </form>

      <section className={s.results} aria-labelledby="audit-heading">
        <div className={s.panelTitle}>
          <span className="eyebrow">Statutory Audit</span>
          <Icon name="shield" />
        </div>
        <h2 id="audit-heading">Compliance Findings</h2>

        {auditResult && extracted ? (
          <>
            <div>
              <span
                className={`${s.statusBadge} ${
                  auditResult.isValid ? s.validBadge : s.invalidBadge
                }`}
              >
                {auditResult.isValid
                  ? '✓ STATUTORY COMPLIANT'
                  : '✕ STATUTORY ISSUES FLAGGED'}
              </span>
            </div>

            {/* Supplier Verification */}
            <div className={s.sectionBlock}>
              <h3>Supplier GSTIN Verification</h3>
              {supplierGstinDetails ? (
                <dl className={s.detailGrid}>
                  <div>
                    <dt>GSTIN</dt>
                    <dd>{extracted.supplierGstin}</dd>
                  </div>
                  <div>
                    <dt>Jurisdiction State</dt>
                    <dd>{supplierGstinDetails.stateName || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>PAN Holder Type</dt>
                    <dd>{supplierGstinDetails.entityTypeName || 'Invalid'}</dd>
                  </div>
                  <div>
                    <dt>Luhn Checksum</dt>
                    <dd>
                      {supplierGstinDetails.checksumValid
                        ? '✓ Verified'
                        : '✕ Checksum Mismatch'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p style={{ color: '#ff9b9b', fontSize: '13px' }}>
                  No valid supplier GSTIN detected. Input Tax Credit (ITC) cannot be claimed.
                </p>
              )}
            </div>

            {/* Detected Issues */}
            {auditResult.issues.length > 0 && (
              <div className={s.sectionBlock}>
                <h3>Statutory & Math Exceptions</h3>
                <ul className={s.issueList}>
                  {auditResult.issues.map((iss, idx) => (
                    <li
                      key={idx}
                      className={`${s.issueItem} ${
                        iss.severity === 'error' ? s.issueError : s.issueWarning
                      }`}
                    >
                      <strong>[{iss.code}]</strong> {iss.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reconciliation Totals */}
            <div className={s.sectionBlock}>
              <h3>Reconciliation of Totals</h3>
              <dl className={s.detailGrid}>
                <div>
                  <dt>Declared Taxable</dt>
                  <dd>{formatInr(extracted.totalTaxableValue)}</dd>
                </div>
                <div>
                  <dt>Declared Grand Total</dt>
                  <dd>{formatInr(extracted.grandTotal)}</dd>
                </div>
                <div>
                  <dt>Computed CGST</dt>
                  <dd>{formatInr(auditResult.computedTotals.cgst)}</dd>
                </div>
                <div>
                  <dt>Computed SGST/UTGST</dt>
                  <dd>{formatInr(auditResult.computedTotals.sgst)}</dd>
                </div>
                <div>
                  <dt>Computed IGST</dt>
                  <dd>{formatInr(auditResult.computedTotals.igst)}</dd>
                </div>
                <div>
                  <dt>Computed Grand Total</dt>
                  <dd>{formatInr(auditResult.computedTotals.grandTotal)}</dd>
                </div>
              </dl>
              <div className={s.reconciliationBox}>
                <span>Reconciliation Discrepancy</span>
                <strong
                  style={{
                    color:
                      auditResult.reconciliationDelta === 0
                        ? '#57e389'
                        : '#ff8182',
                  }}
                >
                  ₹{auditResult.reconciliationDelta.toFixed(2)}
                </strong>
              </div>
            </div>
          </>
        ) : (
          <div className={s.empty}>
            <Icon name="document" />
            <p>
              Enter invoice text or select a sample,
              <br />
              then click Audit Invoice.
            </p>
          </div>
        )}

        <div className={s.assumption}>
          <Icon name="shield" />
          <p>
            Statutory mathematical audit based on Indian CGST, SGST, and IGST rules.
            Always confirm tax conclusions with a qualified Chartered Accountant or GST practitioner.
          </p>
        </div>
      </section>
    </div>
  );
}
