import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { agentDepartmentAccents, agents, capabilityCatalog } from "./agents.ts";

test("each HLC agent has one canonical contextual route", () => {
  assert.equal(agents.dion.route, "/operations");
  assert.equal(agents.diamond.route, "/customer-experience");
  assert.equal(agents.kendrell.route, "/hq");
  assert.equal(new Set(Object.values(agents).map((agent) => agent.route)).size, 3);
});

test("canonical AI role labels and department accents stay locked without purple", () => {
  assert.equal(agents.kendrell.role, "Executive Command AI");
  assert.equal(agents.dion.role, "Operations & BI AI");
  assert.equal(agents.diamond.role, "Customer Experience & Community AI");

  assert.deepEqual(agentDepartmentAccents, {
    kendrell: "#F59E0B",
    dion: "#38BDF8",
    diamond: "#10B981",
  });

  assert.equal(agents.kendrell.accent, agentDepartmentAccents.kendrell);
  assert.equal(agents.dion.accent, agentDepartmentAccents.dion);
  assert.equal(agents.diamond.accent, agentDepartmentAccents.diamond);
  assert.notEqual(agentDepartmentAccents.dion.toLowerCase(), "#6366f1");
});

test("agent pages use the exact locked portrait assets", () => {
  const expected = {
    kendrell: ["/brand/avatars/Kendrell_Locked_HLC.png", "f267d8d4c0232b1c361aee8c1b236b8e3731406c899750b6ec1068ec642e6f5c"],
    dion: ["/brand/avatars/Dion_Locked_HLC.png", "14e344c4bf8e4cf6e05a42602f98ba901fe4358b51e3e22d304333d479d08e7f"],
    diamond: ["/brand/avatars/Diamond_Locked_HLC.png", "141ac383739313fa8f658ab0564f0b792ccd345b92c7b3dea74fddd5802489d1"],
  } as const;

  for (const [agentId, [publicPath, sha256]] of Object.entries(expected)) {
    assert.equal(agents[agentId as keyof typeof agents].image, publicPath);
    const asset = readFileSync(`public${publicPath}`);
    assert.equal(createHash("sha256").update(asset).digest("hex"), sha256);
  }
});

test("agent source portraits and official logo remain identity locked", () => {
  const registry = readFileSync("docs/governance/ASSET_REGISTRY.md", "utf8");
  const expectedSources = {
    kendrell: ["public/brand/avatars/sources/Kendrell_Identity_Source_20260920.jpeg", "21c088ab032e4e6ea942d9e227a745084ee757bb0cacda01d54f6387d9630492"],
    dion: ["public/brand/avatars/sources/Dion_Identity_Source_20260920.jpeg", "37a59dadce0c9caa1048f68bffdd11348fbe269adceb7ffcf7cc1e3e4e5e9b69"],
    diamond: ["public/brand/avatars/sources/Diamond_Identity_Source_20260920.jpeg", "81e2013f2db167c96c0a489692db7b8811aea84822a11a978638311322463581"],
  } as const;

  for (const [agentId, [sourcePath, sha256]] of Object.entries(expectedSources)) {
    const asset = readFileSync(sourcePath);
    assert.equal(createHash("sha256").update(asset).digest("hex"), sha256, `${agentId} source portrait must not drift`);
    assert.match(registry, new RegExp(sourcePath.replaceAll(".", "\\.")));
  }

  const officialLogo = readFileSync("public/brand/homelead-connect-official-master.svg");
  assert.equal(createHash("sha256").update(officialLogo).digest("hex"), "31c97d8b6880a93c711bded854950ec304af7e2a9d1c8a3e6e6abbd2886a4813");
  assert.match(registry, /Never alter agent facial identity/);
  assert.match(registry, /Never alter, redraw, approximate, retype, or restyle the official logo/);
});

test("agent capabilities remain role-scoped and deterministic", () => {
  assert.ok(capabilityCatalog.kendrell.every((item) => !capabilityCatalog.dion.some((other) => other.id === item.id)));
  assert.ok(capabilityCatalog.diamond.some((item) => item.id === "draft_customer_reply" && item.level === "SUGGEST"));
  assert.ok(capabilityCatalog.diamond.some((item) => item.id === "escalate_customer_issue" && item.level === "ESCALATE"));
  assert.ok(capabilityCatalog.dion.some((item) => item.id === "create_followup" && item.level === "EXECUTE"));
  assert.ok(capabilityCatalog.kendrell.some((item) => item.id === "risk_exception_triage" && item.level === "SUGGEST"));
  assert.ok(!capabilityCatalog.kendrell.some((item) => item.id === "send_customer_communication"));
});

