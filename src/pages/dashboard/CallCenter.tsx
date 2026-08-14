import { useEffect, useState } from "react";
import {
  listBusinessPhones,
  listCallSessions,
  recordCallDisposition,
  type BusinessPhone,
  type CallSession,
} from "../../api/telephony";
import { errorMessage } from "../../lib/errorMessage";

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
      .catch((reason: unknown) => setError(errorMessage(reason, "Unable to load telephony.")))
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
      setError(errorMessage(reason, "Unable to save disposition."));
    } finally { setSaving(false); }
  }

  return (
    <main className="hlc-call-center-page" style={{ width: "min(1000px, calc(100% - 32px))", margin: "32px auto" }}>
      <h1>Call center</h1>
      <p>One operational view of manual and programmable calls. Provider evidence controls call state.</p>
      {loading && <p role="status">Loading calls…</p>}
      {error && <p role="alert">{error}</p>}
      {editingCallId && <section className="hlc-call-disposition" role="dialog" aria-modal="true" aria-labelledby="call-disposition-heading" style={{ padding: 16, border: "2px solid #0f172a", borderRadius: 12 }}>
        <h2 id="call-disposition-heading">Record call disposition</h2>
        <label>Disposition<input autoFocus required maxLength={80} value={disposition} onChange={(event) => setDisposition(event.target.value)} /></label>
        <label>Notes<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <div className="hlc-call-disposition-actions" style={{ display: "flex", gap: 8 }}>
          <button type="button" disabled={saving || !disposition.trim()} onClick={saveDisposition}>{saving ? "Saving…" : "Save disposition"}</button>
          <button type="button" disabled={saving} onClick={() => setEditingCallId(null)}>Cancel</button>
        </div>
      </section>}

      <section aria-labelledby="business-numbers-heading">
        <h2 id="business-numbers-heading">Business numbers</h2>
        <div className="hlc-call-center-list">
          {!loading && phones.length === 0
            ? <p>Phone provider setup required.</p>
            : phones.map((phone) => (
              <article className="hlc-call-center-record" key={phone.id}>
                <strong>{phone.display_name}: {phone.phone_number}</strong>
                <span>{` · ${phone.provider_type} · ${phone.readiness_state}`}{phone.browser_calling_enabled ? " · browser calling" : ""}</span>
              </article>
            ))}
        </div>
      </section>

      <section aria-labelledby="call-history-heading">
        <h2 id="call-history-heading">Call history</h2>
        <div className="hlc-call-center-list">
          {!loading && calls.length === 0
            ? <p>No call sessions.</p>
            : calls.map((call) => (
              <article className="hlc-call-center-record hlc-call-history-record" key={call.id}>
                <div className="hlc-call-history-copy">
                  <strong>{call.direction || "unknown"} · {call.normalized_state || "requested"}</strong>
                  <span>{new Date(call.started_at).toLocaleString()}</span>
                  <span>{call.subject_type ? `${call.subject_type} ${call.subject_id}` : "Unknown caller"}</span>
                  {call.disposition && <span>{call.disposition}</span>}
                </div>
                <button type="button" onClick={() => beginDisposition(call)}>Record disposition</button>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}
