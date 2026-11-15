/**
 * GSTPIXEL SaaS Architecture Types
 */

export type SubscriptionTier = 'community' | 'starter' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanDetails {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPriceInr: number;
  annualPriceInr: number; // 2 months free discount
  invoiceLimitPerMonth: number;
  razorpayPlanIdMonthly?: string;
  razorpayPlanIdAnnual?: string;
  popular?: boolean;
  features: PlanFeature[];
}

export interface UserQuota {
  monthlyLimit: number;
  usedThisMonth: number;
  resetDate: string; // ISO date string
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  businessName: string;
  gstin?: string;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  quota: UserQuota;
  createdAt: string;
  isActive: boolean;
}

export interface StoredInvoiceRecord {
  id: string;
  userId: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierGstin: string;
  supplierName?: string;
  recipientGstin?: string;
  recipientName?: string;
  placeOfSupplyState?: string;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  auditStatus: 'COMPLIANT' | 'FLAGGED';
  issuesCount: number;
  issues: string[];
  rawTextSnippet: string;
  auditedAt: string;
}

export interface InvoiceFilter {
  status?: 'ALL' | 'COMPLIANT' | 'FLAGGED';
  searchQuery?: string;
}
