import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { agents, capabilityCatalog, type AgentId } from "../../ai/agents";
import { createAgentHandoff, listAgentHandoffs, listAgentRuns, runAgentCapability, type AgentHandoff, type AgentRun } from "../../api/agents";
import { listLeads } from "../../api/leads";
import type { Lead } from "../../lib/types/database";
import { errorMessage } from "../../lib/errorMessage";

export default function AgentWorkspace({ agentId }: { agentId: AgentId }) {
  const agent = agents[agentId];
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

  const load = useCallback(async () => {
    const [runRows, handoffRows, leadRows] = await Promise.all([listAgentRuns(agentId), listAgentHandoffs(agentId), listLeads()]);
    setRuns(runRows); setHandoffs(handoffRows); setLeads(leadRows);
  }, [agentId]);

  useEffect(() => {
    let active = true;
    Promise.all([listAgentRuns(agentId), listAgentHandoffs(agentId), listLeads()])
      .then(([runRows, handoffRows, leadRows]) => { if (active) { setRuns(runRows); setHandoffs(handoffRows); setLeads(leadRows); } })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason, `Unable to load ${agent.name}.`)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [agentId, agent.name]);

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
      if (capability === "create_owner_attention_item") { if (notes.trim().length < 3) throw new Error("Describe what needs owner attention."); input.reason = notes; }
      const response = await runAgentCapability(agentId, capability, input);
      setResult(response.result ?? { status: response.status, error: response.error, error_code: response.error_code });
      setMessage(response.status === "succeeded" ? "Capability completed through the canonical HLC runtime." : `Capability ${response.status}: ${response.error || "No action was taken."}`);
      await load();
    } catch (reason) { setError(errorMessage(reason, "Unable to run this capability.")); }
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

  return <main style={pageStyle}>
    <header style={{ borderLeft: `6px solid ${agent.accent}`, paddingLeft: 16 }}><h1>{agent.name}</h1><p><strong>{agent.role}</strong></p><p>{agent.question}</p></header>
    <p style={noticeStyle}>Deterministic workspace capabilities are active. Conversational model output: <strong>AI Provider Setup Required</strong>. No model or browser prompt can bypass HLC permissions or lifecycle rules.</p>
    {loading && <p>Loading authenticated workspace context…</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: message.includes("completed") || message.includes("persisted") ? "#166534" : "#92400e" }}>{message}</p>}
    {!loading && <div style={gridStyle}>
      <section style={panelStyle}><h2>Capabilities</h2>
        {(agentId === "diamond" || agentId === "dion") && <label>Related lead<select value={leadId} onChange={(event) => setLeadId(event.target.value)}><option value="">Select when the capability needs a lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.full_name || `Lead #${lead.id}`}</option>)}</select></label>}
        {agentId === "dion" && <label>Follow-up date/time<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>}
        {(agentId === "dion" || agentId === "kendrell") && <label>{agentId === "kendrell" ? "Owner attention reason" : "Follow-up notes"}<textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>}
        <div style={{ display: "grid", gap: 10 }}>{capabilityCatalog[agentId].map((capability) => <button type="button" disabled={busy} key={capability.id} onClick={() => run(capability.id)}><small>{capability.level}</small><br />{capability.label}</button>)}</div>
      </section>
      <section style={panelStyle}><h2>Latest verified result</h2>{result ? <pre style={preStyle}>{JSON.stringify(result, null, 2)}</pre> : <p>No capability has run in this session.</p>}</section>
    </div>}
    {agentId !== "kendrell" && <form onSubmit={handoff} style={{ ...panelStyle, marginTop: 20 }}><h2>Handoff to {agentId === "diamond" ? "Dion" : "Kendrell"}</h2><p>The source agent remains attributable; the destination agent does not impersonate it.</p><label>Reason<textarea required minLength={3} maxLength={500} value={handoffReason} onChange={(event) => setHandoffReason(event.target.value)} /></label><button disabled={busy} type="submit">Persist handoff</button></form>}
    <section style={{ ...panelStyle, marginTop: 20 }}><h2>Persisted history</h2>{runs.length === 0 ? <p>No runs yet.</p> : runs.map((runItem) => <article key={runItem.id} style={historyStyle}><strong>{runItem.capability_id}</strong> · {runItem.status}<br /><small>{new Date(runItem.created_at).toLocaleString()}</small>{runItem.error_summary && <p>{runItem.error_summary}</p>}</article>)}</section>
    <section style={{ ...panelStyle, marginTop: 20 }}><h2>Agent handoffs</h2>{handoffs.length === 0 ? <p>No handoffs for this agent.</p> : handoffs.map((item) => <article key={item.id} style={historyStyle}><strong>{item.source_agent} → {item.destination_agent}</strong> · {item.status}<p>{item.reason}</p><small>{new Date(item.created_at).toLocaleString()}</small></article>)}</section>
    {selectedLead && <p style={{ color: "#64748b" }}>Current authorized context: {selectedLead.full_name || `Lead #${selectedLead.id}`}</p>}
  </main>;
}

const pageStyle = { width: "min(1100px, calc(100% - 48px))", margin: "40px auto", fontFamily: "system-ui, sans-serif" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 };
const panelStyle = { display: "grid", gap: 12, padding: 20, border: "1px solid #e2e8f0", borderRadius: 14 };
const noticeStyle = { padding: 14, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10 };
const preStyle = { maxHeight: 420, overflow: "auto", whiteSpace: "pre-wrap" as const, padding: 14, background: "#0f172a", color: "#e2e8f0", borderRadius: 10 };
const historyStyle = { padding: "10px 0", borderTop: "1px solid #e2e8f0" };
