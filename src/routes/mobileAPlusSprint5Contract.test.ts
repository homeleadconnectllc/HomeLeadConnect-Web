import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/mobile-a-plus-sprint-5-community-participation.css", "utf8");
const styleEntry = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const participation = readFileSync("src/pages/dashboard/CommunityParticipation.tsx", "utf8");
const router = readFileSync("src/pages/dashboard/LaunchSurfaceRouter.tsx", "utf8");

test("Sprint 5 mounts after Sprint 4 as compact-only authority", () => {
  const sprint4 = styleEntry.indexOf("./mobile-a-plus-sprint-4-community-messages.css");
  const sprint5 = styleEntry.indexOf("./mobile-a-plus-sprint-5-community-participation.css");
  assert.ok(sprint4 >= 0);
  assert.ok(sprint5 > sprint4);
  assert.match(styles, /@media \(max-width: 760px\)/);
});

test("Sprint 5 keeps persisted Community discussions, groups and events wired", () => {
  assert.match(router, /CommunityParticipation page="discussions"/);
  assert.match(router, /CommunityParticipation page="groups"/);
  assert.match(router, /CommunityParticipation page="events"/);
  assert.match(participation, /createCommunityReply/);
  assert.match(participation, /joinCommunityGroup/);
  assert.match(participation, /setCommunityEventAttendance/);
});

test("Sprint 5 uses touch-safe, keyboard-safe Community controls", () => {
  assert.match(styles, /input,[\s\S]*select,[\s\S]*textarea[\s\S]*min-height: 44px/);
  assert.match(styles, /font-size: 16px/);
  assert.match(styles, /button,[\s\S]*a[\s\S]*min-height: 44px/);
});

test("Sprint 5 event selection is not communicated by color alone", () => {
  assert.match(participation, /aria-pressed=\{mine === "going"\}/);
  assert.match(participation, /aria-pressed=\{mine === "interested"\}/);
  assert.match(participation, /aria-pressed=\{mine === "not_going"\}/);
  assert.match(styles, /button\[aria-pressed="true"\]::before[\s\S]*content: "✓"/);
});

test("Sprint 5 contains long Community content and respects reduced motion", () => {
  assert.match(styles, /overflow-wrap: anywhere/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
