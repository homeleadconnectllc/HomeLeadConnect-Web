import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import {
  CONNECT_FRAMEWORK,
  CONNECT_SCORING_RUBRIC,
  getConnectScenario,
  type ConnectVariant,
} from "../../../src/data/connectConversationSystem.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});

const MODEL = "gpt-5.6-terra";
const MAX_MESSAGES = 30;
const MAX_TEXT = 1800;
const PASSING_SCORE = 75;

type TranscriptMessage = { role: "learner" | "counterpart"; text: string };
type Action = "turn" | "finish";

type FinishPayload = {
  score?: number;
  rubricScores?: Record<string, number>;
  strengths?: string[];
  mistakes?: string[];
  coaching?: string[];
  recommendedDispositionId?: string | null;
  recommendationReason?: string | null;
  summary?: string;
};

function extractResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const output = (payload as { output?: unknown[] }).output;
  if (!Array.isArray(output)) return "";
  const pieces: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown[] }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const typed = part as { type?: string; text?: string };
      if (typed.type === "output_text" && typeof typed.text === "string") pieces.push(typed.text);
    }
  }
  return pieces.join("").trim();
}

function safeMessages(value: unknown): TranscriptMessage[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_MESSAGES).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const role = (item as { role?: unknown }).role;
    const text = (item as { text?: unknown }).text;
    if ((role !== "learner" && role !== "counterpart") || typeof text !== "string") return [];
    const clean = text.trim().slice(0, MAX_TEXT);
    return clean ? [{ role, text: clean }] : [];
  });
}

function safeVariant(value: unknown): ConnectVariant {
  return ["master", "quick", "standard", "warm", "professional", "high-touch"].includes(String(value))
    ? value as ConnectVariant
    : "standard";
}

function rubricMaximums() {
  return Object.fromEntries(CONNECT_SCORING_RUBRIC.map((item) => [item.id, item.weight]));
}

function normalizeFinish(raw: FinishPayload, allowedDispositionIds: string[]) {
  const maximums = rubricMaximums();
  const rubricScores: Record<string, number> = {};
  for (const item of CONNECT_SCORING_RUBRIC) {
    const candidate = Number(raw.rubricScores?.[item.id] ?? 0);
    rubricScores[item.id] = Math.max(0, Math.min(item.weight, Number.isFinite(candidate) ? Math.round(candidate) : 0));
  }
  const computed = Object.values(rubricScores).reduce((sum, value) => sum + value, 0);
  const modelScore = Number(raw.score);
  const score = Number.isFinite(modelScore) ? Math.max(0, Math.min(100, Math.round(modelScore))) : computed;
  const disposition = raw.recommendedDispositionId && allowedDispositionIds.includes(raw.recommendedDispositionId)
    ? raw.recommendedDispositionId
    : null;
  const list = (value: unknown) => Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 500)).filter(Boolean).slice(0, 6)
    : [];
  return {
    score,
    rubricScores,
    strengths: list(raw.strengths),
    mistakes: list(raw.mistakes),
    coaching: list(raw.coaching),
    recommendedDispositionId: disposition,
    recommendationReason: typeof raw.recommendationReason === "string" ? raw.recommendationReason.trim().slice(0, 1000) : null,
    summary: typeof raw.summary === "string" ? raw.summary.trim().slice(0, 1000) : "",
    passed: score >= PASSING_SCORE,
  };
}

