import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getBillingStatus, type BillingStatus } from "../api/billing";
import { evaluateBillingAccess, resolveEntitlementState } from "../lib/billing/entitlement";
import { errorMessage } from "../lib/errorMessage";
import { resolveActiveWorkspaceRole, resolveUserDestination, type HlcDestination } from "../lib/accessDestination";
import { canAccessWorkspacePath, type InternalRole } from "../lib/accessPolicy";

type WorkspaceResolution = {
  userId: string;
  destination: HlcDestination | null;
  role: InternalRole | null;
  billing: BillingStatus | null;
  billingError: boolean;
  accessError: string;
};

function trialDaysRemaining(trialEnd: string | null | undefined) {
  if (!trialEnd) return null;
  const expiresAt = Date.parse(trialEnd);
  if (!Number.isFinite(expiresAt)) return null;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 86_400_000));
}

export default function WorkspaceLayout() {
  const { session } = useAuth();
  const [resolution, setResolution] = useState<WorkspaceResolution | null>(null);
  const location = useLocation();
  const billingEnabled = import.meta.env.VITE_BILLING_ENABLED === "true";

  useEffect(() => {
    if (!session) return;
    let active = true;
    const userId = session.user.id;

    Promise.all([
      resolveUserDestination(userId),
      resolveActiveWorkspaceRole(userId),
      billingEnabled
        ? getBillingStatus().then((status) => ({ status, error: null })).catch((reason: unknown) => ({ status: null, error: reason }))
        : Promise.resolve({ status: null, error: null }),
    ]).then(([destination, role, billingResult]) => {
      if (!active) return;
      setResolution({
        userId,
        destination,
        role,
        billing: billingResult.status,
        billingError: Boolean(billingResult.error),
        accessError: "",
      });
    }).catch((reason: unknown) => {
      if (!active) return;
      setResolution({ userId, destination: null, role: null, billing: null, billingError: false, accessError: errorMessage(reason, "Unable to verify workspace access.") });
    });

    return () => { active = false; };
  }, [session, billingEnabled]);

  if (!session || !resolution || resolution.userId !== session.user.id) return <main style={{ padding: 32 }}><p>Checking workspace access…</p></main>;
  if (resolution.accessError) return <main style={{ padding: 32 }}><h1>Workspace access unavailable</h1><p role="alert">{resolution.accessError}</p><p>Try again after the connection is restored. No workspace access decision was changed.</p></main>;
  if (resolution.destination !== "/dashboard") return <Navigate to={resolution.destination || "/portal/accept"} replace />;
  if (!resolution.role) return <main style={{ padding: 32 }}><h1>Internal access not assigned</h1><p role="alert">This account has workspace membership but no recognized HomeLead Connect internal role for the selected workspace.</p><p>Customer and provider accounts should use their assigned portal. Internal access requires an owner, manager, or technician membership role.</p></main>;
  if (!canAccessWorkspacePath(resolution.role, location.pathname)) return <main style={{ padding: 32 }}><h1>Access restricted</h1><p role="alert">Your HomeLead Connect role does not allow this area.</p><p>This page is limited to authorized internal roles and cannot be opened by direct URL.</p><Link to="/dashboard">Return to Dashboard</Link></main>;

  const entitlementInput = {
    billingEnabled,
    pathname: location.pathname,
    status: resolution.billing?.status ?? null,
    isActive: resolution.billing?.is_active ?? null,
    trialEnd: resolution.billing?.trial_end ?? null,
    verificationFailed: resolution.billingError,
  };
  const billingDecision = evaluateBillingAccess(entitlementInput);
  const entitlementState = resolveEntitlementState(entitlementInput);
  const daysRemaining = trialDaysRemaining(resolution.billing?.trial_end);

  if (billingDecision === "verification_unavailable") return <main style={{ padding: 32 }}><h1>Billing status unavailable</h1><p role="alert">HomeLead Connect could not verify this workspace’s subscription state. Access was not classified as inactive.</p><Link to="/settings">Open billing settings</Link></main>;
  if (billingDecision === "subscription_required") return <main style={{padding:32}}><h1>Subscription required</h1><p>This workspace does not currently have an active trial, paid subscription, or payment-recovery grace period.</p><Link to="/settings/billing">Review billing</Link></main>;

  return <>
    {entitlementState === "full_trial_preview" && <aside className="hlc-entitlement-banner is-trial" role="status">
      <strong>FULL TRIAL PREVIEW</strong>
      <span>{daysRemaining === null ? "Your 14-day trial is active." : `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining in your 14-day trial.`} Saved work and history remain attached to this workspace when the trial ends. Existing records remain preserved.</span>
    </aside>}
    {entitlementState === "limited_mode" && <aside className="hlc-entitlement-banner is-limited" role="status"><strong>LIMITED MODE</strong><span>Stripe reports a payment-recovery or unrecognized active state. Existing records remain preserved; review billing before relying on premium capabilities.</span><Link to="/settings/billing">Resolve billing</Link></aside>}
    <Outlet />
  </>;
}
