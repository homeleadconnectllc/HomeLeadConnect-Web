export type BillingAccessDecision = "allowed" | "subscription_required" | "verification_unavailable";
export type EntitlementState = "full_trial_preview" | "full_paid_access" | "limited_mode" | "membership_gate" | "verification_unavailable";

export type EntitlementInput = {
  billingEnabled: boolean;
  pathname: string;
  status?: string | null;
  isActive: boolean | null;
  trialEnd?: string | null;
  verificationFailed: boolean;
};

export function isBillingRecoveryPath(pathname: string) {
  return pathname === "/settings" || pathname === "/settings/billing";
}

function hasUnexpiredTrial(trialEnd?: string | null) {
  if (!trialEnd) return false;
  const expiresAt = Date.parse(trialEnd);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function resolveEntitlementState(input: EntitlementInput): EntitlementState {
  if (!input.billingEnabled) return "full_paid_access";
  if (input.verificationFailed) return "verification_unavailable";
  const status = String(input.status || "").toLowerCase();
  if (status === "trialing" && input.isActive && hasUnexpiredTrial(input.trialEnd)) return "full_trial_preview";
  if (status === "active" && input.isActive) return "full_paid_access";
  if (status === "past_due" && input.isActive) return "limited_mode";
  if (input.isActive && status !== "trialing") return "limited_mode";
  return "membership_gate";
}

export function evaluateBillingAccess(input: EntitlementInput): BillingAccessDecision {
  if (isBillingRecoveryPath(input.pathname)) return "allowed";
  const state = resolveEntitlementState(input);
  if (state === "verification_unavailable") return "verification_unavailable";
  return state === "membership_gate" ? "subscription_required" : "allowed";
}
