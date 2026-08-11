export type BillingAccessDecision = "allowed" | "subscription_required" | "verification_unavailable";

export function evaluateBillingAccess(input: {
  billingEnabled: boolean;
  pathname: string;
  isActive: boolean | null;
  verificationFailed: boolean;
}): BillingAccessDecision {
  if (!input.billingEnabled || input.pathname === "/settings") return "allowed";
  if (input.verificationFailed) return "verification_unavailable";
  return input.isActive ? "allowed" : "subscription_required";
}
