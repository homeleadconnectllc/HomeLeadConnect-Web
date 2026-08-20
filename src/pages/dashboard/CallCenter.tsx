import { useEffect, useMemo, useState } from "react";
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
  const callLogEntries = useMemo(() => calls.filter((call) => Boolean(call.disposition?.trim())), [calls]);
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="hlc-call-center-workspace">
      <header className="hlc-call-center-header">
        <div>
          <p className="hlc-call-center-eyebrow">COMMUNICATIONS COMMAND CENTER</p>
          <h1>Call Center</h1>
          <p>Run carrier handoffs, connected company lines, persisted call history, operator outcomes, and follow-up evidence from one HLC communications workspace.</p>
        </div>
        <div className="hlc-call-center-summary" aria-label="Call center summary">
          <span><strong>{phones.length}</strong><small>Connected lines</small></span>
          <span><strong>{calls.length}</strong><small>Call sessions</small></span>
          <span><strong>{callLogEntries.length}</strong><small>Logged outcomes</small></span>
          <span><strong>{googleVoicePhone ? "Ready" : "Manual"}</strong><small>Carrier lane</small></span>
        </div>
      </header>

      {loading && <p className="hlc-call-center-state" role="status">Loading communications…</p>}
      {error && <p className="hlc-call-center-state is-error" role="alert">{error}</p>}

      {!loading && googleVoicePhone && (
        <section className="hlc-call-carrier-lane" aria-labelledby="google-voice-companion-heading">
          <div className="hlc-call-section-heading">
            <div>
              <span>ACTIVE CARRIER LANE</span>
              <h2 id="google-voice-companion-heading">Google Voice</h2>
            </div>
            <div className="hlc-call-carrier-number">
              <strong>{formatPhoneNumber(googleVoicePhone.phone_number)}</strong>
              <small>{googleVoicePhone.is_primary ? "Primary HLC company line" : "HLC company line"} · {googleVoicePhone.verification_state}</small>
            </div>
          </div>

          <p className="hlc-call-carrier-explainer">
            Keep HLC open for customer context, compliance checks, notes, outcomes and follow-up while Google Voice handles the live carrier session. HLC never marks a call answered, completed or transferred unless operator or provider evidence records that outcome.
          </p>

          <div className="hlc-call-carrier-grid">
            <div className="hlc-call-device-readiness" aria-label="Google Voice device readiness">
              <strong>{deviceMode === "ios" ? "iPhone call readiness" : deviceMode === "mac" ? "Mac call readiness" : "Desktop call readiness"}</strong>
              {deviceMode === "ios" ? <>
                <span>1. Keep the Google Voice app signed in and allow Voice notifications.</span>
                <span>2. For calls that must originate from your Google Voice number, start the call in Google Voice rather than the iPhone Phone app.</span>
                <span>3. Return to HLC after the call to record the outcome and create follow-up work.</span>
              </> : <>
                <span>1. Keep voice.google.com signed in and open in a supported browser.</span>
                <span>2. Allow browser/system notifications so incoming Voice activity can alert you.</span>
                <span>3. Keep HLC alongside Google Voice for lead context, history and follow-up.</span>
              </>}
            </div>

            <div className="hlc-call-integration-ledger" aria-label="Google Voice integration status">
              <span><strong>Carrier</strong><small>Google Voice</small></span>
              <span><strong>Live ringing</strong><small>Google Voice app/web</small></span>
              <span><strong>Lead context</strong><small>HLC</small></span>
              <span><strong>Compliance + history</strong><small>HLC</small></span>
              <span><strong>Outcome + follow-up</strong><small>HLC</small></span>
              <span><strong>Direct Voice call control API</strong><small>Not connected</small></span>
            </div>
          </div>

          <div className="hlc-call-action-rail">
            <a className="is-primary" href="https://voice.google.com/" target="_blank" rel="noreferrer">{voiceLaunchLabel}</a>
            <Link to="/manual-communications?channel=call&transport=google_voice&direction=outbound">Prepare outbound call</Link>
            <Link to="/manual-communications?channel=sms&transport=google_voice&direction=outbound">Prepare text</Link>
            <Link to="/manual-communications?channel=call&transport=google_voice&direction=inbound">Log inbound call</Link>
            <Link to="/manual-communications?channel=sms&transport=google_voice&direction=inbound">Log inbound text</Link>
          </div>

          <p className="hlc-call-boundary-note">
            Google Voice remains the carrier surface. Features available inside Google Voice depend on the Voice account and plan. HLC does not provide embedded Answer, Hold, Transfer, Hang Up controls and does not claim direct recording, delivery or inbound synchronization unless a supported provider integration supplies that evidence.
          </p>
        </section>
      )}

      {editingCallId && (
        <section className="hlc-call-disposition" role="dialog" aria-modal="true" aria-labelledby="call-disposition-heading" data-smart-compose="off">
          <div className="hlc-call-section-heading">
            <div><span>OPERATOR EVIDENCE</span><h2 id="call-disposition-heading">Record call outcome</h2></div>
          </div>
          <label>Outcome<input autoFocus required maxLength={80} value={disposition} onChange={(event) => setDisposition(event.target.value)} /></label>
          <label>Operator notes<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          <div className="hlc-call-disposition-actions">
            <button type="button" disabled={saving || !disposition.trim()} onClick={saveDisposition}>{saving ? "Saving…" : "Save to call log"}</button>
            <button type="button" disabled={saving} onClick={() => setEditingCallId(null)}>Cancel</button>
          </div>
        </section>
      )}

      <section className="hlc-call-lines" aria-labelledby="business-numbers-heading">
        <div className="hlc-call-section-heading">
          <div><span>ROUTING</span><h2 id="business-numbers-heading">Connected phone lines</h2></div>
          <strong>{phones.length}</strong>
        </div>
        <div className="hlc-call-line-list">
          {!loading && phones.length === 0
            ? <p className="hlc-call-empty">No connected phone line yet. HLC can use a supported provider or device-native/manual communication path once configured.</p>
            : phones.map((phone) => (
              <article className="hlc-call-line-row" key={phone.id}>
                <div className="hlc-call-line-identity">
                  <strong>{phone.display_name}: {formatPhoneNumber(phone.phone_number)}</strong>
                  <small>{providerLabel(phone.provider_type)} · {phone.readiness_state.replaceAll("_", " ")}{phone.is_primary ? " · Primary HLC number" : ""}</small>
                </div>
                <div className="hlc-call-line-capabilities" aria-label="Phone provider capabilities">
                  <span>{capabilityLabel(phone.browser_calling_enabled, "In-app calling ready", "Calls use provider/device handoff")}</span>
                  <span>{capabilityLabel(phone.sms_enabled, "In-app SMS ready", "SMS uses provider/manual logging")}</span>
                  <span>{phone.inbound_enabled ? "Inbound events synchronized" : "Inbound events require operator/provider evidence"}</span>
                </div>
                {phone.provider_type === "google_voice" && !phone.browser_calling_enabled && (
                  <p className="hlc-call-line-note">Google Voice is the active HLC carrier for this line. HLC prepares contact and compliance context, opens the carrier surface, and preserves operator-reported history. Live Google Voice call controls stay inside Google Voice unless a supported API is connected later.</p>
                )}
                <div className="hlc-call-line-actions">
                  {phone.provider_type === "google_voice" ? <>
                    <a className="is-primary" href="https://voice.google.com/" target="_blank" rel="noreferrer">{voiceLaunchLabel}</a>
                    <Link to="/manual-communications?channel=call&transport=google_voice&direction=outbound">Outbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=google_voice&direction=outbound">Outbound text</Link>
                    <Link to="/manual-communications?channel=call&transport=google_voice&direction=inbound">Log inbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=google_voice&direction=inbound">Log inbound text</Link>
                    <a href={`tel:${phone.phone_number}`}>Use device Phone app</a>
                  </> : <>
                    <a href={`tel:${phone.phone_number}`}>Call from this device</a>
                    <Link to="/manual-communications?channel=call&transport=device_native&direction=outbound">Outbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=device_native&direction=outbound">Outbound text</Link>
                    <Link to="/manual-communications?channel=call&transport=device_native&direction=inbound">Log inbound call</Link>
                    <Link to="/manual-communications?channel=sms&transport=device_native&direction=inbound">Log inbound text</Link>
                  </>}
                </div>
              </article>
            ))}
        </div>
      </section>

      <div className="hlc-call-ledgers">
        <section className="hlc-call-log" aria-labelledby="call-log-heading">
          <div className="hlc-call-section-heading">
            <div><span>OUTCOMES</span><h2 id="call-log-heading">Call Log</h2></div>
            <strong>{callLogEntries.length}</strong>
          </div>
          <p className="hlc-call-ledger-intro">Operator-recorded outcomes from persisted HLC call sessions. Notes remain attached to the source call record.</p>
          <div className="hlc-call-ledger-list">
            {!loading && callLogEntries.length === 0
              ? <p className="hlc-call-empty">No call outcomes have been logged yet. Open a call in Call History and record the outcome after the interaction.</p>
              : callLogEntries.map((call) => (
                <article className="hlc-call-ledger-row hlc-call-log-record" key={`log-${call.id}`}>
                  <div className="hlc-call-history-copy">
                    <strong>{call.disposition}</strong>
                    <span>{call.direction || "unknown"} · {call.normalized_state || "requested"}</span>
                    <span>{new Date(call.started_at).toLocaleString()}</span>
                    <span>{call.subject_type ? `${call.subject_type} ${call.subject_id}` : "Caller/contact not linked"}</span>
                  </div>
                  <button type="button" onClick={() => beginDisposition(call)}>Update outcome</button>
                </article>
              ))}
          </div>
        </section>

        <section className="hlc-call-history" aria-labelledby="call-history-heading">
          <div className="hlc-call-section-heading">
            <div><span>ALL RECORDED SESSIONS</span><h2 id="call-history-heading">Call History</h2></div>
            <strong>{calls.length}</strong>
          </div>
          <div className="hlc-call-ledger-list">
            {!loading && calls.length === 0
              ? <p className="hlc-call-empty">No HLC call history yet.</p>
              : calls.map((call) => (
                <article className="hlc-call-ledger-row hlc-call-history-record" key={call.id}>
                  <div className="hlc-call-history-copy">
                    <strong>{call.direction || "unknown"} · {call.normalized_state || "requested"}</strong>
                    <span>{new Date(call.started_at).toLocaleString()}</span>
                    <span>{call.subject_type ? `${call.subject_type} ${call.subject_id}` : "Caller/contact not linked"}</span>
                    {call.disposition && <span>Outcome: {call.disposition}</span>}
                  </div>
                  <button type="button" onClick={() => beginDisposition(call)}>{call.disposition ? "Update call outcome" : "Record call outcome"}</button>
                </article>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
