import { create } from 'zustand';
import { BillingAccount, Subscription, Invoice } from '@/services/billing/BillingService';

interface BillingState {
  account: BillingAccount | null;
  subscriptions: Subscription[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  setAccount: (account: BillingAccount | null) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchBillingData: (facilityId: string) => Promise<void>;
  clearBillingData: () => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  account: null,
  subscriptions: [],
  invoices: [],
  loading: false,
  error: null,
  setAccount: (account) => set({ account }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setInvoices: (invoices) => set({ invoices }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  fetchBillingData: async (_facilityId: string) => {
    set({ loading: true, error: null });
    try {
      // Mock implementation
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch billing data',
        loading: false 
      });
    }
  },
  
  clearBillingData: () => set({ 
    account: null, 
    subscriptions: [], 
    invoices: [], 
    error: null 
  }),
}));
