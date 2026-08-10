import { useCallback, useEffect, useState } from "react";
import { decideHomeownerEstimate, getHomeownerPortalData, type HomeownerPortalRelationship } from "../../api/portals";
import { errorMessage } from "../../lib/errorMessage";
import { formatCurrency } from "../../lib/estimator/calculations";

export default function HomeownerPortal() {
  const [relationships, setRelationships] = useState<HomeownerPortalRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    setError("");
    try { setRelationships(await getHomeownerPortalData()); }
    catch (reason) { setError(errorMessage(reason, "Unable to load your projects.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    getHomeownerPortalData()
      .then((result) => { if (active) setRelationships(result); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load your projects.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function decide(id: string, decision: "accepted" | "rejected") {
    setBusy(true); setError(""); setMessage("");
    try {
      await decideHomeownerEstimate(id, decision);
      await load();
      setMessage(`Estimate ${decision}.`);
    } catch (reason) { setError(errorMessage(reason, "Unable to update the estimate.")); }
    finally { setBusy(false); }
  }

  return <main style={pageStyle}>
    <h1>Homeowner portal</h1>
    <p>Estimates, jobs, and appointments explicitly shared with your account.</p>
    {loading && <p>Loading your projects…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    {!loading && !error && relationships.length === 0 && <p>No projects are linked to this account.</p>}
    {relationships.map((relationship) => <section key={`${relationship.workspace_id}:${relationship.lead_id}`} style={cardStyle}>
      <h2>{relationship.homeowner_name || "Your project"}</h2>
      <h3>LeadScope estimates</h3>
      {relationship.estimates.length === 0 && <p>No estimates shared yet.</p>}
      {relationship.estimates.map((estimate) => <article key={estimate.id} style={itemStyle}>
        <strong>{formatCurrency(Number(estimate.total))}</strong> · {estimate.status}
        <ul>{estimate.lines.map((line) => <li key={line.id}>{line.description} — {line.quantity} × {formatCurrency(Number(line.unit_cost))}</li>)}</ul>
        {estimate.status === "sent" && <div style={actionsStyle}>
          <button disabled={busy} onClick={() => decide(estimate.id, "accepted")}>Accept estimate</button>
          <button disabled={busy} onClick={() => decide(estimate.id, "rejected")}>Reject estimate</button>
        </div>}
      </article>)}
      <h3>Jobs and appointments</h3>
      {relationship.jobs.length === 0 && <p>No jobs created yet.</p>}
      {relationship.jobs.map((job) => <article key={job.id} style={itemStyle}>
        <strong>{job.name}</strong> · {job.status} · {formatCurrency(Number(job.contract_value))}
        {job.appointments.length === 0 ? <p>No appointments scheduled.</p> : <ul>{job.appointments.map((appointment) => <li key={appointment.id}>{new Date(appointment.appointment_date).toLocaleString()} · {appointment.status}</li>)}</ul>}
      </article>)}
    </section>)}
  </main>;
}

const pageStyle = { width: "min(960px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const cardStyle = { marginTop: 20, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const itemStyle = { marginTop: 12, padding: 14, background: "#f8fafc", borderRadius: 10 };
const actionsStyle = { display: "flex", gap: 10, flexWrap: "wrap" as const };
