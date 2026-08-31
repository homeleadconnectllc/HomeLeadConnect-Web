import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import {
  clearPendingManualCall,
  quickCallOutcomes,
  readPendingManualCall,
  beginPendingManualCall,
  shouldPromptForReturnedCall,
  suggestedFollowUpLocal,
} from "../../lib/postCallAutomation";

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

async function canManageCommunications(userId?: string) {
  if (!userId) return false;
  const { data, error } = await supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return ["owner", "manager"].includes(String(data?.role || "").toLowerCase());
}

export default function ManualCommunications() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const pendingAtEntry = useMemo(() => readPendingManualCall(), []);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [history, setHistory] = useState<ManualCommunicationActivity[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState(() => pendingAtEntry?.conversationId || "");
  const [configuredNumber, setConfiguredNumber] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [canConfigureGoogleVoice, setCanConfigureGoogleVoice] = useState(false);
  const [contactKey, setContactKey] = useState(() => pendingAtEntry?.contactKey || searchParams.get("contact") || "");
  const [channel, setChannel] = useState<ManualCommunicationChannel>(() => searchParams.get("channel") === "sms" ? "sms" : "call");
  const [transport, setTransport] = useState<ManualCommunicationTransport>(() => pendingAtEntry?.transport || (searchParams.get("transport") === "google_voice" ? "google_voice" : "device_native"));
  const [direction, setDirection] = useState<"inbound" | "outbound">(() => searchParams.get("direction") === "inbound" ? "inbound" : "outbound");
  const [purpose, setPurpose] = useState<CommunicationPurpose>(() => pendingAtEntry?.purpose || "service");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [check, setCheck] = useState<ComplianceResult | null>(() => pendingAtEntry?.complianceCheck || null);
  const [requestId, setRequestId] = useState(() => pendingAtEntry?.requestId || crypto.randomUUID());
  const [returnPromptOpen, setReturnPromptOpen] = useState(() => shouldPromptForReturnedCall(pendingAtEntry));
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

  async function reload() {
    try {
      const [leadRows, contractorRows, activityRows, conversationRows, canConfigure] = await Promise.all([
        listLeads(), listContractors(), listManualCommunicationActivity(), listConversations(), canManageCommunications(session?.user.id),
      ]);
      setLeads(leadRows);
      setContractors(contractorRows);
      setHistory(activityRows);
      setConversations(conversationRows);
      setCanConfigureGoogleVoice(canConfigure);
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
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listLeads(),
      listContractors(),
      listManualCommunicationActivity(),
      listConversations(),
      canManageCommunications(session?.user.id),
    ])
      .then(async ([leadRows, contractorRows, activityRows, conversationRows, canConfigure]) => {
        if (!active) return;
        setLeads(leadRows);
        setContractors(contractorRows);
        setHistory(activityRows);
        setConversations(conversationRows);
        setCanConfigureGoogleVoice(canConfigure);
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
  }, [session?.user.id]);

  useEffect(() => {
    const promptIfReturned = () => {
      const pending = readPendingManualCall();
      if (document.visibilityState === "visible" && shouldPromptForReturnedCall(pending)) setReturnPromptOpen(true);
    };
    window.addEventListener("focus", promptIfReturned);
    document.addEventListener("visibilitychange", promptIfReturned);
    return () => {
      window.removeEventListener("focus", promptIfReturned);
      document.removeEventListener("visibilitychange", promptIfReturned);
    };
  }, []);

  function resetCheck() {
    setCheck(null);
    setMessage("");
  }

  async function saveConfiguration(event: FormEvent) {
    event.preventDefault();
    if (!canConfigureGoogleVoice) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await configureGoogleVoice(numberInput);
      await reload();
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

  function startCallHandoff() {
    if (!selected || channel !== "call" || direction !== "outbound" || check?.decision !== "ALLOW") return;
    beginPendingManualCall({ contactKey: selected.key, transport, purpose, complianceCheck: check, conversationId, requestId });
    setReturnPromptOpen(false);
    setMessage("Call opened. HLC will ask for the outcome when you return.");
  }

  async function persistActivity(reportedOutcome: string, reportedFollowUpAt = followUpAt) {
    if (!selected || !reportedOutcome.trim() || (direction === "outbound" && check?.decision !== "ALLOW")) return;
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
        outcome: reportedOutcome,
        notes,
        complianceCheckId: check?.id,
        conversationId: conversationId || undefined,
        requestId,
      });
      if (reportedFollowUpAt && selected.followUpLeadId) {
        await createFollowUp({
          leadId: selected.followUpLeadId,
          scheduledFor: new Date(reportedFollowUpAt).toISOString(),
          notes: `Follow up after ${transport === "device_native" ? "device" : "Google Voice"} ${channel === "call" ? "call" : "text"}: ${reportedOutcome}`,
        });
      }
      setOutcome("");
      setNotes("");
      setFollowUpAt("");
      setCheck(null);
      setRequestId(crypto.randomUUID());
      clearPendingManualCall();
      setReturnPromptOpen(false);
      await reload();
      setMessage(reportedFollowUpAt && selected.followUpLeadId ? "Call outcome and follow-up saved automatically." : "Call outcome saved automatically to HLC history.");
    } catch (reason) {
      setError(errorMessage(reason, "Unable to save the communication activity."));
    } finally {
      setBusy(false);
    }
  }

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    await persistActivity(outcome);
  }

  async function quickSaveOutcome(label: string, needsFollowUp: boolean) {
    const automaticFollowUp = needsFollowUp && selected?.followUpLeadId ? suggestedFollowUpLocal() : "";
    setOutcome(label);
    setFollowUpAt(automaticFollowUp);
    await persistActivity(label, automaticFollowUp);
  }

  const canHandoff = direction === "outbound" && check?.decision === "ALLOW" && Boolean(nativeTarget);
  const openLabel = channel === "call" ? "Open Phone App" : "Open Messages";

  return <main style={pageStyle}>
    <header style={heroStyle}>
      <p style={eyebrowStyle}>MANUAL COMMUNICATIONS</p>
      <h1 style={{ margin: 0 }}>Call or text someone</h1>
      <p style={{ margin: 0, color: "#cbd5e1" }}>Pick a contact, choose Call or Text, run the safety check, then open the app on your device. When you return, record what happened.</p>
    </header>

    {loading && <p role="status">Loading communication records…</p>}
    {error && <p role="alert" style={{ color: "#fecaca", background: "#450a0a", padding: 12, borderRadius: 10 }}>{error}</p>}
    {message && <p role="status" style={{ color: "#bbf7d0", background: "#052e16", padding: 12, borderRadius: 10 }}>{message}</p>}

    {returnPromptOpen && selected && <section role="dialog" aria-modal="true" aria-labelledby="post-call-heading" style={postCallStyle}>
      <p style={eyebrowStyle}>STEP 4 · RECORD OUTCOME</p>
      <h2 id="post-call-heading" style={{ margin: 0 }}>What happened with {selected.label}?</h2>
      <p style={{ margin: 0 }}>One tap saves the result. No-answer, voicemail and callback outcomes also schedule a follow-up for this time tomorrow when the contact is a lead.</p>
      <div style={quickOutcomeGridStyle}>
        {quickCallOutcomes.map((item) => <button key={item.label} disabled={busy} type="button" onClick={() => void quickSaveOutcome(item.label, item.followUp)}>{busy ? "Saving…" : item.label}</button>)}
      </div>
      <button type="button" disabled={busy} onClick={() => { clearPendingManualCall(); setReturnPromptOpen(false); setMessage("Pending call prompt dismissed without recording an outcome."); }}>This was not a completed call</button>
    </section>}

    {!loading && <form onSubmit={saveActivity} style={actionPanelStyle}>
      <section style={stepStyle} aria-labelledby="manual-step-contact">
        <div style={stepNumberStyle}>1</div>
        <div style={stepBodyStyle}>
          <h2 id="manual-step-contact" style={stepHeadingStyle}>Who are you contacting?</h2>
          <label style={labelStyle}>Contact
            <select required value={contactKey} onChange={(event) => { setContactKey(event.target.value); resetCheck(); }}>
              <option value="">Select a lead or professional</option>
              {contacts.map((contact) => <option key={contact.key} value={contact.key}>{contact.label} · {contact.phone}</option>)}
            </select>
          </label>
          {selected && <div style={selectedContactStyle}><strong>{selected.label}</strong><span>{selected.phone}</span></div>}
        </div>
      </section>

      <section style={stepStyle} aria-labelledby="manual-step-channel">
        <div style={stepNumberStyle}>2</div>
        <div style={stepBodyStyle}>
          <h2 id="manual-step-channel" style={stepHeadingStyle}>How do you want to reach them?</h2>
          <div style={channelGridStyle} role="group" aria-label="Choose call or text">
            <button type="button" aria-pressed={channel === "call"} style={channel === "call" ? channelButtonActiveStyle : channelButtonStyle} onClick={() => { setChannel("call"); resetCheck(); }}>📞 <strong>Call</strong><span>Use your phone app</span></button>
            <button type="button" aria-pressed={channel === "sms"} style={channel === "sms" ? channelButtonActiveStyle : channelButtonStyle} onClick={() => { setChannel("sms"); resetCheck(); }}>💬 <strong>Text</strong><span>Use your messages app</span></button>
          </div>
        </div>
      </section>

      <section style={stepStyle} aria-labelledby="manual-step-open">
        <div style={stepNumberStyle}>3</div>
        <div style={stepBodyStyle}>
          <h2 id="manual-step-open" style={stepHeadingStyle}>Check &amp; open</h2>
          {direction === "outbound" && !check && <button style={primaryButtonStyle} disabled={busy || !selected} type="button" onClick={checkAction}>{busy ? "Checking…" : `Check before ${channel === "call" ? "calling" : "texting"}`}</button>}
          {direction === "outbound" && check && <div role="status" style={check.decision === "ALLOW" ? allowedStyle : blockedStyle}>
            <strong>{check.decision === "ALLOW" ? "Ready to continue" : "Contact blocked"}</strong>
            {check.reasons.length > 0 && <ul>{check.reasons.map((reason) => <li key={reason}>{reasonLabels[reason] || reason}</li>)}</ul>}
            {check.decision === "ALLOW" && <p style={{ marginBottom: 0 }}>The safety check is clear. Open the selected app, complete the manual action, then come back to HLC.</p>}
          </div>}
          {canHandoff && transport === "device_native" && <a href={`${channel === "call" ? "tel" : "sms"}:${nativeTarget}`} onClick={channel === "call" ? startCallHandoff : undefined} style={handoffStyle} aria-label={`${openLabel} for ${selected?.label || "selected contact"}`}>{openLabel}</a>}
          {direction === "outbound" && check?.decision === "ALLOW" && transport === "google_voice" && <a href="https://voice.google.com/" target="_blank" rel="noreferrer" onClick={channel === "call" ? startCallHandoff : undefined} style={handoffStyle}>Open Google Voice</a>}
          {!selected && <p style={helperStyle}>Choose a contact in Step 1 to continue.</p>}
        </div>
      </section>

      <section style={stepStyle} aria-labelledby="manual-step-outcome">
        <div style={stepNumberStyle}>4</div>
        <div style={stepBodyStyle}>
          <h2 id="manual-step-outcome" style={stepHeadingStyle}>Record what happened</h2>
          <p style={helperStyle}>Only record the result after the call or text actually happened.</p>
          <label style={labelStyle}>Outcome<input required maxLength={80} value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="For example: spoke with homeowner" /></label>
          <label style={labelStyle}>Notes<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional details" /></label>
          {selected?.type === "lead" && <label style={labelStyle}>Optional follow-up date and time<input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} /></label>}
          <button aria-label="Save operator-reported activity" style={secondaryPrimaryStyle} disabled={busy || !selected || !outcome.trim() || (direction === "outbound" && check?.decision !== "ALLOW")} type="submit">{busy ? "Saving…" : "Save Outcome"}</button>
        </div>
      </section>

      <details style={advancedStyle}>
        <summary style={advancedSummaryStyle}>Advanced options</summary>
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <label style={labelStyle}>Related HLC conversation<select value={conversationId} onChange={(event) => setConversationId(event.target.value)}><option value="">No conversation selected</option>{conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.subject}</option>)}</select></label>
          <div style={twoColumnStyle}>
            <label style={labelStyle}>Provider<select value={transport} onChange={(event) => { setTransport(event.target.value as ManualCommunicationTransport); resetCheck(); }}><option value="device_native">This device</option><option value="google_voice" disabled={!configuredNumber}>Google Voice{configuredNumber ? "" : " — not configured"}</option></select></label>
            <label style={labelStyle}>Direction<select value={direction} onChange={(event) => { setDirection(event.target.value as "inbound" | "outbound"); resetCheck(); }}><option value="outbound">Outbound</option><option value="inbound">Inbound</option></select></label>
          </div>
          <label style={labelStyle}>Purpose<select value={purpose} onChange={(event) => { setPurpose(event.target.value as CommunicationPurpose); resetCheck(); }}><option value="service">Service communication</option><option value="appointment">Appointment</option><option value="lead_follow_up">Lead follow-up</option><option value="marketing">Marketing</option></select></label>
        </div>
      </details>
    </form>}

    {!loading && <details style={supportingDetailsStyle}>
      <summary style={advancedSummaryStyle}>How HLC records manual calls and texts</summary>
      <p style={helperStyle}><strong>Honest record:</strong> HLC opens the selected device/provider after a compliance check and records only the outcome you report. It does not claim a call connected, a text delivered, or a provider synchronized unless provider evidence proves it.</p>
    </details>}

    {!loading && canConfigureGoogleVoice && !configuredNumber && <details style={supportingDetailsStyle}>
      <summary style={advancedSummaryStyle}>Optional Google Voice setup</summary>
      <form onSubmit={saveConfiguration} style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <label style={labelStyle}>HLC Google Voice business number<input required type="tel" value={numberInput} onChange={(event) => setNumberInput(event.target.value)} /></label>
        <p style={helperStyle}>Device-native calling works without this. Saving a number only enables Google Voice as an additional manual channel; it does not connect a private API.</p>
        <button disabled={busy} type="submit">{busy ? "Saving…" : "Enable optional Google Voice logging"}</button>
      </form>
    </details>}

    {!loading && !canConfigureGoogleVoice && !configuredNumber && <details style={supportingDetailsStyle}>
      <summary style={advancedSummaryStyle}>Optional Google Voice setup</summary>
      <p style={helperStyle}>Google Voice workspace setup is limited to an HLC owner or manager. You can continue using the device-native Call and Text workflow above.</p>
    </details>}

    {!loading && configuredNumber && <details style={supportingDetailsStyle}>
      <summary style={advancedSummaryStyle}>Optional Google Voice</summary>
      <p>Manual operator number: <strong>{configuredNumber}</strong></p>
      <a href="https://voice.google.com/" target="_blank" rel="noreferrer">Open Google Voice</a>
    </details>}

    {!loading && <section style={historyPanelStyle}>
      <h2 style={{ marginTop: 0 }}>Recent manual history</h2>
      {history.length === 0 ? <p style={helperStyle}>No manual call or text activity has been logged yet.</p> : history.map((item) => <article key={item.id} style={historyStyle}><strong>{item.channel === "call" ? "Call" : "Text"} · {item.manual_outcome}</strong><p>{item.direction} · {item.destination} · {item.provider_name === "device_native" ? "device" : "Google Voice"} · operator reported</p>{item.operator_notes && <p>{item.operator_notes}</p>}<small>{new Date(item.created_at).toLocaleString()}</small></article>)}
    </section>}
  </main>;
}

