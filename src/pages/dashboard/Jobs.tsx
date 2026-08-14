import { useEffect, useState } from "react";
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
    <main className="hlc-jobs-page" style={pageStyle}>
      <h1>Jobs</h1>
      <p style={{ color: "#64748b" }}>Jobs created from accepted estimates.</p>
      {loading && <p>Loading jobs…</p>}
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
      {!loading && !error && jobs.length === 0 && <p>No jobs yet.</p>}
      <div className="hlc-jobs-list" style={{ display: "grid", gap: 12 }}>
        {jobs.map((job) => <JobCard key={job.id} job={job} disabled={busyJobId === job.id} onStatusChange={changeStatus} />)}
      </div>
    </main>
  );
}

const pageStyle = {
  width: "min(1000px, calc(100% - 48px))",
  margin: "40px auto",
  fontFamily: "system-ui, sans-serif",
};