test("professional operating doctrines define data, guardrails, handoffs, and completion", () => {
  for (const agent of Object.values(agents)) {
    assert.ok(agent.operatingDoctrine.mission.length > 40);
    assert.ok(agent.operatingDoctrine.authoritativeData.length >= 4);
    assert.ok(agent.operatingDoctrine.responsibilities.length >= 4);
    assert.ok(agent.operatingDoctrine.escalationTriggers.length >= 4);
    assert.ok(agent.operatingDoctrine.handoffRules.length >= 2);
    assert.ok(agent.operatingDoctrine.completionCriteria.length >= 4);
  }

  assert.match(agents.kendrell.operatingDoctrine.mission, /orchestrat/i);
  assert.ok(agents.kendrell.operatingDoctrine.handoffRules.some((rule) => /Dion/i.test(rule)));
  assert.ok(agents.kendrell.operatingDoctrine.handoffRules.some((rule) => /Diamond/i.test(rule)));

  assert.match(agents.dion.operatingDoctrine.mission, /operations/i);
  assert.ok(agents.dion.operatingDoctrine.authoritativeData.some((item) => /SLA/i.test(item)));
  assert.ok(agents.dion.operatingDoctrine.completionCriteria.some((item) => /recorded in HLC/i.test(item)));

  assert.match(agents.diamond.operatingDoctrine.mission, /customer-service/i);
  assert.ok(agents.diamond.operatingDoctrine.escalationTriggers.some((item) => /human/i.test(item)));
  assert.ok(agents.diamond.operatingDoctrine.escalationTriggers.some((item) => /frustration/i.test(item)));
  assert.ok(agents.diamond.operatingDoctrine.completionCriteria.some((item) => /escalated/i.test(item)));
});

test("agent runtime enforces evidence-first advisory operation and professional escalation", () => {
  const source = readFileSync("supabase/functions/hlc-agent-chat/index.ts", "utf8");
  assert.match(source, /PROFESSIONAL OPERATING PROTOCOL/);
  assert.match(source, /Observe: use only authorized HLC context and canonical record evidence/);
  assert.match(source, /Assess: identify the user's actual objective/);
  assert.match(source, /Verify: distinguish VERIFIED FACT, REASONABLE INFERENCE, and UNKNOWN/);
  assert.match(source, /Handoffs must be structured/);
  assert.match(source, /This conversational channel is advisory-only/);
  assert.match(source, /Kendrell command access requires an approved owner, manager, or supervisor role/);
  assert.match(source, /repeated_issue=/);
  assert.match(source, /asks_for_human=/);
  assert.match(source, /frustration_language=/);
  assert.match(source, /sensitive_topic=/);
  assert.match(source, /sla_attention_leads=/);
  assert.match(source, /followups_overdue=/);
  assert.match(source, /pending_assignments=/);
  assert.match(source, /unread_notifications_for_user=/);
  assert.doesNotMatch(source, /you can send messages, change leads/i);
});

test("agent voice personas stay distinct and locked", () => {
  assert.equal(agents.kendrell.voicePersona.genderPresentation, "male");
  assert.match(agents.kendrell.voicePersona.tone, /steady/i);
  assert.match(agents.kendrell.voicePersona.tone, /lower-key/i);

  assert.equal(agents.dion.voicePersona.genderPresentation, "male");
  assert.match(agents.dion.voicePersona.tone, /analytical/i);
  assert.match(agents.dion.voicePersona.tone, /masculine/i);

  assert.equal(agents.diamond.voicePersona.genderPresentation, "female");
  assert.match(agents.diamond.voicePersona.tone, /polished/i);
  assert.match(agents.diamond.voicePersona.tone, /feminine/i);

  for (const agent of Object.values(agents)) {
    assert.ok(agent.voicePersona.avoid.some((item) => /robotic/i.test(item)));
  }
});

test("provider voices stay agent-specific without generic male/female choices", () => {
  const voiceRuntime = readFileSync("supabase/functions/hlc-agent-voice/index.ts", "utf8");
  const chatPanel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");

  assert.match(voiceRuntime, /kendrell:\s*\{[\s\S]*voice:\s*"Schedar"/);
  assert.match(voiceRuntime, /dion:\s*\{[\s\S]*voice:\s*"Sadaltager"/);
  assert.match(voiceRuntime, /diamond:\s*\{[\s\S]*voice:\s*"Sulafat"/);
  assert.match(voiceRuntime, /Kendrell|adult male executive operator/i);
  assert.match(voiceRuntime, /Dion|adult male business-intelligence operator/i);
  assert.match(voiceRuntime, /Diamond|adult female customer-experience guide/i);

  assert.match(chatPanel, /\{agentName\} voice · \{voicePersona\.tone\}/);
  assert.doesNotMatch(chatPanel, /voicePersona\.genderPresentation/);
  assert.doesNotMatch(chatPanel, /<select[^>]*voice/i);
});
