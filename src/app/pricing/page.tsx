'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SAAS_PLANS } from '@/domain/saas/plans';
import { SubscriptionTier, BillingCycle } from '@/domain/saas/types';
import { razorpayBillingService } from '@/domain/billing/razorpay-service';
import { authService } from '@/domain/saas/auth-service';
import { Arrow, Icon } from '@/components/ui';
import ui from '@/components/ui.module.css';
import s from './pricing.module.css';

function formatInr(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (tier === 'community') {
      authService.upgradeTier('community', cycle);
      setCheckoutNotice('You are now on the Community Free Plan (5 audits/month).');
      return;
    }

    const user = authService.getCurrentUser();
    const res = await razorpayBillingService.launchCheckout(tier, cycle, {
      name: user.name,
      email: user.email,
      contact: '9046520548',
      businessName: user.businessName,
      gstin: user.gstin,
    });

    if (res.isSimulated && res.success) {
      authService.upgradeTier(tier, cycle);
      setCheckoutNotice(
        `✓ [STAGING SIMULATION] Successfully enrolled in ${SAAS_PLANS[tier].name} (${cycle.toUpperCase()}). Razorpay Simulation ID: ${res.subscriptionId}. (No real charges incurred).`
      );
    }
  };

  const planOrder: SubscriptionTier[] = ['community', 'starter', 'pro', 'enterprise'];

  return (
    <main id="main">
      <div className={`wrap ${s.pricingContainer}`}>
        {/* Header */}
        <div className={s.header}>
          <div className="eyebrow">SaaS Compliance Platform / Indian Businesses</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0' }}>
            Transparent pricing for <em>flawless compliance.</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0 0 1.5rem' }}>
            Inspect invoices, detect Input Tax Credit (ITC) risks, verify GSTIN check digits, and eliminate tax head discrepancies before filing.
          </p>

          {/* Billing Cycle Toggle */}
          <div className={s.toggleContainer}>
            <button
              type="button"
              className={`${s.toggleButton} ${cycle === 'monthly' ? s.toggleButtonActive : ''}`}
              onClick={() => setCycle('monthly')}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`${s.toggleButton} ${cycle === 'annual' ? s.toggleButtonActive : ''}`}
              onClick={() => setCycle('annual')}
            >
              Annual Billing
            </button>
            <span className={s.discountPill}>Save 17% (2 Months Free)</span>
          </div>
        </div>

        {checkoutNotice && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontWeight: 600,
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          >
            {checkoutNotice}{' '}
            <Link href="/tools/invoice-audit" style={{ textDecoration: 'underline', marginLeft: '0.5rem' }}>
              Go to Invoice Auditor →
            </Link>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className={s.grid}>
          {planOrder.map((tier) => {
            const plan = SAAS_PLANS[tier];
            const price = cycle === 'annual' ? plan.annualPriceInr : plan.monthlyPriceInr;
            const isFree = price === 0;

            return (
              <div key={tier} className={`${s.planCard} ${plan.popular ? s.planCardPopular : ''}`}>
                {plan.popular && <span className={s.popularPill}>Most Popular</span>}

                <div>
                  <h3 className={s.planName}>{plan.name}</h3>
                  <p className={s.planTagline}>{plan.tagline}</p>
                </div>

                <div className={s.priceBlock}>
                  <span className={s.priceAmount}>{formatInr(price)}</span>
                  <span className={s.pricePeriod}>/{cycle === 'annual' ? 'year' : 'month'}</span>
                </div>
                <div className={s.taxNote}>
                  {isFree ? '100% Free Forever' : '+ 18% GST applicable (ITC claimable)'}
                </div>

                <ul className={s.featureList}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className={s.featureItem}>
                      <span className={feat.included ? s.featureCheck : s.featureCross}>
                        {feat.included ? '✓' : '✕'}
                      </span>
                      <span className={feat.highlight ? s.featureHighlight : undefined}>
                        {feat.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`${ui.btn} ${plan.popular ? ui.btnPrimary : ''} ${s.planCta}`}
                  onClick={() => handleSelectPlan(tier)}
                >
                  {isFree ? 'Start Free' : `Select ${plan.name}`} <Arrow />
                </button>
              </div>
            );
          })}
        </div>

        {/* Statutory Notice */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem 1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          <strong>Statutory Compliance Disclaimer:</strong> GSTPIXEL SaaS tools provide automated pre-filing compliance checks based on Section 16 of the Central Goods and Services Tax Act, 2017 and standard GSTN specifications. These algorithmic evaluations assist in identifying arithmetic and structural mismatches. They do not substitute for formal chartered accountant certification or legal representation before GST appellate authorities.
        </div>

        {/* FAQ Section */}
        <div className={s.faqSection}>
          <h2 className={s.faqTitle}>Frequently Asked Questions</h2>
          <div className={s.faqGrid}>
            <div className={s.faqItem}>
              <div className={s.faqQuestion}>Can I claim Input Tax Credit (ITC) on my GSTPIXEL subscription?</div>
              <div className={s.faqAnswer}>
                Yes. GSTPIXEL issues official B2B tax invoices with 18% GST (SAC code 998315 - Hosting & IT SaaS). Provide your GSTIN during checkout to receive automatic GSTR-2B reflection.
              </div>
            </div>
            <div className={s.faqItem}>
              <div className={s.faqQuestion}>What payment methods are supported?</div>
              <div className={s.faqAnswer}>
                We support all major Indian payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm), Corporate & Personal NetBanking, Credit/Debit cards (Visa, MasterCard, RuPay), and NEFT/RTGS for Enterprise accounts.
              </div>
            </div>
            <div className={s.faqItem}>
              <div className={s.faqQuestion}>How is my financial invoice data protected?</div>
              <div className={s.faqAnswer}>
                All invoice files and numbers are encrypted in transit and at rest. Mathematical validations run securely within your browser sandbox or isolated edge workers. We never sell or share transaction records.
              </div>
            </div>
            <div className={s.faqItem}>
              <div className={s.faqQuestion}>Can I switch plans or cancel at any time?</div>
              <div className={s.faqAnswer}>
                Yes, you can upgrade, downgrade, or cancel your subscription at any time with immediate effect. Unused days on monthly plans are credited towards upgraded tiers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
