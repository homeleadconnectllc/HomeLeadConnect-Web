import { formatCurrency } from "../../lib/estimator/calculations";
import type { CrmJob } from "../../lib/types/database";

export default function JobTable({ jobs }: { jobs: CrmJob[] }) {
  return (
    <div className="hlc-ui-overflow-x-1b1d75">
      <table className="hlc-ui-job-table-0ae647">
        <thead>
          <tr>
            <th className="hlc-ui-cell-c1da27">Job</th>
            <th className="hlc-ui-cell-c1da27">Value</th>
            <th className="hlc-ui-cell-c1da27">Status</th>
            <th className="hlc-ui-cell-c1da27">Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="hlc-ui-cell-c1da27">{job.name}</td>
              <td className="hlc-ui-cell-c1da27">{formatCurrency(Number(job.contract_value))}</td>
              <td className="hlc-ui-cell-c1da27">{job.status}</td>
              <td className="hlc-ui-cell-c1da27">{new Date(job.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
