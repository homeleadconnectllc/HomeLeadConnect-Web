import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { errorMessage } from "../lib/errorMessage";
import { resolveUserDestination, type HlcDestination } from "../lib/accessDestination";

export default function AppEntry() {
  const { session, loading } = useAuth();
  const [target, setTarget] = useState<HlcDestination | "/login" | null>(null);
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

    resolveUserDestination(session.user.id)
      .then((destination) => {
        if (active) setTarget(destination);
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
