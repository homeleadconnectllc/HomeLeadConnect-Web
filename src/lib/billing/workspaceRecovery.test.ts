import assert from "node:assert/strict";
import test from "node:test";

import { chooseEntitledWorkspaceRecovery, hasVerifiedWorkspaceAccess } from "./workspaceRecovery.ts";

const now = new Date("2026-09-04T15:00:00Z");

test("active and trialing workspaces are verified access candidates", () => {
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "a", status: "active", is_active: true }, now), true);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "b", status: "trialing", is_active: true }, now), true);
});

test("past due workspace qualifies only inside webhook-confirmed grace", () => {
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "a", status: "past_due", is_active: true, grace_period_end: "2026-09-05T15:00:00Z" }, now), true);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "b", status: "past_due", is_active: true, grace_period_end: "2026-09-03T15:00:00Z" }, now), false);
});

test("inactive and canceled workspaces never qualify", () => {
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "a", status: "active", is_active: false }, now), false);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "b", status: "canceled", is_active: true }, now), false);
});

test("recovery chooses exactly one other entitled workspace", () => {
  const selected = chooseEntitledWorkspaceRecovery("current", [
    { workspace_id: "current", status: null, is_active: false },
    { workspace_id: "paid", status: "active", is_active: true },
    { workspace_id: "inactive", status: "canceled", is_active: false },
  ], now);
  assert.equal(selected?.workspace_id, "paid");
});

test("recovery refuses ambiguous multiple entitled workspaces", () => {
  const selected = chooseEntitledWorkspaceRecovery("current", [
    { workspace_id: "paid-a", status: "active", is_active: true },
    { workspace_id: "paid-b", status: "trialing", is_active: true },
  ], now);
  assert.equal(selected, null);
});

test("recovery never returns the already-selected workspace", () => {
  const selected = chooseEntitledWorkspaceRecovery("current", [
    { workspace_id: "current", status: "active", is_active: true },
  ], now);
  assert.equal(selected, null);
});