async function askOpenAI(apiKey: string, instructions: string, input: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, instructions, input }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`OpenAI roleplay request failed (${response.status})`);
    return extractResponseText(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "HLC runtime configuration is incomplete." }, 503);
  if (!openaiKey) return json({ error: "CONNECT roleplay AI is not configured for this environment." }, 503);
  if (!authorization) return json({ error: "Authentication is required." }, 401);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Authentication is required." }, 401);

  let body: { action?: Action; scenarioId?: string; variant?: ConnectVariant; transcript?: TranscriptMessage[] };
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }

  const action: Action = body.action === "finish" ? "finish" : "turn";
  const scenario = getConnectScenario(String(body.scenarioId ?? ""));
  if (!scenario) return json({ error: "Unknown CONNECT scenario." }, 400);
  const variant = safeVariant(body.variant);
  const selectedVariant = scenario.variants.find((item) => item.variant === variant) ?? scenario.variants[0];
  const transcript = safeMessages(body.transcript);
  if (!selectedVariant) return json({ error: "Scenario has no approved variant." }, 409);

  const framework = CONNECT_FRAMEWORK.map((step) => `${step.name}: ${step.purpose}`).join("\n");
  const transcriptText = transcript.length
    ? transcript.map((item) => `${item.role === "learner" ? "HLC learner" : "Counterpart"}: ${item.text}`).join("\n")
    : "No conversation yet.";

  if (action === "turn") {
    const learnerMessages = transcript.filter((item) => item.role === "learner");
    if (!learnerMessages.length) {
      return json({ reply: "I’m ready when you are. Start the conversation the way you would with a real person.", teacher: scenario.teacher });
    }
    const instructions = `You are the counterpart inside HomeLead Connect's CONNECT Conversation System roleplay. This is simulation only. React naturally to what the learner actually says. Do not coach, grade, reveal the rubric, write CRM records, or pretend a real customer/provider action occurred. Stay in character. Keep each turn concise and realistic. Introduce reasonable hesitation or questions when useful, but do not manufacture emergencies, fear, or facts outside the scenario.\n\nScenario: ${scenario.title}\nAudience: ${scenario.audience}\nGoal the learner is practicing: ${scenario.goal}\nVariant being studied: ${selectedVariant.label}\nApproved script guardrail: ${selectedVariant.body}\nCONNECT framework:\n${framework}`;
    try {
      const reply = await askOpenAI(openaiKey, instructions, transcriptText);
      if (!reply) return json({ error: "CONNECT roleplay returned no response." }, 502);
      return json({ reply, teacher: scenario.teacher });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "CONNECT roleplay failed." }, 502);
    }
  }

  if (!transcript.some((item) => item.role === "learner")) return json({ error: "Complete at least one learner turn before scoring." }, 400);
  const rubric = CONNECT_SCORING_RUBRIC.map((item) => `${item.id}: ${item.label}, maximum ${item.weight}`).join("\n");
  const allowedDispositionIds = scenario.recommendedDispositionIds;
  const instructions = `You are ${scenario.teacher}, the HLC coach evaluating a CONNECT roleplay. Score behavior and judgment, not word-for-word memorization. Base the result only on the transcript and approved scenario guardrails. The learner cannot earn more than each rubric maximum. Return ONLY valid JSON with keys: score, rubricScores, strengths, mistakes, coaching, recommendedDispositionId, recommendationReason, summary. rubricScores must use the exact rubric ids. strengths/mistakes/coaching must be arrays of concise strings. recommendedDispositionId must be null or one of the allowed IDs. A CRM disposition is a recommendation only; never claim it was applied.\n\nRubric:\n${rubric}\n\nAllowed dispositions: ${allowedDispositionIds.join(", ") || "none"}\n\nScenario: ${scenario.title}\nGoal: ${scenario.goal}\nRequired information: ${scenario.requiredInformation.join("; ")}\nSuggested questions: ${scenario.suggestedQuestions.join("; ")}\nApproved ${selectedVariant.label} guardrail: ${selectedVariant.body}\nCONNECT framework:\n${framework}`;

  let parsed: FinishPayload;
  try {
    const text = await askOpenAI(openaiKey, instructions, transcriptText);
    const jsonText = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    parsed = JSON.parse(jsonText) as FinishPayload;
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "CONNECT scoring failed." }, 502);
  }
  const result = normalizeFinish(parsed, allowedDispositionIds);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: sessionId, error: persistError } = await admin.rpc("academy_record_roleplay_session", {
    p_user_id: userData.user.id,
    p_scenario_id: scenario.id,
    p_variant: variant,
    p_teacher: scenario.teacher,
    p_transcript: transcript,
    p_score: result.score,
    p_rubric_scores: result.rubricScores,
    p_strengths: result.strengths,
    p_mistakes: result.mistakes,
    p_coaching: result.coaching,
    p_recommended_disposition_id: result.recommendedDispositionId,
    p_recommendation_reason: result.recommendationReason,
    p_passed: result.passed,
  });
  if (persistError) return json({ error: "CONNECT score could not be saved." }, 500);

  const { data: progress, error: progressError } = await userClient.rpc("academy_record_activity", {
    p_module_id: scenario.id,
    p_activity_type: "simulation",
    p_completed: true,
    p_score: result.score,
    p_threshold: PASSING_SCORE,
    p_assessment_id: null,
    p_teacher: null,
  });
  if (progressError) return json({ error: "CONNECT score saved, but Academy progression could not be recorded.", sessionId }, 500);

  return json({ ...result, teacher: scenario.teacher, sessionId, progress, dispositionApplied: false, requiresCrmConfirmation: Boolean(result.recommendedDispositionId) });
});
