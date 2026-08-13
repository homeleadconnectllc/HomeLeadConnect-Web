import { getCurrentWorkspaceId, supabase } from "./client";

export type BillingStatus = {
  plan_key: string;
  status: string;
  is_active: boolean;
  trial_end: string | null;
  current_period_end: string | null;
  grace_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type BillingOffer = {
  key: string;
  name: string;
  price_cents: number;
  currency: string;
  interval: "month" | "year";
};

export async function getBillingStatus(): Promise<BillingStatus | null> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase.from("workspace_plan_status")
    .select("plan_key,status,is_active,trial_end,current_period_end,grace_period_end,cancel_at_period_end")
    .eq("workspace_id", workspaceId).maybeSingle();
  if (error) throw error;
  return data as BillingStatus | null;
}

export async function getBillingOffer(): Promise<BillingOffer> {
  const { data, error } = await supabase.from("plans")
    .select("key,name,price_cents,currency,interval")
    .eq("key", "hlc_v1")
    .eq("is_active", true)
    .single();
  if (error) throw error;
  if (!data || typeof data.price_cents !== "number" || data.price_cents <= 0) {
    throw new Error("The HLC billing offer is not configured.");
  }
  if (data.interval !== "month" && data.interval !== "year") {
    throw new Error("The HLC billing interval is invalid.");
  }
  return data as BillingOffer;
}

export async function startSubscriptionCheckout() {
  const { data, error } = await supabase.functions.invoke("stripe-checkout-session", { body: {
    acceptedTerms: true,
    disclosureVersion: "pa-v1-2026-08-10",
    clientRequestId: crypto.randomUUID(),
  } });
  if (error) throw error;
  if (!data?.url) throw new Error("Stripe Checkout is unavailable.");
  window.location.assign(data.url as string);
}

export async function openBillingPortal() {
  const { data, error } = await supabase.functions.invoke("stripe-billing-portal", { body: {} });
  if (error) throw error;
  if (!data?.url) throw new Error("Stripe billing management is unavailable.");
  window.location.assign(data.url as string);
}
