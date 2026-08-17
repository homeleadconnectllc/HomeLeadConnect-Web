import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { chatWithAgent, type AgentChatMessage } from "../../api/agentChat";
import { agents, type AgentId } from "../../ai/agents";
import { errorMessage } from "../../lib/errorMessage";
import {
  getAgentVoicePreferences,
  isAgentAudioSupported,
  prepareAgentAudio,
  saveAgentVoicePreferences,
  speakAgentText,
  stopAgentSpeech,
  type AgentVoicePreferences,
} from "../../lib/agentVoice";

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
type PresenceState = "available" | "thinking" | "listening" | "speaking";

const avatarByAgent: Record<AgentId, string> = {
  kendrell: "/brand/avatars/Kendrell_Locked_HLC.png",
  dion: "/brand/avatars/Dion_Locked_HLC.png",
  diamond: "/brand/avatars/Diamond_Locked_HLC.png",
};

const quickPrompts: Record<AgentId, string[]> = {
  kendrell: ["What needs my attention?", "Summarize this workspace", "What should I do next?"],
  dion: ["What is operationally blocked?", "Show my next actions", "Summarize today's workload"],
  diamond: ["What customer needs attention?", "Summarize recent messages", "What follow-up matters most?"],
};

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
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voicePreferences, setVoicePreferences] = useState<AgentVoicePreferences>(() => getAgentVoicePreferences());
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const recognitionSupported = typeof window !== "undefined" && Boolean(getRecognitionConstructor());
  const speechOutputSupported = isAgentAudioSupported();
  const sendDisabled = busy || draft.trim().length === 0;
  const voicePersona = agents[agentId].voicePersona;
  const presence: PresenceState = listening ? "listening" : voiceBusy ? "speaking" : busy ? "thinking" : "available";

  function updateVoicePreferences(next: AgentVoicePreferences) {
    setVoicePreferences(next);
    saveAgentVoicePreferences(next);
    if (!next.enabled) {
      stopAgentSpeech();
      return;
    }
    void prepareAgentAudio().catch((reason) => {
      setError(errorMessage(reason, "Tap voice again to enable audio on this device."));
    });
  }

  async function speak(text: string) {
    if (!speechOutputSupported || !voicePreferences.enabled || voiceBusy) return;
    setVoiceBusy(true);
    setError("");
    try {
      await prepareAgentAudio();
      await speakAgentText(agentId, text);
    } catch (reason) {
      setError(errorMessage(reason, `${agentName}'s voice is temporarily unavailable.`));
    } finally {
      setVoiceBusy(false);
    }
  }

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;

    if (voicePreferences.enabled && voicePreferences.autoSpeak && speechOutputSupported) {
      try { await prepareAgentAudio(); } catch { /* text chat still proceeds */ }
    }

    setBusy(true);
    setError("");
    setDraft("");
    const prior = messages;
    setMessages([...prior, { role: "user", text: clean }]);
    try {
      const response = await chatWithAgent(agentId, clean, prior);
      setMessages((current) => [...current, { role: "model", text: response.reply }]);
      if (voicePreferences.enabled && voicePreferences.autoSpeak) await speak(response.reply);
    } catch (reason) {
      setError(errorMessage(reason, `${agentName} is temporarily unavailable. Try again in a moment.`));
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await sendMessage(draft);
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

  return <section className="hlc-ai-chat" style={{ "--chat-agent-accent": accent } as CSSProperties} aria-labelledby={`${agentId}-chat-title`} data-presence={presence} data-agent-experience="premium-conversation-v2">
    <header className="hlc-ai-chat-head">
      <div className="hlc-ai-presence-avatar" data-state={presence}>
        <img src={avatarByAgent[agentId]} alt="" aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
      <div>
        <h2 id={`${agentId}-chat-title`}>{agentName}</h2>
        <p>{presence === "thinking" ? "Thinking" : presence === "listening" ? "Listening" : presence === "speaking" ? "Speaking" : "Ready"}</p>
      </div>
    </header>

    <div className="hlc-ai-transcript" aria-live="polite">
      {messages.length === 0 && <div className="hlc-ai-welcome">
        <strong>How can I help?</strong>
        <p>I can work from the HLC context you are authorized to access and help you decide what to do next.</p>
        <div className="hlc-ai-quick-prompts">
          {quickPrompts[agentId].map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(prompt)}>{prompt}</button>)}
        </div>
      </div>}
      {messages.map((item, index) => <article key={`${item.role}-${index}`} className={`hlc-ai-message is-${item.role}`}>
        <strong>{item.role === "user" ? "You" : agentName}</strong>
        <p>{item.text}</p>
        {item.role === "model" && speechOutputSupported && voicePreferences.enabled && <button type="button" className="hlc-ai-replay" disabled={voiceBusy} onClick={() => void speak(item.text)} aria-label={`Play ${agentName} response`}>{voiceBusy ? "Speaking…" : "Listen"}</button>}
      </article>)}
      {busy && <div className="hlc-ai-thinking" role="status"><span/><span/><span/><em>{agentName} is thinking</em></div>}
    </div>

    {error && <p role="alert" className="hlc-ai-error">{error}</p>}

    <form onSubmit={submit} className="hlc-ai-composer">
      <label className="sr-only" htmlFor={`${agentId}-chat-input`}>Message {agentName}</label>
      <textarea id={`${agentId}-chat-input`} maxLength={4000} rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${agentName}…`} />
      <div className="hlc-ai-composer-actions">
        {recognitionSupported && <button className={`hlc-ai-icon-action ${listening ? "is-active" : ""}`} type="button" aria-pressed={listening} onClick={toggleDictation} title={listening ? "Stop listening" : "Voice input"}>{listening ? "■" : "🎤"}<span>{listening ? "Stop" : "Talk"}</span></button>}
        <details className="hlc-ai-settings">
          <summary title="Agent preferences">•••<span>Options</span></summary>
          <div>
            {speechOutputSupported && <>
              <label><input type="checkbox" checked={voicePreferences.enabled} onChange={(event) => updateVoicePreferences({ enabled: event.target.checked, autoSpeak: event.target.checked ? true : false })}/> Enable agent voice</label>
              <label><input type="checkbox" checked={voicePreferences.autoSpeak} disabled={!voicePreferences.enabled} onChange={(event) => updateVoicePreferences({ ...voicePreferences, autoSpeak: event.target.checked })}/> Speak future briefings</label>
              <small>{voicePersona.genderPresentation} · {voicePersona.tone}</small>
            </>}
            {!speechOutputSupported && <small>Voice output is unavailable in this browser.</small>}
          </div>
        </details>
        <button className="hlc-ai-send" type="submit" disabled={sendDisabled} aria-label={`Send message to ${agentName}`}>➤</button>
      </div>
    </form>
  </section>;
}
