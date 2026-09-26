import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ledger = JSON.parse(readFileSync(
  "docs/governance/hcx-source-of-truth-reconciliation-ledger.json",
  "utf8",
)) as {
  schemaVersion: number;
  authorityOrder: string[];
  allowedDispositions: string[];
  entries: Array<Record<string, unknown>>;
};

const requiredFields = [
  "occurredAt",
  "createdAt",
  "modifiedAt",
  "observedAt",
  "source",
  "sourceIdentifier",
  "requirement",
  "currentAuthority",
  "implementedLocation",
  "dataHome",
  "workflowTrigger",
  "permissionModel",
  "testEvidence",
  "authority",
  "status",
  "builderAction",
  "conflictSupersededInformation",
  "remainingRisk",
] as const;

test("reconciliation ledger is machine-readable and records all four clocks without inventing missing values", () => {
  assert.equal(ledger.schemaVersion, 1);
  assert.ok(ledger.entries.length >= 8);
  for (const entry of ledger.entries) {
    for (const field of requiredFields) assert.ok(field in entry, `missing ${field}`);
    for (const clock of ["occurredAt", "createdAt", "modifiedAt", "observedAt"]) {
      const value = entry[clock];
      assert.ok(value === null || typeof value === "string", `${clock} must be timestamp text or null`);
    }
  }
});

test("reconciliation ledger keeps production, test, prototype and candidate authority distinct", () => {
  const byId = new Map(ledger.entries.map((entry) => [entry.id, entry]));
  assert.equal(byId.get("production-authority-7197ed02")?.builderAction, "PRESERVE");
  assert.equal(byId.get("production-contact-endpoint-ambiguity")?.status, "broken");
  assert.equal(byId.get("test-resolver-hardening-20260921232736")?.status, "verified-test");
  assert.equal(byId.get("repo-resolver-hardening-staged")?.status, "staged");
  assert.equal(byId.get("lovable-prototype-source")?.authority, "historical-visual");
});

test("ledger only uses governed reconciliation dispositions", () => {
  for (const entry of ledger.entries) {
    assert.ok(ledger.allowedDispositions.includes(String(entry.builderAction)), String(entry.id));
  }
});