const pageStyle = { width: "min(900px, calc(100% - 32px))", margin: "28px auto 100px", fontFamily: "system-ui, sans-serif", color: "#f8fafc" };
const heroStyle = { display: "grid", gap: 10, marginBottom: 18, padding: "22px 0 18px", borderBottom: "1px solid rgba(148,163,184,.2)" };
const eyebrowStyle = { margin: 0, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", fontSize: 12 };
const actionPanelStyle = { display: "grid", gap: 0, overflow: "hidden", border: "1px solid rgba(148,163,184,.24)", borderRadius: 16, background: "#0b1829" };
const stepStyle = { display: "grid", gridTemplateColumns: "42px minmax(0,1fr)", gap: 12, padding: 18, borderBottom: "1px solid rgba(148,163,184,.16)" };
const stepNumberStyle = { display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 999, background: "#0c4a6e", color: "#e0f2fe", fontWeight: 900 };
const stepBodyStyle = { display: "grid", gap: 12, minWidth: 0 };
const stepHeadingStyle = { margin: 0, fontSize: 18 };
const labelStyle = { display: "grid", gap: 6, fontWeight: 700, color: "#e2e8f0" };
const selectedContactStyle = { display: "flex", flexWrap: "wrap" as const, justifyContent: "space-between", gap: 8, padding: 12, borderRadius: 10, background: "#10243d", color: "#dbeafe" };
const channelGridStyle = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 };
const channelButtonStyle = { display: "grid", gap: 4, minHeight: 86, padding: 12, border: "1px solid rgba(148,163,184,.28)", borderRadius: 12, background: "#0f2035", color: "#f8fafc", textAlign: "left" as const };
const channelButtonActiveStyle = { ...channelButtonStyle, border: "2px solid #38bdf8", background: "#10304d" };
const primaryButtonStyle = { minHeight: 48, padding: "12px 16px", border: 0, borderRadius: 10, background: "#0284c7", color: "#fff", fontWeight: 900 };
const secondaryPrimaryStyle = { ...primaryButtonStyle, background: "#0f766e" };
const helperStyle = { margin: 0, color: "#a8b8ca", lineHeight: 1.5 };
const twoColumnStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const allowedStyle = { padding: 12, background: "#052e16", border: "1px solid #16a34a", borderRadius: 10, color: "#dcfce7" };
const blockedStyle = { padding: 12, background: "#450a0a", border: "1px solid #dc2626", borderRadius: 10, color: "#fee2e2" };
const handoffStyle = { display: "grid", placeItems: "center", width: "100%", minHeight: 52, padding: "12px 16px", borderRadius: 10, background: "#0369a1", color: "#fff", fontWeight: 900, textDecoration: "none" };
const advancedStyle = { padding: 18, background: "#081421" };
const supportingDetailsStyle = { marginTop: 14, padding: 16, border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, background: "#091729" };
const advancedSummaryStyle = { cursor: "pointer", fontWeight: 800, color: "#dbeafe" };
const historyPanelStyle = { marginTop: 20, padding: 18, border: "1px solid rgba(148,163,184,.2)", borderRadius: 14, background: "#091729" };
const historyStyle = { padding: "12px 0", borderTop: "1px solid rgba(148,163,184,.18)" };
const postCallStyle = { display: "grid", gap: 14, padding: 20, marginBottom: 20, border: "2px solid #38bdf8", borderRadius: 18, background: "linear-gradient(145deg, #0b1e34, #0d2d3d)", boxShadow: "0 18px 45px rgba(0, 0, 0, 0.24)" };
const quickOutcomeGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 };
