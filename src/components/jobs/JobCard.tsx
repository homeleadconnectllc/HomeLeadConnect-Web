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
    <article style={cardStyle}>
      <div>
        <h3 style={{ margin: 0 }}>{job.name}</h3>
        <p style={{ margin: "8px 0", color: "#475569" }}>
          {formatCurrency(Number(job.contract_value))}
        </p>
        <small>Estimate: {job.source_estimate_id}</small>
      </div>
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
      <Link to={`/jobs/${job.id}`}>Open job</Link>
    </article>
  );
}

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  padding: 20,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
};
