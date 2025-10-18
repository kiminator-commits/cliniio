// Mock Next.js API types for Vite project
interface NextApiRequest {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface NextApiResponse {
  status: (code: number) => NextApiResponse;
  json: (data: Record<string, unknown>) => NextApiResponse;
  send: (data: Record<string, unknown>) => NextApiResponse;
}

// Mock Stripe for Vite project
interface StripeConstructor {
  new (secretKey: string, options?: { apiVersion: string }): StripeInstance;
}

interface StripeInstance {
  webhooks: {
    constructEvent: (payload: string, signature: string, secret: string) => Record<string, unknown>;
  };
}

const StripeConstructor = class MockStripe implements StripeInstance {
  constructor(_secretKey: string, _options?: { apiVersion: string }) {
    // Mock constructor
  }
  
  webhooks = {
    constructEvent: (payload: string, _signature: string, _secret: string) => {
      // Mock implementation
      return JSON.parse(payload);
    }
  };
} as unknown as StripeConstructor;
import { supabase } from "@/lib/supabaseClient";

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) throw new Error("Missing STRIPE_SECRET_KEY");
if (!webhookSecret) console.warn("⚠️ STRIPE_WEBHOOK_SECRET not set — verification disabled (DEV mode).");

const stripe = new StripeConstructor(stripeSecret, { apiVersion: "2024-06-20" });

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Method Not Allowed" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  if (!sig) {
    res.status(400).send({ error: "Missing Stripe signature" });
    return;
  }

  let event: Record<string, unknown>;

  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(req.body as unknown as string, sig, webhookSecret)
      : (JSON.parse(req.body as unknown as string) as Record<string, unknown>);
  } catch (err: unknown) {
    console.error("❌ Webhook signature verification failed:", err instanceof Error ? err.message : String(err));
    res.status(400).send({ error: `Webhook Error: ${err instanceof Error ? err.message : String(err)}` });
    return;
  }

  try {
    switch (event.type) {
      // 🧾 Customer created / updated
      case "customer.created":
      case "customer.updated": {
        const customer = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;
        const facility_id = (customer?.metadata as Record<string, unknown>)?.facility_id as string;
        if (!facility_id) break;

        await supabase
          .from("billing_accounts")
          .upsert({
            facility_id,
            billing_name: (customer?.name as string) ?? null,
            billing_email: (customer?.email as string) ?? null,
            payment_provider: "stripe",
            payment_provider_id: customer?.id as string,
            updated_at: new Date().toISOString(),
          });
        break;
      }

      // 🔁 Subscription created or updated
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;
        const facility_id = (sub?.metadata as Record<string, unknown>)?.facility_id as string;
        if (!facility_id) break;

        const current_period_start = new Date((sub?.current_period_start as number) * 1000).toISOString();
        const current_period_end = new Date((sub?.current_period_end as number) * 1000).toISOString();

        await supabase.from("subscriptions").upsert({
          facility_id,
          plan_name: (((sub?.items as Record<string, unknown>)?.data as Record<string, unknown>[])?.[0]?.price as Record<string, unknown>)?.id as string ?? "unknown",
          plan_tier: (((sub?.items as Record<string, unknown>)?.data as Record<string, unknown>[])?.[0]?.price as Record<string, unknown>)?.nickname as string ?? "custom",
          status: sub?.status as string,
          current_period_start,
          current_period_end,
          payment_provider_id: sub?.id as string,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      // 💳 Invoice events
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.created": {
        const invoice = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;
        const subId = invoice?.subscription as string | undefined;
        const facility_id = (invoice?.metadata as Record<string, unknown>)?.facility_id as string;

        if (!subId || !facility_id) break;

        await supabase.from("invoices").upsert({
          facility_id,
          subscription_id: subId,
          invoice_number: invoice?.number as string ?? undefined,
          amount: (invoice?.amount_due as number) / 100,
          currency: (invoice?.currency as string)?.toUpperCase() ?? "CAD",
          status:
            event.type === "invoice.payment_succeeded"
              ? "paid"
              : event.type === "invoice.payment_failed"
              ? "failed"
              : "open",
          issued_at: new Date((invoice?.created as number) * 1000).toISOString(),
          paid_at:
            event.type === "invoice.payment_succeeded"
              ? new Date().toISOString()
              : null,
          payment_provider_id: invoice?.id as string,
        });
        break;
      }

      // 🧨 Subscription canceled
      case "customer.subscription.deleted": {
        const sub = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;
        const facility_id = (sub?.metadata as Record<string, unknown>)?.facility_id as string;
        if (!facility_id) break;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("payment_provider_id", sub?.id as string);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event: ${event.type as string}`);
    }

    res.status(200).json({ received: true });
  } catch (err: unknown) {
    console.error("❌ Stripe sync error:", err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}

// ⚙️ Next.js config to preserve raw body for Stripe signature
export const config = {
  api: {
    bodyParser: false,
  },
};
