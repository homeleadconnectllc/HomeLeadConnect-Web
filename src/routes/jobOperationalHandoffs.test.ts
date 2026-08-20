import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const jobCard = readFileSync("src/components/jobs/JobCard.tsx", "utf8");
const followUps = readFileSync("src/pages/dashboard/FollowUps.tsx", "utf8");

test("job rows keep lead context through follow-up and call handoffs", () => {
  assert.match(jobCard, /\/follow-ups\?leadRecord=/);
  assert.match(jobCard, /\/manual-communications\?channel=call&direction=outbound&contact=lead:/);
  assert.match(jobCard, /\/documents\?entityType=job&entityId=/);
});

test("follow-up composer resolves numeric job lead context to the canonical lead UUID", () => {
  assert.match(followUps, /searchParams\.get\("leadRecord"\)/);
  assert.match(followUps, /leads\.find\(\(lead\) => lead\.id === numericLeadId\)/);
  assert.match(followUps, /setLeadId\(matchingLead\.id_uuid\)/);
});
