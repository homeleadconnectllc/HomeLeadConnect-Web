import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path: string) => fs.readFileSync(path, "utf8");

test("lead actions deep-link call and text into HLC with follow-up purpose", () => {
  const leadDetail = read("src/pages/dashboard/LeadDetail.tsx");
  assert.match(leadDetail, /channel=call&purpose=lead_follow_up/);
  assert.match(leadDetail, /channel=sms&purpose=lead_follow_up/);
  assert.match(leadDetail, /compose=email&lead=/);
});

test("manual communications honors a deep-linked communication purpose", () => {
  const manual = read("src/pages/dashboard/ManualCommunications.tsx");
  assert.match(manual, /communicationPurposeFromQuery/);
  assert.match(manual, /searchParams\.get\("purpose"\)/);
  assert.match(manual, /lead_follow_up/);
});

test("email deep links resolve only through an active resident portal recipient", () => {
  const messages = read("src/pages/dashboard/Messages.tsx");
  assert.match(messages, /composeEmail/);
  assert.match(messages, /recipient\.role === "homeowner"/);
  assert.match(messages, /recipient\.subjectId === contextualLeadId/);
  assert.match(messages, /not connected to an active resident portal yet/);
  assert.match(messages, /setDeliveryMode\("email"\)/);
});
