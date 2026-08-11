import { Link } from "react-router-dom";
import type { Lead } from "../../lib/types/database";
import PortalInviteButton from "../portal/PortalInviteButton";

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <article className="responsive-record-card" style={cardStyle}>
      <div>
        <h3 style={{ margin: 0 }}>{lead.full_name || `Lead #${lead.id}`}</h3>
        <p style={{ margin: "8px 0", color: "#64748b" }}>
          {[lead.email, lead.phone].filter(Boolean).join(" · ")}
        </p>
        <small>Status: {lead.status || "new"}</small>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <Link to={`/estimator?lead=${lead.id}`} style={actionStyle}>Create Estimate</Link>
        <Link to={`/follow-ups?lead=${lead.id_uuid}`}>Schedule follow-up</Link>
        <PortalInviteButton role="homeowner" targetId={lead.id} email={lead.email} label="Invite to homeowner portal" />
      </div>
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
