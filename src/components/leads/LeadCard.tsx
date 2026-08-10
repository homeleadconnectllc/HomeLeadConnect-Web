import { Link } from "react-router-dom";
import type { Lead } from "../../lib/types/database";

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <article style={cardStyle}>
      <div>
        <h3 style={{ margin: 0 }}>{lead.full_name || `Lead #${lead.id}`}</h3>
        <p style={{ margin: "8px 0", color: "#64748b" }}>
          {[lead.email, lead.phone].filter(Boolean).join(" · ")}
        </p>
        <small>Status: {lead.status || "new"}</small>
      </div>
      <Link to={`/estimator?lead=${lead.id}`} style={actionStyle}>
        Create Estimate
      </Link>
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

const actionStyle = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  textDecoration: "none",
  whiteSpace: "nowrap" as const,
};
