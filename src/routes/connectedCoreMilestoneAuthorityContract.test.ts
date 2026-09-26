import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ledger = JSON.parse(readFileSync(
  "docs/sprints/HCX_CONNECTED_CORE_E2E_LIVE_LEDGER.json",
  "utf8",
)) as {
  schemaVersion: number;
  milestone: string;
  certification: string;
  candidateSha: string;
  workstreams: Array<{
    id: string;
    name: string;
    status: string;
    hardBlocker: boolean;
    evidence: string[];
    gaps: string[];
    nextAction: string;
  }>;
};

test("Connected Core E2E ledger covers CC-01 through CC-10 exactly once", () => {
  assert.equal(ledger.schemaVersion, 1);
  assert.equal(ledger.milestone, "Connected Core E2E");
  assert.match(ledger.candidateSha, /^[0-9a-f]{40}$/);
  const ids = ledger.workstreams.map((item) => item.id);
  assert.deepEqual(ids, Array.from({ length: 10 }, (_, index) => `CC-${String(index + 1).padStart(2, "0")}`));
  assert.equal(new Set(ids).size, 10);
});

test("every Connected Core workstream has evidence, gaps and a concrete next action", () => {
  for (const item of ledger.workstreams) {
    assert.ok(item.name.trim(), `${item.id} missing name`);
    assert.ok(item.status.trim(), `${item.id} missing status`);
    assert.ok(item.evidence.length > 0, `${item.id} missing evidence`);
    assert.ok(item.gaps.length > 0, `${item.id} missing gaps`);
    assert.ok(item.nextAction.trim(), `${item.id} missing next action`);
  }
});

test("milestone cannot claim certification while hard blockers remain unresolved", () => {
  const unresolvedHardBlockers = ledger.workstreams.filter(
    (item) => item.hardBlocker && !["implemented"].includes(item.status),
  );
  assert.ok(unresolvedHardBlockers.length > 0);
  assert.equal(ledger.certification, "NOT_YET_CERTIFIED");
});

test("identity, communications, workflows, permissions and certification remain explicitly guarded", () => {
  const byId = new Map(ledger.workstreams.map((item) => [item.id, item]));
  assert.equal(byId.get("CC-01")?.status, "partial");
  assert.equal(byId.get("CC-03")?.status, "partial");
  assert.equal(byId.get("CC-05")?.status, "partial");
  assert.equal(byId.get("CC-07")?.hardBlocker, true);
  assert.equal(byId.get("CC-10")?.hardBlocker, true);
  assert.match((byId.get("CC-06")?.gaps || []).join(" "), /sound/i);
});
