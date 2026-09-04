import { chooseEntitledWorkspaceRecovery, hasVerifiedWorkspaceAccess } from "../lib/billing/workspaceRecovery";
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

const BILLING_STATUS_FIELDS = "workspace_id,plan_key,status,is_active,trial_end,current_period_end,grace_period_end,cancel_at_period_end";

type BillingStatusWithWorkspace = BillingStatus & { workspace_id: string };

function withoutWorkspaceId(value: BillingStatusWithWorkspace): BillingStatus {
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

async function recoverEntitledWorkspace(currentWorkspaceId: string): Promise<BillingStatus | null> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return null;

    const { data: memberships, error: membershipError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", authData.user.id);
    if (membershipError) return null;

    const workspaceIds = [...new Set((memberships || [])
      .map((membership) => membership.workspace_id as string | null)
      .filter((workspaceId): workspaceId is string => Boolean(workspaceId)))];
    if (workspaceIds.length < 2) return null;

    const { data: candidates, error: candidateError } = await supabase
      .from("workspace_plan_status")
      .select(BILLING_STATUS_FIELDS)
      .in("workspace_id", workspaceIds);
    if (candidateError) return null;

    const recovery = chooseEntitledWorkspaceRecovery(currentWorkspaceId, candidates || []);
    if (!recovery) return null;

    const selectedBilling = (candidates || []).find((candidate) => candidate.workspace_id === recovery.workspace_id) as BillingStatusWithWorkspace | undefined;
    if (!selectedBilling) return null;

    const { error: switchError } = await supabase.rpc("switch_current_workspace", {
      p_workspace_id: recovery.workspace_id,
    });
    if (switchError) return null;

    return withoutWorkspaceId(selectedBilling);
  } catch {
    return null;
  }
}

export async function getBillingStatus(): Promise<BillingStatus | null> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase.from("workspace_plan_status")
    .select(BILLING_STATUS_FIELDS)
    .eq("workspace_id", workspaceId).maybeSingle();
  if (error) throw error;

  const selectedBilling = data as BillingStatusWithWorkspace | null;
  if (selectedBilling && hasVerifiedWorkspaceAccess(selectedBilling)) {
    return withoutWorkspaceId(selectedBilling);
  }

  // A stale selected-workspace pointer may reference either a workspace with no billing row
  // or one with a non-entitled/inactive row. If exactly one other workspace the signed-in
  // user is actually a member of has webhook-confirmed trial, paid, or live grace access,
  // recover to that workspace through the membership-validated switch RPC. This is not an
  // owner bypass: ambiguous cases and customer workspaces without verified access remain gated.
  const recovered = await recoverEntitledWorkspace(workspaceId);
  if (recovered) return recovered;

  return selectedBilling ? withoutWorkspaceId(selectedBilling) : null;
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
