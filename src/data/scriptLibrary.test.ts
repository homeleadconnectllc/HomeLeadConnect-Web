import assert from "node:assert/strict";
import test from "node:test";
import { objectionGuides, scriptLibrary, scriptLibrarySections } from "./scriptLibrary";

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
