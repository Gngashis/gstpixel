/**
 * GSTPIXEL Indian Payment Integration — Razorpay Service
 *
 * Implements Razorpay subscriptions and one-time checkout architecture for Indian businesses.
 * STRICT SAFETY PROTOCOL:
 * - Operates in 'staging_simulation' mode by default.
 * - Live charges are strictly disabled (isLiveBillingActive: false).
 * - Live billing activation requires explicit founder authorization and live Razorpay credentials.
 */

import { SubscriptionTier, BillingCycle } from '../saas/types';
import { SAAS_PLANS, calculateTaxForPlan } from '../saas/plans';

export interface RazorpayCustomerDetails {
  name: string;
  email: string;
  contact: string;
  gstin?: string;
  businessName?: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise (e.g. ₹499 = 49900 paise)
  currency: 'INR';
  name: 'GSTPIXEL';
  description: string;
  image?: string;
  order_id?: string;
  subscription_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    tier: SubscriptionTier;
    billingCycle: BillingCycle;
    gstin?: string;
    businessName?: string;
  };
  theme: {
    color: '#10b981'; // GSTPIXEL Emerald Accent
  };
}

export interface CheckoutResult {
  success: boolean;
  paymentId?: string;
  subscriptionId?: string;
  signature?: string;
  isSimulated: boolean;
  error?: string;
}

export class RazorpayBillingService {
  // STRICT SAFETY GUARD: Always staging unless explicitly authorized by founder
  public static readonly IS_LIVE_BILLING_ACTIVE: boolean = false;
  public static readonly TEST_KEY_ID: string = 'rzp_test_gstpixel_stage';

  /**
   * Prepares complete order / subscription payload for a chosen SaaS tier.
   */
  public prepareSubscriptionOrder(
    tier: SubscriptionTier,
    billingCycle: BillingCycle,
    customer: RazorpayCustomerDetails
  ): {
    amountPaise: number;
    amountInr: number;
    taxBreakdown: { basePrice: number; gstAmount: number; totalWithGst: number };
    planId?: string;
    description: string;
  } {
    const plan = SAAS_PLANS[tier];
    const basePrice = billingCycle === 'annual' ? plan.annualPriceInr : plan.monthlyPriceInr;
    const tax = calculateTaxForPlan(basePrice);
    const amountPaise = Math.round(tax.totalWithGst * 100);

    const planId = billingCycle === 'annual' ? plan.razorpayPlanIdAnnual : plan.razorpayPlanIdMonthly;
    const description = `GSTPIXEL ${plan.name} (${billingCycle.toUpperCase()}) - Incl. 18% GST`;

    return {
      amountPaise,
      amountInr: tax.totalWithGst,
      taxBreakdown: tax,
      planId,
      description,
    };
  }

  /**
   * Safe execution of checkout. In staging mode, simulates successful authorization
   * without incurring any financial transaction.
   */
  public async launchCheckout(
    tier: SubscriptionTier,
    billingCycle: BillingCycle,
    customer: RazorpayCustomerDetails
  ): Promise<CheckoutResult> {
    const order = this.prepareSubscriptionOrder(tier, billingCycle, customer);

    if (!RazorpayBillingService.IS_LIVE_BILLING_ACTIVE) {
      // Safe Staged Simulation
      const simulatedPaymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const simulatedSubId = `sub_sim_${order.planId || 'community'}`;

      return {
        success: true,
        paymentId: simulatedPaymentId,
        subscriptionId: simulatedSubId,
        isSimulated: true,
      };
    }

    // Live mode requires founder authorization and injected window.Razorpay SDK
    return {
      success: false,
      isSimulated: false,
      error: 'Live Razorpay payments are currently disabled pending founder activation.',
    };
  }

  /**
   * Algorithmic verification of Razorpay webhook signatures using HMAC-SHA256.
   * Can be executed in edge environments (Cloudflare Workers / Web Crypto API) or Node.js.
   */
  public static async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    if (!payload || !signature || !secret) return false;

    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        const calculatedSignature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return calculatedSignature === signature;
      }
    } catch {
      return false;
    }

    return false;
  }
}

export const razorpayBillingService = new RazorpayBillingService();
