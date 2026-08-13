import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAutomationJobs, runAutomation, type AutomationJobRecord } from "../../api/automations";
import { automationRegistry, type AutomationMode } from "../../config/automation";

const colors: Record<AutomationMode, string> = { AUTOMATIC: "#166534", RECOMMEND: "#1d4ed8", CONFIRM: "#92400e", BLOCKED: "#b91c1c" };
type SafeAutomation = "workflow_health_check" | "followup_scan" | "owner_attention_scan";
const safeRuns: Array<{ id: SafeAutomation; label: string; description: string }> = [
  { id: "workflow_health_check", label: "Run workflow health check", description: "Counts live leads, jobs, assignments and scheduled appointments without changing workflow state." },
  { id: "followup_scan", label: "Scan follow-ups", description: "Checks overdue and upcoming follow-ups for the authenticated workspace." },
  { id: "owner_attention_scan", label: "Scan owner attention", description: "Checks open Kendrell handoffs and owner-attention items." },
];

export default function Automations() {
  const [jobs, setJobs] = useState<AutomationJobRecord[]>([]);
  const [historyState, setHistoryState] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState<SafeAutomation | null>(null);
  const [runtimeMessage, setRuntimeMessage] = useState("");

  const refresh = useCallback(async () => {
    const rows = await listAutomationJobs();
    setJobs(rows);
    setHistoryState("ready");
  }, []);

  useEffect(() => {
    let active = true;
    listAutomationJobs()
      .then((rows) => {
        if (!active) return;
        setJobs(rows);
        setHistoryState("ready");
      })
      .catch(() => {
        if (active) setHistoryState("error");
      });
    return () => { active = false; };
  }, []);

  async function execute(jobType: SafeAutomation) {
    setBusy(jobType);
    setRuntimeMessage("");
    try {
      const response = await runAutomation(jobType);
      setRuntimeMessage(`${response.job_type} ${response.status}.`);
      await refresh();
    } catch (reason) {
      setRuntimeMessage(reason instanceof Error ? reason.message : "Automation run failed.");
    } finally {
      setBusy(null);
    }
  }

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>One HLC system · shared automation layer</p>
      <h1 style={{ margin: 0 }}>Automation control plane</h1>
      <p style={{ margin: 0, maxWidth: 820, lineHeight: 1.6 }}>Every automation belongs to the canonical HLC workflow, records, permissions and audit trail. Automatic work handles safe deterministic steps; recommendations expose reasoning; consequential actions require confirmation.</p>
    </header>

    <section style={legendStyle} aria-label="Automation modes">
      <strong>AUTOMATIC:</strong><span>safe deterministic action</span>
      <strong>RECOMMEND:</strong><span>human chooses after reviewing evidence</span>
      <strong>CONFIRM:</strong><span>preview and explicit authorization required</span>
      <strong>BLOCKED:</strong><span>provider, rule, persistence or approval is missing</span>
    </section>

    <section style={runtimeStyle} aria-labelledby="automation-runtime-title">
      <div>
        <p style={eyebrowDarkStyle}>Active persisted runtime</p>
        <h2 id="automation-runtime-title" style={{ margin: "4px 0 8px" }}>Safe deterministic runs</h2>
        <p style={{ margin: 0, lineHeight: 1.55 }}>These controls execute authenticated, tenant-scoped checks through the database runtime and preserve each result in automation history. They do not send messages, assign providers, schedule appointments or change billing.</p>
      </div>
      <div style={runtimeGridStyle}>{safeRuns.map((run) => <article key={run.id} style={historyCardStyle}>
        <strong>{run.label}</strong>
        <span>{run.description}</span>
        <button type="button" disabled={busy !== null} onClick={() => execute(run.id)}>{busy === run.id ? "Running…" : "Run now"}</button>
      </article>)}</div>
      {runtimeMessage && <p role="status" style={{ margin: 0 }}>{runtimeMessage}</p>}
    </section>

    <div style={gridStyle}>{automationRegistry.map((item) => <article key={`${item.stage}-${item.name}`} style={cardStyle}>
      <div style={headingStyle}><div><p style={stageStyle}>{item.stage} · {item.owner}</p><h2 style={{ margin: "4px 0" }}>{item.name}</h2></div><strong style={{ ...badgeStyle, color: colors[item.mode], borderColor: colors[item.mode] }}>{item.mode}</strong></div>
      <p><strong>Trigger:</strong> {item.trigger}</p>
      <p><strong>Outcome:</strong> {item.outcome}</p>
      <p><strong>Guardrail:</strong> {item.guardrail}</p>
    </article>)}</div>

    <section style={historyStyle} aria-labelledby="automation-history-title">
      <div>
        <p style={eyebrowDarkStyle}>Persisted execution evidence</p>
        <h2 id="automation-history-title" style={{ margin: "4px 0 8px" }}>Recent automation jobs</h2>
        <p style={{ margin: 0, lineHeight: 1.55 }}>Runtime writes are server-controlled. Browser users may read their workspace history and invoke only the safe allowlisted checks above.</p>
      </div>
      {historyState === "loading" && <p>Loading automation history…</p>}
      {historyState === "error" && <p role="alert">Automation history is unavailable. No job state has been guessed.</p>}
      {historyState === "ready" && jobs.length === 0 && <p>No persisted automation jobs exist for this workspace yet.</p>}
      {historyState === "ready" && jobs.length > 0 && <div style={historyGridStyle}>{jobs.map((job) => <article key={job.id} style={historyCardStyle}>
        <div style={headingStyle}><strong>{job.job_type}</strong><span style={statusStyle}>{job.status}</span></div>
        <small>Attempts {job.retry_count} / {job.max_attempts}</small>
        <small>Created {new Date(job.created_at).toLocaleString()}</small>
        {job.result && <pre style={resultStyle}>{JSON.stringify(job.result, null, 2)}</pre>}
        {job.last_error && <small role="alert">{job.last_error}</small>}
      </article>)}</div>}
    </section>

    <aside style={boundaryStyle}><h2>One-project boundary</h2><p>Public website, accounts, CRM, LeadScope, providers, jobs, communications, Network, Map, Community, billing and agents are modules of one HomeLead Connect product. They reuse canonical identities and records rather than synchronizing duplicate systems.</p><p><strong>Kendrell:</strong> Inside HLC, Kendrell coordinates command, approvals, risk, system health and agent handoffs. Outside HLC, the private owner-assistant environment stays separately secured and may exchange only explicitly authorized HLC context and actions.</p><Link to="/workflow">Open the golden workflow →</Link></aside>
  </main>;
}

