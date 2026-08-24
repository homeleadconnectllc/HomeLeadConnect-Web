import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { chatWithAgent, type AgentChatMessage } from "../../api/agentChat";
import { agents, type AgentId } from "../../ai/agents";
import { errorMessage } from "../../lib/errorMessage";
import {
  agentLocaleOptions,
  getAgentLocalePreference,
  getAgentUiCopy,
  resolveAgentLocale,
  saveAgentLocalePreference,
  type AgentLocale,
  type ResolvedAgentLocale,
} from "../../lib/agentLocale";
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
type PresenceState = "available" | "thinking" | "listening" | "preparing" | "speaking";
type VoicePhase = "idle" | "preparing" | "speaking";

const avatarByAgent: Record<AgentId, string> = {
  kendrell: "/brand/avatars/Kendrell_Locked_HLC.png",
  dion: "/brand/avatars/Dion_Locked_HLC.png",
  diamond: "/brand/avatars/Diamond_Locked_HLC.png",
};

const quickPrompts: Record<ResolvedAgentLocale, Record<AgentId, string[]>> = {
  "en-US": {
    kendrell: ["What needs my attention?", "Summarize this workspace", "What should I do next?"],
    dion: ["What is operationally blocked?", "Show my next actions", "Summarize today's workload"],
    diamond: ["What customer needs attention?", "Summarize recent messages", "What follow-up matters most?"],
  },
  "es-US": {
    kendrell: ["¿Qué necesita mi atención?", "Resume este espacio de trabajo", "¿Qué debo hacer ahora?"],
    dion: ["¿Qué está bloqueado en operaciones?", "Muéstrame mis próximas acciones", "Resume la carga de trabajo de hoy"],
    diamond: ["¿Qué cliente necesita atención?", "Resume los mensajes recientes", "¿Qué seguimiento importa más?"],
  },
  "fr-FR": {
    kendrell: ["Qu’est-ce qui demande mon attention ?", "Résume cet espace de travail", "Que dois-je faire ensuite ?"],
    dion: ["Qu’est-ce qui bloque les opérations ?", "Montre mes prochaines actions", "Résume la charge de travail d’aujourd’hui"],
    diamond: ["Quel client demande de l’attention ?", "Résume les messages récents", "Quel suivi est prioritaire ?"],
  },
  "pt-BR": {
    kendrell: ["O que precisa da minha atenção?", "Resuma este espaço de trabalho", "O que devo fazer agora?"],
    dion: ["O que está bloqueado nas operações?", "Mostre minhas próximas ações", "Resuma a carga de trabalho de hoje"],
    diamond: ["Qual cliente precisa de atenção?", "Resuma as mensagens recentes", "Qual acompanhamento é mais importante?"],
  },
  "zh-CN": {
    kendrell: ["什么需要我关注？", "总结这个工作区", "我下一步该做什么？"],
    dion: ["运营中有什么被阻塞？", "显示我的下一步操作", "总结今天的工作量"],
    diamond: ["哪位客户需要关注？", "总结最近的消息", "哪个跟进最重要？"],
  },
  "ar-SA": {
    kendrell: ["ما الذي يحتاج إلى انتباهي؟", "لخّص مساحة العمل هذه", "ما الذي ينبغي أن أفعله بعد ذلك؟"],
    dion: ["ما العالق في العمليات؟", "أظهر لي إجراءاتي التالية", "لخّص عبء العمل اليوم"],
    diamond: ["أي عميل يحتاج إلى اهتمام؟", "لخّص الرسائل الأخيرة", "ما المتابعة الأكثر أهمية؟"],
  },
};

function getRecognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

