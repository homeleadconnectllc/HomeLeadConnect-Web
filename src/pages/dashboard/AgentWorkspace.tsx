import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { agents, agentHandoffCopy, capabilityCatalog, type AgentId } from "../../ai/agents";
import { createAgentHandoff, listAgentHandoffs, listAgentRuns, runAgentCapability, type AgentHandoff, type AgentRun } from "../../api/agents";
import { listLeads } from "../../api/leads";
import AgentChatPanel from "../../components/agents/AgentChatPanel";
import type { Lead } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { KendrellMemorial } from "./KendrellDedication";

export default function AgentWorkspace({ agentId }: { agentId: AgentId }) {
  const agent = agents[agentId];
  const account = useAccountAccess();
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [handoffs, setHandoffs] = useState<AgentHandoff[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [handoffReason, setHandoffReason] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  const load = useCallback(async () => {
    const [runRows, handoffRows, leadRows] = await Promise.all([listAgentRuns(agentId), listAgentHandoffs(agentId), listLeads()]);
    setRuns(runRows); setHandoffs(handoffRows); setLeads(leadRows);
  }, [agentId]);

  useEffect(() => {
    let active = true;
    Promise.all([listAgentRuns(agentId), listAgentHandoffs(agentId), listLeads()])
      .then(([runRows, handoffRows, leadRows]) => {
        if (!active) return;
        setRuns(runRows); setHandoffs(handoffRows); setLeads(leadRows);
        setShowNudge(runRows.length === 0 || (agentId !== "kendrell" && leadRows.length === 0));
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(errorMessage(reason, `Unable to load ${agent.name}.`));
        setShowNudge(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [agentId, agent.name]);

  useEffect(() => {
    if (!guidanceOpen) return;
    document.body.classList.add("hlc-agent-guidance-open");
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setGuidanceOpen(false); }
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.classList.remove("hlc-agent-guidance-open"); window.removeEventListener("keydown", closeOnEscape); };
  }, [guidanceOpen]);

  const selectedLead = useMemo(() => leads.find((lead) => String(lead.id) === leadId), [leadId, leads]);

  async function run(capability: string) {
    setBusy(true); setError(""); setMessage(""); setResult(null);
    try {
      const input: Record<string, unknown> = {};
      if (["customer_context", "draft_customer_reply", "send_customer_communication", "create_followup"].includes(capability)) {
        if (!leadId) throw new Error("Select a lead first.");
        input.lead_id = Number(leadId); input.related_entity_type = "lead"; input.related_entity_id = leadId;
      }
      if (capability === "create_followup") {
        if (!dueAt) throw new Error("Choose a future follow-up time.");
        input.scheduled_for = new Date(dueAt).toISOString(); input.notes = notes;
      }
      if (capability === "create_owner_attention_item") {
        if (account.role !== "owner") throw new Error("This action is available only in Antoine's owner workspace. Switch to that workspace in Settings first.");
        if (notes.trim().length < 3) throw new Error("Describe what needs Antoine's attention.");
        input.reason = notes;
      }
      const response = await runAgentCapability(agentId, capability, input);
      setResult(response.result ?? { status: response.status, error: response.error, error_code: response.error_code });
      setMessage(response.status === "succeeded" ? `${capabilityExperience[capability]?.title ?? "Request"} completed.` : `${response.error || "No action was taken."}`);
      await load();
    } catch (reason) {
      setError(errorMessage(reason, "Unable to run this capability.")); setShowNudge(true);
    } finally { setBusy(false); }
  }

  async function handoff(event: FormEvent) {
    event.preventDefault(); if (agentId === "kendrell") return;
    setBusy(true); setError(""); setMessage("");
    try {
      await createAgentHandoff({ source: agentId, destination: agentId === "diamond" ? "dion" : "kendrell", reason: handoffReason, leadId: leadId || undefined });
      setHandoffReason(""); await load(); setMessage(`Handoff persisted for ${agentId === "diamond" ? "Dion" : "Kendrell"}.`);
    } catch (reason) { setError(errorMessage(reason, "Unable to create the handoff.")); }
    finally { setBusy(false); }
  }

  const handoffCopy = agentId === "diamond" ? agentHandoffCopy["diamond:dion"] : agentId === "dion" ? agentHandoffCopy["dion:kendrell"] : agentHandoffCopy["kendrell:dion"];

  function openAgentConversation() {
    setGuidanceOpen(false);
    window.setTimeout(() => {
      document.getElementById(`${agentId}-chat-input`)?.focus();
      document.getElementById(`${agentId}-chat-input`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  return <main className="hlc-agent-workspace hlc-agent-team-structural">
    {agentId === "kendrell" && <KendrellMemorial />}

    <header className="hlc-agent-team-header">
      <div className="hlc-agent-team-identity">
        {agent.image && <img src={agent.image} alt={`${agent.name} AI workspace visual`} />}
        <div><span>{agent.role}</span><h1>{agent.name}</h1><p>{agent.introduction}</p></div>
      </div>
      <button type="button" onClick={() => setGuidanceOpen(true)}>Ask {agent.name}</button>
    </header>

    <nav className="hlc-agent-team-switcher" aria-label="AI Team workspaces">
      <Link className={agentId === "kendrell" ? "is-active" : ""} to="/hq">Kendrell</Link>
      <Link className={agentId === "dion" ? "is-active" : ""} to="/operations">Dion</Link>
      <Link className={agentId === "diamond" ? "is-active" : ""} to="/customer-experience">Diamond</Link>
    </nav>

    <section className="hlc-agent-chat-stage" aria-label={`${agent.name} conversation`}>
      <div className="hlc-agent-stage-copy"><span>CONVERSATION</span><h2>{agent.question}</h2><p>Your workspace is protected. Restricted changes still require the correct HLC role.</p></div>
      <AgentChatPanel agentId={agentId} agentName={agent.name} accent={agent.accent} />
    </section>

    {showNudge && <aside className="hlc-agent-nudge" aria-label={`${agent.name} guidance`}><div><strong>{agent.name} can help here.</strong><p>{error ? "I can explain the failure and the safest available next step." : agent.guidance[0]}</p></div><div><button type="button" onClick={() => { setGuidanceOpen(true); setShowNudge(false); }}>Show guidance</button><button type="button" onClick={() => setShowNudge(false)}>Dismiss</button></div></aside>}
    {loading && <p role="status">Loading authenticated workspace context…</p>}
    {error && <p role="alert" className="hlc-agent-status is-error">{error}</p>}
    {message && <p role="status" className="hlc-agent-status">{message}</p>}

    {!loading && <div className="hlc-agent-operating-grid">
      <section className="hlc-agent-action-workbench">
        <header><span>ACTIONS</span><h2>What should {agent.name} do next?</h2></header>
        {(agentId === "diamond" || agentId === "dion") && <label>Related lead<select value={leadId} onChange={(event) => setLeadId(event.target.value)}><option value="">Select when the capability needs a lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.full_name || `Lead #${lead.id}`}</option>)}</select></label>}
        {agentId === "dion" && <label>Follow-up date/time<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>}
        {(agentId === "dion" || agentId === "kendrell") && <label>{agentId === "kendrell" ? "What needs Antoine's attention?" : "Follow-up notes"}<textarea maxLength={2000} placeholder={agentId === "kendrell" ? "Briefly explain the decision, risk, or unresolved issue." : "Add the important follow-up details."} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>}
        {agentId === "kendrell" && account.role !== "owner" && <p className="hlc-agent-role-boundary">You are currently in a {account.role ?? "non-owner"} workspace. Saving an item to Antoine's owner priority list requires switching to his owner workspace in <Link to="/settings">Settings</Link>.</p>}
        <div className="hlc-agent-capability-list">{capabilityCatalog[agentId].map((capability) => {
          const experience = capabilityExperience[capability.id] ?? { title: capability.label, description: "Run this HLC action." };
          const ownerOnlyBlocked = capability.id === "create_owner_attention_item" && account.role !== "owner";
          return <button type="button" disabled={busy || ownerOnlyBlocked} key={capability.id} onClick={() => run(capability.id)}><strong>{experience.title}</strong><span>{ownerOnlyBlocked ? "Switch to Antoine's owner workspace to use this." : experience.description}</span></button>;
        })}</div>
      </section>

      <aside className="hlc-agent-result-rail">
        <section><span>RESULT</span><h2>Most recent result</h2>{result ? <FriendlyResult value={result} /> : <p>Choose an action to see its result here.</p>}</section>
        {selectedLead && <p>Current authorized context: {selectedLead.full_name || `Lead #${selectedLead.id}`}</p>}
      </aside>
    </div>}

    <div className="hlc-agent-history-grid">
      {agentId !== "kendrell" && <form onSubmit={handoff} className="hlc-agent-handoff"><span>HANDOFF</span><h2>Send work to {agentId === "diamond" ? "Dion" : "Kendrell"}</h2><p>{handoffCopy}</p><label>Reason<textarea required minLength={3} maxLength={500} value={handoffReason} onChange={(event) => setHandoffReason(event.target.value)} /></label><button disabled={busy} type="submit">Persist handoff</button></form>}
      <section className="hlc-agent-history"><span>ACTIVITY</span><h2>Recent activity</h2>{runs.length === 0 ? <p>No activity yet.</p> : runs.map((runItem) => <article key={runItem.id}><div><strong>{friendlyCapabilityName(runItem.capability_id)}</strong><span>{friendlyStatus(runItem.status)}</span></div><small>{new Date(runItem.created_at).toLocaleString()}</small>{runItem.error_summary && <p>{runItem.error_summary}</p>}</article>)}</section>
      <section className="hlc-agent-history"><span>TEAM HANDOFFS</span><h2>Work sent between agents</h2>{handoffs.length === 0 ? <p>No work has been sent to another agent.</p> : handoffs.map((item) => <article key={item.id}><div><strong>{agents[item.source_agent].name} → {agents[item.destination_agent].name}</strong><span>{friendlyStatus(item.status)}</span></div><p>{item.reason}</p><small>{new Date(item.created_at).toLocaleString()}</small></article>)}</section>
    </div>

    <button type="button" className="hlc-agent-help-fab" aria-label={`Open ${agent.name} help`} onClick={() => setGuidanceOpen(true)}><span aria-hidden="true">?</span><span>{agent.name}</span></button>

    {guidanceOpen && createPortal(<div className="hlc-agent-guidance-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGuidanceOpen(false); }}>
      <section className="hlc-agent-guidance-drawer" role="dialog" aria-modal="true" aria-labelledby={`${agentId}-guidance-title`}>
        <div className="hlc-agent-guidance-head"><div className="hlc-agent-guidance-identity">{agent.image && <img src={agent.image} alt="" aria-hidden="true" />}<span><small>{agent.role}</small><strong id={`${agentId}-guidance-title`}>{agent.name} Command</strong><em>Online · workspace protected</em></span></div><button autoFocus type="button" aria-label="Close guidance" onClick={() => setGuidanceOpen(false)}>Close</button></div>
        <div className="hlc-agent-guidance-intro"><span>Command guidance</span><h2>Make the next decision clear.</h2><p>{agent.introduction}</p></div>
        <h3>How {agent.name} can help</h3>
        <div className="hlc-agent-guidance-cards">{agent.guidance.map((script, index) => {
          const item = guidanceExperience[agentId][index] ?? { icon: "◇", label: "Guide", summary: script };
          return <details key={script}><summary><i aria-hidden="true">{item.icon}</i><span><small>{item.label}</small><strong>{item.summary}</strong></span><b aria-hidden="true">＋</b></summary><p>{script}</p></details>;
        })}</div>
        {agentId !== "kendrell" && <p>{handoffCopy}</p>}
        <p className="hlc-agent-guidance-boundary">Guidance respects workspace authorization, provider readiness, compliance, and HLC lifecycle rules.</p>
        <button className="hlc-agent-guidance-primary" type="button" onClick={openAgentConversation}>Ask {agent.name} about this</button>
      </section>
    </div>, document.body)}
  </main>;
}

const capabilityExperience: Record<string, { title: string; description: string }> = {
  executive_workspace_summary: { title: "Show my business overview", description: "See leads, follow-ups, jobs, appointments, and alerts that need attention." },
  launch_readiness_summary: { title: "Check launch readiness", description: "Review what has passed and what still needs to be completed before launch." },
  risk_exception_triage: { title: "Help me review a risk", description: "Organize the issue, likely impact, unknowns, and safest next step." },
  delegate_operations: { title: "Plan the next operations step", description: "Prepare clear follow-through for Dion and the operations team." },
  create_owner_attention_item: { title: "Add this to Antoine's priority list", description: "Save the issue for owner review and follow-up." },
  operational_summary: { title: "Show today's operations", description: "Review active jobs, assignments, appointments, and follow-ups." },
  bottleneck_detection: { title: "Find what is slowing work down", description: "Identify stalled work and recommend the next operational move." },
  followups_due: { title: "Show follow-ups that are due", description: "See upcoming and overdue customer follow-ups." },
  provider_assignment: { title: "Check provider assignment", description: "Review whether work has the right available provider." },
  create_followup: { title: "Schedule a follow-up", description: "Save the selected lead's next follow-up time and notes." },
  customer_context: { title: "Open customer context", description: "See the selected customer's authorized history and current status." },
  explain_customer_status: { title: "Explain the customer's status", description: "Turn the current record into a clear customer-ready explanation." },
  draft_customer_reply: { title: "Draft a customer reply", description: "Prepare a reply for human review before anything is sent." },
  escalate_unresolved_issue: { title: "Flag an unresolved customer issue", description: "Send a documented issue to the right HLC operator." },
  send_customer_communication: { title: "Send an approved message", description: "Send only after approval, provider, and compliance checks pass." },
  kendrell_advisory_chat: { title: "Conversation with Kendrell", description: "A workspace-aware advisory conversation." },
  dion_advisory_chat: { title: "Conversation with Dion", description: "An operations-focused advisory conversation." },
  diamond_advisory_chat: { title: "Conversation with Diamond", description: "A customer-experience advisory conversation." },
};

const guidanceExperience: Record<AgentId, Array<{ icon: string; label: string; summary: string }>> = {
  kendrell: [{ icon: "◎", label: "Analyze", summary: "Separate facts, risks, and unknowns" }, { icon: "↟", label: "Prioritize", summary: "Rank what needs attention first" }, { icon: "⇄", label: "Delegate", summary: "Route work to Dion or Diamond" }, { icon: "△", label: "Escalate", summary: "Identify blockers and owner decisions" }],
  dion: [{ icon: "▦", label: "Operate", summary: "Review today's operating picture" }, { icon: "⌁", label: "Detect", summary: "Find workflow bottlenecks" }, { icon: "→", label: "Follow through", summary: "Turn plans into assigned next steps" }, { icon: "△", label: "Escalate", summary: "Send unresolved decisions to Kendrell" }],
  diamond: [{ icon: "◌", label: "Understand", summary: "Clarify the customer context" }, { icon: "✦", label: "Respond", summary: "Prepare a clear human-reviewed reply" }, { icon: "♡", label: "Protect", summary: "Preserve trust, consent, and continuity" }, { icon: "⇄", label: "Handoff", summary: "Route operational needs to Dion" }],
};

function friendlyCapabilityName(id: string) { return capabilityExperience[id]?.title ?? id.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function friendlyStatus(status: string) { if (status === "succeeded" || status === "resolved") return "Completed"; if (status === "running" || status === "open") return "In progress"; if (status === "blocked") return "Needs permission"; if (status === "failed") return "Needs attention"; return status.replaceAll("_", " "); }

function FriendlyResult({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <p>No result was returned.</p>;
  if (typeof value !== "object") return <p>{String(value)}</p>;
  if (Array.isArray(value)) return value.length === 0 ? <p>Nothing needs attention in this category.</p> : <ul>{value.map((item, index) => <li key={index}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>)}</ul>;
  return <dl className="hlc-agent-result-list">{Object.entries(value as Record<string, unknown>).map(([key, item]) => <div key={key}><dt>{key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</dt><dd>{typeof item === "object" ? JSON.stringify(item) : String(item)}</dd></div>)}</dl>;
}
