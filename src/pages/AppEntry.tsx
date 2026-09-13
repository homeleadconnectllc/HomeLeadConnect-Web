import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PublicSiteNav from "../components/PublicSiteNav";
import { useAuth } from "../hooks/useAuth";
import { errorMessage } from "../lib/errorMessage";
import { resolveUserDestination, type HlcDestination } from "../lib/accessDestination";
import "../styles/app-entry-frontdoor-20260913.css";

type Resolution = {
  userId: string;
  target: HlcDestination | null;
  error: string;
};

function EntryState({ error = "" }: { error?: string }) {
  return <main className="hlc-app-entry-state">
    <PublicSiteNav />
    <section className="hlc-app-entry-state__shell" aria-live="polite">
      <div className="hlc-app-entry-state__panel">
        <img className="hlc-app-entry-state__logo" src="/hlc-logo-public.webp" alt="HomeLead Connect" width={440} height={142} />
        <p className="hlc-app-entry-state__kicker">HomeLead Connect access</p>
        <h1>{error ? "We kept your account protected." : "Opening your HomeLead Connect area."}</h1>
        {error ? <><p role="alert">{error}</p><p>Your account was not redirected to an unverified workspace or portal.</p></> : <><p role="status">Checking your approved HomeLead Connect destination and opening the correct workspace or portal.</p><div className="hlc-app-entry-state__pulse" aria-hidden="true" /></>}
      </div>
    </section>
  </main>;
}

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

  if (loading) return <EntryState />;
  if (!session) return <Navigate to="/login" replace />;

  if (!resolution || resolution.userId !== session.user.id) {
    return <EntryState />;
  }

  if (resolution.error) {
    return <EntryState error={resolution.error} />;
  }

  return <Navigate to={resolution.target!} replace />;
}
