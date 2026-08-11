import { getCurrentWorkspaceId, supabase } from "./client";
import type { AgentId } from "../ai/agents";

export type AgentRunResult = { run_id: string; status: "succeeded" | "failed" | "blocked"; result: unknown; error_code?: string; error?: string };
export type AgentRun = { id: string; agent_id: AgentId; capability_id: string; mode: string; status: string; result_summary: unknown; error_summary: string | null; created_at: string };
export type AgentHandoff = { id: string; source_agent: AgentId; destination_agent: AgentId; related_entity_type: string | null; related_entity_id: string | null; reason: string; status: string; created_at: string };

export async function runAgentCapability(agent: AgentId, capability: string, input: Record<string, unknown> = {}, requestId = crypto.randomUUID()) {
  const { data, error } = await supabase.rpc("run_hlc_agent_capability", {
    p_agent_id: agent, p_capability_id: capability, p_input: input, p_idempotency_key: requestId, p_route_context: window.location.pathname,
  });
  if (error) throw error;
  return data as AgentRunResult;
}

export async function listAgentRuns(agent: AgentId) {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase.from("ai_agent_runs")
    .select("id,agent_id,capability_id,mode,status,result_summary,error_summary,created_at")
    .eq("workspace_id", workspaceId).eq("agent_id", agent).order("created_at", { ascending: false }).limit(25);
  if (error) throw error;
  return (data ?? []) as AgentRun[];
}

export async function listAgentHandoffs(agent: AgentId) {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase.from("ai_agent_handoffs")
    .select("id,source_agent,destination_agent,related_entity_type,related_entity_id,reason,status,created_at")
    .eq("workspace_id", workspaceId).or(`source_agent.eq.${agent},destination_agent.eq.${agent}`).order("created_at", { ascending: false }).limit(25);
  if (error) throw error;
  return (data ?? []) as AgentHandoff[];
}

export async function createAgentHandoff(input: { source: "dion" | "diamond"; destination: "dion" | "kendrell"; reason: string; leadId?: string }, requestId = crypto.randomUUID()) {
  const { data, error } = await supabase.rpc("create_hlc_agent_handoff", {
    p_source_agent: input.source, p_destination_agent: input.destination, p_reason: input.reason,
    p_related_entity_type: input.leadId ? "lead" : null, p_related_entity_id: input.leadId || null, p_idempotency_key: requestId,
  });
  if (error) throw error;
  return data as string;
}
