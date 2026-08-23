export type AgentLocale = "auto" | "en-US" | "es-US" | "fr-FR" | "pt-BR" | "zh-CN" | "ar-SA";
export type ResolvedAgentLocale = Exclude<AgentLocale, "auto">;

type AgentId = "kendrell" | "dion" | "diamond";

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

const localeNames: Record<ResolvedAgentLocale, string> = {
  "en-US": "English (United States)",
  "es-US": "Spanish (United States)",
  "fr-FR": "French",
  "pt-BR": "Brazilian Portuguese",
  "zh-CN": "Simplified Chinese",
  "ar-SA": "Arabic",
};

export function buildAgentLocaleDirective(locale: ResolvedAgentLocale) {
  return `HLC language preference: respond in ${localeNames[locale]} (${locale}). Translate user-facing guidance faithfully while preserving canonical HLC record meaning. Never rewrite or imply changes to canonical records merely because the presentation language differs. For consent, pricing, scheduling, confirmations, safety, billing, or legal-sensitive wording, translate precisely rather than loosely summarizing.`;
}

const localizedFallback: Record<ResolvedAgentLocale, Record<AgentId, string>> = {
  "en-US": {
    kendrell: "Kendrell here. Live reasoning is temporarily unavailable. I can still keep the verified HLC context, priorities, risks, and next-step boundaries clear without pretending an action occurred.",
    dion: "Dion here. Live reasoning is temporarily unavailable. I can still work from verified HLC workflow state and keep the next operational step clear without inventing status or completion.",
    diamond: "Diamond here. Live reasoning is temporarily unavailable. I can still explain verified HLC status and the safest next step without guessing or making unsupported promises.",
  },
  "es-US": {
    kendrell: "Habla Kendrell. El razonamiento en vivo no está disponible temporalmente. Aun así puedo mantener claros el contexto verificado de HLC, las prioridades, los riesgos y el siguiente paso sin fingir que se realizó una acción.",
    dion: "Habla Dion. El razonamiento en vivo no está disponible temporalmente. Aun así puedo trabajar con el estado verificado del flujo de HLC y mantener claro el siguiente paso operativo sin inventar estados ni finalizaciones.",
    diamond: "Habla Diamond. El razonamiento en vivo no está disponible temporalmente. Aun así puedo explicar el estado verificado de HLC y el siguiente paso más seguro sin adivinar ni hacer promesas no respaldadas.",
  },
  "fr-FR": {
    kendrell: "Kendrell à l’appareil. Le raisonnement en direct est temporairement indisponible. Je peux toutefois garder clairs le contexte HLC vérifié, les priorités, les risques et la prochaine étape sans prétendre qu’une action a été effectuée.",
    dion: "Dion à l’appareil. Le raisonnement en direct est temporairement indisponible. Je peux toutefois travailler à partir de l’état vérifié du workflow HLC et préciser la prochaine étape sans inventer de statut ni d’achèvement.",
    diamond: "Diamond à l’appareil. Le raisonnement en direct est temporairement indisponible. Je peux toutefois expliquer le statut HLC vérifié et la prochaine étape la plus sûre sans deviner ni faire de promesses non confirmées.",
  },
  "pt-BR": {
    kendrell: "Aqui é Kendrell. O raciocínio ao vivo está temporariamente indisponível. Ainda posso manter claros o contexto verificado da HLC, as prioridades, os riscos e o próximo passo sem fingir que alguma ação foi executada.",
    dion: "Aqui é Dion. O raciocínio ao vivo está temporariamente indisponível. Ainda posso trabalhar com o estado verificado do fluxo da HLC e deixar claro o próximo passo operacional sem inventar status ou conclusão.",
    diamond: "Aqui é Diamond. O raciocínio ao vivo está temporariamente indisponível. Ainda posso explicar o status verificado da HLC e o próximo passo mais seguro sem adivinhar nem fazer promessas sem respaldo.",
  },
  "zh-CN": {
    kendrell: "我是 Kendrell。实时推理暂时不可用。我仍可依据已验证的 HLC 上下文，清楚说明优先事项、风险和下一步，而且不会假装任何操作已经执行。",
    dion: "我是 Dion。实时推理暂时不可用。我仍可依据已验证的 HLC 工作流状态说明下一项运营步骤，而且不会虚构状态或完成情况。",
    diamond: "我是 Diamond。实时推理暂时不可用。我仍可说明已验证的 HLC 状态和最安全的下一步，而且不会猜测或作出没有依据的承诺。",
  },
  "ar-SA": {
    kendrell: "أنا Kendrell. الاستدلال المباشر غير متاح مؤقتًا. لا يزال بإمكاني إبقاء سياق HLC الموثّق والأولويات والمخاطر والخطوة التالية واضحة من دون الادعاء بأن أي إجراء قد نُفّذ.",
    dion: "أنا Dion. الاستدلال المباشر غير متاح مؤقتًا. لا يزال بإمكاني العمل من حالة سير العمل الموثّقة في HLC وتوضيح الخطوة التشغيلية التالية من دون اختلاق حالة أو إنجاز.",
    diamond: "أنا Diamond. الاستدلال المباشر غير متاح مؤقتًا. لا يزال بإمكاني شرح حالة HLC الموثّقة والخطوة التالية الأكثر أمانًا من دون تخمين أو وعود غير مدعومة.",
  },
};

export function getLocalizedAgentFallback(agentId: AgentId, locale: ResolvedAgentLocale) {
  return localizedFallback[locale][agentId];
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
