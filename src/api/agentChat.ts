import { supabase } from "./client";
import type { AgentId } from "../ai/agents";

export type AgentChatMessage = { role: "user" | "model"; text: string };
export type AgentChatResponse = {
  agentId: AgentId;
  model: string;
  reply: string;
  advisoryOnly: boolean;
  fallback?: boolean;
  contextKind?: "internal" | "resident_portal" | "professional_portal";
};

export async function chatWithAgent(agentId: AgentId, message: string, history: AgentChatMessage[] = []) {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "/";
  const { data, error } = await supabase.functions.invoke("hlc-agent-chat", {
    body: { agentId, message, history: history.slice(-8), pagePath },
  });
  if (error) {
    const context = (error as { context?: { json?: () => Promise<unknown> } }).context;
    if (context?.json) {
      try {
        const body = await context.json() as { error?: string };
        if (body?.error) throw new Error(body.error);
      } catch (reason) {
        if (reason instanceof Error) throw reason;
      }
    }
    throw error;
  }
  if (!data?.reply) throw new Error("AI provider returned no response.");
  return data as AgentChatResponse;
}
