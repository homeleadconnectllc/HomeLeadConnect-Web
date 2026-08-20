import { useEffect, useMemo, useState } from "react";
import { listJobs, updateJobStatus } from "../../api/jobs";
import JobCard from "../../components/jobs/JobCard";
import type { CrmJob, CrmJobStatus } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

export default function Jobs() {
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

  const summary = useMemo(() => ({
    total: jobs.length,
    pending: jobs.filter((job) => job.status === "pending").length,
    active: jobs.filter((job) => job.status === "active").length,
    completed: jobs.filter((job) => job.status === "completed").length,
  }), [jobs]);

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

  return (
    <main className="hlc-jobs-workspace">
      <header className="hlc-jobs-header">
        <div>
          <p className="hlc-jobs-kicker">WORK OPERATIONS</p>
          <h1>Jobs</h1>
          <p>Track accepted work from handoff through completion without losing the estimate context.</p>
        </div>
      </header>

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
        {!loading && !error && jobs.length === 0 && (
          <div className="hlc-jobs-empty">
            <strong>No jobs yet</strong>
            <span>Accepted estimates will appear here as operational work.</span>
          </div>
        )}

        <div className="hlc-jobs-list">
          {jobs.map((job) => (
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
