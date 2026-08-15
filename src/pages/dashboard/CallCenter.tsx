import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
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
  if (providerType === "linked_phone") return "Linked company line";
  return providerType.replaceAll("_", " ");
}

function capabilityLabel(enabled: boolean, enabledText: string, manualText: string) {
  return enabled ? enabledText : manualText;
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

  const googleVoicePhone = phones.find((phone) => phone.provider_type === "google_voice") ?? null;

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
      <p>Calls, connected phone lines, missed-call activity, voicemail state, texts, and operator outcomes in one HomeLead Connect workspace.</p>
      {loading && <p role="status">Loading communications…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && googleVoicePhone && (
        <section className="hlc-google-voice-companion" aria-labelledby="google-voice-companion-heading" style={companionStyle}>
          <div style={{ display: "grid", gap: 6 }}>
            <span style={eyebrowStyle}>ACTIVE CARRIER COMPANION</span>
            <h2 id="google-voice-companion-heading" style={{ margin: 0 }}>Google Voice</h2>
            <strong style={{ fontSize: 22 }}>{formatPhoneNumber(googleVoicePhone.phone_number)}</strong>
            <span>{googleVoicePhone.is_primary ? "Primary HLC company line" : "HLC company line"} · {googleVoicePhone.verification_state}</span>
          </div>
          <p style={{ margin: 0 }}>
            Keep HLC open as your lead and communication workspace while Google Voice handles the live carrier session. Incoming ringing and text alerts come from Google Voice/browser notifications; HLC provides the customer context, handoff, logging, follow-up, and history around that activity.
          </p>
          <div style={companionActionsStyle}>
            <a href="https://voice.google.com/" target="_blank" rel="noreferrer" style={primaryActionStyle}>Open Google Voice</a>
            <Link to="/manual-communications?channel=call&transport=google_voice&direction=outbound" style={actionStyle}>Call</Link>
            <Link to="/manual-communications?channel=sms&transport=google_voice&direction=outbound" style={actionStyle}>Text</Link>
            <Link to="/manual-communications?channel=call&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound call</Link>
            <Link to="/manual-communications?channel=sms&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound text</Link>
          </div>
          <div aria-label="Google Voice integration status" style={statusGridStyle}>
            <span><strong>Carrier:</strong> Google Voice</span>
            <span><strong>Live alerts:</strong> Google Voice/browser</span>
            <span><strong>Lead context:</strong> HLC</span>
            <span><strong>Call/text history:</strong> HLC operator record</span>
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>
            Google Voice is opened as a separate secure carrier surface rather than framed inside HLC. HLC never claims Answer, Hold, Transfer, Hang Up, delivery, or inbound synchronization unless a provider API supplies evidence for those controls.
          </p>
        </section>
      )}

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
              <article className="hlc-call-center-record" key={phone.id} style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>{phone.display_name}: {formatPhoneNumber(phone.phone_number)}</strong>
                  {phone.is_primary && <span> · Primary HLC number</span>}
                </div>
                <span>{providerLabel(phone.provider_type)} · {phone.readiness_state.replaceAll("_", " ")}</span>
                <div aria-label="Phone provider capabilities" style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 14 }}>
                  <span>{capabilityLabel(phone.browser_calling_enabled, "In-app calling ready", "Calls use provider/device handoff")}</span>
                  <span>·</span>
                  <span>{capabilityLabel(phone.sms_enabled, "In-app SMS ready", "SMS uses provider/manual logging")}</span>
                  <span>·</span>
                  <span>{phone.inbound_enabled ? "Inbound events synchronized" : "Inbound events require operator/provider evidence"}</span>
                </div>
                {phone.provider_type === "google_voice" && !phone.browser_calling_enabled && (
                  <p style={{ margin: 0, color: "#475569" }}>
                    Google Voice is the active HLC carrier for this line. HLC can hand off calls/texts and preserve operator-reported history; embedded Answer, Hold, Transfer, Hang Up and automatic inbound synchronization remain unavailable until a programmable provider supplies those controls.
                  </p>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href={`tel:${phone.phone_number}`} style={actionStyle}>Call from this device</a>
                  {phone.provider_type === "google_voice" ? <>
                    <a href="https://voice.google.com/" target="_blank" rel="noreferrer" style={actionStyle}>Open Google Voice</a>
                    <Link to="/manual-communications?channel=call&transport=google_voice&direction=outbound" style={actionStyle}>Outbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=google_voice&direction=outbound" style={actionStyle}>Outbound text</Link>
                    <Link to="/manual-communications?channel=call&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound text</Link>
                  </> : <>
                    <Link to="/manual-communications?channel=call&transport=device_native&direction=outbound" style={actionStyle}>Outbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=device_native&direction=outbound" style={actionStyle}>Outbound text</Link>
                    <Link to="/manual-communications?channel=call&transport=device_native&direction=inbound" style={secondaryActionStyle}>Log inbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=device_native&direction=inbound" style={secondaryActionStyle}>Log inbound text</Link>
                  </>}
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

const actionStyle: CSSProperties = { display: "inline-flex", minHeight: 40, alignItems: "center", padding: "8px 12px", border: "1px solid #0f172a", borderRadius: 10, fontWeight: 800, textDecoration: "none", color: "#0f172a", background: "#fff" };
const primaryActionStyle: CSSProperties = { ...actionStyle, background: "#0f172a", color: "#fff" };
const secondaryActionStyle: CSSProperties = { ...actionStyle, borderColor: "#94a3b8", color: "#334155" };
const companionStyle: CSSProperties = { display: "grid", gap: 16, padding: 20, margin: "24px 0", border: "1px solid #bfdbfe", borderRadius: 18, background: "linear-gradient(145deg, #eff6ff 0%, #ecfeff 100%)", boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" };
const companionActionsStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" };
const statusGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.82)" };
const eyebrowStyle: CSSProperties = { fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: "#075985" };
