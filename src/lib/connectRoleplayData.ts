import { supabase } from "./supabase";
import type { ConnectTeacher, ConnectVariant } from "../data/connectConversationSystem";

export type ConnectRoleplayMessage = { role: "learner" | "counterpart"; text: string };

export type ConnectRoleplayScore = {
  score: number;
  rubricScores: Record<string, number>;
  strengths: string[];
  mistakes: string[];
  coaching: string[];
  recommendedDispositionId: string | null;
  recommendationReason: string | null;
  summary: string;
  passed: boolean;
  teacher: ConnectTeacher;
  sessionId: string;
  dispositionApplied: false;
  requiresCrmConfirmation: boolean;
  progress?: {
    module_id?: string;
    activity_type?: string;
    attempt_number?: number;
    xp_awarded?: number;
  };
};

export type ConnectRoleplaySession = {
  id: string;
  scenario_id: string;
  variant: ConnectVariant;
  teacher: ConnectTeacher;
  transcript: ConnectRoleplayMessage[];
  score: number;
  rubric_scores: Record<string, number>;
  strengths: string[];
  mistakes: string[];
  coaching: string[];
  recommended_disposition_id: string | null;
  recommendation_reason: string | null;
  passed: boolean;
  created_at: string;
};

async function invokeRoleplay(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("hlc-connect-roleplay", { body });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as Record<string, unknown>;
}

export async function sendConnectRoleplayTurn(input: {
  scenarioId: string;
  variant: ConnectVariant;
  transcript: ConnectRoleplayMessage[];
}) {
  const data = await invokeRoleplay({ action: "turn", ...input });
  const reply = typeof data.reply === "string" ? data.reply.trim() : "";
  if (!reply) throw new Error("CONNECT roleplay returned no reply.");
  return { reply, teacher: data.teacher as ConnectTeacher };
}

export async function finishConnectRoleplay(input: {
  scenarioId: string;
  variant: ConnectVariant;
  transcript: ConnectRoleplayMessage[];
}) {
  return await invokeRoleplay({ action: "finish", ...input }) as unknown as ConnectRoleplayScore;
}

export async function loadConnectRoleplaySessions(scenarioId?: string) {
  let query = supabase
    .from("academy_roleplay_sessions")
    .select("id,scenario_id,variant,teacher,transcript,score,rubric_scores,strengths,mistakes,coaching,recommended_disposition_id,recommendation_reason,passed,created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  if (scenarioId) query = query.eq("scenario_id", scenarioId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ConnectRoleplaySession[];
}
