import assert from "node:assert/strict";
import test from "node:test";
import { getCriticalDispositions, intelligentDispositions } from "./intelligentDispositions";

test("intelligent dispositions have unique ids", () => {
  const ids = intelligentDispositions.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("critical outcomes require human confirmation", () => {
  for (const item of getCriticalDispositions()) {
    assert.equal(item.humanConfirmation, "required", `${item.id} must require confirmation`);
  }
});

test("workflow dispositions map to the canonical HLC lifecycle", () => {
  const stages = intelligentDispositions.flatMap((item) => item.goldenWorkflowStage ? [item.goldenWorkflowStage] : []);
  for (const required of ["Qualify", "Estimate", "Match", "Schedule"] as const) {
    assert.ok(stages.includes(required), `missing disposition mapping for ${required}`);
  }
});

test("every disposition produces at least one next action and automation", () => {
  for (const item of intelligentDispositions) {
    assert.ok(item.nextActions.length > 0, `${item.id} missing next action`);
    assert.ok(item.automationKeys.length > 0, `${item.id} missing automation key`);
  }
});
