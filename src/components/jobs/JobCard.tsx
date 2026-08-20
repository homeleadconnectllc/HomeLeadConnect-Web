import { formatCurrency } from "../../lib/estimator/calculations";
import type { CrmJob, CrmJobStatus } from "../../lib/types/database";
import { Link } from "react-router-dom";

const statuses: CrmJobStatus[] = ["pending", "active", "completed", "cancelled"];

export default function JobCard({
  job,
  onStatusChange,
  disabled,
}: {
  job: CrmJob;
  onStatusChange: (job: CrmJob, status: CrmJobStatus) => void;
  disabled?: boolean;
}) {
  return (
    <article className="hlc-job-row">
      <div className="hlc-job-identity">
        <span className="hlc-job-status-dot" data-status={job.status} aria-hidden="true" />
        <div className="hlc-job-identity-copy">
          <strong>{job.name}</strong>
          <span>Job #{job.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="hlc-job-value-cell">
        <span className="hlc-job-cell-label">Value</span>
        <strong>{formatCurrency(Number(job.contract_value))}</strong>
        <small>Estimate {job.source_estimate_id}</small>
      </div>

      <div className="hlc-job-actions">
        <span className="hlc-job-cell-label">Status</span>
        <select
          disabled={disabled}
          aria-label={`Status for ${job.name}`}
          value={job.status}
          onChange={(event) =>
            onStatusChange(job, event.target.value as CrmJobStatus)
          }
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status[0].toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <Link className="hlc-job-open" to={`/jobs/${job.id}`}>Open job</Link>
        <Link to={`/documents?entityType=job&entityId=${encodeURIComponent(job.id)}`}>Attach evidence</Link>
      </div>
    </article>
  );
}
