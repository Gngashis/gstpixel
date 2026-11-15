import type { Metadata } from 'next';
import Link from 'next/link';
import { InvoiceManager } from '@/features/invoice-manager/invoice-manager';
import { TextLink } from '@/components/ui';
import s from '../../interior.module.css';

export const metadata: Metadata = {
  title: 'GST Invoice & Compliance Auditor',
  description:
    'Audit Indian GST invoices against statutory requirements: GSTIN verification, Luhn checksums, tax head consistency, and mathematical totals reconciliation.',
};

export default function InvoiceAuditPage() {
  return (
    <main id="main">
      <div className={`wrap ${s.toolWrap}`}>
        <nav className={s.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tools">Tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Invoice Auditor</span>
        </nav>

        <div className={s.toolHeading}>
          <div>
            <div className="eyebrow">Tax & compliance / SaaS Suite</div>
            <h1>
              GST Invoice & SaaS Manager, <em>verified.</em>
            </h1>
            <p>
              Inspect invoices for statutory compliance before claiming Input Tax Credit (ITC).
              <br />
              Audit, archive, and manage your invoices with customer account quotas and discrepancy reports.
            </p>
          </div>
          <span className={s.localLabel}>
            Audited & Archived Securely
            <br />
            <small>Database & Quota Backed</small>
          </span>
        </div>

        <InvoiceManager />

        <div className={s.toolNotes}>
          <section>
            <h2>How the audit works</h2>
            <p>
              <strong>GSTIN Checksum:</strong> Verifies the 15-character GSTIN against state codes, PAN entity type, and the official Luhn Mod-36 checksum algorithm.
            </p>
            <p>
              <strong>Jurisdiction Check:</strong> Reconciles supplier location and place of supply to ensure intra-state supplies levy CGST + SGST/UTGST, and inter-state supplies levy IGST.
            </p>
            <p>
              <strong>Arithmetic Invariant:</strong> Validates line item taxable amounts and tax calculations against declared invoice grand totals.
            </p>
          </section>
          <section>
            <h2>Need professional review?</h2>
            <p>
              Mathematical verification confirms arithmetic and structural consistency. ITC admissibility, classification, and tax liability require formal professional verification.
            </p>
            <TextLink href="/services/gst">Explore GST advisory</TextLink>
          </section>
        </div>
      </div>
    </main>
  );
}
