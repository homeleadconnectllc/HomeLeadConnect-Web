import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/FollowUps.tsx", "utf8");
const styles = readFileSync("src/styles/follow-ups-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Follow Ups is a dedicated relationship queue instead of a card history page", () => {
  assert.match(page, /hlc-followups-workspace/);
  assert.match(page, /RELATIONSHIP QUEUE/);
  assert.match(page, /hlc-followups-summary/);
  assert.match(page, /hlc-followup-queue/);
  assert.doesNotMatch(page, /cardStyle/);
  assert.doesNotMatch(page, /style=\{pageStyle\}/);
});

test("Follow Ups preserves creation, completion, lead context, and durable empty state", () => {
  assert.match(page, /const selectedLeadId = leadId \|\| contextualLeadId/);
  assert.match(page, /createFollowUp\(\{ leadId: selectedLeadId, scheduledFor: new Date\(scheduledFor\)\.toISOString\(\), notes \}\)/);
  assert.match(page, /completeFollowUp\(item\.id\)/);
  assert.match(page, /searchParams\.get\("lead"\)/);
  assert.match(page, /searchParams\.get\("leadRecord"\)/);
  assert.match(page, /No follow-ups yet\./);
  assert.match(page, /to="\/leads"/);
});

test("Follow Ups specialization is mounted before final application workspace authority and collapses on mobile", () => {
  const routeIndex = entry.indexOf("./follow-ups-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-followup-column-head,\.hlc-followup-row\{display:grid/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-followup-row\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-followups-summary\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
