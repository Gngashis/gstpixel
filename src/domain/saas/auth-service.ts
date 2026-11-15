import { UserProfile, SubscriptionTier, BillingCycle } from './types';
import { SAAS_PLANS } from './plans';

const STORAGE_KEY_AUTH_USER = 'gstpixel_saas_user_v1';

export const DEMO_USERS: Record<string, UserProfile> = {
  community_user: {
    id: 'usr_comm_01',
    email: 'trader@jaigaonmarket.in',
    name: 'Rajesh Sharma',
    businessName: 'Jaigaon Hardware & Tools Store',
    gstin: '19AAACR1234Q1Z1',
    tier: 'community',
    billingCycle: 'monthly',
    quota: {
      monthlyLimit: 5,
      usedThisMonth: 2,
      resetDate: '2026-12-01T00:00:00Z',
    },
    createdAt: '2026-11-01T10:00:00Z',
    isActive: true,
  },
  starter_user: {
    id: 'usr_start_02',
    email: 'tea.export@himalayantraders.in',
    name: 'Tenzing Norbu',
    businessName: 'Himalayan Foothills Tea Traders',
    gstin: '19AAPFN4567M1ZR',
    tier: 'starter',
    billingCycle: 'monthly',
    quota: {
      monthlyLimit: 100,
      usedThisMonth: 34,
      resetDate: '2026-12-10T00:00:00Z',
    },
    createdAt: '2026-10-10T14:30:00Z',
    isActive: true,
  },
  gstpixel_founder: {
    id: 'usr_founder_00',
    email: 'ashis@gstpixel.com',
    name: 'Ashis Gurung',
    businessName: 'GSTPIXEL Business & Digital Solutions',
    gstin: '19AAACS8577K1ZM',
    tier: 'enterprise',
    billingCycle: 'annual',
    quota: {
      monthlyLimit: 2500,
      usedThisMonth: 12,
      resetDate: '2027-11-01T00:00:00Z',
    },
    createdAt: '2026-09-01T08:00:00Z',
    isActive: true,
  },
};

type AuthListener = (user: UserProfile) => void;

class AuthService {
  private currentUser: UserProfile;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.currentUser = DEMO_USERS.community_user;
    if (typeof window !== 'undefined') {
      this.restoreSession();
    }
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.tier) {
          this.currentUser = parsed;
        }
      }
    } catch {
      // Fallback to default
    }
  }

  private persistSession() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.currentUser));
      } catch {}
    }
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public async syncWithServer(): Promise<UserProfile> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${this.currentUser.id}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            this.currentUser = {
              ...this.currentUser,
              ...data.user,
              quota: {
                monthlyLimit: data.user.monthlyLimit || this.currentUser.quota.monthlyLimit,
                usedThisMonth: data.user.usedThisMonth || this.currentUser.quota.usedThisMonth,
                resetDate: data.user.resetDate || this.currentUser.quota.resetDate,
              },
            };
            this.persistSession();
          }
        }
      } catch {
        // Fallback to local session
      }
    }
    return this.currentUser;
  }

  public async loginAsDemoUser(demoKey: keyof typeof DEMO_USERS) {
    if (DEMO_USERS[demoKey]) {
      this.currentUser = { ...DEMO_USERS[demoKey] };
      this.persistSession();

      if (typeof window !== 'undefined') {
        try {
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ demoUser: demoKey }),
          });
        } catch {}
      }
    }
  }

  public updateProfile(updates: Partial<Pick<UserProfile, 'name' | 'businessName' | 'gstin'>>) {
    this.currentUser = {
      ...this.currentUser,
      ...updates,
    };
    this.persistSession();
  }

  public upgradeTier(tier: SubscriptionTier, billingCycle: BillingCycle = 'monthly') {
    const plan = SAAS_PLANS[tier];
    this.currentUser = {
      ...this.currentUser,
      tier,
      billingCycle,
      quota: {
        monthlyLimit: plan.invoiceLimitPerMonth,
        usedThisMonth: this.currentUser.quota.usedThisMonth,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    this.persistSession();
  }

  public recordInvoiceAuditUsage(): { success: boolean; error?: string } {
    if (this.currentUser.quota.usedThisMonth >= this.currentUser.quota.monthlyLimit) {
      return {
        success: false,
        error: `Monthly quota of ${this.currentUser.quota.monthlyLimit} audits reached. Upgrade your plan to continue auditing invoices.`,
      };
    }

    this.currentUser = {
      ...this.currentUser,
      quota: {
        ...this.currentUser.quota,
        usedThisMonth: this.currentUser.quota.usedThisMonth + 1,
      },
    };
    this.persistSession();
    return { success: true };
  }

  public resetQuotaForTest() {
    this.currentUser = {
      ...this.currentUser,
      quota: {
        ...this.currentUser.quota,
        usedThisMonth: 0,
      },
    };
    this.persistSession();
  }
}

export const authService = new AuthService();
