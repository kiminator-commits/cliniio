import { useEffect } from "react";
import { useBillingData } from "@/hooks/useBillingData";
import { useToast } from "@/components/ui/use-toast";

export default function BillingSettingsTab({ facilityId }: { facilityId: string }) {
  const { account, subscriptions: _subscriptions, invoices, loading, error, reload } = useBillingData(facilityId);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Billing Sync Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const paid = invoices.find((i) => i.status === "paid");
    if (paid) {
      toast({
        title: "Payment Received",
        description: `Invoice #${paid.invoice_number || paid.id.slice(0, 8)} marked as paid.`,
      });
    }
  }, [invoices, toast]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading billing info...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold">Billing Overview</h2>
      {account ? (
        <p className="text-sm text-muted-foreground">
          Connected to <strong>{account.payment_provider}</strong>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No billing account found.</p>
      )}

      <button
        onClick={reload}
        className="text-sm text-blue-600 underline hover:text-blue-800 mt-3"
      >
        Refresh Billing Data
      </button>
    </div>
  );
}
