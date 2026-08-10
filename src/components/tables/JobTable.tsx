import { formatCurrency } from "../../lib/estimator/calculations";
import type { CrmJob } from "../../lib/types/database";

export default function JobTable({ jobs }: { jobs: CrmJob[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cellStyle}>Job</th>
            <th style={cellStyle}>Value</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td style={cellStyle}>{job.name}</td>
              <td style={cellStyle}>{formatCurrency(Number(job.contract_value))}</td>
              <td style={cellStyle}>{job.status}</td>
              <td style={cellStyle}>{new Date(job.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = {
  padding: 12,
  textAlign: "left" as const,
  borderBottom: "1px solid #e2e8f0",
};
