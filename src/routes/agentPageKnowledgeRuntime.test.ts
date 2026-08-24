import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runtime = readFileSync("supabase/functions/hlc-agent-chat/index.ts", "utf8");
const knowledge = readFileSync("src/ai/pageKnowledge.ts", "utf8");

test("agent chat runtime imports one canonical shared HLC page knowledge registry", () => {
  assert.match(runtime, /from "\.\.\/\.\.\/\.\.\/src\/ai\/pageKnowledge\.ts"/);
  assert.match(runtime, /resolveHlcPageKnowledge/);
  assert.match(runtime, /serializeHlcPageKnowledge/);
  assert.match(runtime, /HLC_GLOBAL_AGENT_BOUNDARIES/);
  assert.match(runtime, /HLC_CORE_LIFECYCLE/);
  assert.equal((knowledge.match(/export const HLC_PAGE_KNOWLEDGE/g) || []).length, 1);
});

test("client pagePath cannot broaden resident or professional portal knowledge", () => {
  assert.match(runtime, /function isPagePathAuthorizedForContext/);
  assert.match(runtime, /contextKind === "resident_portal"[\s\S]*normalized === "\/homeowner-portal"[\s\S]*startsWith\("\/homeowner-portal\/"\)/);
  assert.match(runtime, /normalized === "\/contractor-portal"[\s\S]*startsWith\("\/contractor-portal\/"\)/);
  assert.match(runtime, /sharedPortalSurface = normalized === "\/messages" \|\| normalized === "\/notifications"/);
  assert.match(runtime, /isPagePathAuthorizedForContext\(contextKind, pagePath\) \? resolveHlcPageKnowledge\(pagePath\) : null/);
});

test("shared page knowledge is assembled once outside agent identity rules", () => {
  const agentRulesAt = runtime.indexOf("const agentRules");
  const sharedContextAt = runtime.indexOf("const sharedPageKnowledgeContext");
  const systemInstructionAt = runtime.indexOf("const systemInstruction");
  assert.ok(agentRulesAt >= 0 && sharedContextAt > agentRulesAt && systemInstructionAt > sharedContextAt);
  assert.match(runtime, /Authorized shared HLC page\/workflow knowledge:\n\$\{sharedPageKnowledgeContext\}/);
  assert.match(runtime, /KNOWLEDGE != AUTHORITY/);
  assert.doesNotMatch(runtime, /kendrellPageKnowledge|dionPageKnowledge|diamondPageKnowledge/);
});

test("page knowledge remains navigation guidance rather than record evidence", () => {
  assert.match(runtime, /Current HLC page path \(navigation context only; never record evidence\)/);
  assert.match(knowledge, /route parameter identifies a requested page shape only; it is never trusted as record evidence/i);
  assert.match(runtime, /page_knowledge_id: pageKnowledge\?\.id \?\? null/);
});

test("existing authorization remains in front of shared page knowledge", () => {
  const accountContextAt = runtime.indexOf("if (!contextKind || !workspaceId)");
  const kendrellGuardAt = runtime.indexOf("Kendrell command access requires");
  const residentGuardAt = runtime.indexOf("Diamond is the resident portal assistant");
  const professionalGuardAt = runtime.indexOf("Dion is the professional portal assistant");
  const pageResolveAt = runtime.indexOf("const pageKnowledge =");
  assert.ok(accountContextAt >= 0);
  assert.ok(kendrellGuardAt > accountContextAt);
  assert.ok(residentGuardAt > accountContextAt);
  assert.ok(professionalGuardAt > accountContextAt);
  assert.ok(pageResolveAt > kendrellGuardAt && pageResolveAt > residentGuardAt && pageResolveAt > professionalGuardAt);
});

test("exactly three HLC agent identities remain in the runtime", () => {
  assert.match(runtime, /type AgentId = "kendrell" \| "dion" \| "diamond"/);
  assert.doesNotMatch(runtime, /"researcher"|"executor"|"reviewer"|"critic"|"planner"/i);
});
