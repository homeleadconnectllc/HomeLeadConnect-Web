import { supabase } from "./client";

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

type BillingAccessResolution = BillingStatus & {
  workspace_id: string;
  recovered: boolean;
};

function withoutResolutionMetadata(value: BillingAccessResolution): BillingStatus {
  return {
    plan_key: value.plan_key,
    status: value.status,
    is_active: value.is_active,
    trial_end: value.trial_end,
    current_period_end: value.current_period_end,
    grace_period_end: value.grace_period_end,
    cancel_at_period_end: value.cancel_at_period_end,
  };
}

export async function getBillingStatus(): Promise<BillingStatus | null> {
  // Billing selection and stale-workspace recovery are intentionally resolved by one
  // membership-validated SECURITY DEFINER RPC. The browser never receives Stripe IDs and
  // never needs broader SELECT access to workspace_plan_status than the selected workspace.
  const { data, error } = await supabase.rpc("resolve_billing_workspace_access");
  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as BillingAccessResolution | null | undefined;
  return row ? withoutResolutionMetadata(row) : null;
}

export async function getBillingOffer(): Promise<BillingOffer> {
  const { data, error } = await supabase.from("plans")
    .select("key,name,price_cents,currency,interval")
    .eq("key", "hlc_v1")
    .eq("is_active", true)
    .single();
  if (error) throw error;
  if (!data || typeof data.price_cents !== "number" || data.price_cents <= 0) {
    throw new Error("The HomeLead Connect billing offer is not configured.");
  }
  if (data.interval !== "month" && data.interval !== "year") {
    throw new Error("The HomeLead Connect billing interval is invalid.");
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
