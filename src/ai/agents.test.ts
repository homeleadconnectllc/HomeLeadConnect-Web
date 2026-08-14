import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { agents, capabilityCatalog } from "./agents.ts";

test("each HLC agent has one canonical contextual route", () => {
  assert.equal(agents.dion.route, "/operations");
  assert.equal(agents.diamond.route, "/customer-experience");
  assert.equal(agents.kendrell.route, "/hq");
  assert.equal(new Set(Object.values(agents).map((agent) => agent.route)).size, 3);
});

test("agent pages use the exact locked portrait assets", () => {
  const expected = {
    kendrell: ["/brand/avatars/Kendrell_Locked_HLC.png", "c4e037c88a9e2533c0dfc20ed0c340d7fa14b901e91e60515132f78a62926127"],
    dion: ["/brand/avatars/Dion_Locked_HLC.png", "14e344c4bf8e4cf6e05a42602f98ba901fe4358b51e3e22d304333d479d08e7f"],
    diamond: ["/brand/avatars/Diamond_Locked_HLC.png", "141ac383739313fa8f658ab0564f0b792ccd345b92c7b3dea74fddd5802489d1"],
  } as const;

  for (const [agentId, [publicPath, sha256]] of Object.entries(expected)) {
    assert.equal(agents[agentId as keyof typeof agents].image, publicPath);
    const asset = readFileSync(`public${publicPath}`);
    assert.equal(createHash("sha256").update(asset).digest("hex"), sha256);
  }
});

test("agent capabilities remain role-scoped and deterministic", () => {
  assert.ok(capabilityCatalog.kendrell.every((item) => !capabilityCatalog.dion.some((other) => other.id === item.id)));
  assert.ok(capabilityCatalog.diamond.some((item) => item.id === "draft_customer_reply" && item.level === "SUGGEST"));
  assert.ok(capabilityCatalog.dion.some((item) => item.id === "create_followup" && item.level === "EXECUTE"));
  assert.ok(!capabilityCatalog.kendrell.some((item) => item.id === "send_customer_communication"));
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
