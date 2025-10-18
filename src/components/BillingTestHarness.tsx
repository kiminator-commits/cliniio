"use client";
import { useEffect } from "react";
import { useBillingData } from "@/hooks/useBillingData";

export default function BillingTestHarness() {
  // Replace with an actual facility_id
  const facilityId = "00000000-0000-0000-0000-000000000000";
  const { account, subscriptions, invoices, loading, error, reload: _reload } = useBillingData(facilityId);

  useEffect(() => {
    if (!loading && !error) {
      console.group("💳 Billing Data");
      console.log("Account:", account);
      console.log("Subscriptions:", subscriptions);
      console.log("Invoices:", invoices);
      console.groupEnd();
    }
  }, [account, subscriptions, invoices, loading, error]);

  if (error) console.error("Billing error:", error);
  if (loading) console.log("Loading billing data…");

  return null; // silent background harness
}
