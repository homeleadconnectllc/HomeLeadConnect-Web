import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAutomationJobs, runAutomation, type AutomationJobRecord, type AutomationJobStatus } from "../../api/automations";
import { automationRegistry, type AutomationMode } from "../../config/automation";

const colors: Record<AutomationMode, string> = { AUTOMATIC: "#166534", RECOMMEND: "#1d4ed8", CONFIRM: "#92400e", BLOCKED: "#b91c1c" };
type SafeAutomation = "workflow_health_check" | "followup_scan" | "owner_attention_scan";
type RuntimeMessage = { tone: "success" | "error"; text: string };
const safeRuns: Array<{ id: SafeAutomation; label: string; description: string }> = [
  { id: "workflow_health_check", label: "Run workflow health check", description: "Counts live leads, jobs, assignments and scheduled appointments without changing workflow state." },
  { id: "followup_scan", label: "Scan follow-ups", description: "Checks overdue and upcoming follow-ups for the authenticated workspace." },
  { id: "owner_attention_scan", label: "Scan owner attention", description: "Checks open Kendrell handoffs and owner-attention items." },
];

const statusLabels: Record<AutomationJobStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  success: "Success",
  failed: "Failed",
  running: "Processing",
  succeeded: "Success",
  blocked: "Blocked",
};

const jobLabels: Record<string, string> = {
  workflow_health_check: "Manual workflow health check",
  followup_scan: "Manual follow-up scan",
  owner_attention_scan: "Manual owner-attention scan",
  workflow_automation_scan: "Automatic hourly workflow scan",
};

export default function Automations() {
  const [jobs, setJobs] = useState<AutomationJobRecord[]>([]);
  const [historyState, setHistoryState] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState<Partial<Record<SafeAutomation, boolean>>>({});
  const [runtimeMessages, setRuntimeMessages] = useState<Partial<Record<SafeAutomation, RuntimeMessage>>>({});
  const latestAutomaticScan = useMemo(() => jobs.find((job) => job.job_type === "workflow_automation_scan"), [jobs]);

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
    if (busy[jobType]) return;

    setBusy((current) => ({ ...current, [jobType]: true }));
    setRuntimeMessages((current) => ({ ...current, [jobType]: undefined }));

    try {
      const response = await runAutomation(jobType);
      const label = statusLabels[response.status] ?? response.status;
      setRuntimeMessages((current) => ({
        ...current,
        [jobType]: { tone: response.status === "failed" || response.status === "blocked" ? "error" : "success", text: `${response.job_type} ${label.toLowerCase()}.` },
      }));
      await refresh();
    } catch (reason) {
      setRuntimeMessages((current) => ({
        ...current,
        [jobType]: { tone: "error", text: reason instanceof Error ? reason.message : "Automation run failed." },
      }));
    } finally {
      setBusy((current) => ({ ...current, [jobType]: false }));
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

    <section style={scheduledStyle} aria-labelledby="scheduled-workflow-title">
      <div>
        <p style={eyebrowDarkStyle}>Scheduled workflow automation</p>
        <h2 id="scheduled-workflow-title" style={{ margin: "4px 0 8px" }}>Hourly workflow monitor <span style={activeBadgeStyle}>ACTIVE</span></h2>
        <p style={{ margin: 0, lineHeight: 1.55 }}>HLC automatically records a read-only workflow snapshot every hour at minute 7. It checks workflow health, follow-up pressure and owner-attention conditions. It never messages customers, assigns providers, changes appointments, changes lead/job state or changes billing.</p>
      </div>
      <div style={scheduledEvidenceStyle}>
        <strong>Latest automatic evidence</strong>
        {historyState === "loading" && <span>Loading latest scheduled scan…</span>}
        {historyState === "error" && <span role="alert">Scheduled scan history is temporarily unavailable.</span>}
        {historyState === "ready" && !latestAutomaticScan && <span>No automatic scan has been recorded yet.</span>}
        {latestAutomaticScan && <>
          <span>{statusLabels[latestAutomaticScan.status] ?? latestAutomaticScan.status} · {new Date(latestAutomaticScan.created_at).toLocaleString()}</span>
          {latestAutomaticScan.result && <pre style={resultStyle}>{JSON.stringify(latestAutomaticScan.result, null, 2)}</pre>}
        </>}
      </div>
    </section>

    <section style={runtimeStyle} aria-labelledby="automation-runtime-title">
      <div>
        <p style={eyebrowDarkStyle}>On-demand management checks</p>
        <h2 id="automation-runtime-title" style={{ margin: "4px 0 8px" }}>Safe deterministic runs</h2>
        <p style={{ margin: 0, lineHeight: 1.55 }}>Owner and manager controls execute authenticated, tenant-scoped checks through the database runtime and preserve each result in automation history. They do not send messages, assign providers, schedule appointments or change billing.</p>
      </div>
      <div style={runtimeGridStyle}>{safeRuns.map((run) => {
        const isRunning = Boolean(busy[run.id]);
        const message = runtimeMessages[run.id];
        return <article key={run.id} style={historyCardStyle}>
          <strong>{run.label}</strong>
          <span>{run.description}</span>
          <button type="button" aria-busy={isRunning} disabled={isRunning} onClick={() => execute(run.id)}>{isRunning ? "Running…" : "Run now"}</button>
          {message && <small role="status" style={message.tone === "error" ? errorMessageStyle : successMessageStyle}>{message.text}</small>}
        </article>;
      })}</div>
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
        <p style={{ margin: 0, lineHeight: 1.55 }}>Automation history is management-only. System-scheduled and owner/manager-initiated checks share the same auditable workspace history.</p>
      </div>
      {historyState === "loading" && <p>Loading automation history…</p>}
      {historyState === "error" && <p role="alert">Automation history is unavailable. No job state has been guessed.</p>}
      {historyState === "ready" && jobs.length === 0 && <p>No persisted automation jobs exist for this workspace yet.</p>}
      {historyState === "ready" && jobs.length > 0 && <div style={historyGridStyle}>{jobs.map((job) => <article key={job.id} style={historyCardStyle}>
        <div style={headingStyle}><strong>{jobLabels[job.job_type] ?? job.job_type}</strong><span style={statusStyle}>{statusLabels[job.status] ?? job.status}</span></div>
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
const scheduledStyle = { display: "grid", gap: 14, padding: 22, border: "1px solid #60a5fa", borderRadius: 16, background: "#eff6ff", color: "#334155" };
const scheduledEvidenceStyle = { display: "grid", gap: 8, padding: 14, border: "1px solid #bfdbfe", borderRadius: 12, background: "#fff" };
const activeBadgeStyle = { display: "inline-block", marginLeft: 8, padding: "3px 8px", border: "1px solid #16a34a", borderRadius: 999, color: "#166534", background: "#f0fdf4", fontSize: 11, verticalAlign: "middle" };
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
const successMessageStyle = { color: "#166534", fontWeight: 800 };
const errorMessageStyle = { color: "#b91c1c", fontWeight: 800 };
const resultStyle = { margin: 0, padding: 10, overflow: "auto", whiteSpace: "pre-wrap" as const, borderRadius: 8, background: "#0f172a", color: "#e2e8f0", fontSize: 12 };
const boundaryStyle = { padding: 22, border: "1px solid #60a5fa", borderRadius: 16, background: "#eff6ff", color: "#334155", lineHeight: 1.6 };
