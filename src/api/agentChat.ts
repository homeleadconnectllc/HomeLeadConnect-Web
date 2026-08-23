import { supabase } from "./client";
import type { AgentId } from "../ai/agents";
import {
  buildAgentLocaleDirective,
  getLocalizedAgentFallback,
  type ResolvedAgentLocale,
} from "../lib/agentLocale";

export type AgentChatMessage = { role: "user" | "model"; text: string };
export type AgentChatResponse = {
  agentId: AgentId;
  model: string;
  reply: string;
  advisoryOnly: boolean;
  fallback?: boolean;
  contextKind?: "internal" | "resident_portal" | "professional_portal";
  locale?: ResolvedAgentLocale;
};

export async function chatWithAgent(agentId: AgentId, message: string, history: AgentChatMessage[] = [], locale: ResolvedAgentLocale = "en-US") {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "/";
  const localeDirective: AgentChatMessage = { role: "user", text: buildAgentLocaleDirective(locale) };
  const localeAwareHistory = [localeDirective, ...history.slice(-7)];
  const { data, error } = await supabase.functions.invoke("hlc-agent-chat", {
    body: { agentId, message, history: localeAwareHistory, pagePath, locale },
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
  const response = data as AgentChatResponse;
  return {
    ...response,
    locale,
    reply: response.fallback ? getLocalizedAgentFallback(agentId, locale) : response.reply,
  };
}
