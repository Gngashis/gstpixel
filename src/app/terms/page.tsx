import type { Metadata } from 'next';
import Link from 'next/link';
import s from '../interior.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service | GSTPIXEL',
  description:
    'GSTPIXEL Terms of Service. Commercial terms, subscription billing, statutory disclaimer, and limitation of liability.',
};

export default function TermsPage() {
  return (
    <main id="main">
      <div className={`wrap ${s.toolWrap}`}>
        <nav className={s.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Terms of Service</span>
        </nav>

        <div className={s.toolHeading}>
          <div>
            <div className="eyebrow">Commercial Terms / Legal Agreement</div>
            <h1>
              Terms of Service & <em>Statutory Notice.</em>
            </h1>
            <p>
              Last updated: 15 November 2026. Please review these terms carefully before utilizing GSTPIXEL tools or subscribing to SaaS tiers.
            </p>
          </div>
        </div>

        <div className={s.toolNotes} style={{ marginTop: '2rem' }}>
          <section>
            <h2>1. Statutory Demarcation & Professional CA Advice</h2>
            <p style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderLeft: '4px solid #10b981' }}>
              <strong>IMPORTANT STATUTORY NOTICE:</strong> GSTPIXEL tools, automated invoice audits, and AI advisory summaries provide computational pre-filing evaluations based on statutory specifications under Section 16 of the Central Goods and Services Tax Act, 2017. <strong>These automated checks do not constitute formal legal opinion or substitute for chartered accountant certification.</strong> For representation before GST appellate authorities, assessment scrutiny, or statutory filings, businesses should consult an empanelled Chartered Accountant (CA) or authorized GST Practitioner.
            </p>
          </section>

          <section>
            <h2>2. Subscription Tiers & Billing</h2>
            <p>
              GSTPIXEL offers Community (Free), Starter AI (₹499/mo), Business Pro (₹1,499/mo), and Enterprise (₹3,999/mo) plans. All commercial subscriptions are subject to 18% Goods and Services Tax (SAC Code 998315). Subscriptions recur automatically on a monthly or annual cycle unless cancelled prior to renewal.
            </p>
          </section>

          <section>
            <h2>3. Payment Processing & Invoicing</h2>
            <p>
              Payments are securely authorized through Razorpay. GSTPIXEL issues compliant tax invoices for all subscription payments, enabling registered Indian business entities to claim Input Tax Credit (ITC) on their subscription fees.
            </p>
          </section>

          <section>
            <h2>4. Quota Enforcement & Fair Usage</h2>
            <p>
              Each subscription tier carries a predetermined monthly invoice audit allocation. Unused quota does not roll over to subsequent billing cycles. Reverse engineering, bulk scraping, or automated abuse designed to bypass plan limitations is strictly prohibited.
            </p>
          </section>

          <section>
            <h2>5. Limitation of Liability</h2>
            <p>
              While GSTPIXEL strives for 100% mathematical and statutory accuracy matching GSTN specifications, tax laws are subject to dynamic CBIC circulars and regional judicial rulings. Users remain solely responsible for the legal accuracy of their final tax filings. GSTPIXEL and its operators shall not be liable for penalties, interest, or lost input tax credit resulting from inaccurate filing decisions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
