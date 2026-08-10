import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function WorkspaceLayout() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [portalTarget, setPortalTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([
      supabase.from("workspace_members").select("workspace_id").eq("user_id", session.user.id).limit(1),
      supabase.from("homeowner_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
      supabase.from("contractor_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
    ]).then(([membership, homeowner, contractor]) => {
      if (!active) return;
      setAuthorized(!membership.error && Boolean(membership.data?.length));
      if (!homeowner.error && homeowner.data?.length) setPortalTarget("/homeowner-portal");
      else if (!contractor.error && contractor.data?.length) setPortalTarget("/contractor-portal");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  if (loading) return <main style={{ padding: 32 }}><p>Checking workspace access…</p></main>;
  if (!authorized) return <Navigate to={portalTarget || "/portal/accept"} replace />;
  return <Outlet />;
}
