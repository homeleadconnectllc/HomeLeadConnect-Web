import { useState } from "react";
import type { Lead } from "../types/lead";
import {
  formatDate,
  getLeadName,
  humanize,
  normalizeStage,
} from "../hooks/useLeads";
import LeadPriorityBadge from "./LeadPriorityBadge";
import LeadStatusBadge from "./LeadStatusBadge";

type Props = {
  lead: Lead;
  saving: boolean;
  onClose: () => void;
  onSave: (
    updates: Partial<
      Pick<Lead, "status" | "stage" | "priority" | "appointment_at">
    >,
  ) => Promise<boolean>;
};

export default function LeadDetail({
  lead,
  saving,
  onClose,
  onSave,
}: Props) {
  const [status, setStatus] = useState(lead.status ?? "");
  const [stage, setStage] = useState(lead.stage ?? "");
  const [priority, setPriority] = useState(lead.priority ?? "low");
  const [appointment, setAppointment] = useState(
    lead.appointment_at
      ? new Date(lead.appointment_at).toISOString().slice(0, 16)
      : "",
  );

  async function save() {
    await onSave({
      status: status || null,
      stage: stage || null,
      priority,
      appointment_at: appointment
        ? new Date(appointment).toISOString()
        : null,
    });
  }

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={top}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: 12 }}>
              Lead #{lead.id}
            </div>
            <h2 style={{ margin: "4px 0" }}>{getLeadName(lead)}</h2>
            <div style={{ color: "#94a3b8" }}>
              {lead.lead_code ?? "No lead code"}
            </div>
          </div>

          <button type="button" onClick={onClose} style={closeButton}>
            Close
          </button>
        </div>

        <div style={grid}>
          <Info label="Phone" value={lead.phone} />
          <Info label="Email" value={lead.email ?? "—"} />
          <Info label="Source" value={humanize(lead.source)} />
          <Info label="Created" value={formatDate(lead.created_at)} />
          <Info
            label="Last contacted"
            value={formatDate(lead.last_contacted_at)}
          />
          <Info
            label="Next follow-up"
            value={formatDate(lead.next_follow_up_at)}
          />
          <Info
            label="Appointment status"
            value={humanize(lead.appointment_status)}
          />
        </div>

        <div style={section}>
          <label style={label}>Status</label>
          <input
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={input}
          />

          <label style={label}>Stage</label>
          <input
            value={stage}
            onChange={(event) => setStage(event.target.value)}
            style={input}
          />

          <label style={label}>Priority</label>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            style={input}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label style={label}>Appointment</label>
          <input
            type="datetime-local"
            value={appointment}
            onChange={(event) => setAppointment(event.target.value)}
            style={input}
          />
        </div>

        <div style={section}>
          <div style={{ marginBottom: 8 }}>
            <LeadStatusBadge value={normalizeStage(lead.stage)} />{" "}
            <LeadPriorityBadge value={lead.priority} />
          </div>

          <strong>Notes</strong>
          <p style={{ color: "#cbd5e1", whiteSpace: "pre-wrap" }}>
            {lead.notes || "No notes."}
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          style={saveButton}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#64748b", fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 3 }}>{value}</div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(2,6,23,.78)",
  zIndex: 1000,
  display: "flex",
  justifyContent: "flex-end",
};

const panel = {
  width: "min(620px, 100%)",
  height: "100%",
  overflowY: "auto" as const,
  background: "#020617",
  borderLeft: "1px solid #334155",
  padding: 26,
};

const top = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
};

const closeButton = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#fff",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
  gap: 18,
  marginTop: 28,
};

const section = {
  marginTop: 28,
  paddingTop: 20,
  borderTop: "1px solid #1e293b",
};

const label = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  marginBottom: 5,
  marginTop: 14,
};

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "10px 11px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
};

const saveButton = {
  width: "100%",
  marginTop: 24,
  padding: "12px",
  borderRadius: 9,
  border: 0,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
