import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const card = readFileSync("src/components/leads/LeadCard.tsx", "utf8");
const detail = readFileSync("src/pages/dashboard/LeadDetail.tsx", "utf8");
const leadsApi = readFileSync("src/api/leads.ts", "utf8");

test("lead cards open a workspace-scoped lead profile instead of remaining static", () => {
  assert.match(card, /to={`\/leads\/\$\{lead\.id\}`}/);
  assert.match(card, /Open profile, notes, details, and history/);
  assert.match(router, /path="\/leads\/:leadId" element={<LeadDetail\/>}/);
});

test("lead detail exposes real notes, contact, pipeline, schedule, and related actions", () => {
  assert.match(leadsApi, /"notes"/);
  assert.match(leadsApi, /"updated_at"/);
  assert.match(leadsApi, /\.eq\("workspace_id", workspaceId\)/);
  assert.match(detail, />Notes</);
  assert.match(detail, />Contact information</);
  assert.match(detail, />Pipeline details</);
  assert.match(detail, />Schedule & history</);
  assert.match(detail, /manual-communications\?contact=lead:/);
  assert.match(detail, /follow-ups\?lead=/);
  assert.match(detail, /estimator\?lead=/);
});

test("mobile lead metadata has explicit separators", () => {
  assert.match(card, /· Source:/);
  assert.match(card, /· Priority:/);
  assert.match(card, /· Appointment:/);
});
