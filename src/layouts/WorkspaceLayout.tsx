import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getBillingStatus, type BillingStatus } from "../api/billing";
import { evaluateBillingAccess } from "../lib/billing/entitlement";
import { errorMessage } from "../lib/errorMessage";
import { resolveUserDestination, type HlcDestination } from "../lib/accessDestination";

export default function WorkspaceLayout() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<HlcDestination | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [accessError, setAccessError] = useState("");
  const [billingError, setBillingError] = useState(false);
  const location = useLocation();
  const billingEnabled = import.meta.env.VITE_BILLING_ENABLED === "true";

  useEffect(() => {
    if (!session) return;
    let active = true;
    setLoading(true);
    setAccessError("");

    Promise.all([
      resolveUserDestination(session.user.id),
      billingEnabled
        ? getBillingStatus().then((status) => ({ status, error: null })).catch((reason: unknown) => ({ status: null, error: reason }))
        : Promise.resolve({ status: null, error: null }),
    ]).then(([resolvedDestination, billingResult]) => {
      if (!active) return;
      setDestination(resolvedDestination);
      setBilling(billingResult.status);
      setBillingError(Boolean(billingResult.error));
    }).catch((reason: unknown) => {
      if (!active) return;
      setAccessError(errorMessage(reason, "Unable to verify workspace access."));
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [session, billingEnabled]);

  if (loading) return <main style={{ padding: 32 }}><p>Checking workspace access…</p></main>;
  if (accessError) return <main style={{ padding: 32 }}><h1>Workspace access unavailable</h1><p role="alert">{accessError}</p><p>Try again after the connection is restored. No workspace access decision was changed.</p></main>;
  if (destination !== "/dashboard") return <Navigate to={destination || "/portal/accept"} replace />;

  const billingDecision = evaluateBillingAccess({ billingEnabled, pathname: location.pathname, isActive: billing?.is_active ?? null, verificationFailed: billingError });
  if (billingDecision === "verification_unavailable") return <main style={{ padding: 32 }}><h1>Billing status unavailable</h1><p role="alert">HLC could not verify this workspace’s subscription state. Access was not classified as inactive.</p><Link to="/settings">Open billing settings</Link></main>;
  if (billingDecision === "subscription_required") return <main style={{padding:32}}><h1>Subscription required</h1><p>This workspace does not currently have webhook-confirmed trial, paid, or grace-period access.</p><Link to="/settings">Review billing</Link></main>;
  return <Outlet />;
}
