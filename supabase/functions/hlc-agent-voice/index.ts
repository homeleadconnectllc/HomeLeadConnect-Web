import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Expose-Headers": "content-type, x-hlc-agent, x-hlc-provider, x-hlc-voice, x-hlc-sample-rate, x-hlc-locale",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

const VOICE_PROVIDER_TIMEOUT_MS = 8_000;
const PCM_SAMPLE_RATE = 24_000;
const FALLBACK_VOICE_MODEL = "tts-1";

type AgentId = "kendrell" | "dion" | "diamond";
type ContextKind = "internal" | "resident_portal" | "professional_portal";
type AgentLocale = "en-US" | "es-US" | "fr-FR" | "pt-BR" | "zh-CN" | "ar-SA";
type VoiceModel = "gpt-4o-mini-tts" | "tts-1-hd";

type VoiceProfile = {
  voice: string;
  providerVoice: string;
  model: VoiceModel;
  supportsInstructions: boolean;
  direction: string;
};

type ProviderAttempt = {
  response: Response | null;
  timedOut: boolean;
  networkError: boolean;
};

const supportedLocales = new Set<AgentLocale>(["en-US", "es-US", "fr-FR", "pt-BR", "zh-CN", "ar-SA"]);

const localeDirections: Record<AgentLocale, string> = {
  "en-US": "Speak in natural American English pronunciation and rhythm.",
  "es-US": "Speak in natural, clear Spanish appropriate for a US audience. Use Spanish pronunciation and rhythm for the full response, not English pronunciation rules.",
  "fr-FR": "Speak in natural, clear French. Use French pronunciation and rhythm for the full response, not English pronunciation rules.",
  "pt-BR": "Speak in natural Brazilian Portuguese. Use Brazilian Portuguese pronunciation and rhythm for the full response, not English pronunciation rules.",
  "zh-CN": "Speak in natural Standard Mandarin Chinese. Use Mandarin pronunciation and rhythm for the full response, not English pronunciation rules.",
  "ar-SA": "Speak in natural, clear Arabic appropriate for a Saudi/Gulf audience. Use Arabic pronunciation and rhythm for the full response, not English pronunciation rules.",
};

const VOICE_IDENTITY_LOCK = "Maintain one stable vocal identity across every reply. Do not change the apparent speaker, age, pitch range, vocal weight, resonance, accent, baseline speaking rate, warmth, intensity, or overall timbre because of the wording or emotion of the text. Keep the same recognizable voice from sentence to sentence and request to request. Express emphasis with small natural inflection only; never shift into a noticeably harder, softer, deeper, brighter, sharper, breathier, more dramatic, or more forceful version of the voice.";

const voiceProfiles: Record<AgentId, VoiceProfile> = {
  kendrell: {
    voice: "Schedar",
    providerVoice: "cedar",
    model: "gpt-4o-mini-tts",
    supportsInstructions: true,
    direction: "Use the locked Kendrell benchmark: a clearly adult male voice with a deep to medium-low register, calm executive authority, slower measured cadence, clean full resonance, and steady conversational confidence. Sound like a trusted chief-of-staff speaking one-to-one, not a performer. Keep the vocal identity consistent across every reply. Favor grounded chest resonance and smooth connected phrasing without forcing the pitch downward. Never whisper. Never sound breathy, raspy, scratchy, gravelly, spooky, theatrical, robotic, exaggerated, cartoonish, or like a radio announcer. Avoid sudden changes in pitch, energy, age, accent, or vocal weight. The name Kendrell is pronounced Ken-Drayl and HLC is spoken H L C.",
  },
  dion: {
    voice: "Sadaltager",
    providerVoice: "ash",
    model: "gpt-4o-mini-tts",
    supportsInstructions: true,
    direction: "Speak as a natural adult male business-intelligence operator: grounded, analytical, confident, precise and practical. Keep a consistent medium pitch, crisp but natural cadence, moderate vocal weight, and even professional intensity from reply to reply. Slightly quicker and crisper than Kendrell, but still conversational. The name Dion is pronounced Dee-Yon. Never whisper. Never sound breathy, raspy, scratchy, nasal, robotic, theatrical, or like a radio announcer.",
  },
  diamond: {
    voice: "Sulafat",
    providerVoice: "coral",
    model: "tts-1-hd",
    supportsInstructions: false,
    direction: "Speak as a natural adult female customer-experience guide: polished, calm, warm, composed and conversational. Keep the same recognizable medium-soft voice on every reply: stable pitch range, smooth cadence, gentle warmth, moderate vocal weight, and even intensity. The name Diamond is pronounced Die-Men. Do not harden, tighten, sharpen, deepen, brighten, or dramatically soften the voice when the wording changes. Be warm without becoming overly soft. Never sound childlike, breathy, whispery, sing-song, robotic, theatrical, sharp, stern, or forceful.",
  },
};

function applyCanonicalPronunciations(text: string, locale: AgentLocale) {
  if (locale !== "en-US") return text;
  return text
    .replace(/\bDiamond\b/gi, "Die-Men")
    .replace(/\bDion\b/gi, "Dee-Yon")
    .replace(/\bKendrell\b/gi, "Ken-Drayl")
    .replace(/\bHLC\b/g, "H L C");
}

