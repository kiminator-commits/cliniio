import { useCallback, useEffect } from "react";
import { useBillingStore } from "@/stores/useBillingStore";

export function useBillingData(facilityId: string) {
  const {
    account,
    subscriptions,
    invoices,
    loading,
    error,
    fetchBillingData,
    clearBillingData,
  } = useBillingStore();

  const reload = useCallback(async () => {
    await fetchBillingData(facilityId);
  }, [facilityId, fetchBillingData]);

  useEffect(() => {
    if (facilityId) reload();
    return () => clearBillingData();
  }, [facilityId, reload, clearBillingData]);

  return {
    account,
    subscriptions,
    invoices,
    loading,
    error,
    reload,
  };
}
