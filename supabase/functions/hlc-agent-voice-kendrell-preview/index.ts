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

const PROVIDER_TIMEOUT_MS = 8_000;
const PCM_SAMPLE_RATE = 24_000;
const MODEL = "gpt-4o-mini-tts";
const PROVIDER_VOICE = "cedar";
const DISPLAY_VOICE = "Kendrell Regular";

type AgentLocale = "en-US" | "es-US" | "fr-FR" | "pt-BR" | "zh-CN" | "ar-SA";
const supportedLocales = new Set<AgentLocale>(["en-US", "es-US", "fr-FR", "pt-BR", "zh-CN", "ar-SA"]);

const localeDirections: Record<AgentLocale, string> = {
  "en-US": "Use natural American English pronunciation and rhythm.",
  "es-US": "Use natural clear Spanish appropriate for a US audience.",
  "fr-FR": "Use natural clear French pronunciation and rhythm.",
  "pt-BR": "Use natural Brazilian Portuguese pronunciation and rhythm.",
  "zh-CN": "Use natural Standard Mandarin Chinese pronunciation and rhythm.",
  "ar-SA": "Use natural clear Arabic appropriate for a Saudi or Gulf audience.",
};

const KENDRELL_REGULAR_DIRECTION = [
  "Speak in one stable natural adult male voice.",
  "Use a calm, clear, normal conversational delivery with a medium-low register and moderate pace.",
  "Sound professional and composed, like a practical chief-of-staff speaking directly to one person.",
  "Do not force an unusually deep pitch or dramatic resonance.",
  "Do not whisper and do not sound raspy, scratchy, breathy, theatrical, robotic, cartoonish, or like an announcer.",
  "Keep the same recognizable vocal identity from reply to reply.",
  "Kendrell is pronounced Ken-Drayl. HLC is spoken H L C.",
].join(" ");

function applyCanonicalPronunciations(text: string, locale: AgentLocale) {
  if (locale !== "en-US") return text;
  return text
    .replace(/\bKendrell\b/gi, "Ken-Drayl")
    .replace(/\bHLC\b/g, "H L C");
}

async function requestSpeech(openaiKey: string, payload: Record<string, unknown>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("voice_provider_timeout"), PROVIDER_TIMEOUT_MS);
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
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { status: 200, headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey) return json({ error: "Kendrell voice runtime configuration is incomplete." }, 503);
  if (!authorization) return json({ error: "Authentication is required." }, 401);
  if (!openaiKey) return json({ error: "Kendrell voice provider is not configured.", fallbackToText: true }, 503);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Authentication is required." }, 401);

  let body: { agentId?: string; text?: string; locale?: AgentLocale };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (body.agentId !== "kendrell") return json({ error: "This preview endpoint is Kendrell-only." }, 400);
  const text = body.text?.trim() ?? "";
  if (text.length < 1 || text.length > 4000) return json({ error: "Speech text must be between 1 and 4,000 characters." }, 400);
  const locale = body.locale && supportedLocales.has(body.locale) ? body.locale : "en-US";

  const userId = userData.user.id;
  const { data: profile } = await userClient.from("profiles").select("workspace_id,role").eq("user_id", userId).maybeSingle();
  if (!profile?.workspace_id) return json({ error: "Authorized HLC account context is unavailable." }, 403);

  const { data: member } = await userClient.from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", profile.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();
  const role = String(profile.role || "").toLowerCase();
  if (!member || !["owner", "manager"].includes(role)) {
    return json({ error: "Kendrell voice access requires an approved owner or manager role." }, 403);
  }

  let providerResponse: Response;
  try {
    providerResponse = await requestSpeech(openaiKey, {
      model: MODEL,
      voice: PROVIDER_VOICE,
      input: applyCanonicalPronunciations(text, locale),
      response_format: "pcm",
      instructions: `${KENDRELL_REGULAR_DIRECTION} ${localeDirections[locale]} Preserve names, numbers, prices, dates, times, scheduling details, and confirmations exactly in meaning.`,
    });
  } catch (reason) {
    const timedOut = reason instanceof DOMException && reason.name === "AbortError";
    return json({
      error: "Kendrell voice is temporarily unavailable. Continue with the text reply.",
      code: timedOut ? "VOICE_PROVIDER_TIMEOUT" : "VOICE_PROVIDER_NETWORK_ERROR",
      retryable: true,
      fallbackToText: true,
    }, timedOut ? 504 : 502);
  }

  if (!providerResponse.ok) {
    const providerText = (await providerResponse.text()).slice(0, 500);
    console.error("Kendrell preview TTS provider error", providerResponse.status, providerText);
    return json({
      error: "Kendrell voice is temporarily unavailable. Continue with the text reply.",
      code: `VOICE_PROVIDER_${providerResponse.status}`,
      retryable: providerResponse.status === 429 || providerResponse.status >= 500,
      fallbackToText: true,
    }, 502);
  }

  if (!providerResponse.body) return json({ error: "Kendrell voice returned no audio.", fallbackToText: true }, 502);

  return new Response(providerResponse.body, {
    status: 200,
    headers: {
      ...cors,
      "Content-Type": "audio/pcm",
      "Cache-Control": "no-store, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-HLC-Agent": "kendrell",
      "X-HLC-Provider": MODEL,
      "X-HLC-Voice": DISPLAY_VOICE,
      "X-HLC-Locale": locale,
      "X-HLC-Sample-Rate": String(PCM_SAMPLE_RATE),
    },
  });
});
