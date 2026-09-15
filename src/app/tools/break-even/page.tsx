import type { Metadata } from 'next';
import Link from 'next/link';
import { BreakEvenCalculator } from '@/features/business-calculator';
import s from '../../interior.module.css';

export const metadata: Metadata = {
  title: 'Break-even Calculator',
  description:
    'Estimate the whole units needed to cover fixed and variable costs using a selling price you enter.',
};

export default function BreakEvenPage() {
  return (
    <main id="main">
      <div className={`wrap ${s.toolWrap}`}>
        <nav className={s.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tools">Tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Break-even Calculator</span>
        </nav>
        <div className={s.toolHeading}>
          <div>
            <div className="eyebrow">Business / Free tool</div>
            <h1>
              Break-even, <em>made visible.</em>
            </h1>
            <p>
              Estimate how many units need to sell before the entered costs are covered.
              <br />Clear inputs. A whole-unit result.
            </p>
          </div>
          <span className={s.localLabel}>
            Calculated on your device
            <br />
            <small>No account required</small>
          </span>
        </div>
        <BreakEvenCalculator />
        <div className={s.toolNotes}>
          <section>
            <h2>How the calculation works</h2>
            <p><strong>Contribution per unit:</strong> selling price − variable cost per unit.</p>
            <p><strong>Break-even units:</strong> fixed costs ÷ contribution per unit, rounded up.</p>
            <p>A positive contribution per unit is required for a finite result.</p>
          </section>
          <section>
            <h2>Keep the estimate grounded</h2>
            <p>
              The estimate assumes a constant selling price and cost per unit. It does not account
              for tax, changing demand, mixed products or cash timing.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
