import { PlanDetails, SubscriptionTier } from './types';

export const GST_RATE_ON_SOFTWARE = 0.18; // 18% GST applies to SaaS subscriptions in India

export const SAAS_PLANS: Record<SubscriptionTier, PlanDetails> = {
  community: {
    id: 'community',
    name: 'Community Free',
    tagline: 'Essential compliance calculators for micro-enterprises and freelancers.',
    monthlyPriceInr: 0,
    annualPriceInr: 0,
    invoiceLimitPerMonth: 5,
    popular: false,
    features: [
      { name: '5 automated invoice audits per month', included: true },
      { name: 'GSTIN Mod-36 checksum verification', included: true },
      { name: 'Intra vs Inter-state tax head check (CGST/SGST vs IGST)', included: true },
      { name: 'GST Calculator & Break-even tools', included: true },
      { name: 'Export audit certificate (Print/PDF)', included: true },
      { name: 'Multi-GSTIN business tracking', included: false },
      { name: 'Bulk invoice batch processing', included: false },
      { name: 'Priority Chartered Accountant review routing', included: false },
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter AI',
    tagline: 'Ideal for small retail businesses, traders, and e-commerce sellers.',
    monthlyPriceInr: 499,
    annualPriceInr: 4990, // 2 months free
    invoiceLimitPerMonth: 100,
    razorpayPlanIdMonthly: 'plan_gstpixel_starter_499m',
    razorpayPlanIdAnnual: 'plan_gstpixel_starter_4990a',
    popular: true,
    features: [
      { name: '100 automated invoice audits per month', included: true, highlight: true },
      { name: 'LlamaCloud OCR document & PDF extraction', included: true },
      { name: 'OpenRouter AI statutory discrepancy reasoning', included: true },
      { name: 'Full Section 16 CGST compliance checks', included: true },
      { name: 'Export audit certificate & discrepancy report', included: true },
      { name: 'Saved invoice history & search', included: true },
      { name: 'Standard email support', included: true },
      { name: 'Priority Chartered Accountant review routing', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Business Pro',
    tagline: 'Comprehensive audit and reconciliation for growing companies.',
    monthlyPriceInr: 1499,
    annualPriceInr: 14990, // 2 months free
    invoiceLimitPerMonth: 500,
    razorpayPlanIdMonthly: 'plan_gstpixel_pro_1499m',
    razorpayPlanIdAnnual: 'plan_gstpixel_pro_14990a',
    popular: false,
    features: [
      { name: '500 automated invoice audits per month', included: true, highlight: true },
      { name: 'Bulk invoice batch processing', included: true },
      { name: 'GSTR-2B Input Tax Credit (ITC) reconciliation preview', included: true },
      { name: 'Multi-GSTIN multi-branch monitoring', included: true },
      { name: 'Advanced statutory risk scoring & HSN validation', included: true },
      { name: 'CSV & Excel export of reconciliation batches', included: true },
      { name: 'Fast priority support (<4h turnaround)', included: true },
      { name: 'Empanelled CA review routing', included: true },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise / CA Practice',
    tagline: 'Full-scale solution for CA firms, tax practitioners, and high-volume firms.',
    monthlyPriceInr: 3999,
    annualPriceInr: 39990, // 2 months free
    invoiceLimitPerMonth: 2500,
    razorpayPlanIdMonthly: 'plan_gstpixel_ent_3999m',
    razorpayPlanIdAnnual: 'plan_gstpixel_ent_39990a',
    popular: false,
    features: [
      { name: '2,500 automated invoice audits per month', included: true, highlight: true },
      { name: 'Multi-user team & staff access control', included: true },
      { name: 'Client portal with white-label audit reports', included: true },
      { name: 'Direct REST API webhook integration', included: true },
      { name: 'Dedicated Chartered Accountant consultation desk', included: true },
      { name: 'Custom SLA & 99.9% uptime guarantee', included: true },
      { name: 'Direct phone & WhatsApp support', included: true },
    ],
  },
};

/**
 * Calculates statutory 18% GST on subscription price.
 */
export function calculateTaxForPlan(priceInr: number): {
  basePrice: number;
  gstAmount: number;
  totalWithGst: number;
} {
  const gstAmount = Math.round(priceInr * GST_RATE_ON_SOFTWARE * 100) / 100;
  return {
    basePrice: priceInr,
    gstAmount,
    totalWithGst: Math.round((priceInr + gstAmount) * 100) / 100,
  };
}
