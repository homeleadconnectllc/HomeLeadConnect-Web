import { useRef, useState, type FormEvent } from "react";
import { chatWithAgent, type AgentChatMessage } from "../../api/agentChat";
import type { AgentId } from "../../ai/agents";
import { errorMessage } from "../../lib/errorMessage";

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => RecognitionLike;

function getRecognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

export default function AgentChatPanel({ agentId, agentName, accent }: { agentId: AgentId; agentName: string; accent: string }) {
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const recognitionSupported = typeof window !== "undefined" && Boolean(getRecognitionConstructor());
  const speechOutputSupported = typeof window !== "undefined" && "speechSynthesis" in window;

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

  function toggleDictation() {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return;
    const recognition = new Constructor();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) setDraft((current) => `${current}${current ? " " : ""}${transcript}`);
    };
    recognition.onerror = (event) => {
      setError(event.error ? `Voice input error: ${event.error}` : "Voice input failed.");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setListening(true);
    setError("");
    recognition.start();
  }

  function readMessage(text: string) {
    if (!speechOutputSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
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
        {item.role === "model" && speechOutputSupported && <button type="button" onClick={() => readMessage(item.text)} style={listenButtonStyle}>Read aloud</button>}
      </article>)}
      {busy && <p role="status">{agentName} is responding…</p>}
    </div>
    {error && <p role="alert" style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <label htmlFor={`${agentId}-chat-input`}><strong>Message</strong></label>
      <textarea id={`${agentId}-chat-input`} maxLength={4000} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Ask ${agentName}…`} />
      <div style={composerActionsStyle}>
        {recognitionSupported && <button type="button" aria-pressed={listening} onClick={toggleDictation}>{listening ? "Stop listening" : "Voice input"}</button>}
        <button type="submit" disabled={busy || draft.trim().length === 0}>Send to {agentName}</button>
      </div>
      {!recognitionSupported && <small style={{ color: "#64748b" }}>Voice dictation is unavailable in this browser; typed chat remains available.</small>}
    </form>
  </section>;
}

const panelStyle = { display: "grid", gap: 14, padding: 20, border: "1px solid", borderRadius: 14, background: "#fff" };
const transcriptStyle = { display: "grid", gap: 10, maxHeight: 420, overflowY: "auto" as const, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" };
const bubbleStyle = { width: "min(88%, 700px)", boxSizing: "border-box" as const, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, lineHeight: 1.5 };
const listenButtonStyle = { marginTop: 8, minHeight: 36, padding: "6px 10px" };
const composerActionsStyle = { display: "flex", flexWrap: "wrap" as const, gap: 8, alignItems: "center" };
