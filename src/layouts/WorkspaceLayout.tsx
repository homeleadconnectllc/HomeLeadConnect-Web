import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getBillingStatus, type BillingStatus } from "../api/billing";
import { evaluateBillingAccess } from "../lib/billing/entitlement";
import { errorMessage } from "../lib/errorMessage";
import { resolveUserDestination, type HlcDestination } from "../lib/accessDestination";
import { canAccessWorkspacePath, normalizeInternalRole, type InternalRole } from "../lib/accessPolicy";
import { supabase } from "../lib/supabase";

type WorkspaceResolution = {
  userId: string;
  destination: HlcDestination | null;
  role: InternalRole | null;
  billing: BillingStatus | null;
  billingError: boolean;
  accessError: string;
};

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
      supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle(),
      billingEnabled
        ? getBillingStatus().then((status) => ({ status, error: null })).catch((reason: unknown) => ({ status: null, error: reason }))
        : Promise.resolve({ status: null, error: null }),
    ]).then(([destination, profileResult, billingResult]) => {
      if (!active) return;
      if (profileResult.error) throw profileResult.error;
      setResolution({
        userId,
        destination,
        role: normalizeInternalRole(profileResult.data?.role),
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
  if (!resolution.role) return <main style={{ padding: 32 }}><h1>Internal access not assigned</h1><p role="alert">This account has workspace membership but no recognized HLC internal role.</p><p>Customer and provider accounts should use their assigned portal. Internal access requires an owner, manager, or technician role.</p></main>;
  if (!canAccessWorkspacePath(resolution.role, location.pathname)) return <main style={{ padding: 32 }}><h1>Access restricted</h1><p role="alert">Your HLC role does not allow this area.</p><p>This page is limited to authorized internal roles and cannot be opened by direct URL.</p><Link to="/dashboard">Return to Dashboard</Link></main>;

  const billingDecision = evaluateBillingAccess({ billingEnabled, pathname: location.pathname, isActive: resolution.billing?.is_active ?? null, verificationFailed: resolution.billingError });
  if (billingDecision === "verification_unavailable") return <main style={{ padding: 32 }}><h1>Billing status unavailable</h1><p role="alert">HLC could not verify this workspace’s subscription state. Access was not classified as inactive.</p><Link to="/settings">Open billing settings</Link></main>;
  if (billingDecision === "subscription_required") return <main style={{padding:32}}><h1>Subscription required</h1><p>This workspace does not currently have webhook-confirmed trial, paid, or grace-period access.</p><Link to="/settings">Review billing</Link></main>;
  return <Outlet />;
}
