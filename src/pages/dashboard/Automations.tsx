import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAutomationJobs, runAutomation, type AutomationJobRecord, type AutomationJobStatus } from "../../api/automations";
import { automationRegistry, type AutomationMode } from "../../config/automation";

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
  const modeCounts = useMemo(() => automationRegistry.reduce<Record<AutomationMode, number>>((counts, item) => {
    counts[item.mode] += 1;
    return counts;
  }, { AUTOMATIC: 0, RECOMMEND: 0, CONFIRM: 0, BLOCKED: 0 }), []);

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

  return (
    <main className="hlc-automations-workspace">
      <header className="hlc-automations-header">
        <div>
          <p className="hlc-automations-kicker">MANAGEMENT CONTROL</p>
          <h1>Automations</h1>
          <p>Review and run HomeLead Connect automation from one auditable management surface. Safe checks can run directly, recommendations expose evidence, consequential work requires confirmation, and blocked work stays visibly blocked.</p>
        </div>
        <Link className="hlc-automations-workflow-link" to="/workflow">View service workflow</Link>
      </header>

      <section className="hlc-automations-summary" aria-label="Automation mode summary">
        {(["AUTOMATIC", "RECOMMEND", "CONFIRM", "BLOCKED"] as AutomationMode[]).map((mode) => (
          <span key={mode} data-mode={mode}><strong>{modeCounts[mode]}</strong><small>{mode}</small></span>
        ))}
      </section>

      <section className="hlc-automation-monitor" aria-labelledby="scheduled-workflow-title">
        <div className="hlc-automation-monitor-copy">
          <p className="hlc-automation-section-kicker">Scheduled monitor</p>
          <h2 id="scheduled-workflow-title">Hourly workflow monitor <span className="hlc-automation-active">Active</span></h2>
          <p>HomeLead Connect records a read-only workflow snapshot every hour at minute 7. It checks workflow health, follow-up pressure, and owner-attention conditions without messaging customers, assigning providers, changing appointments, changing lead or job state, or changing billing.</p>
        </div>
        <div className="hlc-automation-evidence">
          <small>Latest automatic evidence</small>
          {historyState === "loading" && <span>Loading latest scheduled scan…</span>}
          {historyState === "error" && <span role="alert">Scheduled scan history is temporarily unavailable.</span>}
          {historyState === "ready" && !latestAutomaticScan && <span>No automatic scan has been recorded yet.</span>}
          {latestAutomaticScan && <>
            <strong>{statusLabels[latestAutomaticScan.status] ?? latestAutomaticScan.status}</strong>
            <span>{new Date(latestAutomaticScan.created_at).toLocaleString()}</span>
            {latestAutomaticScan.result && <pre>{JSON.stringify(latestAutomaticScan.result, null, 2)}</pre>}
          </>}
        </div>
      </section>

      <section className="hlc-automation-runtime" aria-labelledby="automation-runtime-title">
        <div className="hlc-automation-section-heading">
          <div><p className="hlc-automation-section-kicker">On-demand checks</p><h2 id="automation-runtime-title">Safe deterministic runs</h2></div>
          <p>Authenticated, workspace-scoped checks with persisted execution evidence.</p>
        </div>
        <div className="hlc-automation-run-list">
          {safeRuns.map((run) => {
            const isRunning = Boolean(busy[run.id]);
            const message = runtimeMessages[run.id];
            return (
              <article className="hlc-automation-run-row" key={run.id}>
                <div><strong>{run.label}</strong><span>{run.description}</span></div>
                <div className="hlc-automation-run-action">
                  {message && <small role="status" data-tone={message.tone}>{message.text}</small>}
                  <button type="button" aria-busy={isRunning} disabled={isRunning} onClick={() => execute(run.id)}>{isRunning ? "Running…" : "Run now"}</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="hlc-automation-registry" aria-labelledby="automation-registry-title">
        <div className="hlc-automation-section-heading">
          <div><p className="hlc-automation-section-kicker">Policy registry</p><h2 id="automation-registry-title">Automation rules</h2></div>
          <p>{automationRegistry.length} registered rules</p>
        </div>
        <div className="hlc-automation-registry-head" aria-hidden="true"><span>Rule / owner</span><span>Trigger → outcome</span><span>Mode / guardrail</span></div>
        <div className="hlc-automation-registry-list">
          {automationRegistry.map((item) => (
            <article className="hlc-automation-rule-row" key={`${item.stage}-${item.name}`} data-mode={item.mode}>
              <div className="hlc-automation-rule-name"><small>{item.stage} · {item.owner}</small><strong>{item.name}</strong></div>
              <div className="hlc-automation-rule-flow"><span>{item.trigger}</span><strong aria-hidden="true">→</strong><span>{item.outcome}</span></div>
              <div className="hlc-automation-rule-guard"><span>{item.mode}</span><small>{item.guardrail}</small></div>
            </article>
          ))}
        </div>
      </section>

      <section className="hlc-automation-history" aria-labelledby="automation-history-title">
        <div className="hlc-automation-section-heading">
          <div><p className="hlc-automation-section-kicker">Persisted evidence</p><h2 id="automation-history-title">Recent automation jobs</h2></div>
          <p>Management history shared by scheduled and manual checks.</p>
        </div>
        {historyState === "loading" && <p className="hlc-automation-state">Loading automation history…</p>}
        {historyState === "error" && <p className="hlc-automation-state is-error" role="alert">Automation history is unavailable. No job state has been guessed.</p>}
        {historyState === "ready" && jobs.length === 0 && <p className="hlc-automation-state">No persisted automation jobs exist for this workspace yet.</p>}
        {historyState === "ready" && jobs.length > 0 && (
          <div className="hlc-automation-history-list">
            {jobs.map((job) => (
              <article className="hlc-automation-history-row" key={job.id} data-status={job.status}>
                <div><strong>{jobLabels[job.job_type] ?? job.job_type}</strong><small>Created {new Date(job.created_at).toLocaleString()}</small></div>
                <div><span>{statusLabels[job.status] ?? job.status}</span><small>Attempts {job.retry_count} / {job.max_attempts}</small></div>
                <div>{job.result && <pre>{JSON.stringify(job.result, null, 2)}</pre>}{job.last_error && <small role="alert">{job.last_error}</small>}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="hlc-automation-boundary">
        <strong>Management boundary</strong>
        <p>Automations supports the HomeLead Connect platform; it does not replace Leads, Jobs, Calendar, Messages, billing, Community, LeadScope, or the AI Team. Each record remains authoritative in its parent area, while this page provides automation policy, evidence, and safe management controls.</p>
      </aside>
    </main>
  );
}
