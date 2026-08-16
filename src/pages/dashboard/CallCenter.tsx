import { useEffect, useMemo, useState, type CSSProperties } from "react";
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

function getDeviceMode() {
  if (typeof navigator === "undefined") return "desktop" as const;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios" as const;
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac" as const;
  return "desktop" as const;
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
  const deviceMode = useMemo(() => getDeviceMode(), []);
  const voiceLaunchLabel = deviceMode === "ios" ? "Open Google Voice for iPhone" : "Open Google Voice";

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
            Keep HLC open for customer context, compliance checks, notes, outcomes and follow-up while Google Voice handles the live carrier session. HLC never marks a call answered, completed or transferred unless operator or provider evidence records that outcome.
          </p>

          <div style={deviceReadinessStyle} aria-label="Google Voice device readiness">
            <strong>{deviceMode === "ios" ? "iPhone call readiness" : deviceMode === "mac" ? "Mac call readiness" : "Desktop call readiness"}</strong>
            {deviceMode === "ios" ? <>
              <span>1. Keep the Google Voice app signed in and allow Voice notifications.</span>
              <span>2. For calls that must originate from your Google Voice number, start the call in Google Voice rather than the iPhone Phone app.</span>
              <span>3. Return to HLC after the call to record the outcome and create follow-up work.</span>
            </> : <>
              <span>1. Keep voice.google.com signed in and open in a supported browser.</span>
              <span>2. Allow browser/macOS notifications so incoming Voice activity can alert you.</span>
              <span>3. Keep HLC alongside Google Voice for lead context, history and follow-up.</span>
            </>}
          </div>

          <div style={companionActionsStyle}>
            <a href="https://voice.google.com/" target="_blank" rel="noreferrer" style={primaryActionStyle}>{voiceLaunchLabel}</a>
            <Link to="/manual-communications?channel=call&transport=google_voice&direction=outbound" style={actionStyle}>Prepare outbound call</Link>
            <Link to="/manual-communications?channel=sms&transport=google_voice&direction=outbound" style={actionStyle}>Prepare text</Link>
            <Link to="/manual-communications?channel=call&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound call</Link>
            <Link to="/manual-communications?channel=sms&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound text</Link>
          </div>

          <div aria-label="Google Voice integration status" style={statusGridStyle}>
            <span><strong>Carrier:</strong> Google Voice</span>
            <span><strong>Live ringing:</strong> Google Voice app/web</span>
            <span><strong>Lead context:</strong> HLC</span>
            <span><strong>Compliance + history:</strong> HLC</span>
            <span><strong>Outcome + follow-up:</strong> HLC</span>
            <span><strong>Direct Voice call control API:</strong> Not connected</span>
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>
            Google Voice remains the carrier surface. Features available inside Google Voice depend on the Voice account and plan. HLC does not provide embedded Answer, Hold, Transfer, Hang Up controls and does not claim direct recording, delivery or inbound synchronization unless a supported provider integration supplies that evidence.
          </p>
        </section>
      )}

      {editingCallId && <section className="hlc-call-disposition" role="dialog" aria-modal="true" aria-labelledby="call-disposition-heading" style={{ padding: 16, border: "2px solid #0f172a", borderRadius: 12 }} data-smart-compose="off">
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
                    Google Voice is the active HLC carrier for this line. HLC prepares the contact and compliance context, opens the carrier surface, and preserves operator-reported history. Live Google Voice call controls stay inside Google Voice unless a supported API is connected later.
                  </p>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {phone.provider_type === "google_voice" ? <>
                    <a href="https://voice.google.com/" target="_blank" rel="noreferrer" style={primaryActionStyle}>{voiceLaunchLabel}</a>
                    <Link to="/manual-communications?channel=call&transport=google_voice&direction=outbound" style={actionStyle}>Outbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=google_voice&direction=outbound" style={actionStyle}>Outbound text</Link>
                    <Link to="/manual-communications?channel=call&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=google_voice&direction=inbound" style={secondaryActionStyle}>Log inbound text</Link>
                    <a href={`tel:${phone.phone_number}`} style={secondaryActionStyle}>Use device Phone app</a>
                  </> : <>
                    <a href={`tel:${phone.phone_number}`} style={actionStyle}>Call from this device</a>
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
const deviceReadinessStyle: CSSProperties = { display: "grid", gap: 6, padding: 14, border: "1px solid #bae6fd", borderRadius: 12, background: "rgba(255,255,255,0.9)", color: "#334155" };
const eyebrowStyle: CSSProperties = { fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: "#075985" };
