import type { Metadata } from 'next';
import Link from 'next/link';
import s from '../interior.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | GSTPIXEL',
  description:
    'GSTPIXEL Privacy Policy adhering to the Digital Personal Data Protection (DPDP) Act, 2023. Information on data processing, encryption, and financial privacy.',
};

export default function PrivacyPage() {
  return (
    <main id="main">
      <div className={`wrap ${s.toolWrap}`}>
        <nav className={s.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Privacy Policy</span>
        </nav>

        <div className={s.toolHeading}>
          <div>
            <div className="eyebrow">Legal & Compliance / DPDP Act 2023</div>
            <h1>
              Privacy & Financial <em>Data Protection.</em>
            </h1>
            <p>
              Last updated: 15 November 2026. How GSTPIXEL safeguards your tax documents, business records, and customer privacy.
            </p>
          </div>
        </div>

        <div className={s.toolNotes} style={{ marginTop: '2rem' }}>
          <section>
            <h2>1. Commitment to Financial Privacy</h2>
            <p>
              GSTPIXEL (&quot;gstpixel.com&quot;, &quot;we&quot;, &quot;us&quot;) operates as a business compliance and tax technology platform. We treat all invoice records, GSTIN numbers, financial amounts, and tax filings as strictly confidential business data under the Indian Digital Personal Data Protection Act, 2023.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>
              <strong>Customer Account Data:</strong> Business name, authorized contact name, email address, telephone number, and Goods and Services Tax Identification Number (GSTIN).
            </p>
            <p>
              <strong>Invoice & Transaction Data:</strong> Document images, OCR extractions, supplier/recipient GSTINs, HSN/SAC codes, and line-item tax distributions uploaded for statutory pre-filing validation.
            </p>
            <p>
              <strong>Payment Information:</strong> Subscription transactions are processed via Razorpay. We never store credit card numbers, CVVs, or UPI PINs on our servers.
            </p>
          </section>

          <section>
            <h2>3. How Your Data Is Processed</h2>
            <p>
              <strong>Algorithmic Validation:</strong> Mathematical cross-checks (e.g. Luhn Mod-36 checksums, tax head allocations, and line-item arithmetic) run securely in sandboxed server environments or client-side execution.
            </p>
            <p>
              <strong>Zero Data Selling:</strong> We never sell, monetize, or license your transaction data, vendor relationships, or financial turnover to third-party advertisers or financial brokers.
            </p>
          </section>

          <section>
            <h2>4. Encryption & Security Standards</h2>
            <p>
              All data transmitted to GSTPIXEL is secured via TLS 1.3 encryption. Stored invoice records and customer archives are encrypted at rest with AES-256 standards. Edge processing occurs across Cloudflare&apos;s secured infrastructure.
            </p>
          </section>

          <section>
            <h2>5. Your Rights & Data Erasure</h2>
            <p>
              Under the DPDP Act 2023, you retain full rights to request an export of your stored audit history or demand permanent deletion of your customer account and uploaded invoices. You can delete individual invoice records directly from your dashboard or email <code>privacy@gstpixel.com</code>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
