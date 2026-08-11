import assert from "node:assert/strict";
import test from "node:test";

import { agents, capabilityCatalog } from "./agents.ts";

test("each HLC agent has one canonical contextual route", () => {
  assert.equal(agents.dion.route, "/operations");
  assert.equal(agents.diamond.route, "/customer-experience");
  assert.equal(agents.kendrell.route, "/hq");
  assert.equal(new Set(Object.values(agents).map((agent) => agent.route)).size, 3);
});

test("agent pages do not substitute reference artwork for missing locked portraits", () => {
  assert.equal(agents.kendrell.image, undefined);
  assert.equal(agents.dion.image, undefined);
  assert.equal(agents.diamond.image, undefined);
});

test("agent capabilities remain role-scoped and deterministic", () => {
  assert.ok(capabilityCatalog.kendrell.every((item) => !capabilityCatalog.dion.some((other) => other.id === item.id)));
  assert.ok(capabilityCatalog.diamond.some((item) => item.id === "draft_customer_reply" && item.level === "SUGGEST"));
  assert.ok(capabilityCatalog.dion.some((item) => item.id === "create_followup" && item.level === "EXECUTE"));
  assert.ok(!capabilityCatalog.kendrell.some((item) => item.id === "send_customer_communication"));
});
