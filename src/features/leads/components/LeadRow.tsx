import type { Lead } from "../types/lead";
import {
  formatDate,
  getLeadName,
  normalizeStage,
  humanize,
} from "../hooks/useLeads";
import LeadPriorityBadge from "./LeadPriorityBadge";
import LeadStatusBadge from "./LeadStatusBadge";

type Props = {
  lead: Lead;
  onOpen: (lead: Lead) => void;
  onArchive: (lead: Lead) => void;
};

export default function LeadRow({ lead, onOpen, onArchive }: Props) {
  return (
    <tr
      style={{
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
      }}
      onClick={() => onOpen(lead)}
    >
      <td style={cellStyle}>
        <strong>{getLeadName(lead)}</strong>
        <div style={{ color: "#64748b", fontSize: 12 }}>
          {lead.phone}
        </div>
      </td>

      <td style={cellStyle}>{lead.lead_code ?? "—"}</td>

      <td style={cellStyle}>
        <LeadStatusBadge value={lead.stage ? normalizeStage(lead.stage) : null} />
      </td>

      <td style={cellStyle}>
        <LeadStatusBadge value={lead.status} />
      </td>

      <td style={cellStyle}>
        <LeadPriorityBadge value={lead.priority} />
      </td>

      <td style={cellStyle}>{humanize(lead.source)}</td>

      <td style={cellStyle}>
        {lead.appointment_at
          ? formatDate(lead.appointment_at)
          : "Not scheduled"}
      </td>

      <td style={cellStyle}>{formatDate(lead.created_at)}</td>

      <td style={cellStyle}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onArchive(lead);
          }}
          style={actionButton}
        >
          Archive
        </button>
      </td>
    </tr>
  );
}

const cellStyle = {
  padding: "14px 12px",
  verticalAlign: "top" as const,
};

const actionButton = {
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#cbd5e1",
  cursor: "pointer",
};
