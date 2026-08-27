import { useEffect, useMemo, useState } from "react";
import { getSystemHealth } from "../../api/ecosystemExtra";
import { errorMessage } from "../../lib/errorMessage";

type ProviderHealth = {
  provider_name?: string | null;
  channel?: string | null;
  status?: string | null;
};

type HealthPayload = {
  providers?: ProviderHealth[];
  subscription?: { status?: string | null } | null;
  notificationCount?: number | null;
  recentAgentRuns?: unknown[] | null;
};

function words(value: unknown) {
  return String(value ?? "")
    .trim()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function channelLabel(channel: unknown) {
  const value = String(channel ?? "").toLowerCase();
  if (value === "sms") return "Text messaging";
  if (value === "call" || value === "voice" || value === "phone") return "Calling";
  if (value === "email") return "Email";
  return words(channel) || "Communications";
}

function statusLabel(status: unknown) {
  const value = String(status ?? "").toLowerCase();
  if (["manual_available", "manual", "handoff_available"].includes(value)) return "Manual handoff available";
  if (["active", "connected", "ready", "available"].includes(value)) return "Available";
  if (["disabled", "inactive", "unavailable"].includes(value)) return "Unavailable";
  if (["setup_required", "not_configured", "missing"].includes(value)) return "Setup required";
  return words(status) || "Status not recorded";
}

function subscriptionLabel(status: unknown) {
  const value = String(status ?? "").toLowerCase();
  if (value === "trialing") return "Trial active";
  if (value === "active") return "Subscription active";
  if (value === "past_due") return "Payment attention required";
  if (value === "canceled" || value === "cancelled") return "Subscription canceled";
  if (!value || value === "not configured") return "Not configured";
  return words(status);
}

export default function SystemHealth() {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getSystemHealth()
      .then((payload) => { if (active) setData(payload as HealthPayload); })
      .catch((reason) => { if (active) setError(errorMessage(reason, "Unable to read system health.")); });
    return () => { active = false; };
  }, []);

  const providers = useMemo(() => data?.providers ?? [], [data]);
  const agentRuns = data?.recentAgentRuns?.length ?? 0;
  const notificationCount = data?.notificationCount ?? 0;

  return (
    <main className="hlc-system-health-workspace">
      <header className="hlc-system-health-header">
        <p>OWNER · RUNTIME EVIDENCE</p>
        <h1>System health</h1>
        <span>See what HLC can actually use right now. Technical adapter names stay available under Details instead of becoming the primary operator language.</span>
      </header>

      {error && <section className="hlc-system-health-state is-error" role="alert"><strong>System health could not be loaded.</strong><span>{error}</span><small>Refresh this page after checking your connection. HLC does not infer a healthy state when runtime evidence is unavailable.</small></section>}
      {!data && !error && <section className="hlc-system-health-state" role="status"><strong>Checking HLC services…</strong><span>Reading current workspace evidence.</span></section>}

      {data && (
        <div className="hlc-system-health-list">
          <section className="hlc-system-health-group">
            <div className="hlc-system-health-group-head"><div><small>COMMUNICATIONS</small><h2>Calls, texts & email</h2></div><strong>{providers.length}</strong></div>
            {providers.length ? providers.map((provider, index) => (
              <article className="hlc-system-health-row" key={`${provider.provider_name}-${provider.channel}-${index}`}>
                <div><strong>{channelLabel(provider.channel)}</strong><span>{statusLabel(provider.status)}</span></div>
                <details><summary>Details</summary><p>Provider: {words(provider.provider_name) || "Not recorded"}</p><p>Channel: {words(provider.channel) || "Not recorded"}</p><p>Runtime state: {words(provider.status) || "Not recorded"}</p></details>
              </article>
            )) : <div className="hlc-system-health-empty"><strong>No communication connection evidence yet.</strong><span>Manual communication can still be recorded where HLC provides an explicit handoff workflow.</span></div>}
          </section>

          <section className="hlc-system-health-group">
            <div className="hlc-system-health-group-head"><div><small>BILLING</small><h2>Subscription</h2></div></div>
            <article className="hlc-system-health-row"><div><strong>{subscriptionLabel(data.subscription?.status)}</strong><span>Entitlement is based on recorded billing evidence.</span></div></article>
          </section>

          <section className="hlc-system-health-group">
            <div className="hlc-system-health-group-head"><div><small>ATTENTION</small><h2>Notifications</h2></div></div>
            <article className="hlc-system-health-row"><div><strong>{notificationCount} recorded</strong><span>Open Notifications to review actionable workspace alerts.</span></div></article>
          </section>

          <section className="hlc-system-health-group">
            <div className="hlc-system-health-group-head"><div><small>AI RUNTIME</small><h2>Kendrell, Dion & Diamond</h2></div></div>
            <article className="hlc-system-health-row"><div><strong>{agentRuns} recent runs</strong><span>Recorded agent activity is shown without inventing a health state.</span></div></article>
          </section>
        </div>
      )}
    </main>
  );
}
