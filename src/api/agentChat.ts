import { supabase } from "./client";
import type { AgentId } from "../ai/agents";
import {
  buildAgentLocaleDirective,
  getLocalizedAgentFallback,
  type ResolvedAgentLocale,
} from "../lib/agentLocale";
import { buildAgentLocaleQualityDirective } from "../lib/agentLocaleQuality";

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

function browserTimeZone() {
  if (typeof Intl === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function buildAgentTemporalDirective(timeZone: string): AgentChatMessage {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  return {
    role: "user",
    text: `HLC RUNTIME TEMPORAL CONTEXT — device-reported conversational context for this interaction: ${formatter.format(now)}; IANA time zone=${timeZone}; UTC instant=${now.toISOString()}. Use this context for greetings and relative-time language such as morning/afternoon/evening, today, tomorrow, and yesterday. Do not treat device time or time zone as trusted business evidence. For appointments, deadlines, schedules, follow-ups, or other operational decisions, prefer canonical stored timestamps and verified HLC record data whenever available. Do not infer the current time from conversation history.`,
  };
}

export async function chatWithAgent(agentId: AgentId, message: string, history: AgentChatMessage[] = [], locale: ResolvedAgentLocale = "en-US") {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "/";
  const timeZone = browserTimeZone();
  const temporalDirective = buildAgentTemporalDirective(timeZone);
  const localeDirective: AgentChatMessage = {
    role: "user",
    text: `${buildAgentLocaleDirective(locale)}\n${buildAgentLocaleQualityDirective(locale)}`,
  };
  const localeAwareHistory = [temporalDirective, localeDirective, ...history.slice(-6)];
  const { data, error } = await supabase.functions.invoke("hlc-agent-chat", {
    body: { agentId, message, history: localeAwareHistory, pagePath, locale, timeZone },
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
