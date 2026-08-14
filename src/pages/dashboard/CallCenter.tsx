import { useEffect, useState } from "react";
import {
  listBusinessPhones,
  listCallSessions,
  recordCallDisposition,
  type BusinessPhone,
  type CallSession,
} from "../../api/telephony";
import { errorMessage } from "../../lib/errorMessage";

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (local.length !== 10) return value;
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

function providerLabel(providerType: string) {
  if (providerType === "google_voice") return "Google Voice";
  return providerType.replaceAll("_", " ");
}

export default function CallCenter() {
  const [phones, setPhones] = useState<BusinessPhone[]>([]);
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [disposition, setDisposition] = useState("");
  const [notes, setNotes] = useState("");

  async function loadCalls() {
    setCalls(await listCallSessions());
  }

  useEffect(() => {
    Promise.all([listBusinessPhones(), listCallSessions()])
      .then(([phoneRows, callRows]) => {
        setPhones(phoneRows);
        setCalls(callRows);
      })
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load HLC communications.")))
      .finally(() => setLoading(false));
  }, []);

  function beginDisposition(call: CallSession) {
    setEditingCallId(call.id);
    setDisposition(call.disposition || "");
    setNotes("");
  }

  async function saveDisposition() {
    if (!editingCallId || !disposition.trim()) return;
    try {
      setSaving(true);
      setError("");
      await recordCallDisposition(editingCallId, disposition, notes);
      await loadCalls();
      setEditingCallId(null);
      setDisposition("");
      setNotes("");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save the call outcome."));
    } finally { setSaving(false); }
  }

  return (
    <main className="hlc-call-center-page" style={{ width: "min(1000px, calc(100% - 32px))", margin: "32px auto" }}>
      <h1>HLC Communications Hub</h1>
      <p>Calls, connected phone lines, missed-call activity, voicemail state, and operator outcomes in one HomeLead Connect workspace.</p>
      {loading && <p role="status">Loading communications…</p>}
      {error && <p role="alert">{error}</p>}
      {editingCallId && <section className="hlc-call-disposition" role="dialog" aria-modal="true" aria-labelledby="call-disposition-heading" style={{ padding: 16, border: "2px solid #0f172a", borderRadius: 12 }}>
        <h2 id="call-disposition-heading">Record call outcome</h2>
        <label>Outcome<input autoFocus required maxLength={80} value={disposition} onChange={(event) => setDisposition(event.target.value)} /></label>
        <label>Operator notes<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <div className="hlc-call-disposition-actions" style={{ display: "flex", gap: 8 }}>
          <button type="button" disabled={saving || !disposition.trim()} onClick={saveDisposition}>{saving ? "Saving…" : "Save call outcome"}</button>
          <button type="button" disabled={saving} onClick={() => setEditingCallId(null)}>Cancel</button>
        </div>
      </section>}

      <section aria-labelledby="business-numbers-heading">
        <h2 id="business-numbers-heading">Connected phone lines</h2>
        <div className="hlc-call-center-list">
          {!loading && phones.length === 0
            ? <p>No connected phone line yet. HLC can use a supported provider or device-native/manual communication path once configured.</p>
            : phones.map((phone) => (
              <article className="hlc-call-center-record" key={phone.id} style={{ display: "grid", gap: 8 }}>
                <div>
                  <strong>{phone.display_name}: {formatPhoneNumber(phone.phone_number)}</strong>
                  {phone.is_primary && <span> · Primary HLC number</span>}
                </div>
                <span>{providerLabel(phone.provider_type)} · {phone.readiness_state.replaceAll("_", " ")}{phone.browser_calling_enabled ? " · in-app calling enabled" : ""}</span>
                {phone.provider_type === "google_voice" && !phone.browser_calling_enabled && (
                  <p style={{ margin: 0, color: "#475569" }}>
                    Google Voice remains the current carrier. HLC records the line and call workflow; live browser answer controls activate only after a programmable WebRTC/SIP provider is connected.
                  </p>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href={`tel:${phone.phone_number}`} style={{ display: "inline-flex", minHeight: 40, alignItems: "center", padding: "8px 12px", border: "1px solid #0f172a", borderRadius: 10, fontWeight: 800, textDecoration: "none", color: "#0f172a" }}>
                    Call from this device
                  </a>
                  {phone.browser_calling_enabled
                    ? <span role="status" style={{ alignSelf: "center", fontWeight: 700 }}>Embedded phone ready</span>
                    : <span style={{ alignSelf: "center", color: "#64748b" }}>Embedded phone awaiting programmable carrier</span>}
                </div>
              </article>
            ))}
        </div>
      </section>

      <section aria-labelledby="call-history-heading">
        <h2 id="call-history-heading">Call activity</h2>
        <div className="hlc-call-center-list">
          {!loading && calls.length === 0
            ? <p>No HLC call activity yet.</p>
            : calls.map((call) => (
              <article className="hlc-call-center-record hlc-call-history-record" key={call.id}>
                <div className="hlc-call-history-copy">
                  <strong>{call.direction || "unknown"} · {call.normalized_state || "requested"}</strong>
                  <span>{new Date(call.started_at).toLocaleString()}</span>
                  <span>{call.subject_type ? `${call.subject_type} ${call.subject_id}` : "Unknown caller"}</span>
                  {call.disposition && <span>{call.disposition}</span>}
                </div>
                <button type="button" onClick={() => beginDisposition(call)}>Record call outcome</button>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
