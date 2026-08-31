import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");
const chatApi = readFileSync("src/api/agentChat.ts", "utf8");
const locale = readFileSync("src/lib/agentLocale.ts", "utf8");
const edgeFunction = readFileSync("supabase/functions/hlc-agent-chat/index.ts", "utf8");

test("agent chat preserves bounded conversation history, route context, temporal context, and locale quality guidance", () => {
  assert.match(chatApi, /history\.slice\(-6\)/);
  assert.match(chatApi, /localeAwareHistory = \[temporalDirective, localeDirective, \.\.\.history\.slice\(-6\)\]/);
  assert.match(chatApi, /pagePath/);
  assert.match(chatApi, /buildAgentTemporalDirective\(timeZone\)/);
  assert.match(chatApi, /buildAgentLocaleDirective\(locale\)/);
  assert.match(chatApi, /buildAgentLocaleQualityDirective\(locale\)/);
  assert.match(edgeFunction, /Stay in that agent identity for the entire conversation/);
});

test("agent service-role follow-up metrics remain tenant-scoped through the linked lead", () => {
  const joinedQueries = edgeFunction.match(/from\("follow_ups"\)\.select\("id,lead:leads!inner\(workspace_id\)"/g) ?? [];
  const workspaceFilters = edgeFunction.match(/\.eq\("lead\.workspace_id", workspaceId\)/g) ?? [];
  assert.equal(joinedQueries.length, 2);
  assert.equal(workspaceFilters.length, 2);
  assert.doesNotMatch(edgeFunction, /from\("follow_ups"\)\.select\("id", \{ count: "exact", head: true \}\)\.eq\("status"/);
});

test("fallback responses are explicitly surfaced instead of impersonating a fresh live answer", () => {
  assert.match(panel, /data-response-mode=\{fallbackMode \? "fallback" : "live"\}/);
  assert.match(locale, /verifiedFallback: "Verified fallback"/);
  assert.match(panel, /live reasoning provider is temporarily unavailable/);
  assert.match(chatApi, /getLocalizedAgentFallback\(agentId, locale\)/);
});

test("repeated deterministic fallback copy is suppressed and never auto-spoken as new reasoning", () => {
  assert.match(panel, /previousModelReply === response\.reply\.trim\(\)/);
  assert.match(panel, /kept the existing verified fallback instead of repeating the same response/);
  assert.match(panel, /!response\.fallback && voicePreferences\.enabled && voicePreferences\.autoSpeak/);
});
