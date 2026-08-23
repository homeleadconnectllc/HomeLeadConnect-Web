export type AgentLocale = "auto" | "en-US" | "es-US" | "fr-FR" | "pt-BR" | "zh-CN" | "ar-SA";
export type ResolvedAgentLocale = Exclude<AgentLocale, "auto">;

export const agentLocaleOptions: Array<{ value: AgentLocale; label: string }> = [
  { value: "auto", label: "Auto detect" },
  { value: "en-US", label: "English" },
  { value: "es-US", label: "Español" },
  { value: "fr-FR", label: "Français" },
  { value: "pt-BR", label: "Português" },
  { value: "zh-CN", label: "中文" },
  { value: "ar-SA", label: "العربية" },
];

const STORAGE_KEY = "hlc.agentLocale.v1";

export function normalizeAgentLocale(value?: string | null): ResolvedAgentLocale {
  const normalized = String(value || "").toLowerCase();
  if (normalized.startsWith("es")) return "es-US";
  if (normalized.startsWith("fr")) return "fr-FR";
  if (normalized.startsWith("pt")) return "pt-BR";
  if (normalized.startsWith("zh")) return "zh-CN";
  if (normalized.startsWith("ar")) return "ar-SA";
  return "en-US";
}

export function getAgentLocalePreference(): AgentLocale {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return agentLocaleOptions.some((option) => option.value === stored) ? stored as AgentLocale : "auto";
}

export function saveAgentLocalePreference(locale: AgentLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
}

export function detectAgentLocale(text: string, browserLocale?: string | null): ResolvedAgentLocale {
  const clean = text.trim();
  if (/[一-鿿]/u.test(clean)) return "zh-CN";
  if (/[؀-ۿ]/u.test(clean)) return "ar-SA";

  const lower = clean.toLocaleLowerCase();
  const scores: Array<[ResolvedAgentLocale, number]> = [
    ["es-US", (lower.match(/\b(hola|gracias|por favor|necesito|quiero|puedo|cita|precio|trabajo|ayuda|qué|cómo|cuándo|dónde)\b/gu) || []).length],
    ["fr-FR", (lower.match(/\b(bonjour|merci|s'il vous plaît|besoin|veux|peux|rendez-vous|prix|travail|aide|quoi|comment|quand|où)\b/gu) || []).length],
    ["pt-BR", (lower.match(/\b(olá|obrigado|obrigada|por favor|preciso|quero|posso|agendamento|preço|trabalho|ajuda|como|quando|onde)\b/gu) || []).length],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  if (scores[0][1] > 0) return scores[0][0];
  return normalizeAgentLocale(browserLocale);
}

export function resolveAgentLocale(preference: AgentLocale, message = "", browserLocale?: string | null): ResolvedAgentLocale {
  return preference === "auto" ? detectAgentLocale(message, browserLocale) : preference;
}

export type AgentUiCopy = {
  language: string;
  autoDetected: string;
  howCanIHelp: string;
  welcome: string;
  thinking: string;
  listening: string;
  speaking: string;
  verifiedFallback: string;
  ready: string;
  you: string;
  listen: string;
  talk: string;
  options: string;
  enableVoice: string;
  autoSpeak: string;
  voiceUnavailable: string;
  send: string;
  message: string;
};

const COPY: Record<ResolvedAgentLocale, AgentUiCopy> = {
  "en-US": {
    language: "Language", autoDetected: "Auto detected", howCanIHelp: "How can I help?",
    welcome: "I can work from the HLC context you are authorized to access and help you decide what to do next.",
    thinking: "Thinking", listening: "Listening", speaking: "Speaking", verifiedFallback: "Verified fallback", ready: "Ready",
    you: "You", listen: "Listen", talk: "Talk", options: "Options", enableVoice: "Enable agent voice",
    autoSpeak: "Speak future briefings", voiceUnavailable: "Voice output is unavailable in this browser.", send: "Send", message: "Message",
  },
  "es-US": {
    language: "Idioma", autoDetected: "Detectado automáticamente", howCanIHelp: "¿Cómo puedo ayudar?",
    welcome: "Puedo trabajar con el contexto de HLC al que tienes acceso autorizado y ayudarte a decidir qué hacer después.",
    thinking: "Pensando", listening: "Escuchando", speaking: "Hablando", verifiedFallback: "Respuesta verificada", ready: "Listo",
    you: "Tú", listen: "Escuchar", talk: "Hablar", options: "Opciones", enableVoice: "Activar voz del agente",
    autoSpeak: "Leer próximos informes", voiceUnavailable: "La salida de voz no está disponible en este navegador.", send: "Enviar", message: "Mensaje",
  },
  "fr-FR": {
    language: "Langue", autoDetected: "Détectée automatiquement", howCanIHelp: "Comment puis-je aider ?",
    welcome: "Je peux utiliser le contexte HLC auquel vous êtes autorisé à accéder et vous aider à décider de la prochaine étape.",
    thinking: "Réflexion", listening: "Écoute", speaking: "Parole", verifiedFallback: "Réponse vérifiée", ready: "Prêt",
    you: "Vous", listen: "Écouter", talk: "Parler", options: "Options", enableVoice: "Activer la voix de l’agent",
    autoSpeak: "Lire les prochains briefings", voiceUnavailable: "La sortie vocale n’est pas disponible dans ce navigateur.", send: "Envoyer", message: "Message",
  },
  "pt-BR": {
    language: "Idioma", autoDetected: "Detectado automaticamente", howCanIHelp: "Como posso ajudar?",
    welcome: "Posso trabalhar com o contexto HLC que você tem autorização para acessar e ajudar a decidir o próximo passo.",
    thinking: "Pensando", listening: "Ouvindo", speaking: "Falando", verifiedFallback: "Resposta verificada", ready: "Pronto",
    you: "Você", listen: "Ouvir", talk: "Falar", options: "Opções", enableVoice: "Ativar voz do agente",
    autoSpeak: "Ler próximos briefings", voiceUnavailable: "A saída de voz não está disponível neste navegador.", send: "Enviar", message: "Mensagem",
  },
  "zh-CN": {
    language: "语言", autoDetected: "自动检测", howCanIHelp: "我能帮您什么？",
    welcome: "我可以根据您有权访问的 HLC 上下文工作，并帮助您决定下一步。",
    thinking: "思考中", listening: "聆听中", speaking: "正在说话", verifiedFallback: "已验证备用回复", ready: "就绪",
    you: "您", listen: "收听", talk: "说话", options: "选项", enableVoice: "启用智能助手语音",
    autoSpeak: "朗读后续简报", voiceUnavailable: "此浏览器不支持语音输出。", send: "发送", message: "消息",
  },
  "ar-SA": {
    language: "اللغة", autoDetected: "تم الاكتشاف تلقائيًا", howCanIHelp: "كيف يمكنني المساعدة؟",
    welcome: "يمكنني العمل باستخدام سياق HLC المصرح لك بالوصول إليه ومساعدتك في تحديد الخطوة التالية.",
    thinking: "يفكر", listening: "يستمع", speaking: "يتحدث", verifiedFallback: "رد احتياطي موثّق", ready: "جاهز",
    you: "أنت", listen: "استماع", talk: "تحدث", options: "خيارات", enableVoice: "تفعيل صوت المساعد",
    autoSpeak: "قراءة الملخصات القادمة", voiceUnavailable: "الإخراج الصوتي غير متاح في هذا المتصفح.", send: "إرسال", message: "رسالة",
  },
};

export function getAgentUiCopy(locale: ResolvedAgentLocale) {
  return COPY[locale] || COPY["en-US"];
}
