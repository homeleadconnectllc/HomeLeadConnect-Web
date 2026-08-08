import { useState } from "react";

type Props = {
  saving: boolean;
  workspaceIds: string[];
  onClose: () => void;
  onSubmit: (payload: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string;
    email: string | null;
    lead_code: string | null;
    status: string;
    stage: string;
    priority: string;
    source: string | null;
    appointment_at: string | null;
    notes: string | null;
    archived: boolean;
    workspace_id: string;
  }) => Promise<boolean>;
};

export default function LeadForm({
  saving,
  workspaceIds,
  onClose,
  onSubmit,
}: Props) {
  const [workspace, setWorkspace] = useState(
    workspaceIds.length === 1 ? workspaceIds[0] : "",
  );
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [leadCode, setLeadCode] = useState("");
  const [status, setStatus] = useState("NEW");
  const [stage, setStage] = useState("NEW");
  const [priority, setPriority] = useState("low");
  const [source, setSource] = useState("");
  const [appointment, setAppointment] = useState("");
  const [notes, setNotes] = useState("");
  const [localError, setLocalError] = useState("");

  async function submit() {
    if (!workspace) {
      setLocalError(
        "We couldn't determine your workspace. Please refresh and try again.",
      );
      return;
    }

    if (!phone.trim()) {
      setLocalError("Phone is required.");
      return;
    }

    setLocalError("");

    const success = await onSubmit({
      full_name: fullName.trim() || null,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      phone: phone.trim(),
      email: email.trim() || null,
      lead_code: leadCode.trim() || null,
      status,
      stage,
      priority,
      source: source.trim() || null,
      appointment_at: appointment
        ? new Date(appointment).toISOString()
        : null,
      notes: notes.trim() || null,
      archived: false,
      workspace_id: workspace,
    });

    if (success) onClose();
  }

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={top}>
          <h2 style={{ margin: 0 }}>Add Lead</h2>
          <button type="button" onClick={onClose} style={close}>
            Close
          </button>
        </div>

        {localError && <div style={error}>{localError}</div>}

        {workspaceIds.length > 1 && (
          <>
            <label style={label}>Workspace</label>
            <select
              value={workspace}
              onChange={(event) => setWorkspace(event.target.value)}
              style={input}
            >
              <option value="">Select workspace</option>
              {workspaceIds.map((id) => (
                <option key={id} value={id}>
                  Workspace {id.slice(0, 8)}
                </option>
              ))}
            </select>
          </>
        )}

        <Field label="Full name" value={fullName} onChange={setFullName} />
        <Field label="First name" value={firstName} onChange={setFirstName} />
        <Field label="Last name" value={lastName} onChange={setLastName} />
        <Field
          label="Phone *"
          value={phone}
          onChange={setPhone}
          type="tel"
        />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Lead code" value={leadCode} onChange={setLeadCode} />

        <label style={label}>Status</label>
        <input value={status} onChange={(e) => setStatus(e.target.value)} style={input} />

        <label style={label}>Stage</label>
        <input value={stage} onChange={(e) => setStage(e.target.value)} style={input} />

        <label style={label}>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={input}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <Field label="Source" value={source} onChange={setSource} />

        <label style={label}>Appointment</label>
        <input
          type="datetime-local"
          value={appointment}
          onChange={(e) => setAppointment(e.target.value)}
          style={input}
        />

        <label style={label}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          style={{ ...input, resize: "vertical" as const }}
        />

        <button
          type="button"
          disabled={saving}
          onClick={() => void submit()}
          style={saveButton}
        >
          {saving ? "Creating..." : "Create lead"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={input}
      />
    </>
  );
}

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(2,6,23,.78)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const panel = {
  width: "min(620px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto" as const,
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: 14,
  padding: 24,
};

const top = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const close = {
  padding: "8px 11px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#fff",
};

const labelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 13,
  marginBottom: 5,
};

const label = labelStyle;

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
  marginTop: 20,
  padding: "12px",
  borderRadius: 9,
  border: 0,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
};

const error = {
  padding: 10,
  marginBottom: 12,
  borderRadius: 8,
  background: "#450a0a",
  color: "#fecaca",
};
