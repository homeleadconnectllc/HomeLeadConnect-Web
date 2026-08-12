import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { errorMessage } from "../lib/errorMessage";
import { resolveUserDestination, type HlcDestination } from "../lib/accessDestination";

type Resolution = {
  userId: string;
  target: HlcDestination | null;
  error: string;
};

export default function AppEntry() {
  const { session, loading } = useAuth();
  const [resolution, setResolution] = useState<Resolution | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const userId = session.user.id;

    resolveUserDestination(userId)
      .then((target) => {
        if (active) setResolution({ userId, target, error: "" });
      })
      .catch((reason: unknown) => {
        if (active) setResolution({ userId, target: null, error: errorMessage(reason, "Unable to determine your HomeLead Connect destination.") });
      });

    return () => {
      active = false;
    };
  }, [session]);

  if (loading) return <main style={{ width: "min(720px, calc(100% - 32px))", margin: "64px auto" }}><p role="status">Opening your HomeLead Connect area…</p></main>;
  if (!session) return <Navigate to="/login" replace />;

  if (!resolution || resolution.userId !== session.user.id) {
    return <main style={{ width: "min(720px, calc(100% - 32px))", margin: "64px auto" }}><p role="status">Opening your HomeLead Connect area…</p></main>;
  }

  if (resolution.error) {
    return <main style={{ width: "min(720px, calc(100% - 32px))", margin: "64px auto" }}>
      <h1>HomeLead Connect access check</h1>
      <p role="alert">{resolution.error}</p>
      <p>Your account was not redirected to an unverified workspace or portal.</p>
    </main>;
  }

  return <Navigate to={resolution.target!} replace />;
}
