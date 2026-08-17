import { Link } from "react-router-dom";
import { Calculator, CalendarClock, Mail, Phone } from "lucide-react";
import type { Lead } from "../../lib/types/database";
import PortalInviteButton from "../portal/PortalInviteButton";

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <article className="responsive-record-card hlc-lead-card" style={cardStyle}>
      <div className="hlc-lead-card-copy">
        <span className="hlc-lead-avatar" aria-hidden="true">{(lead.full_name || "L").trim().charAt(0).toUpperCase()}</span>
        <div>
          <h3 style={{ margin: 0 }}>{lead.full_name || `Lead #${lead.id}`}</h3>
          <p style={{ margin: "8px 0", color: "#64748b" }}>
            {lead.email && <span><Mail size={14} aria-hidden="true" />{lead.email}</span>}
            {lead.phone && <span><Phone size={14} aria-hidden="true" />{lead.phone}</span>}
          </p>
        </div>
      </div>
      <div className="hlc-lead-status-cell"><small>Status</small><strong>{lead.status || "new"}</strong></div>
      <div className="hlc-lead-card-actions" style={{ display: "grid", gap: 8 }}>
        <Link className="hlc-lead-primary-action" to={`/estimator?lead=${lead.id}`} style={actionStyle}><Calculator size={16} aria-hidden="true" />Create estimate</Link>
        <Link to={`/follow-ups?lead=${lead.id_uuid}`}><CalendarClock size={16} aria-hidden="true" />Follow up</Link>
        {lead.phone && <Link to={`/manual-communications?contact=lead:${lead.id}&channel=call`}><Phone size={16} aria-hidden="true" />Call</Link>}
        <PortalInviteButton role="homeowner" targetId={lead.id} email={lead.email} label="Portal invite" />
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
