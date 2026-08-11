import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { listLeads } from "../../api/leads";
import { listContractors } from "../../api/contractors";
import { createFollowUp } from "../../api/followUps";
import {
  checkGoogleVoiceAction,
  configureGoogleVoice,
  getGoogleVoiceConfiguration,
  listGoogleVoiceActivity,
  logGoogleVoiceActivity,
  type CommunicationPurpose,
  type ComplianceResult,
  type GoogleVoiceActivity,
  type ManualCommunicationChannel,
  type ManualCommunicationSubject,
} from "../../api/manualCommunications";
import type { Contractor, Lead } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

type ContactOption = { key: string; type: ManualCommunicationSubject; id: string; label: string; phone: string; followUpLeadId?: string };

const reasonLabels: Record<string, string> = {
  provider_not_connected: "Google Voice has not been configured for this workspace.",
  destination_missing: "The selected contact has no phone number.",
  destination_suppressed: "This phone number is suppressed or on the workspace do-not-contact list.",
  sms_consent_not_proven: "SMS consent has not been recorded for this purpose.",
  outside_permitted_calling_window: "This marketing call is outside the permitted calling window.",
  contact_location_unknown: "The contact location needs review before marketing outreach.",
  dnc_screening_required: "A current do-not-call screening is required for marketing outreach.",
  automated_or_prerecorded_review_required: "Automated or prerecorded communication needs review.",
  recording_consent_not_proven: "Recording consent has not been recorded.",
};

