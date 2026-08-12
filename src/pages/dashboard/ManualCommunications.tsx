import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { listLeads } from "../../api/leads";
import { listContractors } from "../../api/contractors";
import { createFollowUp } from "../../api/followUps";
import {
  checkGoogleVoiceAction,
  checkNativeDeviceAction,
  configureGoogleVoice,
  getGoogleVoiceConfiguration,
  listManualCommunicationActivity,
  logManualCommunicationActivity,
  normalizeNativePhoneTarget,
  type CommunicationPurpose,
  type ComplianceResult,
  type ManualCommunicationActivity,
  type ManualCommunicationChannel,
  type ManualCommunicationSubject,
  type ManualCommunicationTransport,
} from "../../api/manualCommunications";
import type { Contractor, Lead } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";
import { listConversations, type Conversation } from "../../api/messages";

type ContactOption = {
  key: string;
  type: ManualCommunicationSubject;
  id: string;
  label: string;
  phone: string;
  followUpLeadId?: string;
};

const reasonLabels: Record<string, string> = {
  provider_not_connected: "The selected provider is not connected for this workspace.",
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
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [history, setHistory] = useState<ManualCommunicationActivity[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [configuredNumber, setConfiguredNumber] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [contactKey, setContactKey] = useState(() => searchParams.get("contact") || "");
  const [channel, setChannel] = useState<ManualCommunicationChannel>(() => searchParams.get("channel") === "sms" ? "sms" : "call");
  const [transport, setTransport] = useState<ManualCommunicationTransport>("device_native");
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
    ...leads.filter((lead) => lead.phone).map((lead) => ({
      key: `lead:${lead.id}`,
      type: "lead" as const,
      id: String(lead.id),
      label: lead.full_name || `Lead #${lead.id}`,
      phone: lead.phone,
      followUpLeadId: lead.id_uuid,
    })),
    ...contractors.filter((contractor) => contractor.phone).map((contractor) => ({
      key: `contractor:${contractor.id}`,
      type: "contractor" as const,
      id: String(contractor.id),
      label: contractor.company_name || contractor.contact_name || `Contractor #${contractor.id}`,
      phone: contractor.phone || "",
    })),
  ], [leads, contractors]);

  const selected = contacts.find((contact) => contact.key === contactKey) ?? null;
  const nativeTarget = selected ? normalizeNativePhoneTarget(selected.phone) : "";

  const load = useCallback(async () => {
    try {
      const [leadRows, contractorRows, activityRows, conversationRows] = await Promise.all([
        listLeads(), listContractors(), listManualCommunicationActivity(), listConversations(),
      ]);
      setLeads(leadRows);
      setContractors(contractorRows);
      setHistory(activityRows);
      setConversations(conversationRows);
      try {
        const configuration = await getGoogleVoiceConfiguration();
        setConfiguredNumber(configuration?.sender_identity || "");
        setNumberInput(configuration?.sender_identity || "");
      } catch {
        setConfiguredNumber("");
      }
    } catch (reason) {
      setError(errorMessage(reason, "Unable to load manual communications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listLeads(), listContractors(), listManualCommunicationActivity(), listConversations()])
      .then(async ([leadRows, contractorRows, activityRows, conversationRows]) => {
        if (!active) return;
        setLeads(leadRows);
        setContractors(contractorRows);
        setHistory(activityRows);
        setConversations(conversationRows);
        try {
          const configuration = await getGoogleVoiceConfiguration();
          if (!active) return;
          setConfiguredNumber(configuration?.sender_identity || "");
          setNumberInput(configuration?.sender_identity || "");
        } catch {
          if (active) setConfiguredNumber("");
        }
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, "Unable to load manual communications.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function resetCheck() {
    setCheck(null);
    setMessage("");
  }

  async function saveConfiguration(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await configureGoogleVoice(numberInput);
      await load();
      setMessage("Google Voice is available as an optional manual operator channel for this workspace.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save the Google Voice number."));
    } finally {
      setBusy(false);
    }
  }

  async function checkAction() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setMessage("");
    setCheck(null);
    try {
      const input = { subjectType: selected.type, subjectId: selected.id, channel, purpose };
      const result = transport === "device_native" ? await checkNativeDeviceAction(input) : await checkGoogleVoiceAction(input);
      setCheck(result);
    } catch (reason) {
      setError(errorMessage(reason, "Unable to check this communication."));
    } finally {
      setBusy(false);
    }
  }

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    if (!selected || (direction === "outbound" && check?.decision !== "ALLOW")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await logManualCommunicationActivity({
        subjectType: selected.type,
        subjectId: selected.id,
        channel,
        direction,
        purpose,
        providerName: transport,
        outcome,
        notes,
        complianceCheckId: check?.id,
        conversationId: conversationId || undefined,
        requestId,
      });
      if (followUpAt && selected.followUpLeadId) {
        await createFollowUp({
          leadId: selected.followUpLeadId,
          scheduledFor: new Date(followUpAt).toISOString(),
          notes: `Follow up after ${transport === "device_native" ? "device" : "Google Voice"} ${channel === "call" ? "call" : "text"}: ${outcome}`,
        });
      }
      setOutcome("");
      setNotes("");
      setFollowUpAt("");
      setCheck(null);
      setRequestId(crypto.randomUUID());
      await load();
      setMessage("Operator-reported communication saved to HLC history.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save the communication activity."));
    } finally {
      setBusy(false);
    }
  }

  const canHandoff = direction === "outbound" && check?.decision === "ALLOW" && Boolean(nativeTarget);

  return <main style={pageStyle}>
    <h1>Manual calls and texts</h1>
    <p>Use your phone or computer&apos;s native calling/text app as the baseline manual channel. Google Voice remains an optional operator tool when configured.</p>
    <p style={noticeStyle}><strong>Honest record:</strong> HLC opens the selected device/provider after a compliance check and records only the outcome you report. It does not claim a call connected, a text delivered, or a provider synchronized unless provider evidence proves it.</p>

    {loading && <p role="status">Loading communication records…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}

    {!loading && !configuredNumber && <form onSubmit={saveConfiguration} style={panelStyle}>
      <h2>Optional Google Voice channel</h2>
      <label>HLC Google Voice business number<input required type="tel" value={numberInput} onChange={(event) => setNumberInput(event.target.value)} /></label>
      <p>Device-native calling works without this. Saving a number only enables Google Voice as an additional manual channel; it does not connect a private API.</p>
      <button disabled={busy} type="submit">{busy ? "Saving…" : "Enable optional Google Voice logging"}</button>
    </form>}

    {!loading && configuredNumber && <section style={panelStyle}>
      <h2>Optional Google Voice</h2>
      <p>Manual operator number: <strong>{configuredNumber}</strong></p>
      <a href="https://voice.google.com/" target="_blank" rel="noreferrer">Open Google Voice</a>
    </section>}

    {!loading && <form onSubmit={saveActivity} style={{ ...panelStyle, marginTop: 20 }}>
      <h2>Contact and record outcome</h2>
      <label>Contact<select required value={contactKey} onChange={(event) => { setContactKey(event.target.value); resetCheck(); }}><option value="">Select a lead or contractor</option>{contacts.map((contact) => <option key={contact.key} value={contact.key}>{contact.label} · {contact.phone}</option>)}</select></label>
      <label>Related HLC conversation<select value={conversationId} onChange={(event) => setConversationId(event.target.value)}><option value="">No conversation selected</option>{conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.subject}</option>)}</select></label>
      <div style={twoColumnStyle}>
        <label>Transport<select value={transport} onChange={(event) => { setTransport(event.target.value as ManualCommunicationTransport); resetCheck(); }}><option value="device_native">This device</option><option value="google_voice" disabled={!configuredNumber}>Google Voice{configuredNumber ? "" : " — not configured"}</option></select></label>
        <label>Channel<select value={channel} onChange={(event) => { setChannel(event.target.value as ManualCommunicationChannel); resetCheck(); }}><option value="call">Call</option><option value="sms">Interactive text</option></select></label>
      </div>
      <div style={twoColumnStyle}>
        <label>Direction<select value={direction} onChange={(event) => { setDirection(event.target.value as "inbound" | "outbound"); resetCheck(); }}><option value="outbound">Outbound</option><option value="inbound">Inbound</option></select></label>
        <label>Purpose<select value={purpose} onChange={(event) => { setPurpose(event.target.value as CommunicationPurpose); resetCheck(); }}><option value="service">Service communication</option><option value="appointment">Appointment</option><option value="lead_follow_up">Lead follow-up</option><option value="marketing">Marketing</option></select></label>
      </div>
      {direction === "outbound" && <button disabled={busy || !selected} type="button" onClick={checkAction}>{busy ? "Checking…" : "Check before contacting"}</button>}
      {direction === "outbound" && check && <div role="status" style={check.decision === "ALLOW" ? allowedStyle : blockedStyle}>
        <strong>{check.decision}</strong>
        {check.reasons.length > 0 && <ul>{check.reasons.map((reason) => <li key={reason}>{reasonLabels[reason] || reason}</li>)}</ul>}
        {check.decision === "ALLOW" && transport === "device_native" && <p>The compliance gate is clear. Use the native handoff below, then return to record the actual outcome.</p>}
        {check.decision === "ALLOW" && transport === "google_voice" && <p>The compliance gate is clear. Open Google Voice, perform the manual action, then return to record the actual outcome.</p>}
      </div>}
      {canHandoff && transport === "device_native" && <a href={`${channel === "call" ? "tel" : "sms"}:${nativeTarget}`} style={handoffStyle} aria-label={`${channel === "call" ? "Call" : "Text"} ${selected?.label || "selected contact"} with this device`}>{channel === "call" ? `Call ${selected?.phone}` : `Text ${selected?.phone}`} with this device</a>}
      {direction === "outbound" && check?.decision === "ALLOW" && transport === "google_voice" && <a href="https://voice.google.com/" target="_blank" rel="noreferrer" style={handoffStyle}>Open Google Voice</a>}
      <label>Outcome<input required maxLength={80} value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="For example: spoke with homeowner" /></label>
      <label>Notes<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
      {selected?.type === "lead" && <label>Optional follow-up date and time<input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} /></label>}
      <button disabled={busy || !selected || !outcome.trim() || (direction === "outbound" && check?.decision !== "ALLOW")} type="submit">{busy ? "Saving…" : "Save operator-reported activity"}</button>
    </form>}

    {!loading && <section style={{ ...panelStyle, marginTop: 20 }}>
      <h2>Recent manual history</h2>
      {history.length === 0 ? <p>No manual call or text activity has been logged yet.</p> : history.map((item) => <article key={item.id} style={historyStyle}><strong>{item.channel === "call" ? "Call" : "Text"} · {item.manual_outcome}</strong><p>{item.direction} · {item.destination} · {item.provider_name === "device_native" ? "device" : "Google Voice"} · operator reported</p>{item.operator_notes && <p>{item.operator_notes}</p>}<small>{new Date(item.created_at).toLocaleString()}</small></article>)}
    </section>}
  </main>;
}

const pageStyle = { width: "min(900px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const panelStyle = { display: "grid", gap: 12, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const twoColumnStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const noticeStyle = { padding: 14, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10 };
const allowedStyle = { padding: 12, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10 };
const blockedStyle = { padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10 };
const handoffStyle = { display: "inline-block", width: "fit-content", padding: "12px 16px", borderRadius: 10, background: "#0f172a", color: "#fff", fontWeight: 700, textDecoration: "none" };
const historyStyle = { padding: "12px 0", borderTop: "1px solid #e2e8f0" };
