import assert from "node:assert/strict";
import test from "node:test";
import { objectionGuides, scriptLibrary, scriptLibrarySections } from "./scriptLibrary.ts";
import {
  CONNECT_BEHAVIOR_RULE,
  CONNECT_FRAMEWORK,
  CONNECT_SCORING_RUBRIC,
  CONNECT_SCRIPT_FOLDERS,
  flattenConnectFolders,
  getConnectScenario,
  resolveConnectScenarioEvidence,
  searchConnectLibrary,
} from "./connectConversationSystem.ts";
import {
  RUNTIME_CONNECT_FRAMEWORK,
  RUNTIME_CONNECT_SCORING_RUBRIC,
  getRuntimeConnectScenario,
} from "../../supabase/functions/hlc-connect-roleplay/connectRuntimeContract.ts";

test("scripts library covers the required operating sections", () => {
  for (const required of [
    "Call Scripts",
    "Voicemail",
    "Text & Email",
    "Intake & Qualification",
    "Estimate",
    "Matching",
    "Scheduling",
    "Job & Completion",
    "Follow-Up",
    "Objection Handling",
    "Professional Outreach",
    "Reviews & Referrals",
    "Customer Recovery",
    "Compliance & Safety",
  ]) {
    assert.ok(scriptLibrarySections.includes(required as (typeof scriptLibrarySections)[number]), `missing script section: ${required}`);
  }
});

test("starter scripts include multiple channels and both resident and professional audiences", () => {
  const channels = new Set(scriptLibrary.map((item) => item.channel));
  const audiences = new Set(scriptLibrary.map((item) => item.audience));
  for (const requiredChannel of ["call", "voicemail", "sms"]) assert.ok(channels.has(requiredChannel as never));
  assert.ok(audiences.has("resident"));
  assert.ok(audiences.has("professional"));
});

test("every script has guardrails and next actions", () => {
  for (const script of scriptLibrary) {
    assert.ok(script.guardrails.length > 0, `${script.id} is missing guardrails`);
    assert.ok(script.suggestedActions.length > 0, `${script.id} is missing suggested actions`);
    assert.ok(script.body.trim().length > 0, `${script.id} is missing body copy`);
  }
});

test("objection handling is guidance, not pressure scripting", () => {
  assert.ok(objectionGuides.length >= 5);
  for (const guide of objectionGuides) {
    assert.ok(guide.nextActions.length > 0, `${guide.id} is missing next actions`);
    assert.ok(guide.avoid.length > 0, `${guide.id} is missing avoid guidance`);
  }
});

test("CONNECT is a seven-step conversation framework with a 100-point coaching rubric", () => {
  assert.equal(CONNECT_FRAMEWORK.length, 7);
  assert.deepEqual(CONNECT_FRAMEWORK.map((step) => step.name), ["Context", "Open", "Need", "Notice Impact", "Explore Fit", "Confirm", "Take the Next Step"]);
  assert.equal(CONNECT_SCORING_RUBRIC.reduce((total, item) => total + item.weight, 0), 100);
  assert.equal(CONNECT_BEHAVIOR_RULE, "Scripts are guardrails, not speeches.");
});

test("CONNECT Script Library is hierarchical and preserves multiple approved variants", () => {
  assert.ok(CONNECT_SCRIPT_FOLDERS.length >= 5);
  const folders = flattenConnectFolders();
  assert.ok(folders.some((folder) => folder.id === "residents-appointment"));
  assert.ok(folders.some((folder) => folder.id === "providers-recruitment"));

  const scenario = getConnectScenario("resident-new-request");
  assert.ok(scenario);
  assert.deepEqual(
    new Set(scenario.variants.map((variant) => variant.variant)),
    new Set(["master", "quick", "standard", "warm", "professional", "high-touch"]),
  );
  assert.ok(scenario.variants.every((variant) => variant.approved === "approved"));
});

test("CONNECT scenarios resolve approved scripts, objection guidance, and controlled disposition recommendations", () => {
  const scenario = getConnectScenario("resident-new-request");
  assert.ok(scenario);
  const evidence = resolveConnectScenarioEvidence(scenario);
  assert.ok(evidence.sourceScripts.length >= 2);
  assert.ok(evidence.objections.length >= 2);
  assert.ok(evidence.dispositions.length >= 2);
  assert.ok(evidence.dispositions.some((item) => item?.humanConfirmation === "required"));
});

test("CONNECT library search finds folders and scenario content", () => {
  assert.ok(searchConnectLibrary("appointment").some((result) => result.folder.id === "residents-appointment"));
  assert.ok(searchConnectLibrary("desired outcome").some((result) => result.scenario?.id === "resident-new-request"));
});

test("deployable CONNECT Edge contract stays exact with the canonical resident scenario", () => {
  assert.deepEqual(RUNTIME_CONNECT_FRAMEWORK, CONNECT_FRAMEWORK);
  assert.deepEqual(RUNTIME_CONNECT_SCORING_RUBRIC, CONNECT_SCORING_RUBRIC);
  const canonical = getConnectScenario("resident-new-request");
  const runtime = getRuntimeConnectScenario("resident-new-request");
  assert.ok(canonical && runtime);
  assert.equal(runtime.teacher, canonical.teacher);
  assert.equal(runtime.goal, canonical.goal);
  assert.deepEqual(runtime.requiredInformation, canonical.requiredInformation);
  assert.deepEqual(runtime.suggestedQuestions, canonical.suggestedQuestions);
  assert.deepEqual(runtime.recommendedDispositionIds, canonical.recommendedDispositionIds);
  assert.deepEqual(
    runtime.variants,
    canonical.variants.map(({ variant, label, body }) => ({ variant, label, body })),
  );
});