export default function ManualCommunications() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [history, setHistory] = useState<GoogleVoiceActivity[]>([]);
  const [configuredNumber, setConfiguredNumber] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [contactKey, setContactKey] = useState("");
  const [channel, setChannel] = useState<ManualCommunicationChannel>("call");
  const [direction, setDirection] = useState<"inbound" | "outbound">("outbound");
  const [purpose, setPurpose] = useState<CommunicationPurpose>("service");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [check, setCheck] = useState<ComplianceResult | null>(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const contacts = useMemo<ContactOption[]>(() => [
    ...leads.filter((lead) => lead.phone).map((lead) => ({ key: `lead:${lead.id}`, type: "lead" as const, id: String(lead.id), label: lead.full_name || `Lead #${lead.id}`, phone: lead.phone, followUpLeadId: lead.id_uuid })),
    ...contractors.filter((contractor) => contractor.phone).map((contractor) => ({ key: `contractor:${contractor.id}`, type: "contractor" as const, id: String(contractor.id), label: contractor.company_name || contractor.contact_name || `Contractor #${contractor.id}`, phone: contractor.phone || "" })),
  ], [leads, contractors]);
  const selected = contacts.find((contact) => contact.key === contactKey) ?? null;

  const load = useCallback(async () => {
    setError("");
    try {
      const [leadRows, contractorRows, activityRows, configuration] = await Promise.all([
        listLeads(), listContractors(), listGoogleVoiceActivity(), getGoogleVoiceConfiguration(),
      ]);
      setLeads(leadRows); setContractors(contractorRows); setHistory(activityRows);
      setConfiguredNumber(configuration?.sender_identity || "");
      setNumberInput(configuration?.sender_identity || "");
    } catch (reason) { setError(errorMessage(reason, "Unable to load manual communications.")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listLeads(), listContractors(), listGoogleVoiceActivity(), getGoogleVoiceConfiguration()])
      .then(([leadRows, contractorRows, activityRows, configuration]) => {
        if (!active) return;
        setLeads(leadRows); setContractors(contractorRows); setHistory(activityRows);
        setConfiguredNumber(configuration?.sender_identity || "");
        setNumberInput(configuration?.sender_identity || "");
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load manual communications.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function resetCheck() { setCheck(null); setMessage(""); }

  async function saveConfiguration(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try { await configureGoogleVoice(numberInput); await load(); setMessage("Google Voice is available as a manual operator channel for this workspace."); }
    catch (reason) { setError(errorMessage(reason, "Unable to save the Google Voice number.")); }
    finally { setBusy(false); }
  }

  async function checkAction() {
    if (!selected) return;
    setBusy(true); setError(""); setMessage(""); setCheck(null);
    try { setCheck(await checkGoogleVoiceAction({ subjectType: selected.type, subjectId: selected.id, channel, purpose })); }
    catch (reason) { setError(errorMessage(reason, "Unable to check this communication.")); }
    finally { setBusy(false); }
  }

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    if (!selected || (direction === "outbound" && check?.decision !== "ALLOW")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await logGoogleVoiceActivity({ subjectType: selected.type, subjectId: selected.id, channel, direction, purpose, outcome, notes, complianceCheckId: check?.id, requestId });
      if (followUpAt && selected.followUpLeadId) await createFollowUp({ leadId: selected.followUpLeadId, scheduledFor: new Date(followUpAt).toISOString(), notes: `Follow up after Google Voice ${channel === "call" ? "call" : "text"}: ${outcome}` });
      setOutcome(""); setNotes(""); setFollowUpAt(""); setCheck(null); setRequestId(crypto.randomUUID());
      await load(); setMessage("Operator-reported Google Voice activity saved to HLC history.");
    } catch (reason) { setError(errorMessage(reason, "Unable to save the Google Voice activity.")); }
    finally { setBusy(false); }
  }

  return <main style={pageStyle}>
    <h1>Manual calls and texts</h1>
    <p>Use the existing HLC Google Voice account for one-to-one operator calls and interactive texts. Twilio remains the programmable SMS and calling provider.</p>
    <p style={noticeStyle}><strong>Honest record:</strong> HLC records what the operator reports here. It does not claim that Google Voice automatically sent, delivered, or synchronized the communication.</p>
    {loading && <p>Loading communication records…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    {!loading && !configuredNumber && <form onSubmit={saveConfiguration} style={panelStyle}>
      <h2>Set up the manual channel</h2>
      <label>HLC Google Voice business number<input required type="tel" value={numberInput} onChange={(event) => setNumberInput(event.target.value)} /></label>
      <p>This saves only the business number. It does not connect an API or claim automatic synchronization.</p>
      <button disabled={busy} type="submit">{busy ? "Saving…" : "Enable manual Google Voice logging"}</button>
    </form>}
    {!loading && configuredNumber && <>
      <section style={panelStyle}><h2>Google Voice</h2><p>Manual operator channel: <strong>{configuredNumber}</strong></p><a href="https://voice.google.com/" target="_blank" rel="noreferrer">Open Google Voice</a></section>
      <form onSubmit={saveActivity} style={{ ...panelStyle, marginTop: 20 }}>
        <h2>Record an outcome</h2>
        <label>Contact<select required value={contactKey} onChange={(event) => { setContactKey(event.target.value); resetCheck(); }}><option value="">Select a lead or contractor</option>{contacts.map((contact) => <option key={contact.key} value={contact.key}>{contact.label} · {contact.phone}</option>)}</select></label>
        <div style={twoColumnStyle}><label>Channel<select value={channel} onChange={(event) => { setChannel(event.target.value as ManualCommunicationChannel); resetCheck(); }}><option value="call">Call</option><option value="sms">Interactive text</option></select></label><label>Direction<select value={direction} onChange={(event) => { setDirection(event.target.value as "inbound" | "outbound"); resetCheck(); }}><option value="outbound">Outbound</option><option value="inbound">Inbound</option></select></label></div>
        <label>Purpose<select value={purpose} onChange={(event) => { setPurpose(event.target.value as CommunicationPurpose); resetCheck(); }}><option value="service">Service communication</option><option value="appointment">Appointment</option><option value="lead_follow_up">Lead follow-up</option><option value="marketing">Marketing</option></select></label>
        {direction === "outbound" && <button disabled={busy || !selected} type="button" onClick={checkAction}>{busy ? "Checking…" : "Check before contacting"}</button>}
        {direction === "outbound" && check && <div role="status" style={check.decision === "ALLOW" ? allowedStyle : blockedStyle}><strong>{check.decision}</strong>{check.reasons.length > 0 && <ul>{check.reasons.map((reason) => <li key={reason}>{reasonLabels[reason] || reason}</li>)}</ul>}{check.decision === "ALLOW" && <p>You may open Google Voice and perform this manual action. Return here to record the outcome.</p>}</div>}
        <label>Outcome<input required maxLength={80} value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="For example: spoke with homeowner" /></label>
        <label>Notes<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        {selected?.type === "lead" && <label>Optional follow-up date and time<input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} /></label>}
        <button disabled={busy || !selected || !outcome.trim() || (direction === "outbound" && check?.decision !== "ALLOW")} type="submit">{busy ? "Saving…" : "Save operator-reported activity"}</button>
      </form>
      <section style={{ ...panelStyle, marginTop: 20 }}><h2>Recent manual history</h2>{history.length === 0 ? <p>No Google Voice activity has been logged yet.</p> : history.map((item) => <article key={item.id} style={historyStyle}><strong>{item.channel === "call" ? "Call" : "Text"} · {item.manual_outcome}</strong><p>{item.direction} · {item.destination} · operator reported</p>{item.operator_notes && <p>{item.operator_notes}</p>}<small>{new Date(item.created_at).toLocaleString()}</small></article>)}</section>
    </>}
  </main>;
}

const pageStyle = { width: "min(900px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const panelStyle = { display: "grid", gap: 12, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const twoColumnStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const noticeStyle = { padding: 14, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10 };
const allowedStyle = { padding: 12, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10 };
const blockedStyle = { padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10 };
const historyStyle = { padding: "12px 0", borderTop: "1px solid #e2e8f0" };
