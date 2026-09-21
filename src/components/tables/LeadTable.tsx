import { Link } from "react-router-dom";
import type { Lead } from "../../lib/types/database";

export default function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="hlc-ui-overflow-x-1b1d75">
      <table className="hlc-ui-job-table-0ae647">
        <thead>
          <tr>
            <th className="hlc-ui-cell-c1da27">Lead</th>
            <th className="hlc-ui-cell-c1da27">Contact</th>
            <th className="hlc-ui-cell-c1da27">Status</th>
            <th className="hlc-ui-cell-c1da27">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="hlc-ui-cell-c1da27">{lead.full_name || `Lead #${lead.id}`}</td>
              <td className="hlc-ui-cell-c1da27">{lead.email || lead.phone}</td>
              <td className="hlc-ui-cell-c1da27">{lead.status || "new"}</td>
              <td className="hlc-ui-cell-c1da27">
                <Link to={`/estimator?lead=${lead.id}`}>Create Estimate</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
