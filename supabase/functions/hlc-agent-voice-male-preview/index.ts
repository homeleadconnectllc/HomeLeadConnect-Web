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
const MODEL = "gpt-4o-mini-tts-2025-12-15";

type MaleAgentId = "kendrell" | "dion";
type AgentLocale = "en-US" | "es-US" | "fr-FR" | "pt-BR" | "zh-CN" | "ar-SA";

type VoiceProfile = {
  providerVoice: string;
  publicVoice: string;
  direction: string;
};

const supportedLocales = new Set<AgentLocale>(["en-US", "es-US", "fr-FR", "pt-BR", "zh-CN", "ar-SA"]);

const localeDirections: Record<AgentLocale, string> = {
  "en-US": "Use natural American English pronunciation and rhythm.",
  "es-US": "Use natural clear Spanish appropriate for a US audience.",
  "fr-FR": "Use natural clear French pronunciation and rhythm.",
  "pt-BR": "Use natural Brazilian Portuguese pronunciation and rhythm.",
  "zh-CN": "Use natural Standard Mandarin pronunciation and rhythm.",
  "ar-SA": "Use natural clear Arabic appropriate for a Saudi/Gulf audience.",
};

const SHARED_QUALITY = "Match the HLC voice-family quality standard established by Diamond: smooth, clean, stable, natural, conversational, and easy to understand on an iPhone speaker. Speak at ordinary phone-conversation volume with a fully voiced tone from the first word through the last. Never whisper, murmur, speak under the breath, trail off into softness, or use breathy, raspy, scratchy, gravelly, theatrical, novelty, or exaggerated delivery. Prioritize a believable regular human speaking voice over an impressive or dramatic voice.";
const IDENTITY_LOCK = "Keep one recognizable vocal identity across every reply. Do not change apparent speaker, age, accent, baseline pitch range, vocal weight, resonance, or speaking style because of the wording. Use only small natural inflection changes.";
const ACCEPTED_CEDAR_DIRECTION = "Use a plain, smooth, natural adult male speaking voice in a comfortable mildly low register. Speak clearly and fully at normal conversational volume, with calm steady confidence and a moderate measured pace. Every sentence must remain fully voiced and audible; do not soften into a whisper at sentence starts, pauses, or endings. The priority is believable everyday speech that sounds clean and relaxed on a phone speaker. Sound like a composed chief-of-staff speaking directly to one person without performing the role. Do not add cinematic depth, booming resonance, forced bass, gravel, vocal fry, breathiness, whisper, rasp, exaggerated authority, dramatic pauses, or announcer delivery. Keep phrasing simple, connected, and effortless. Kendrell is pronounced Ken-Drayl, Dion is pronounced Dee-Yon, and HLC is spoken H L C.";
const KENDRELL_CLARITY_DIRECTION = "Use a clean, natural adult male speaking voice in a comfortable medium register with an open, clear tone. Keep the voice forward and easy to understand on a phone speaker, with crisp consonants, natural connected phrasing, and ordinary conversational pace. Sound calm and confident without sounding slow, heavy, muffled, monotone, over-enunciated, or synthesized. Use normal human inflection and smooth sentence-to-sentence flow. Do not force a low pitch, chest-heavy resonance, dramatic authority, announcer delivery, or robotic precision. Keep every word fully voiced and distinct through sentence endings. Kendrell is pronounced Ken-Drayl and HLC is spoken H L C.";

const voiceProfiles: Record<MaleAgentId, VoiceProfile> = {
  kendrell: {
    providerVoice: "cedar",
    publicVoice: "Kendrell Standard",
    direction: KENDRELL_CLARITY_DIRECTION,
  },
  dion: {
    providerVoice: "cedar",
    publicVoice: "Dion Standard",
    direction: ACCEPTED_CEDAR_DIRECTION,
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

async function requestSpeech(openaiKey: string, payload: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("voice_provider_timeout"), VOICE_PROVIDER_TIMEOUT_MS);
  try {
    return await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
  } finally {
    clearTimeout(timeout);
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
  if (!openaiKey) return json({ error: "Male voice preview provider is not configured.", fallbackToText: true }, 503);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Authentication is required." }, 401);

  let body: { agentId?: MaleAgentId; text?: string; locale?: AgentLocale };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const agentId = body.agentId;
  const text = body.text?.trim() ?? "";
  const locale = body.locale && supportedLocales.has(body.locale) ? body.locale : "en-US";
  if (!agentId || !(agentId in voiceProfiles)) return json({ error: "This preview is only for Kendrell and Dion." }, 400);
  if (text.length < 1 || text.length > 4000) return json({ error: "Speech text must be between 1 and 4,000 characters." }, 400);

  const userId = userData.user.id;
  const { data: profile } = await userClient.from("profiles").select("workspace_id,role").eq("user_id", userId).maybeSingle();
  if (!profile?.workspace_id) return json({ error: "Authorized HLC workspace context is unavailable." }, 403);

  const { data: member } = await userClient.from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", profile.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!member) return json({ error: "Authorized HLC workspace context is unavailable." }, 403);

  const role = String(profile.role || "").toLowerCase();
  if (agentId === "kendrell" && !["owner", "manager", "supervisor"].includes(role)) {
    return json({ error: "Kendrell voice access requires an approved owner, manager, or supervisor role." }, 403);
  }

  const profileConfig = voiceProfiles[agentId];
  const instructions = `${IDENTITY_LOCK} ${SHARED_QUALITY} ${profileConfig.direction} ${localeDirections[locale]} Preserve names, numbers, prices, dates, times, consent language, scheduling details, and confirmations exactly in meaning.`;
  const speechRequest = {
    model: MODEL,
    voice: profileConfig.providerVoice,
    input: applyCanonicalPronunciations(text, locale),
    response_format: "pcm",
    instructions,
  };

  let providerResponse: Response;
  try {
    providerResponse = await requestSpeech(openaiKey, speechRequest);
  } catch (reason) {
    const timedOut = reason instanceof DOMException && reason.name === "AbortError";
    return json({
      error: "Voice generation is temporarily unavailable. Continue with the text reply.",
      code: timedOut ? "VOICE_PROVIDER_TIMEOUT" : "VOICE_PROVIDER_NETWORK_ERROR",
      retryable: true,
      fallbackToText: true,
    }, timedOut ? 504 : 502);
  }

  if (!providerResponse.ok) {
    const providerText = (await providerResponse.text()).slice(0, 500);
    console.error("Male voice preview provider error", providerResponse.status, providerText);
    return json({
      error: "Voice generation is temporarily unavailable. Continue with the text reply.",
      code: `VOICE_PROVIDER_${providerResponse.status}`,
      retryable: providerResponse.status === 429 || providerResponse.status >= 500,
      fallbackToText: true,
    }, 502);
  }

  if (!providerResponse.body) return json({ error: "Voice provider returned no audio.", fallbackToText: true }, 502);

  return new Response(providerResponse.body, {
    status: 200,
    headers: {
      ...cors,
      "Content-Type": "audio/pcm",
      "Cache-Control": "no-store, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-HLC-Agent": agentId,
      "X-HLC-Provider": MODEL,
      "X-HLC-Voice": profileConfig.publicVoice,
      "X-HLC-Locale": locale,
      "X-HLC-Sample-Rate": String(PCM_SAMPLE_RATE),
    },
  });
});
