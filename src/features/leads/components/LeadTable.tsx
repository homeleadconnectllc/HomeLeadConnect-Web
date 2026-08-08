import type { Lead, LeadSort } from "../types/lead";
import LeadRow from "./LeadRow";

type Props = {
  leads: Lead[];
  sort: LeadSort;
  onSort: (sort: LeadSort) => void;
  onOpen: (lead: Lead) => void;
  onArchive: (lead: Lead) => void;
};

export default function LeadTable({
  leads,
  sort,
  onSort,
  onOpen,
  onArchive,
}: Props) {
  const sortButton = (label: string, value: LeadSort) => (
    <button
      type="button"
      onClick={() => onSort(value)}
      style={{
        border: 0,
        background: "transparent",
        color: "#cbd5e1",
        cursor: "pointer",
        fontWeight: 700,
        padding: 0,
      }}
    >
      {label}
      {sort === value ? " ↓" : ""}
    </button>
  );

  return (
    <div
      style={{
        overflowX: "auto",
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 14,
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: 1050,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #334155" }}>
            {[
              "Lead",
              "Lead Code",
              "Stage",
              "Status",
              "Priority",
              "Source",
              "Appointment",
            ].map((heading) => (
              <th key={heading} style={headerStyle}>
                {heading}
              </th>
            ))}

            <th style={headerStyle}>
              {sortButton("Created", "created_at")}
            </th>

            <th style={headerStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              onOpen={onOpen}
              onArchive={onArchive}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const headerStyle = {
  textAlign: "left" as const,
  padding: "12px",
  color: "#94a3b8",
  fontSize: 12,
  textTransform: "uppercase" as const,
  letterSpacing: ".05em",
};
