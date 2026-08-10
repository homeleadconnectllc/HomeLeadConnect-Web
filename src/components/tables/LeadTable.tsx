import { Link } from "react-router-dom";
import type { Lead } from "../../lib/types/database";

export default function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cellStyle}>Lead</th>
            <th style={cellStyle}>Contact</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td style={cellStyle}>{lead.full_name || `Lead #${lead.id}`}</td>
              <td style={cellStyle}>{lead.email || lead.phone}</td>
              <td style={cellStyle}>{lead.status || "new"}</td>
              <td style={cellStyle}>
                <Link to={`/estimator?lead=${lead.id}`}>Create Estimate</Link>
              </td>
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