const pageStyle = { width: "min(1180px, calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 22 };
const heroStyle = { display: "grid", gap: 12, padding: "clamp(22px,5vw,44px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" };
const eyebrowStyle = { margin: 0, color: "#60a5fa", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" as const };
const eyebrowDarkStyle = { ...eyebrowStyle, color: "#1d4ed8" };
const legendStyle = { display: "grid", gridTemplateColumns: "minmax(100px,auto) minmax(0,1fr)", gap: "8px 12px", padding: 18, border: "1px solid #cbd5e1", borderRadius: 14, background: "#f8fafc", color: "#334155", lineHeight: 1.45 };
const runtimeStyle = { display: "grid", gap: 14, padding: 22, border: "1px solid #86efac", borderRadius: 16, background: "#f0fdf4", color: "#334155" };
const runtimeGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 10 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,350px),1fr))", gap: 14 };
const cardStyle = { padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff", color: "#334155", lineHeight: 1.55, overflow: "hidden" };
const headingStyle = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" };
const stageStyle = { margin: 0, color: "#2563eb", fontSize: 13, fontWeight: 900, textTransform: "uppercase" as const };
const badgeStyle = { border: "1px solid", borderRadius: 999, padding: "5px 10px", fontSize: 11, whiteSpace: "nowrap" as const, flexShrink: 0, lineHeight: 1.2, background: "#fff" };
const historyStyle = { display: "grid", gap: 14, padding: 22, border: "1px solid #cbd5e1", borderRadius: 16, background: "#f8fafc", color: "#334155" };
const historyGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 10 };
const historyCardStyle = { display: "grid", gap: 8, padding: 14, border: "1px solid #cbd5e1", borderRadius: 12, background: "#fff", color: "#334155", lineHeight: 1.45 };
const statusStyle = { border: "1px solid #94a3b8", borderRadius: 999, padding: "3px 7px", fontSize: 11, textTransform: "uppercase" as const, whiteSpace: "nowrap" as const };
const resultStyle = { margin: 0, padding: 10, overflow: "auto", whiteSpace: "pre-wrap" as const, borderRadius: 8, background: "#0f172a", color: "#e2e8f0", fontSize: 12 };
const boundaryStyle = { padding: 22, border: "1px solid #60a5fa", borderRadius: 16, background: "#eff6ff", color: "#334155", lineHeight: 1.6 };