async function requestSpeech(openaiKey: string, speechRequest: Record<string, unknown>): Promise<ProviderAttempt> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => {
      controller.abort("voice_provider_timeout");
      resolve(null);
    }, VOICE_PROVIDER_TIMEOUT_MS);
  });

  try {
    const request = fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(speechRequest),
    }).catch((reason) => {
      if (!controller.signal.aborted) console.error("OpenAI TTS network error", reason instanceof Error ? reason.message.slice(0, 300) : "unknown");
      return null;
    });

    const response = await Promise.race([request, timeout]);
    if (!response) return { response: null, timedOut: controller.signal.aborted, networkError: !controller.signal.aborted };
    return { response, timedOut: false, networkError: false };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { status: 200, headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey) return json({ error: "HLC voice runtime configuration is incomplete." }, 503);
  if (!authorization) return json({ error: "Authentication is required." }, 401);
  if (!openaiKey) return json({ error: "Neural voice provider is not configured.", code: "VOICE_PROVIDER_NOT_CONFIGURED", fallbackToText: true }, 503);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Authentication is required." }, 401);

  let body: { agentId?: AgentId; text?: string; locale?: AgentLocale };
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const agentId = body.agentId;
  const text = body.text?.trim() ?? "";
  const locale = body.locale && supportedLocales.has(body.locale) ? body.locale : "en-US";
  if (!agentId || !(agentId in voiceProfiles)) return json({ error: "Unknown HLC agent." }, 400);
  if (text.length < 1 || text.length > 4000) return json({ error: "Speech text must be between 1 and 4,000 characters." }, 400);

  const userId = userData.user.id;
  const [{ data: profile }, { data: residentLink }, { data: professionalLink }] = await Promise.all([
    userClient.from("profiles").select("workspace_id,role").eq("user_id", userId).maybeSingle(),
    userClient.from("homeowner_portal_links").select("workspace_id").eq("user_id", userId).is("revoked_at", null).limit(1).maybeSingle(),
    userClient.from("contractor_portal_links").select("workspace_id").eq("user_id", userId).is("revoked_at", null).limit(1).maybeSingle(),
  ]);

  let contextKind: ContextKind | null = null;
  let role = "";
  if (profile?.workspace_id) {
    const { data: member } = await userClient.from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", profile.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (member) {
      contextKind = "internal";
      role = String(profile.role || "").toLowerCase();
    }
  }
  if (!contextKind && residentLink?.workspace_id) contextKind = "resident_portal";
  if (!contextKind && professionalLink?.workspace_id) contextKind = "professional_portal";
  if (!contextKind) return json({ error: "Authorized HLC account context is unavailable." }, 403);

  if (agentId === "kendrell" && !(contextKind === "internal" && ["owner", "manager"].includes(role))) {
    return json({ error: "Kendrell voice access requires an approved owner, manager, or supervisor role." }, 403);
  }
  if (contextKind === "resident_portal" && agentId !== "diamond") return json({ error: "Diamond is the resident portal assistant." }, 403);
  if (contextKind === "professional_portal" && agentId !== "dion") return json({ error: "Dion is the professional portal assistant." }, 403);

  const profileConfig = voiceProfiles[agentId];
  const primaryRequest: Record<string, unknown> = {
    model: profileConfig.model,
    voice: profileConfig.providerVoice,
    input: applyCanonicalPronunciations(text, locale),
    response_format: "pcm",
  };
  if (profileConfig.supportsInstructions) {
    primaryRequest.instructions = `${VOICE_IDENTITY_LOCK} ${profileConfig.direction} ${localeDirections[locale]} Preserve names, numbers, prices, dates, times, consent language, scheduling details, and confirmations exactly in meaning.`;
  }

  let usedModel = profileConfig.model as string;
  let attempt = await requestSpeech(openaiKey, primaryRequest);
  let providerResponse = attempt.response;

  if (!providerResponse?.ok) {
    if (providerResponse) {
      const providerText = (await providerResponse.text()).slice(0, 500);
      console.error("OpenAI TTS primary provider error", providerResponse.status, providerText);
    } else if (attempt.timedOut) {
      console.error("OpenAI TTS primary provider timeout", VOICE_PROVIDER_TIMEOUT_MS);
    }

    usedModel = FALLBACK_VOICE_MODEL;
    const fallbackRequest: Record<string, unknown> = {
      model: FALLBACK_VOICE_MODEL,
      voice: profileConfig.providerVoice,
      input: applyCanonicalPronunciations(text, locale),
      response_format: "pcm",
    };
    attempt = await requestSpeech(openaiKey, fallbackRequest);
    providerResponse = attempt.response;
  }

  if (!providerResponse) {
    const code = attempt.timedOut ? "VOICE_PROVIDER_TIMEOUT" : "VOICE_PROVIDER_NETWORK_ERROR";
    return json({ error: "Voice generation is temporarily unavailable. Continue with the text reply.", code, retryable: true, fallbackToText: true }, attempt.timedOut ? 504 : 502);
  }

  if (!providerResponse.ok) {
    const providerText = (await providerResponse.text()).slice(0, 500);
    console.error("OpenAI TTS fallback provider error", providerResponse.status, providerText);
    return json({ error: "Voice generation is temporarily unavailable. Continue with the text reply.", code: `VOICE_PROVIDER_${providerResponse.status}`, retryable: providerResponse.status === 429 || providerResponse.status >= 500, fallbackToText: true }, 502);
  }

  if (!providerResponse.body) {
    return json({ error: "Voice provider returned no audio. Continue with the text reply.", code: "VOICE_PROVIDER_EMPTY_AUDIO", retryable: true, fallbackToText: true }, 502);
  }

  return new Response(providerResponse.body, {
    status: 200,
    headers: {
      ...cors,
      "Content-Type": "audio/pcm",
      "Cache-Control": "no-store, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-HLC-Agent": agentId,
      "X-HLC-Provider": usedModel,
      "X-HLC-Voice": profileConfig.voice,
      "X-HLC-Locale": locale,
      "X-HLC-Sample-Rate": String(PCM_SAMPLE_RATE),
    },
  });
});
