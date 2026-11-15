'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import { parseGstInvoiceFromMarkdown } from '@/domain/ai/invoice-parser';
import { auditExtractedGstInvoice } from '@/domain/ai/gst-verification';
import { ExtractedGstInvoice, GstInvoiceAuditResult } from '@/domain/ai/types';
import { authService, DEMO_USERS } from '@/domain/saas/auth-service';
import { invoiceStorageRepository } from '@/domain/saas/storage-repository';
import { SAAS_PLANS } from '@/domain/saas/plans';
import { UserProfile, StoredInvoiceRecord } from '@/domain/saas/types';
import { razorpayBillingService } from '@/domain/billing/razorpay-service';
import { Arrow, Icon } from '@/components/ui';
import ui from '@/components/ui.module.css';
import s from './invoice-manager.module.css';

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

const SAMPLE_INVOICE_INTERSTATE = `TAX INVOICE
Invoice No: INV-2026-104
Date: 15-11-2026
Supplier GSTIN: 27AAPFU0939F1ZV
Recipient GSTIN: 19AAACS8577K1ZM
Place of Supply: 19 (West Bengal Inter-State)

| Description | Taxable | Total |
| Enterprise AI Platform Licensing | 25000.00 | 29500.00 |

Total Taxable: 25000.00
IGST Amount: 4500.00
Grand Total: 29500.00`;

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

