import type { LeadFilters as Filters } from "../types/lead";
import { humanize, normalizeStage } from "../hooks/useLeads";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  stageOptions: string[];
  sourceOptions: string[];
};

export default function LeadFilters({
  filters,
  onChange,
  stageOptions,
  sourceOptions,
}: Props) {
  const update = (key: keyof Filters, value: string | boolean) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <>
      <select
        value={filters.archived ? "archived" : "active"}
        onChange={(event) =>
          update("archived", event.target.value === "archived")
        }
        aria-label="Lead status"
        style={selectStyle}
      >
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>

      <select
        value={filters.stage}
        onChange={(event) => update("stage", event.target.value)}
        aria-label="Stage"
        style={selectStyle}
      >
        <option value="">All stages</option>
        {stageOptions.map((stage) => (
          <option key={stage} value={stage}>
            {normalizeStage(stage)}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(event) => update("priority", event.target.value)}
        aria-label="Priority"
        style={selectStyle}
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select
        value={filters.source}
        onChange={(event) => update("source", event.target.value)}
        aria-label="Source"
        style={selectStyle}
      >
        <option value="">All sources</option>
        {sourceOptions.map((source) => (
          <option key={source} value={source}>
            {humanize(source)}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(event) => update("status", event.target.value)}
        aria-label="Status"
        style={selectStyle}
      >
        <option value="">All statuses</option>
        <option value="NEW">New</option>
        <option value="new">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="contacted">Contacted</option>
        <option value="QUALIFIED">Qualified</option>
        <option value="qualified">Qualified</option>
        <option value="APPOINTMENT">Appointment</option>
        <option value="appointment">Appointment</option>
        <option value="CLOSED">Closed</option>
        <option value="closed">Closed</option>
      </select>
    </>
  );
}

const selectStyle = {
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
  minWidth: 130,
};
