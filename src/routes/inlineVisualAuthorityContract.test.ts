import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const launch = readFileSync("src/pages/dashboard/LaunchSurface.tsx","utf8");
const teamAccept = readFileSync("src/pages/team/AcceptWorkspaceInvitation.tsx","utf8");
const portalAccept = readFileSync("src/pages/portal/AcceptInvitation.tsx","utf8");
const signed = readFileSync("src/styles/signed-in-professional-system.css","utf8");
const publicFamily = readFileSync("src/styles/public-visual-family-20260919.css","utf8");

test("routed approval and invitation surfaces do not carry inline visual painters", () => {
  for (const source of [launch, teamAccept, portalAccept]) assert.doesNotMatch(source, /style=\{/);
  assert.doesNotMatch(launch, /const (?:page|hero|grid|card|row|territory|approval\w*)Style\s*=/);
});

test("launch and approval presentation is owned by the canonical signed-in authority", () => {
  for (const selector of [".hlc-launch-surface",".hlc-launch-card",".hlc-approval-section",".hlc-approval-status"]) assert.ok(signed.includes(selector));
  assert.match(signed, /\.hlc-launch-card\{[\s\S]*background:transparent;[\s\S]*box-shadow:none;/);
});

test("public invitation handoff presentation is owned by the current public family", () => {
  for (const selector of [".hlc-workspace-invite-page",".hlc-workspace-invite-panel",".hlc-public-status"]) assert.ok(publicFamily.includes(selector));
});
