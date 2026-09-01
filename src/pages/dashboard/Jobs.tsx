import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, Clock3, Hammer, Layers3 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { listJobs, updateJobStatus } from "../../api/jobs";
import JobCard from "../../components/jobs/JobCard";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import type { CrmJob, CrmJobStatus } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

const STATUS_ORDER: CrmJobStatus[] = ["pending", "active", "completed", "cancelled"];

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const account = useAccountAccess();
  const [jobs, setJobs] = useState<CrmJob[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const canManageLifecycle = account.role === "owner" || account.role === "manager";

  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch((reason: unknown) =>
        setError(errorMessage(reason, "Unable to load jobs.")),
      )
      .finally(() => setLoading(false));
  }, []);

  const leadFilter = useMemo(() => {
    const raw = searchParams.get("lead");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const visibleJobs = useMemo(
    () => leadFilter === null ? jobs : jobs.filter((job) => job.lead_id === leadFilter),
    [jobs, leadFilter],
  );

  const summary = useMemo(() => ({
    total: visibleJobs.length,
    pending: visibleJobs.filter((job) => job.status === "pending").length,
    active: visibleJobs.filter((job) => job.status === "active").length,
    completed: visibleJobs.filter((job) => job.status === "completed").length,
  }), [visibleJobs]);

  const statusDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    visibleJobs.forEach((job) => counts.set(job.status, (counts.get(job.status) || 0) + 1));
    return [
      ...STATUS_ORDER.filter((status) => counts.has(status)).map((status) => ({ status, count: counts.get(status) || 0 })),
      ...Array.from(counts.entries())
        .filter(([status]) => !STATUS_ORDER.includes(status as CrmJobStatus))
        .map(([status, count]) => ({ status, count })),
    ];
  }, [visibleJobs]);

  const maxStatusCount = Math.max(1, ...statusDistribution.map((item) => item.count));
  const completionRate = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;
  const activeRate = summary.total ? Math.round((summary.active / summary.total) * 100) : 0;

  async function changeStatus(job: CrmJob, status: CrmJobStatus) {
    if (!canManageLifecycle) return;
    setError("");
    setMessage("");
    setBusyJobId(job.id);
    try {
      const updated = await updateJobStatus(job.id, status);
      setJobs((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMessage(`${job.name} status updated to ${status}.`);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to update job."));
    } finally {
      setBusyJobId(null);
    }
  }

  function clearLeadFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete("lead");
    setSearchParams(next, { replace: true });
  }

  return (
    <main className="hlc-jobs-workspace">
      <header className="hlc-jobs-header">
        <div>
          <p className="hlc-jobs-kicker"><Hammer size={14} aria-hidden="true" /> WORK OPERATIONS</p>
          <h1>Jobs</h1>
          <p>Track accepted work from handoff through completion without losing the estimate context.</p>
        </div>
        <div className="hlc-jobs-hero-visual" aria-label="Current work pulse">
          <div className="hlc-jobs-hero-ring" style={{ "--hlc-job-progress": `${completionRate}%` } as React.CSSProperties}>
            <span>{completionRate}%</span>
            <small>completed</small>
          </div>
          <div className="hlc-jobs-hero-copy">
            <small>30-second work pulse</small>
            <strong>{summary.active} active · {summary.pending} pending</strong>
            <span>{summary.total ? `${activeRate}% of visible work is active now.` : "Job activity appears as accepted work enters the board."}</span>
          </div>
        </div>
      </header>

      {leadFilter !== null && (
        <div className="hlc-jobs-state" role="status">
          Showing jobs for Lead #{leadFilter}. <button type="button" onClick={clearLeadFilter}>Show all jobs</button>
        </div>
      )}

      {!account.loading && !canManageLifecycle && (
        <div className="hlc-jobs-state" role="status">
          Job lifecycle status is read-only for this role. A manager or owner must approve canonical status changes.
        </div>
      )}

      <section className="hlc-jobs-overview" aria-label="Job operating overview">
        <div className="hlc-jobs-summary" aria-label="Job status summary">
          <span><Layers3 size={17} aria-hidden="true" /><strong>{summary.total}</strong><small>Total jobs</small></span>
          <span><Clock3 size={17} aria-hidden="true" /><strong>{summary.pending}</strong><small>Pending</small></span>
          <span><Activity size={17} aria-hidden="true" /><strong>{summary.active}</strong><small>Active</small></span>
          <span><CheckCircle2 size={17} aria-hidden="true" /><strong>{summary.completed}</strong><small>Completed</small></span>
        </div>

        <div className="hlc-jobs-status-visual" aria-label="Persisted job status distribution">
          <div className="hlc-jobs-status-heading">
            <div><small>Lifecycle shape</small><strong>Where current work sits</strong></div>
            <span>{summary.total} visible</span>
          </div>
          {statusDistribution.length ? (
            <div className="hlc-jobs-status-bars">
              {statusDistribution.map((item) => (
                <div className="hlc-jobs-status-row" key={item.status}>
                  <div><span>{statusLabel(item.status)}</span><strong>{item.count}</strong></div>
                  <span className="hlc-jobs-status-track" aria-hidden="true"><i data-status={item.status} style={{ width: `${Math.max(8, (item.count / maxStatusCount) * 100)}%` }} /></span>
                </div>
              ))}
            </div>
          ) : <p className="hlc-jobs-status-empty">Lifecycle distribution will appear when jobs are created.</p>}
        </div>
      </section>

      <section className="hlc-jobs-board" aria-label="Job operating board">
        <div className="hlc-jobs-column-head" aria-hidden="true">
          <span>Job</span>
          <span>Value / estimate</span>
          <span>Status / action</span>
        </div>

        {loading && <p className="hlc-jobs-state">Loading jobs…</p>}
        {error && <p className="hlc-jobs-state hlc-jobs-error" role="alert">{error}</p>}
        {message && <p className="hlc-jobs-state hlc-jobs-success" role="status">{message}</p>}
        {!loading && !error && visibleJobs.length === 0 && (
          <div className="hlc-jobs-empty" data-empty-state="true">
            <Hammer size={28} aria-hidden="true" />
            <strong>{leadFilter === null ? "No jobs yet." : "No jobs for this lead."}</strong>
            <span>{leadFilter === null ? "Accepted estimates will appear here as operational work." : "Accepted estimates for this lead will appear here as operational work."}</span>
          </div>
        )}

        <div className="hlc-jobs-list">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              disabled={busyJobId === job.id || account.loading}
              canManageLifecycle={canManageLifecycle}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