export default function AgentChatPanel({ agentId, agentName, accent }: { agentId: AgentId; agentName: string; accent: string }) {
  const browserLocale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [fallbackMode, setFallbackMode] = useState(false);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle");
  const [localePreference, setLocalePreference] = useState<AgentLocale>(() => getAgentLocalePreference());
  const [activeLocale, setActiveLocale] = useState<ResolvedAgentLocale>(() => resolveAgentLocale(getAgentLocalePreference(), "", browserLocale));
  const [voicePreferences, setVoicePreferences] = useState<AgentVoicePreferences>(() => getAgentVoicePreferences());
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const recognitionSupported = typeof window !== "undefined" && Boolean(getRecognitionConstructor());
  const speechOutputSupported = isAgentAudioSupported();
  const sendDisabled = busy || draft.trim().length === 0;
  const voicePersona = agents[agentId].voicePersona;
  const voiceBusy = voicePhase !== "idle";
  const presence: PresenceState = listening ? "listening" : voicePhase === "speaking" ? "speaking" : voicePhase === "preparing" ? "preparing" : busy ? "thinking" : "available";
  const copy = getAgentUiCopy(activeLocale);

  useEffect(() => {
    if (!speechOutputSupported || !voicePreferences.enabled || !voicePreferences.autoSpeak) return;
    const greetingKey = `hlc.agentRoomGreeting.v2:${agentId}:${activeLocale}`;
    if (window.sessionStorage.getItem(greetingKey) === "1") return;

    const greeting = activeLocale === "en-US"
      ? `${agents[agentId].introduction} ${agents[agentId].question}`.trim()
      : `${agentName}. ${copy.welcome}`;
    let cancelled = false;

    const playGreeting = async () => {
      if (cancelled || window.sessionStorage.getItem(greetingKey) === "1") return;
      try {
        await prepareAgentAudio();
        if (cancelled) return;
        const played = await speakAgentText(agentId, greeting, activeLocale);
        if (!cancelled && played) window.sessionStorage.setItem(greetingKey, "1");
      } catch {
        // Safari/iOS can require the first user gesture. Retry exactly once on the first interaction.
      }
    };

    void playGreeting();
    const unlock = () => { if (!cancelled) void playGreeting(); };
    document.addEventListener("pointerdown", unlock, { once: true, capture: true });
    document.addEventListener("keydown", unlock, { once: true, capture: true });

    return () => {
      cancelled = true;
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
      stopAgentSpeech();
      setVoicePhase("idle");
    };
  }, [activeLocale, agentId, agentName, copy.welcome, speechOutputSupported, voicePreferences.autoSpeak, voicePreferences.enabled]);

  function updateLocalePreference(next: AgentLocale) {
    setLocalePreference(next);
    saveAgentLocalePreference(next);
    const resolved = resolveAgentLocale(next, draft, browserLocale);
    setActiveLocale(resolved);
    stopAgentSpeech();
    setVoicePhase("idle");
  }

  function updateVoicePreferences(next: AgentVoicePreferences) {
    setVoicePreferences(next);
    saveAgentVoicePreferences(next);
    if (!next.enabled) {
      stopAgentSpeech();
      setVoicePhase("idle");
      return;
    }
    void prepareAgentAudio().catch((reason) => {
      setError(errorMessage(reason, "Tap voice again to enable audio on this device."));
    });
  }

  async function speak(text: string, reportError = true, locale = activeLocale) {
    if (!speechOutputSupported || !voicePreferences.enabled || voiceBusy) return;
    setVoicePhase("preparing");
    if (reportError) setError("");
    try {
      await prepareAgentAudio();
      const played = await speakAgentText(agentId, text, locale, () => setVoicePhase("speaking"));
      if (!played) throw new Error("No audible audio started. Tap Listen to retry.");
    } catch (reason) {
      setError(errorMessage(reason, `${agentName}'s voice did not start. Tap Listen to retry.`));
    } finally {
      setVoicePhase("idle");
    }
  }

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const resolvedLocale = resolveAgentLocale(localePreference, clean, browserLocale);
    setActiveLocale(resolvedLocale);

    if (voicePreferences.enabled && voicePreferences.autoSpeak && speechOutputSupported) {
      try { await prepareAgentAudio(); } catch { /* text chat still proceeds */ }
    }

    setBusy(true);
    setError("");
    setDraft("");
    const prior = messages;
    setMessages([...prior, { role: "user", text: clean }]);
    try {
      const response = await chatWithAgent(agentId, clean, prior, resolvedLocale);
      const responseLocale = response.locale || resolvedLocale;
      setActiveLocale(responseLocale);
      const previousModelReply = [...prior].reverse().find((item) => item.role === "model")?.text.trim() ?? "";
      const repeatedFallback = Boolean(response.fallback && previousModelReply && previousModelReply === response.reply.trim());
      setFallbackMode(Boolean(response.fallback));

      if (repeatedFallback) {
        setError(`${agentName}'s live reasoning provider is temporarily unavailable. HLC kept the existing verified fallback instead of repeating the same response.`);
      } else {
        setMessages((current) => [...current, { role: "model", text: response.reply }]);
        if (response.fallback) {
          setError(`${agentName} is using verified HLC fallback guidance right now. Live reasoning will resume automatically when the provider is available.`);
        }
      }

      if (!response.fallback && voicePreferences.enabled && voicePreferences.autoSpeak) void speak(response.reply, false, responseLocale);
    } catch (reason) {
      setFallbackMode(false);
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
    recognition.lang = activeLocale;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      setDraft(transcript);
      setListening(false);
      recognitionRef.current = null;
      void sendMessage(transcript);
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
    try {
      recognition.start();
    } catch (reason) {
      recognitionRef.current = null;
      setListening(false);
      setError(errorMessage(reason, "Voice input could not start. Check microphone permission and try again."));
    }
  }

  const presenceLabel = presence === "thinking"
    ? copy.thinking
    : presence === "listening"
      ? copy.listening
      : presence === "preparing"
        ? "Preparing voice…"
        : presence === "speaking"
          ? copy.speaking
          : fallbackMode
            ? copy.verifiedFallback
            : copy.ready;

  return <section className="hlc-ai-chat" style={{ "--chat-agent-accent": accent } as CSSProperties} aria-labelledby={`${agentId}-chat-title`} data-presence={presence} data-agent-experience="premium-conversation-v3" data-response-mode={fallbackMode ? "fallback" : "live"} data-agent-locale={activeLocale}>
    <header className="hlc-ai-chat-head">
      <div className="hlc-ai-presence-avatar" data-state={presence}>
        <img src={avatarByAgent[agentId]} alt="" aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
      <div>
        <h2 id={`${agentId}-chat-title`}>{agentName}</h2>
        <p>{presenceLabel}</p>
      </div>
      <label className="hlc-ai-language-control">
        <span>{copy.language}</span>
        <select value={localePreference} onChange={(event) => updateLocalePreference(event.target.value as AgentLocale)} aria-label={`${copy.language} · ${agentName}`}>
          {agentLocaleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {localePreference === "auto" && <small>{copy.autoDetected}: {activeLocale}</small>}
      </label>
    </header>

    <div className="hlc-ai-transcript" aria-live="polite" dir={activeLocale === "ar-SA" ? "rtl" : "auto"}>
      {messages.length === 0 && <div className="hlc-ai-welcome">
        <strong>{copy.howCanIHelp}</strong>
        <p>{copy.welcome}</p>
        <div className="hlc-ai-quick-prompts">
          {quickPrompts[activeLocale][agentId].map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(prompt)}>{prompt}</button>)}
        </div>
      </div>}
      {messages.map((item, index) => <article key={`${item.role}-${index}`} className={`hlc-ai-message is-${item.role}`}>
        <strong>{item.role === "user" ? copy.you : agentName}</strong>
        <p>{item.text}</p>
        {item.role === "model" && speechOutputSupported && voicePreferences.enabled && <button type="button" className="hlc-ai-replay" disabled={voiceBusy} onClick={() => void speak(item.text)} aria-label={`${copy.listen} · ${agentName}`}>{voicePhase === "preparing" ? "Preparing…" : voicePhase === "speaking" ? `${copy.speaking}…` : copy.listen}</button>}
      </article>)}
      {busy && <div className="hlc-ai-thinking" role="status"><span/><span/><span/><em>{agentName} · {copy.thinking}</em></div>}
    </div>

    {error && <p role="alert" className="hlc-ai-error">{error}</p>}

    <form onSubmit={submit} className="hlc-ai-composer" onPointerDown={() => { if (voicePreferences.enabled) void prepareAgentAudio().catch(() => undefined); }}>
      <label className="sr-only" htmlFor={`${agentId}-chat-input`}>{copy.message} {agentName}</label>
      <textarea id={`${agentId}-chat-input`} maxLength={4000} rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`${copy.message} ${agentName}…`} lang={activeLocale} dir={activeLocale === "ar-SA" ? "rtl" : "auto"} />
      <div className="hlc-ai-composer-actions">
        {recognitionSupported && <button className={`hlc-ai-icon-action ${listening ? "is-active" : ""}`} type="button" aria-pressed={listening} onClick={toggleDictation} title={copy.talk}>{listening ? "■" : "🎤"}<span>{listening ? `${copy.listening}…` : copy.talk}</span></button>}
        <details className="hlc-ai-settings">
          <summary title={copy.options}><span className="hlc-ai-settings-label">Voice</span><span className="sr-only">{copy.options}</span></summary>
          <div>
            {speechOutputSupported && <>
              <label><input type="checkbox" checked={voicePreferences.enabled} onChange={(event) => updateVoicePreferences({ enabled: event.target.checked, autoSpeak: event.target.checked ? true : false })}/> {copy.enableVoice}</label>
              <label><input type="checkbox" checked={voicePreferences.autoSpeak} disabled={!voicePreferences.enabled} onChange={(event) => updateVoicePreferences({ ...voicePreferences, autoSpeak: event.target.checked })}/> {copy.autoSpeak}</label>
              <small>{agentName} voice · {voicePersona.tone} · {activeLocale}</small>
            </>}
            {!speechOutputSupported && <small>{copy.voiceUnavailable}</small>}
          </div>
        </details>
        <button className="hlc-ai-send" type="submit" disabled={sendDisabled} aria-label={`${copy.send} · ${agentName}`}>➤</button>
      </div>
    </form>
  </section>;
}