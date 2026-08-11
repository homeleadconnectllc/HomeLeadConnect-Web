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

export async function getBillingStatus(): Promise<BillingStatus | null> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase.from("workspace_plan_status")
    .select("plan_key,status,is_active,trial_end,current_period_end,grace_period_end,cancel_at_period_end")
    .eq("workspace_id", workspaceId).maybeSingle();
  if (error) throw error;
  return data as BillingStatus | null;
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
