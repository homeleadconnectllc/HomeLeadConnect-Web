import assert from "node:assert/strict";
import test from "node:test";
import { connectedCoreControlMatrix, connectedCoreLifecycle } from "../config/connectedCoreControlMatrix.ts";

test("connected core lifecycle keeps the complete vertical chain visible", () => {
  assert.deepEqual(connectedCoreLifecycle, [
    "identity", "request", "crm", "assignment", "communication", "appointment", "job", "document", "financial", "follow-up", "audit",
  ]);
});

test("every connected-core ledger entry resolves operational boundaries", () => {
  const required = [
    "record", "sourceOfTruth", "permissionBoundary", "entitlementBoundary", "consentBoundary",
    "automation", "failureBehavior", "auditEvidence", "mobileBehavior", "status",
  ] as const;
  for (const item of connectedCoreControlMatrix) {
    for (const field of required) assert.ok(String(item[field]).trim(), `${item.id} is missing ${field}`);
  }
});

test("canonical identity and communications cannot be marked complete while reconciliation remains", () => {
  const identity = connectedCoreControlMatrix.find((item) => item.id === "canonical-contact-identity");
  const communications = connectedCoreControlMatrix.find((item) => item.id === "governed-communications");
  assert.equal(identity?.status, "partial");
  assert.equal(communications?.status, "partial");
  assert.match(identity?.failureBehavior ?? "", /never silently attach/i);
  assert.match(communications?.failureBehavior ?? "", /no fabricated delivery/i);
});
