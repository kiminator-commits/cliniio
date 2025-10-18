import { create } from "zustand";
import { billingService, BillingAccount, Subscription, Invoice } from "@/services/billing/BillingService";

interface BillingState {
  account: BillingAccount | null;
  subscriptions: Subscription[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchBillingData: (facilityId: string) => Promise<void>;
  clearBillingData: () => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  account: null,
  subscriptions: [],
  invoices: [],
  loading: false,
  error: null,

  async fetchBillingData(facilityId: string) {
    if (!facilityId) return;
    set({ loading: true, error: null });
    try {
      const account = await billingService.getBillingAccount(facilityId);
      const subscriptions = await billingService.getSubscriptions(facilityId);
      const allInvoices: Invoice[] = [];
      for (const sub of subscriptions) {
        const inv = await billingService.getInvoices(sub.id);
        allInvoices.push(...inv);
      }
      set({ account, subscriptions, invoices: allInvoices, loading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  clearBillingData() {
    set({
      account: null,
      subscriptions: [],
      invoices: [],
      loading: false,
      error: null,
    });
  },
}));
