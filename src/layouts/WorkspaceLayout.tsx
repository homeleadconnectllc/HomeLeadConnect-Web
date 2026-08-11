import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { getBillingStatus, type BillingStatus } from "../api/billing";

export default function WorkspaceLayout() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [portalTarget, setPortalTarget] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const location=useLocation();
  const billingEnabled=import.meta.env.VITE_BILLING_ENABLED==="true";

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([
      supabase.from("workspace_members").select("workspace_id").eq("user_id", session.user.id).limit(1),
      supabase.from("homeowner_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
      supabase.from("contractor_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
      billingEnabled?getBillingStatus().catch(()=>null):Promise.resolve(null),
    ]).then(([membership, homeowner, contractor, billingStatus]) => {
      if (!active) return;
      setAuthorized(!membership.error && Boolean(membership.data?.length));
      setBilling(billingStatus);
      if (!homeowner.error && homeowner.data?.length) setPortalTarget("/homeowner-portal");
      else if (!contractor.error && contractor.data?.length) setPortalTarget("/contractor-portal");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session,billingEnabled]);

  if (loading) return <main style={{ padding: 32 }}><p>Checking workspace access…</p></main>;
  if (!authorized) return <Navigate to={portalTarget || "/portal/accept"} replace />;
  if(billingEnabled&&location.pathname!=="/settings"&&!billing?.is_active){return <main style={{padding:32}}><h1>Subscription required</h1><p>This workspace does not currently have webhook-confirmed trial, paid, or grace-period access.</p><Link to="/settings">Review billing</Link></main>;}
  return <Outlet />;
}
