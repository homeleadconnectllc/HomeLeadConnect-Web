import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../lib/errorMessage";

export default function AppEntry() {
  const { session, loading } = useAuth();
  const [target, setTarget] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setTarget("/login");
      return;
    }

    let active = true;
    setResolving(true);
    setError("");

    Promise.all([
      supabase.from("workspace_members").select("workspace_id").eq("user_id", session.user.id).limit(1),
      supabase.from("homeowner_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
      supabase.from("contractor_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
    ])
      .then(([membership, homeowner, contractor]) => {
        if (!active) return;
        if (membership.error) throw membership.error;
        if (membership.data?.length) setTarget("/dashboard");
        else if (!homeowner.error && homeowner.data?.length) setTarget("/homeowner-portal");
        else if (!contractor.error && contractor.data?.length) setTarget("/contractor-portal");
        else setTarget("/portal/accept");
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(errorMessage(reason, "Unable to determine your HomeLead Connect destination."));
      })
      .finally(() => {
        if (active) setResolving(false);
      });

    return () => {
      active = false;
    };
  }, [loading, session]);

  if (loading || resolving || (!target && !error)) {
    return <main style={{ width: "min(720px, calc(100% - 32px))", margin: "64px auto" }}>
      <p role="status">Opening your HomeLead Connect area…</p>
    </main>;
  }

  if (error) {
    return <main style={{ width: "min(720px, calc(100% - 32px))", margin: "64px auto" }}>
      <h1>HomeLead Connect access check</h1>
      <p role="alert">{error}</p>
      <p>Your account was not redirected to an unverified workspace or portal.</p>
    </main>;
  }

  return <Navigate to={target!} replace />;
}
