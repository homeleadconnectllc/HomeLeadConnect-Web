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

const LOAD_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs = LOAD_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

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
    const [leadRows, contractorRows] = await Promise.all([
      withTimeout(listLeads(), [] as Lead[]),
      withTimeout(listContractors(), [] as Contractor[]),
    ]);
    setLeads(leadRows);
    setContractors(contractorRows);

    void withTimeout(listManualCommunicationActivity(), [] as ManualCommunicationActivity[]).then(setHistory);
    void withTimeout(listConversations(), [] as Conversation[]).then(setConversations);
    void withTimeout(canManageCommunications(session?.user.id), false).then(setCanConfigureGoogleVoice);
    void withTimeout(getGoogleVoiceConfiguration(), null).then((configuration) => {
      setConfiguredNumber(configuration?.sender_identity || "");
      setNumberInput(configuration?.sender_identity || "");
    }).catch(() => setConfiguredNumber(""));
  }

  useEffect(() => {
    let active = true;

    Promise.all([
      withTimeout(listLeads(), [] as Lead[]),
      withTimeout(listContractors(), [] as Contractor[]),
    ])
      .then(([leadRows, contractorRows]) => {
        if (!active) return;
        setLeads(leadRows);
        setContractors(contractorRows);
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason, "Unable to load contacts for manual communications."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    void withTimeout(listManualCommunicationActivity(), [] as ManualCommunicationActivity[])
      .then((activityRows) => { if (active) setHistory(activityRows); });
    void withTimeout(listConversations(), [] as Conversation[])
      .then((conversationRows) => { if (active) setConversations(conversationRows); });
    void withTimeout(canManageCommunications(session?.user.id), false)
      .then((canConfigure) => { if (active) setCanConfigureGoogleVoice(canConfigure); });
    void withTimeout(getGoogleVoiceConfiguration(), null)
      .then((configuration) => {
        if (!active) return;
        setConfiguredNumber(configuration?.sender_identity || "");
        setNumberInput(configuration?.sender_identity || "");
      })
      .catch(() => { if (active) setConfiguredNumber(""); });

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

  return <main className="hlc-ui-page-0fe80a">
    <header className="hlc-ui-hero-71fb15">
      <p className="hlc-ui-eyebrow-5f86ec">MANUAL COMMUNICATIONS</p>
      <h1 className="hlc-ui-margin-ab79ea">Call or text someone</h1>
      <p className="hlc-ui-manual-communications-b24d93">Pick a contact, choose Call or Text, run the safety check, then open the app on your device. When you return, record what happened.</p>
    </header>

    {loading && <p role="status">Loading communication records…</p>}
    {error && <p role="alert" className="hlc-ui-manual-communications-eb1608">{error}</p>}
    {message && <p role="status" className="hlc-ui-manual-communications-b6a500">{message}</p>}

    {returnPromptOpen && selected && <section role="dialog" aria-modal="true" aria-labelledby="post-call-heading" className="hlc-ui-postCall-7d163e">
      <p className="hlc-ui-eyebrow-5f86ec">STEP 4 · RECORD OUTCOME</p>
      <h2 id="post-call-heading" className="hlc-ui-margin-ab79ea">What happened with {selected.label}?</h2>
      <p className="hlc-ui-margin-ab79ea">One tap saves the result. No-answer, voicemail and callback outcomes also schedule a follow-up for this time tomorrow when the contact is a lead.</p>
      <div className="hlc-ui-quickOutcomeGrid-c55b41">
        {quickCallOutcomes.map((item) => <button key={item.label} disabled={busy} type="button" onClick={() => void quickSaveOutcome(item.label, item.followUp)}>{busy ? "Saving…" : item.label}</button>)}
      </div>
      <button type="button" disabled={busy} onClick={() => { clearPendingManualCall(); setReturnPromptOpen(false); setMessage("Pending call prompt dismissed without recording an outcome."); }}>This was not a completed call</button>
    </section>}

    {!loading && <form onSubmit={saveActivity} className="hlc-ui-actionPanel-bc7076">
      <section className="hlc-ui-step-384a6d" aria-labelledby="manual-step-contact">
        <div className="hlc-ui-stepNumber-939291">1</div>
        <div className="hlc-ui-stepBody-e191da">
          <h2 id="manual-step-contact" className="hlc-ui-stepHeading-e4432c">Who are you contacting?</h2>
          <label className="hlc-ui-label-97e274">Contact
            <select required value={contactKey} onChange={(event) => { setContactKey(event.target.value); resetCheck(); }}>
              <option value="">Select a lead or professional</option>
              {contacts.map((contact) => <option key={contact.key} value={contact.key}>{contact.label} · {contact.phone}</option>)}
            </select>
          </label>
          {selected && <div className="hlc-ui-selectedContact-22bbaa"><strong>{selected.label}</strong><span>{selected.phone}</span></div>}
        </div>
      </section>

      <section className="hlc-ui-step-384a6d" aria-labelledby="manual-step-channel">
        <div className="hlc-ui-stepNumber-939291">2</div>
        <div className="hlc-ui-stepBody-e191da">
          <h2 id="manual-step-channel" className="hlc-ui-stepHeading-e4432c">How do you want to reach them?</h2>
          <div className="hlc-ui-channelGrid-a7ef9a" role="group" aria-label="Choose call or text">
            <button type="button" aria-pressed={channel === "call"} className="hlc-communication-channel" onClick={() => { setChannel("call"); resetCheck(); }}>
              <span aria-hidden="true">📞</span>
              <strong>{channel === "call" ? "✓ Call selected" : "Call"}</strong>
              <span>{channel === "call" ? "Step 3 next" : "Phone app"}</span>
            </button>
            <button type="button" aria-pressed={channel === "sms"} className="hlc-communication-channel" onClick={() => { setChannel("sms"); resetCheck(); }}>
              <span aria-hidden="true">💬</span>
              <strong>{channel === "sms" ? "✓ Text selected" : "Text"}</strong>
              <span>{channel === "sms" ? "Step 3 next" : "Messages app"}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="hlc-ui-step-384a6d" aria-labelledby="manual-step-open">
        <div className="hlc-ui-stepNumber-939291">3</div>
        <div className="hlc-ui-stepBody-e191da">
          <h2 id="manual-step-open" className="hlc-ui-stepHeading-e4432c">Check &amp; open</h2>
          {direction === "outbound" && !check && <button className="hlc-ui-primaryButton-f2bf7a" disabled={busy || !selected} type="button" onClick={checkAction}>{busy ? "Checking…" : `Check before ${channel === "call" ? "calling" : "texting"}`}</button>}
          {direction === "outbound" && check && <div role="status" className="hlc-communication-decision" data-decision={check.decision}>
            <strong>{check.decision === "ALLOW" ? "Ready to continue" : "Contact blocked"}</strong>
            {check.reasons.length > 0 && <ul>{check.reasons.map((reason) => <li key={reason}>{reasonLabels[reason] || reason}</li>)}</ul>}
            {check.decision === "ALLOW" && <p className="hlc-ui-margin-bottom-fa769a">The safety check is clear. Open the selected app, complete the manual action, then come back to HLC.</p>}
          </div>}
          {canHandoff && transport === "device_native" && <a href={`${channel === "call" ? "tel" : "sms"}:${nativeTarget}`} onClick={channel === "call" ? startCallHandoff : undefined} className="hlc-ui-handoff-f60592" aria-label={`${openLabel} for ${selected?.label || "selected contact"}`}>{openLabel}</a>}
          {direction === "outbound" && check?.decision === "ALLOW" && transport === "google_voice" && <a href="https://voice.google.com/" target="_blank" rel="noreferrer" onClick={channel === "call" ? startCallHandoff : undefined} className="hlc-ui-handoff-f60592">Open Google Voice</a>}
          {!selected && <p className="hlc-ui-helper-6370cf">Choose a contact in Step 1 to continue.</p>}
        </div>
      </section>

      <section className="hlc-ui-step-384a6d" aria-labelledby="manual-step-outcome">
        <div className="hlc-ui-stepNumber-939291">4</div>
        <div className="hlc-ui-stepBody-e191da">
          <h2 id="manual-step-outcome" className="hlc-ui-stepHeading-e4432c">Record what happened</h2>
          <p className="hlc-ui-helper-6370cf">Only record the result after the call or text actually happened.</p>
          <label className="hlc-ui-label-97e274">Outcome<input required maxLength={80} value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="For example: spoke with homeowner" /></label>
          <label className="hlc-ui-label-97e274">Notes<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional details" /></label>
          {selected?.type === "lead" && <label className="hlc-ui-label-97e274">Optional follow-up date and time<input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} /></label>}
          <button aria-label="Save operator-reported activity" className="hlc-ui-secondaryPrimary-02985d" disabled={busy || !selected || !outcome.trim() || (direction === "outbound" && check?.decision !== "ALLOW")} type="submit">{busy ? "Saving…" : "Save Outcome"}</button>
        </div>
      </section>

      <details className="hlc-ui-advanced-2d0151">
        <summary className="hlc-ui-advancedSummary-470967">Advanced options</summary>
        <div className="hlc-ui-manual-communications-8b9d0b">
          <label className="hlc-ui-label-97e274">Related HLC conversation<select value={conversationId} onChange={(event) => setConversationId(event.target.value)}><option value="">No conversation selected</option>{conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.subject}</option>)}</select></label>
          <div className="hlc-ui-twoColumn-e22205">
            <label className="hlc-ui-label-97e274">Provider<select value={transport} onChange={(event) => { setTransport(event.target.value as ManualCommunicationTransport); resetCheck(); }}><option value="device_native">This device</option><option value="google_voice" disabled={!configuredNumber}>Google Voice{configuredNumber ? "" : " — not configured"}</option></select></label>
            <label className="hlc-ui-label-97e274">Direction<select value={direction} onChange={(event) => { setDirection(event.target.value as "inbound" | "outbound"); resetCheck(); }}><option value="outbound">Outbound</option><option value="inbound">Inbound</option></select></label>
          </div>
          <label className="hlc-ui-label-97e274">Purpose<select value={purpose} onChange={(event) => { setPurpose(event.target.value as CommunicationPurpose); resetCheck(); }}><option value="service">Service communication</option><option value="appointment">Appointment</option><option value="lead_follow_up">Lead follow-up</option><option value="marketing">Marketing</option></select></label>
        </div>
      </details>
    </form>}

    {!loading && <details className="hlc-ui-supportingDetails-c72fa5">
      <summary className="hlc-ui-advancedSummary-470967">How HLC records manual calls and texts</summary>
      <p className="hlc-ui-helper-6370cf"><strong>Honest record:</strong> HLC opens the selected device/provider after a compliance check and records only the outcome you report. It does not claim a call connected, a text delivered, or a provider synchronized unless provider evidence proves it.</p>
    </details>}

    {!loading && canConfigureGoogleVoice && !configuredNumber && <details className="hlc-ui-supportingDetails-c72fa5">
      <summary className="hlc-ui-advancedSummary-470967">Optional Google Voice setup</summary>
      <form onSubmit={saveConfiguration} className="hlc-ui-manual-communications-8b9d0b">
        <label className="hlc-ui-label-97e274">HLC Google Voice business number<input required type="tel" value={numberInput} onChange={(event) => setNumberInput(event.target.value)} /></label>
        <p className="hlc-ui-helper-6370cf">Device-native calling works without this. Saving a number only enables Google Voice as an additional manual channel; it does not connect a private API.</p>
        <button disabled={busy} type="submit">{busy ? "Saving…" : "Enable optional Google Voice logging"}</button>
      </form>
    </details>}

    {!loading && !canConfigureGoogleVoice && !configuredNumber && <details className="hlc-ui-supportingDetails-c72fa5">
      <summary className="hlc-ui-advancedSummary-470967">Optional Google Voice setup</summary>
      <p className="hlc-ui-helper-6370cf">Google Voice workspace setup is limited to an HLC owner or manager. You can continue using the device-native Call and Text workflow above.</p>
    </details>}

    {!loading && configuredNumber && <details className="hlc-ui-supportingDetails-c72fa5">
      <summary className="hlc-ui-advancedSummary-470967">Optional Google Voice</summary>
      <p>Manual operator number: <strong>{configuredNumber}</strong></p>
      <a href="https://voice.google.com/" target="_blank" rel="noreferrer">Open Google Voice</a>
    </details>}

    {!loading && <section className="hlc-ui-historyPanel-57ee4c">
      <h2 className="hlc-ui-margin-top-a0925a">Recent manual history</h2>
      {history.length === 0 ? <p className="hlc-ui-helper-6370cf">No manual call or text activity has been logged yet.</p> : history.map((item) => <article key={item.id} className="hlc-ui-history-4facb6"><strong>{item.channel === "call" ? "Call" : "Text"} · {item.manual_outcome}</strong><p>{item.direction} · {item.destination} · {item.provider_name === "device_native" ? "device" : "Google Voice"} · operator reported</p>{item.operator_notes && <p>{item.operator_notes}</p>}<small>{new Date(item.created_at).toLocaleString()}</small></article>)}
    </section>}
  </main>;
}
