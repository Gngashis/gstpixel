import type { Metadata } from 'next';
import Link from 'next/link';
import { ProfitCalculator } from '@/features/business-calculator';
import s from '../../interior.module.css';

export const metadata: Metadata = {
  title: 'Profit, Margin & Markup Calculator',
  description:
    'Compare revenue and costs to calculate profit, profit margin and markup using amounts you enter.',
};

export default function ProfitMarginPage() {
  return (
    <main id="main">
      <div className={`wrap ${s.toolWrap}`}>
        <nav className={s.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tools">Tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Profit & Margin Calculator</span>
        </nav>
        <div className={s.toolHeading}>
          <div>
            <div className="eyebrow">Business / Free tool</div>
            <h1>
              Profit, <em>made clear.</em>
            </h1>
            <p>
              Compare revenue with costs and see profit, margin and markup.
              <br />Two amounts. Three useful views.
            </p>
          </div>
          <span className={s.localLabel}>
            Calculated on your device
            <br />
            <small>No account required</small>
          </span>
        </div>
        <ProfitCalculator />
        <div className={s.toolNotes}>
          <section>
            <h2>How the calculation works</h2>
            <p><strong>Profit:</strong> revenue − total costs.</p>
            <p><strong>Profit margin:</strong> profit ÷ revenue × 100.</p>
            <p><strong>Markup:</strong> profit ÷ total costs × 100.</p>
          </section>
          <section>
            <h2>Choose consistent amounts</h2>
            <p>
              Compare figures from the same period and decide which costs belong in your estimate.
              The calculator does not assess tax, cash flow or business viability.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
