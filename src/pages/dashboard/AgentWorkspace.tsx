import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
      .then(([runRows, handoffRows, leadRows]) => { if (active) { setRuns(runRows); setHandoffs(handoffRows); setLeads(leadRows); setShowNudge(runRows.length === 0 || (agentId !== "kendrell" && leadRows.length === 0)); } })
      .catch((reason: unknown) => { if (active) { setError(errorMessage(reason, `Unable to load ${agent.name}.`)); setShowNudge(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [agentId, agent.name]);

  useEffect(() => {
    if (!guidanceOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setGuidanceOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
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
      if (capability === "create_followup") { if (!dueAt) throw new Error("Choose a future follow-up time."); input.scheduled_for = new Date(dueAt).toISOString(); input.notes = notes; }
      if (capability === "create_owner_attention_item") {
        if (account.role !== "owner") throw new Error("This action is available only in Antoine's owner workspace. Switch to that workspace in Settings first.");
        if (notes.trim().length < 3) throw new Error("Describe what needs Antoine's attention.");
        input.reason = notes;
      }
      const response = await runAgentCapability(agentId, capability, input);
      setResult(response.result ?? { status: response.status, error: response.error, error_code: response.error_code });
      setMessage(response.status === "succeeded" ? `${capabilityExperience[capability]?.title ?? "Request"} completed.` : `${response.error || "No action was taken."}`);
      await load();
    } catch (reason) { setError(errorMessage(reason, "Unable to run this capability.")); setShowNudge(true); }
    finally { setBusy(false); }
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

  const handoffCopy = agentId === "diamond"
    ? agentHandoffCopy["diamond:dion"]
    : agentId === "dion"
      ? agentHandoffCopy["dion:kendrell"]
      : agentHandoffCopy["kendrell:dion"];

  return <main className="hlc-agent-workspace" style={pageStyle}>
    {agentId === "kendrell" && <KendrellMemorial />}
    <header className="hlc-agent-command-hero" style={{ ...heroStyle, borderColor: agent.accent }}>
      <div style={{ display: "grid", gap: 12, alignContent: "center" }}>
        <div style={brandRowStyle}><img src="/hlc-logo-final.png" alt="HomeLead Connect" style={{ width: 48, height: 48, objectFit: "contain" }} /><span>{agent.pageTitle}</span></div>
        <p style={{ margin: 0, color: agent.accent, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{agent.role}</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 4rem)" }}>{agent.name}</h1>
        <p style={{ margin: 0, fontSize: "1.05rem", lineHeight: 1.6 }}>{agent.introduction}</p>
        <p style={{ margin: 0, color: "#cbd5e1" }}>{agent.question}</p>
        <button type="button" onClick={() => setGuidanceOpen(true)} style={{ width: "fit-content", background: agent.accent, color: "#0f172a", fontWeight: 800 }}>Ask {agent.name}</button>
      </div>
      <div className="hlc-agent-portrait-frame" style={portraitFrameStyle}>
        {agent.image ? <img src={agent.image} alt={`${agent.name} AI workspace visual`} style={portraitStyle} /> : <div role="status" style={missingPortraitStyle}><strong>{agent.name}</strong><span>Approved portrait asset setup required</span></div>}
        <span style={{ ...presenceStyle, background: agent.accent }}>Workspace ready</span>
        {agentId === "kendrell" && <small className="hlc-symbolic-portrait-note">Symbolic Kendrell AI visual — not a historical photograph</small>}
      </div>
    </header>
    <p style={noticeStyle}><strong>Your workspace is protected.</strong> {agent.name} can explain information and recommend actions using only what your current role is allowed to access. Restricted changes still require the correct HLC role.</p>
    <AgentChatPanel agentId={agentId} agentName={agent.name} accent={agent.accent} />
    {showNudge && <aside aria-label={`${agent.name} guidance`} style={{ ...nudgeStyle, borderColor: agent.accent }}><div><strong>{agent.name} can help here.</strong><p style={{ marginBottom: 0 }}>{error ? "I can explain the failure and the safest available next step." : agent.guidance[0]}</p></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" onClick={() => { setGuidanceOpen(true); setShowNudge(false); }}>Show guidance</button><button type="button" onClick={() => setShowNudge(false)}>Dismiss</button></div></aside>}
    {loading && <p>Loading authenticated workspace context…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: message.includes("completed") || message.includes("persisted") ? "#1d4ed8" : "#334155" }}>{message}</p>}
    {!loading && <div style={gridStyle}>
      <section className="hlc-agent-actions" style={panelStyle}><h2>What would you like {agent.name} to do?</h2>
        {(agentId === "diamond" || agentId === "dion") && <label>Related lead<select value={leadId} onChange={(event) => setLeadId(event.target.value)}><option value="">Select when the capability needs a lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.full_name || `Lead #${lead.id}`}</option>)}</select></label>}
        {agentId === "dion" && <label>Follow-up date/time<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>}
        {(agentId === "dion" || agentId === "kendrell") && <label>{agentId === "kendrell" ? "What needs Antoine's attention?" : "Follow-up notes"}<textarea maxLength={2000} placeholder={agentId === "kendrell" ? "Briefly explain the decision, risk, or unresolved issue." : "Add the important follow-up details."} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>}
        {agentId === "kendrell" && account.role !== "owner" && <p style={roleNoticeStyle}>You are currently in a {account.role ?? "non-owner"} workspace. You can use Kendrell's summaries and guidance here, but saving an item to Antoine's owner priority list requires switching to his owner workspace in <Link to="/settings">Settings</Link>.</p>}
        <div style={{ display: "grid", gap: 10 }}>{capabilityCatalog[agentId].map((capability) => {
          const experience = capabilityExperience[capability.id] ?? { title: capability.label, description: "Run this HLC action." };
          const ownerOnlyBlocked = capability.id === "create_owner_attention_item" && account.role !== "owner";
          return <button className="hlc-agent-action-button" type="button" disabled={busy || ownerOnlyBlocked} key={capability.id} onClick={() => run(capability.id)}><strong>{experience.title}</strong><span>{ownerOnlyBlocked ? "Switch to Antoine's owner workspace to use this." : experience.description}</span></button>;
        })}</div>
      </section>
      <section style={panelStyle}><h2>Most recent result</h2>{result ? <FriendlyResult value={result} /> : <p>Choose an action to see its result here.</p>}</section>
    </div>}
    {agentId !== "kendrell" && <form onSubmit={handoff} style={{ ...panelStyle, marginTop: 20 }}><h2>Handoff to {agentId === "diamond" ? "Dion" : "Kendrell"}</h2><p>{handoffCopy}</p><p>The source agent remains attributable; the destination agent does not impersonate it.</p><label>Reason<textarea required minLength={3} maxLength={500} value={handoffReason} onChange={(event) => setHandoffReason(event.target.value)} /></label><button disabled={busy} type="submit">Persist handoff</button></form>}
    <section style={{ ...panelStyle, marginTop: 20 }}><h2>Recent activity</h2>{runs.length === 0 ? <p>No activity yet.</p> : runs.map((runItem) => <article key={runItem.id} style={historyStyle}><div style={historyHeadingStyle}><strong>{friendlyCapabilityName(runItem.capability_id)}</strong><span style={statusPillStyle(runItem.status)}>{friendlyStatus(runItem.status)}</span></div><small>{new Date(runItem.created_at).toLocaleString()}</small>{runItem.error_summary && <p>{runItem.error_summary}</p>}</article>)}</section>
    <section style={{ ...panelStyle, marginTop: 20 }}><h2>Work sent between HLC agents</h2>{handoffs.length === 0 ? <p>No work has been sent to another agent.</p> : handoffs.map((item) => <article key={item.id} style={historyStyle}><div style={historyHeadingStyle}><strong>{agents[item.source_agent].name} → {agents[item.destination_agent].name}</strong><span style={statusPillStyle(item.status)}>{friendlyStatus(item.status)}</span></div><p>{item.reason}</p><small>{new Date(item.created_at).toLocaleString()}</small></article>)}</section>
    {selectedLead && <p style={{ color: "#64748b" }}>Current authorized context: {selectedLead.full_name || `Lead #${selectedLead.id}`}</p>}
    <button type="button" aria-label={`Open ${agent.name} help`} onClick={() => setGuidanceOpen(true)} style={{ ...floatingButtonStyle, borderColor: agent.accent }}><span aria-hidden="true">?</span><span>{agent.name}</span></button>
    {guidanceOpen && <div role="presentation" style={overlayStyle} onMouseDown={(event) => { if (event.target === event.currentTarget) setGuidanceOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={`${agentId}-guidance-title`} style={{ ...drawerStyle, borderColor: agent.accent }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}><div><p style={{ color: agent.accent, margin: 0 }}>{agent.role}</p><h2 id={`${agentId}-guidance-title`} style={{ marginTop: 4 }}>Guidance from {agent.name}</h2></div><button autoFocus type="button" aria-label="Close guidance" onClick={() => setGuidanceOpen(false)}>Close</button></div>
        <p>{agent.introduction}</p>
        <h3>How I can help</h3>
        <ul style={{ display: "grid", gap: 12, paddingLeft: 22 }}>{agent.guidance.map((script) => <li key={script}>{script}</li>)}</ul>
        {agentId !== "kendrell" && <p style={{ ...noticeStyle, margin: 0 }}>{handoffCopy}</p>}
        <p style={{ color: "#64748b" }}>Guidance does not bypass workspace authorization, provider readiness, compliance, or HLC lifecycle rules. Use the capability controls on this page for persisted actions.</p>
      </section>
    </div>}
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

function friendlyCapabilityName(id: string) {
  return capabilityExperience[id]?.title ?? id.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function friendlyStatus(status: string) {
  if (status === "succeeded" || status === "resolved") return "Completed";
  if (status === "running" || status === "open") return "In progress";
  if (status === "blocked") return "Needs permission";
  if (status === "failed") return "Needs attention";
  return status.replaceAll("_", " ");
}

function statusPillStyle(status: string) {
  const complete = status === "succeeded" || status === "resolved";
  const problem = status === "failed" || status === "blocked";
  return { padding: "4px 9px", borderRadius: 999, background: complete ? "#dcfce7" : problem ? "#fee2e2" : "#dbeafe", color: complete ? "#166534" : problem ? "#991b1b" : "#1e3a8a", fontSize: 12, fontWeight: 800 };
}

function FriendlyResult({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <p>No result was returned.</p>;
  if (typeof value !== "object") return <p>{String(value)}</p>;
  if (Array.isArray(value)) return value.length === 0 ? <p>Nothing needs attention in this category.</p> : <ul>{value.map((item, index) => <li key={index}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>)}</ul>;
  return <dl style={resultListStyle}>{Object.entries(value as Record<string, unknown>).map(([key, item]) => <div key={key} style={resultRowStyle}><dt>{key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</dt><dd>{typeof item === "object" ? JSON.stringify(item) : String(item)}</dd></div>)}</dl>;
}

const pageStyle = { width: "min(1100px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif", display: "grid", gap: 20 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 };
const panelStyle = { display: "grid", gap: 12, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const noticeStyle = { padding: 14, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10 };
const historyStyle = { padding: "10px 0", borderTop: "1px solid #e2e8f0" };
const historyHeadingStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" as const };
const roleNoticeStyle = { margin: 0, padding: 12, border: "1px solid #bfdbfe", borderRadius: 10, background: "#eff6ff", color: "#1e3a8a", lineHeight: 1.5 };
const resultListStyle = { display: "grid", gap: 8, margin: 0 };
const resultRowStyle = { display: "grid", gridTemplateColumns: "minmax(120px, .7fr) minmax(0, 1.3fr)", gap: 12, padding: 10, borderRadius: 10, background: "#f8fafc", overflowWrap: "anywhere" as const };
const heroStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, padding: 28, border: "1px solid", borderRadius: 22, background: "linear-gradient(135deg, #0f172a, #111827 62%, #1e293b)", color: "#f8fafc", boxShadow: "0 24px 60px rgba(15,23,42,.18)" };
const brandRowStyle = { display: "flex", alignItems: "center", gap: 12, fontWeight: 800, letterSpacing: ".04em" };
const portraitFrameStyle = { minHeight: 300, position: "relative" as const, overflow: "hidden", borderRadius: 18, background: "linear-gradient(145deg, #1e293b, #0f172a)", border: "1px solid rgba(255,255,255,.16)" };
const portraitStyle = { width: "100%", height: "100%", minHeight: 300, objectFit: "cover" as const, objectPosition: "center 20%" };
const missingPortraitStyle = { minHeight: 300, display: "grid", placeContent: "center", gap: 8, textAlign: "center" as const, padding: 24, color: "#cbd5e1" };
const presenceStyle = { position: "absolute" as const, left: 14, bottom: 14, borderRadius: 999, padding: "7px 11px", color: "#0f172a", fontSize: 13, fontWeight: 800 };
const nudgeStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 16, margin: "18px 0", padding: 16, border: "1px solid", borderRadius: 14, background: "#fff" };
const floatingButtonStyle = { position: "fixed" as const, right: 20, bottom: 20, display: "flex", gap: 8, alignItems: "center", zIndex: 30, border: "2px solid", borderRadius: 999, background: "#0f172a", color: "#fff", boxShadow: "0 14px 36px rgba(15,23,42,.3)" };
const overlayStyle = { position: "fixed" as const, inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end", background: "rgba(15,23,42,.56)" };
const drawerStyle = { width: "min(520px, 100%)", height: "100%", overflowY: "auto" as const, padding: 28, borderLeft: "5px solid", background: "#fff", boxShadow: "-24px 0 60px rgba(15,23,42,.24)" };
