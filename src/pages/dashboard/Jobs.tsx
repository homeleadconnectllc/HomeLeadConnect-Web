import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listJobs, updateJobStatus } from "../../api/jobs";
import JobCard from "../../components/jobs/JobCard";
import type { CrmJob, CrmJobStatus } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<CrmJob[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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

  async function changeStatus(job: CrmJob, status: CrmJobStatus) {
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
          <p className="hlc-jobs-kicker">WORK OPERATIONS</p>
          <h1>Jobs</h1>
          <p>Track accepted work from handoff through completion without losing the estimate context.</p>
        </div>
      </header>

      {leadFilter !== null && (
        <div className="hlc-jobs-state" role="status">
          Showing jobs for Lead #{leadFilter}. <button type="button" onClick={clearLeadFilter}>Show all jobs</button>
        </div>
      )}

      <section className="hlc-jobs-summary" aria-label="Job status summary">
        <span><strong>{summary.total}</strong><small>Total jobs</small></span>
        <span><strong>{summary.pending}</strong><small>Pending</small></span>
        <span><strong>{summary.active}</strong><small>Active</small></span>
        <span><strong>{summary.completed}</strong><small>Completed</small></span>
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
          <div className="hlc-jobs-empty">
            <strong>{leadFilter === null ? "No jobs yet." : "No jobs for this lead."}</strong>
            <span>{leadFilter === null ? "Accepted estimates will appear here as operational work." : "Accepted estimates for this lead will appear here as operational work."}</span>
          </div>
        )}

        <div className="hlc-jobs-list">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              disabled={busyJobId === job.id}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
