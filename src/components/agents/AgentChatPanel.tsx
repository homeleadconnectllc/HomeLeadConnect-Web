import { useState, type FormEvent } from "react";
import { chatWithAgent, type AgentChatMessage } from "../../api/agentChat";
import type { AgentId } from "../../ai/agents";
import { errorMessage } from "../../lib/errorMessage";

export default function AgentChatPanel({ agentId, agentName, accent }: { agentId: AgentId; agentName: string; accent: string }) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true); setError(""); setDraft("");
    const prior = messages;
    setMessages([...prior, { role: "user", text }]);
    try {
      const response = await chatWithAgent(agentId, text, prior);
      setMessages((current) => [...current, { role: "model", text: response.reply }]);
    } catch (reason) {
      setError(errorMessage(reason, "AI Provider Setup Required"));
    } finally {
      setBusy(false);
    }
  }

  return <section style={{ ...panelStyle, borderColor: accent }} aria-labelledby={`${agentId}-chat-title`}>
    <div>
      <p style={{ margin: 0, color: accent, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" }}>Advisory conversation</p>
      <h2 id={`${agentId}-chat-title`} style={{ margin: "4px 0 8px" }}>Talk with {agentName}</h2>
      <p style={{ margin: 0, color: "#475569" }}>Gemini-backed conversation is advisory only. Actions still run through HLC's deterministic authorized controls.</p>
    </div>
    <div aria-live="polite" style={transcriptStyle}>
      {messages.length === 0 && <p style={{ color: "#64748b" }}>Ask about the current HLC workspace, next steps, or what needs attention.</p>}
      {messages.map((item, index) => <article key={`${item.role}-${index}`} style={{ ...bubbleStyle, marginLeft: item.role === "user" ? "auto" : 0, background: item.role === "user" ? "#eff6ff" : "#f8fafc" }}>
        <strong>{item.role === "user" ? "You" : agentName}</strong>
        <p style={{ margin: "5px 0 0", whiteSpace: "pre-wrap" }}>{item.text}</p>
      </article>)}
      {busy && <p role="status">{agentName} is responding…</p>}
    </div>
    {error && <p role="alert" style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <label htmlFor={`${agentId}-chat-input`}><strong>Message</strong></label>
      <textarea id={`${agentId}-chat-input`} maxLength={4000} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Ask ${agentName}…`} />
      <button type="submit" disabled={busy || draft.trim().length === 0} style={{ width: "fit-content" }}>Send to {agentName}</button>
    </form>
  </section>;
}

const panelStyle = { display: "grid", gap: 14, padding: 20, border: "1px solid", borderRadius: 14, background: "#fff" };
const transcriptStyle = { display: "grid", gap: 10, maxHeight: 420, overflowY: "auto" as const, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" };
const bubbleStyle = { width: "min(88%, 700px)", padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, lineHeight: 1.5 };
