export interface BillingAccount {
  id: string;
  facility_id: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: string;
  payment_provider: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  account_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  account_id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice_number: string;
  due_date: string;
  created_at: string;
}

class BillingService {
  async getAccount(facilityId: string): Promise<BillingAccount | null> {
    // Mock implementation
    return {
      id: 'acc_' + facilityId,
      facility_id: facilityId,
      status: 'active',
      plan: 'basic',
      payment_provider: 'stripe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async getSubscriptions(accountId: string): Promise<Subscription[]> {
    // Mock implementation
    return [];
  }

  async getInvoices(accountId: string): Promise<Invoice[]> {
    // Mock implementation
    return [];
  }

  async createSubscription(accountId: string, planId: string): Promise<Subscription> {
    // Mock implementation
    return {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      account_id: accountId,
      plan_id: planId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };
  }

  async getBillingAccount(facilityId: string): Promise<BillingAccount | null> {
    return this.getAccount(facilityId);
  }
}

export const billingService = new BillingService();