export function InvoiceManager() {
  const [activeTab, setActiveTab] = useState<'audit' | 'history' | 'subscription'>('audit');
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [invoices, setInvoices] = useState<StoredInvoiceRecord[]>(invoiceStorageRepository.getAllInvoices());

  // Audit state
  const [invoiceText, setInvoiceText] = useState(SAMPLE_INVOICE_VALID);
  const [extracted, setExtracted] = useState<ExtractedGstInvoice | null>(null);
  const [auditResult, setAuditResult] = useState<GstInvoiceAuditResult | null>(null);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // History filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'FLAGGED'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<StoredInvoiceRecord | null>(null);

  // Simulation checkout state
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = authService.subscribe((u) => setCurrentUser(u));
    const unsubStorage = invoiceStorageRepository.subscribe(() => {
      setInvoices(invoiceStorageRepository.getAllInvoices());
    });

    // Synchronize with server edge database
    authService.syncWithServer().catch(() => {});
    invoiceStorageRepository.syncWithServer(currentUser.id).catch(() => {});

    return () => {
      unsubAuth();
      unsubStorage();
    };
  }, []);

  const handleAudit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setQuotaError(null);
    setSavedNotification(null);

    // Check customer quota
    const quotaCheck = authService.recordInvoiceAuditUsage();
    if (!quotaCheck.success) {
      setQuotaError(quotaCheck.error || 'Monthly audit quota exceeded.');
      return;
    }

    try {
      const parsed = parseGstInvoiceFromMarkdown(invoiceText);
      const audited = auditExtractedGstInvoice(parsed);
      setExtracted(parsed);
      setAuditResult(audited);
    } catch {
      setAuditResult(null);
      setExtracted(null);
    }
  };

  const handleSaveToStorage = () => {
    if (!extracted || !auditResult) return;

    invoiceStorageRepository.addInvoice({
      userId: currentUser.id,
      invoiceNumber: extracted.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
      invoiceDate: extracted.invoiceDate || new Date().toISOString().split('T')[0],
      supplierGstin: extracted.supplierGstin || 'UNSPECIFIED',
      supplierName: extracted.supplierName || 'Unknown Supplier',
      recipientGstin: extracted.recipientGstin,
      recipientName: extracted.recipientName,
      placeOfSupplyState: extracted.placeOfSupplyState,
      taxableAmount: extracted.totalTaxableValue,
      taxAmount: extracted.totalCgst + extracted.totalSgst + extracted.totalIgst,
      grandTotal: extracted.grandTotal,
      auditStatus: auditResult.isValid ? 'COMPLIANT' : 'FLAGGED',
      issuesCount: auditResult.issues.length,
      issues: auditResult.issues.map((i) => i.message),
      rawTextSnippet: invoiceText.slice(0, 300),
    });

    setSavedNotification('Invoice successfully audited and archived to your account repository.');
    setTimeout(() => setSavedNotification(null), 4000);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInvoiceText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSimulatedUpgrade = async (tier: 'starter' | 'pro' | 'enterprise') => {
    setCheckoutNotice(null);
    const res = await razorpayBillingService.launchCheckout(tier, 'monthly', {
      name: currentUser.name,
      email: currentUser.email,
      contact: '9046520548',
      businessName: currentUser.businessName,
      gstin: currentUser.gstin,
    });

    if (res.isSimulated && res.success) {
      authService.upgradeTier(tier, 'monthly');
      setCheckoutNotice(
        `✓ [STAGING SIMULATION] Upgraded to ${SAAS_PLANS[tier].name}. Razorpay Staging ID: ${res.subscriptionId}. (No real charges incurred).`
      );
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.auditStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.supplierGstin.toLowerCase().includes(q) ||
        (inv.supplierName && inv.supplierName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const quotaPercent = Math.min(100, Math.round((currentUser.quota.usedThisMonth / currentUser.quota.monthlyLimit) * 100));
  const currentPlan = SAAS_PLANS[currentUser.tier];

  return (
    <div className={s.container}>
      {/* Tab Navigation */}
      <div className={s.tabBar} role="tablist" aria-label="Invoice Manager Tabs">
        <button
          className={`${s.tabButton} ${activeTab === 'audit' ? s.tabActive : ''}`}
          role="tab"
          aria-selected={activeTab === 'audit'}
          onClick={() => setActiveTab('audit')}
        >
          <Icon name="calculator" /> Audit Invoice
        </button>
        <button
          className={`${s.tabButton} ${activeTab === 'history' ? s.tabActive : ''}`}
          role="tab"
          aria-selected={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          <Icon name="document" /> My Invoices
          <span className={s.badge}>{invoices.length}</span>
        </button>
        <button
          className={`${s.tabButton} ${activeTab === 'subscription' ? s.tabActive : ''}`}
          role="tab"
          aria-selected={activeTab === 'subscription'}
          onClick={() => setActiveTab('subscription')}
        >
          <Icon name="briefcase" /> Account & Quota
          <span className={s.badge}>{currentPlan.name}</span>
        </button>
      </div>

      {/* Quota Banner */}
      <div className={s.quotaBarContainer}>
        <div className={s.quotaInfo}>
          <div className={s.quotaTitle}>
            <span>{currentUser.businessName || 'Business Account'}</span>
            <span className={s.badge}>{currentPlan.name}</span>
          </div>
          <div className={s.quotaSub}>
            Monthly usage: <strong>{currentUser.quota.usedThisMonth}</strong> of {currentUser.quota.monthlyLimit} audits used ({currentUser.quota.monthlyLimit - currentUser.quota.usedThisMonth} remaining).
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={s.progressBarBg}>
            <div
              className={`${s.progressBarFill} ${quotaPercent >= 100 ? s.progressBarFull : ''}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          {currentUser.tier === 'community' && (
            <Link href="/pricing" className={`${ui.btn} ${ui.btnSm}`} style={{ textDecoration: 'none' }}>
              Upgrade Plan
            </Link>
          )}
        </div>
      </div>

      {quotaError && (
        <div className={s.issueItem} style={{ borderLeftColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <strong>Quota Exceeded:</strong> {quotaError}{' '}
          <Link href="/pricing" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            View Upgrade Options
          </Link>
        </div>
      )}

      {checkoutNotice && (
        <div className={s.issueItem} style={{ borderLeftColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
          {checkoutNotice}
        </div>
      )}

      {/* TAB 1: AUDIT INVOICE */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick sample scenarios */}
          <div className={s.sampleBar}>
            <span className={s.sampleLabel}>Load Test Scenario:</span>
            <button
              type="button"
              className={s.sampleBtn}
              onClick={() => {
                setInvoiceText(SAMPLE_INVOICE_VALID);
                setExtracted(null);
                setAuditResult(null);
              }}
            >
              Valid Intra-State
            </button>
            <button
              type="button"
              className={s.sampleBtn}
              onClick={() => {
                setInvoiceText(SAMPLE_INVOICE_INTERSTATE);
                setExtracted(null);
                setAuditResult(null);
              }}
            >
              Valid Inter-State (IGST)
            </button>
            <button
              type="button"
              className={s.sampleBtn}
              onClick={() => {
                setInvoiceText(SAMPLE_INVOICE_TAX_ERROR);
                setExtracted(null);
                setAuditResult(null);
              }}
            >
              Tax Head Error (IGST)
            </button>
            <button
              type="button"
              className={s.sampleBtn}
              onClick={() => {
                setInvoiceText(SAMPLE_INVOICE_ARITHMETIC_ERROR);
                setExtracted(null);
                setAuditResult(null);
              }}
            >
              Math Mismatch
            </button>
          </div>

          <form onSubmit={handleAudit} className={s.editorGrid}>
            <label htmlFor="invoice-text" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Invoice Markdown / OCR Text / Paste
            </label>
            <textarea
              id="invoice-text"
              className={s.textarea}
              value={invoiceText}
              onChange={(e) => setInvoiceText(e.target.value)}
              placeholder="Paste tax invoice content, OCR output, or markdown table here..."
              rows={9}
            />

            <div className={s.fileDropArea}>
              <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                <span className={s.fileDropText}>
                  📁 Drop document here or click to browse (Text, Markdown, or OCR outputs)
                </span>
                <input
                  id="file-input"
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className={s.actionRow}>
              <button type="submit" className={`${ui.btn} ${ui.btnPrimary}`}>
                Audit Invoice <Arrow />
              </button>
              <button
                type="button"
                className={ui.btn}
                onClick={() => {
                  setInvoiceText('');
                  setExtracted(null);
                  setAuditResult(null);
                }}
              >
                Clear Text
              </button>
            </div>
          </form>

          {/* Audit Result Display */}
          {auditResult && extracted && (
            <div className={s.resultsCard}>
              <div className={s.statusHeader}>
                <span className={auditResult.isValid ? s.statusBadgeCompliant : s.statusBadgeFlagged}>
                  {auditResult.isValid ? '✓ STATUTORY COMPLIANT' : '✕ STATUTORY ISSUES FLAGGED'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button type="button" className={`${ui.btn} ${ui.btnSm}`} onClick={handleSaveToStorage}>
                    Save to My Invoices
                  </button>
                  <button type="button" className={`${ui.btn} ${ui.btnSm}`} onClick={() => window.print()}>
                    Print / Export
                  </button>
                </div>
              </div>

              {savedNotification && (
                <div className={s.issueItem} style={{ borderLeftColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  {savedNotification}
                </div>
              )}

              {/* Statutory Disclaimer Badge */}
              <div className={s.disclaimerBanner}>
                <strong>Automated Pre-Filing Statutory Check:</strong> Algorithmic validation under Section 16 of the Central Goods and Services Tax Act, 2017. Does not replace formal verification by an empanelled Chartered Accountant or authorized GST Practitioner.
              </div>

              {/* Key invoice attributes */}
              <div className={s.summaryGrid}>
                <div className={s.summaryItem}>
                  <span className={s.summaryItemLabel}>Invoice No & Date</span>
                  <span className={s.summaryItemValue}>
                    {extracted.invoiceNumber || 'N/A'} ({extracted.invoiceDate || 'N/A'})
                  </span>
                </div>
                <div className={s.summaryItem}>
                  <span className={s.summaryItemLabel}>Supplier GSTIN</span>
                  <span className={s.summaryItemValue} style={{ fontFamily: 'monospace' }}>
                    {extracted.supplierGstin || 'Missing GSTIN'}
                  </span>
                </div>
                <div className={s.summaryItem}>
                  <span className={s.summaryItemLabel}>Taxable Value</span>
                  <span className={s.summaryItemValue}>{formatInr(extracted.totalTaxableValue)}</span>
                </div>
                <div className={s.summaryItem}>
                  <span className={s.summaryItemLabel}>Declared Grand Total</span>
                  <span className={s.summaryItemValue}>{formatInr(extracted.grandTotal)}</span>
                </div>
              </div>

              {/* Issues Section */}
              {auditResult.issues.length > 0 ? (
                <div className={s.issuesList}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Statutory Findings ({auditResult.issues.length}):
                  </span>
                  {auditResult.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={s.issueItem}
                      style={{
                        borderLeftColor: issue.severity === 'error' ? '#ef4444' : '#f59e0b',
                        backgroundColor: issue.severity === 'error' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                      }}
                    >
                      <strong>[{issue.severity.toUpperCase()}] {issue.code}:</strong> {issue.message}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={s.issueItem} style={{ borderLeftColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.06)' }}>
                  ✓ All statutory arithmetic, Mod-36 GSTIN check digits, and intra-state CGST/SGST allocations reconcile with 0 errors.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY INVOICES (DATABASE STORAGE) */}
      {activeTab === 'history' && (
        <div>
          <div className={s.searchBar}>
            <input
              type="text"
              placeholder="Search by invoice number, GSTIN, or vendor..."
              className={s.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className={s.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Statuses ({invoices.length})</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="FLAGGED">Flagged Only</option>
            </select>
          </div>

          <div className={s.tableContainer}>
            <table className={s.invoiceTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Supplier GSTIN</th>
                  <th>Taxable</th>
                  <th>Tax</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.invoiceDate}</td>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td style={{ fontFamily: 'monospace' }}>{inv.supplierGstin}</td>
                      <td>{formatInr(inv.taxableAmount)}</td>
                      <td>{formatInr(inv.taxAmount)}</td>
                      <td style={{ fontWeight: 600 }}>{formatInr(inv.grandTotal)}</td>
                      <td>
                        <span className={inv.auditStatus === 'COMPLIANT' ? s.statusBadgeCompliant : s.statusBadgeFlagged}>
                          {inv.auditStatus}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className={s.actionBtnSmall}
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className={`${s.actionBtnSmall} ${s.deleteBtnSmall}`}
                          onClick={() => invoiceStorageRepository.deleteInvoice(inv.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No invoices found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal / Detailed View of Selected Invoice */}
          {selectedInvoice && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
              onClick={() => setSelectedInvoice(null)}
            >
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  maxWidth: '650px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '1.5rem',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Invoice {selectedInvoice.invoiceNumber}</h3>
                  <button
                    type="button"
                    className={ui.btn}
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Close
                  </button>
                </div>

                <div className={s.summaryGrid} style={{ marginBottom: '1rem' }}>
                  <div className={s.summaryItem}>
                    <span className={s.summaryItemLabel}>Supplier GSTIN</span>
                    <span className={s.summaryItemValue} style={{ fontFamily: 'monospace' }}>
                      {selectedInvoice.supplierGstin}
                    </span>
                  </div>
                  <div className={s.summaryItem}>
                    <span className={s.summaryItemLabel}>Grand Total</span>
                    <span className={s.summaryItemValue}>{formatInr(selectedInvoice.grandTotal)}</span>
                  </div>
                </div>

                {selectedInvoice.issues.length > 0 ? (
                  <div className={s.issuesList}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>
                      Flagged Statutory Findings:
                    </span>
                    {selectedInvoice.issues.map((msg, i) => (
                      <div key={i} className={s.issueItem}>
                        {msg}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={s.issueItem} style={{ borderLeftColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.06)' }}>
                    ✓ Clean statutory record. Zero discrepancies flagged.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION & DEMO ACCOUNTS */}
      {activeTab === 'subscription' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={s.subscriptionGrid}>
            <div className={s.planCardCurrent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={s.summaryItemLabel}>Active Subscription</span>
                <span className={s.badge} style={{ background: '#10b981', color: '#fff' }}>
                  {currentPlan.name}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{currentUser.businessName}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Billing Cycle: {currentUser.billingCycle.toUpperCase()} | Registered GSTIN: {currentUser.gstin || 'None'}
              </p>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <span className={s.summaryItemLabel}>Monthly Audit Quota</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {currentUser.quota.usedThisMonth} / {currentUser.quota.monthlyLimit} Audits
                </div>
              </div>
              <Link href="/pricing" className={`${ui.btn} ${ui.btnPrimary}`} style={{ textAlign: 'center', textDecoration: 'none' }}>
                View All Plans & Features
              </Link>
            </div>

            {/* Test Demo User Switcher */}
            <div className={s.demoSwitcher}>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>SaaS Account Switcher (Demo / Testing)</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Switch between different customer profiles to verify quota enforcement and tier features:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={s.sampleBtn}
                  onClick={() => authService.loginAsDemoUser('community_user')}
                >
                  Switch to Rajesh (Community Free — 5 limit)
                </button>
                <button
                  type="button"
                  className={s.sampleBtn}
                  onClick={() => authService.loginAsDemoUser('starter_user')}
                >
                  Switch to Tenzing (Starter AI — 100 limit)
                </button>
                <button
                  type="button"
                  className={s.sampleBtn}
                  onClick={() => authService.loginAsDemoUser('gstpixel_founder')}
                >
                  Switch to Ashis / GSTPIXEL (Enterprise — 2,500 limit)
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Staged Razorpay Simulation:</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={s.actionBtnSmall}
                    onClick={() => handleSimulatedUpgrade('starter')}
                  >
                    Simulate Starter (₹499)
                  </button>
                  <button
                    type="button"
                    className={s.actionBtnSmall}
                    onClick={() => handleSimulatedUpgrade('pro')}
                  >
                    Simulate Pro (₹1,499)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
