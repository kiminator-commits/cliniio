import { useState, useEffect, useCallback } from "react";
import { billingService, BillingAccount, Subscription, Invoice } from "@/services/billing/BillingService";

export function useBilling(facilityId: string) {
  const [account, setAccount] = useState<BillingAccount | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBillingData = useCallback(async () => {
    if (!facilityId) return;
    setLoading(true);
    try {
      const acc = await billingService.getBillingAccount(facilityId);
      const subs = await billingService.getSubscriptions(facilityId);
      const allInvoices: Invoice[] = [];
      for (const sub of subs) {
        const inv = await billingService.getInvoices(sub.id);
        allInvoices.push(...inv);
      }
      setAccount(acc);
      setSubscriptions(subs);
      setInvoices(allInvoices);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  return {
    account,
    subscriptions,
    invoices,
    loading,
    error,
    reload: loadBillingData,
  };
}
