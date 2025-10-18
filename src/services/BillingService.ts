import { supabase } from "@/lib/supabaseClient";
// import Stripe from "stripe";

// Mock Stripe for development
const Stripe = class {
  constructor(secret: string, options: { apiVersion: string }) {
    // Mock implementation
  }
  
  customers = {
    retrieve: async (id: string) => ({ id, email: 'test@example.com' }),
    create: async (data: any) => ({ id: 'cus_test', ...data })
  };
  
  subscriptions = {
    list: async (params: any) => ({ data: [], has_more: false }),
    create: async (params: any) => ({ id: 'sub_test', ...params })
  };
};

const stripeSecret = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;

export interface BillingAccount {
  id: string;
  facility_id: string;
  billing_name?: string;
  billing_email?: string;
  payment_provider?: string;
  payment_provider_id?: string; // Stripe customer ID
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  facility_id: string;
  billing_account_id: string;
  plan_name: string;
  plan_tier: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at?: string;
  updated_at?: string;
  payment_provider_id?: string; // Stripe subscription ID
}

export interface Invoice {
  id: string;
  facility_id: string;
  subscription_id: string;
  invoice_number?: string;
  amount: number;
  currency?: string;
  status: string;
  issued_at?: string;
  paid_at?: string | null;
  payment_provider_id?: string; // Stripe invoice ID
}

class BillingService {
  private accountCache = new Map<string, BillingAccount>();
  private subscriptionCache = new Map<string, Subscription[]>();
  private invoiceCache = new Map<string, Invoice[]>();

  // 🧩 Create or retrieve a Stripe Customer, then sync Supabase
  async ensureStripeCustomer(account: BillingAccount): Promise<BillingAccount> {
    if (!stripe) throw new Error("Stripe not configured");

    let customer;
    if (account.payment_provider_id) {
      customer = await stripe.customers.retrieve(account.payment_provider_id);
    } else {
      customer = await stripe.customers.create({
        email: account.billing_email,
        name: account.billing_name,
        metadata: { facility_id: account.facility_id },
      });

      account.payment_provider = "stripe";
      account.payment_provider_id = customer.id;
      await this.upsertBillingAccount(account);
    }
    return account;
  }

  // 🔹 Supabase read/write
  async getBillingAccount(facilityId: string): Promise<BillingAccount | null> {
    if (this.accountCache.has(facilityId)) return this.accountCache.get(facilityId)!;

    const { data, error } = await supabase
      .from("billing_accounts")
      .select("*")
      .eq("facility_id", facilityId)
      .single();

    if (error && error.code !== "PGRST116") throw new Error(error.message);
    if (data) this.accountCache.set(facilityId, data);
    return data ?? null;
  }

  async upsertBillingAccount(account: BillingAccount): Promise<void> {
    const { error } = await supabase
      .from("billing_accounts")
      .upsert(account, { onConflict: "facility_id" });

    if (error) throw new Error(error.message);
    this.accountCache.set(account.facility_id, account);
  }

  // 🧠 Stripe-ready subscription creation
  async createSubscription(
    facilityId: string,
    priceId: string
  ): Promise<Subscription> {
    if (!stripe) throw new Error("Stripe not configured");

    const account = await this.getBillingAccount(facilityId);
    if (!account || !account.payment_provider_id) {
      throw new Error("No Stripe customer linked to this facility.");
    }

    const subscription = await stripe.subscriptions.create({
      customer: account.payment_provider_id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: { facility_id: facilityId },
    });

    const newSub: Subscription = {
      id: crypto.randomUUID(),
      facility_id: facilityId,
      billing_account_id: account.id,
      plan_name: priceId,
      plan_tier: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      payment_provider_id: subscription.id,
    };

    await supabase.from("subscriptions").upsert(newSub);
    return newSub;
  }

  async getSubscriptions(facilityId: string): Promise<Subscription[]> {
    if (this.subscriptionCache.has(facilityId))
      return this.subscriptionCache.get(facilityId)!;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("facility_id", facilityId);

    if (error) throw new Error(error.message);
    this.subscriptionCache.set(facilityId, data ?? []);
    return data ?? [];
  }

  async getInvoices(subscriptionId: string): Promise<Invoice[]> {
    if (this.invoiceCache.has(subscriptionId))
      return this.invoiceCache.get(subscriptionId)!;

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("subscription_id", subscriptionId);

    if (error) throw new Error(error.message);
    this.invoiceCache.set(subscriptionId, data ?? []);
    return data ?? [];
  }

  // 🔹 Stripe-aware invoice payment update
  async markInvoicePaid(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", invoiceId);

    if (error) throw new Error(error.message);
    for (const [subId, list] of this.invoiceCache.entries()) {
      const idx = list.findIndex((i) => i.id === invoiceId);
      if (idx !== -1) {
        list[idx].status = "paid";
        list[idx].paid_at = new Date().toISOString();
      }
    }
  }

  clearCache(): void {
    this.accountCache.clear();
    this.subscriptionCache.clear();
    this.invoiceCache.clear();
  }
}

export const billingService = new BillingService();
