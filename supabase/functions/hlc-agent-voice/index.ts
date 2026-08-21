import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Expose-Headers": "content-type, x-hlc-agent, x-hlc-provider, x-hlc-voice, x-hlc-sample-rate",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

const VOICE_PROVIDER_TIMEOUT_MS = 12_000;
const OPENAI_TTS_MODEL = "gpt-4o-mini-tts";
const PCM_SAMPLE_RATE = 24_000;

type AgentId = "kendrell" | "dion" | "diamond";
type ContextKind = "internal" | "resident_portal" | "professional_portal";

const voiceProfiles: Record<AgentId, { voice: string; providerVoice: string; direction: string }> = {
  kendrell: {
    voice: "Schedar",
    providerVoice: "cedar",
    direction: "Speak as a natural adult male executive operator: steady, confident, calm, lower-key, conversational, clean and full-voiced. Relaxed but not sleepy. Never whisper. Never sound breathy, raspy, scratchy, gravelly, spooky, theatrical, robotic, or like an announcer. Use normal conversational volume and smooth connected phrasing.",
  },
  dion: {
    voice: "Sadaltager",
    providerVoice: "ash",
    direction: "Speak as a natural adult male business-intelligence operator: grounded, analytical, confident, precise and practical. Slightly quicker and crisper than Kendrell, but still conversational. Pronounce the name Dion as Dee-Yon. Never whisper. Never sound breathy, raspy, scratchy, nasal, robotic, theatrical, or like a radio announcer.",
  },
  diamond: {
    voice: "Sulafat",
    providerVoice: "coral",
    direction: "Speak as a natural adult female customer-experience guide: polished, calm, warm, composed and conversational. Smooth and measured, never childlike, breathy, whispery, sing-song, robotic, theatrical, or overly soft.",
  },
};

function applyCanonicalPronunciations(text: string) {
  return text.replace(/\bDion\b/gi, "Dee-Yon");
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

  let body: { agentId?: AgentId; text?: string };
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const agentId = body.agentId;
  const text = body.text?.trim() ?? "";
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
  const providerAbort = new AbortController();
  const timeoutId = setTimeout(() => providerAbort.abort("voice_provider_timeout"), VOICE_PROVIDER_TIMEOUT_MS);

  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      signal: providerAbort.signal,
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        voice: profileConfig.providerVoice,
        input: applyCanonicalPronunciations(text),
        instructions: profileConfig.direction,
        response_format: "pcm",
        stream_format: "audio",
      }),
    });
  } catch (reason) {
    clearTimeout(timeoutId);
    if (providerAbort.signal.aborted) {
      console.error("OpenAI TTS provider timeout", VOICE_PROVIDER_TIMEOUT_MS);
      return json({ error: "Voice generation took too long. Continue with the text reply.", code: "VOICE_PROVIDER_TIMEOUT", retryable: true, fallbackToText: true }, 504);
    }
    console.error("OpenAI TTS network error", reason instanceof Error ? reason.message.slice(0, 300) : "unknown");
    return json({ error: "Voice generation is temporarily unavailable. Continue with the text reply.", code: "VOICE_PROVIDER_NETWORK_ERROR", retryable: true, fallbackToText: true }, 502);
  }
  clearTimeout(timeoutId);

  if (!providerResponse.ok) {
    const providerText = (await providerResponse.text()).slice(0, 500);
    console.error("OpenAI TTS provider error", providerResponse.status, providerText);
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
      "X-HLC-Provider": OPENAI_TTS_MODEL,
      "X-HLC-Voice": profileConfig.voice,
      "X-HLC-Sample-Rate": String(PCM_SAMPLE_RATE),
    },
  });
});
