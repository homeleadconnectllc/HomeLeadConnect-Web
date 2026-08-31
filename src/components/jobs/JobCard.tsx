import { MoreHorizontal } from "lucide-react";
import { allowedJobStatusTransitions } from "../../api/jobs";
import { formatCurrency } from "../../lib/estimator/calculations";
import type { CrmJob, CrmJobStatus } from "../../lib/types/database";
import { Link } from "react-router-dom";

export default function JobCard({
  job,
  onStatusChange,
  disabled,
  canManageLifecycle,
}: {
  job: CrmJob;
  onStatusChange: (job: CrmJob, status: CrmJobStatus) => void;
  disabled?: boolean;
  canManageLifecycle: boolean;
}) {
  const leadRecord = job.lead_id == null ? null : encodeURIComponent(String(job.lead_id));
  const availableStatuses = [job.status, ...allowedJobStatusTransitions(job.status)];
  const secondaryActions = (
    <>
      {leadRecord && <Link to={`/follow-ups?leadRecord=${leadRecord}`}>Schedule follow-up</Link>}
      {leadRecord && <Link to={`/manual-communications?channel=call&direction=outbound&contact=lead:${leadRecord}`}>Prepare call</Link>}
      <Link to={`/documents?entityType=job&entityId=${encodeURIComponent(job.id)}`}>Attach evidence</Link>
    </>
  );

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
        <small>{job.source_estimate_id ? "LeadScope estimate linked" : "No source estimate"}</small>
      </div>

      <div className="hlc-job-actions">
        <span className="hlc-job-cell-label">Status</span>
        {canManageLifecycle && availableStatuses.length > 1 ? (
          <select
            disabled={disabled}
            aria-label={`Status for ${job.name}`}
            value={job.status}
            onChange={(event) =>
              onStatusChange(job, event.target.value as CrmJobStatus)
            }
          >
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status[0].toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <strong aria-label={`Status for ${job.name}`}>{job.status[0].toUpperCase() + job.status.slice(1)}</strong>
        )}
        <Link className="hlc-job-open" to={`/jobs/${job.id}`}>Open job</Link>
        <span className="hlc-s2-desktop-secondary">{secondaryActions}</span>
        <details className="hlc-s2-mobile-overflow">
          <summary aria-label={`More actions for ${job.name}`}><MoreHorizontal size={17} aria-hidden="true" /><span>More</span></summary>
          <div className="hlc-s2-overflow-menu">{secondaryActions}</div>
        </details>
      </div>
    </article>
  );
}
