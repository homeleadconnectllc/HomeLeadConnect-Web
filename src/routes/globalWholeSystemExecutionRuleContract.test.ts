import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rule = readFileSync("docs/governance/HCX_GLOBAL_WHOLE_SYSTEM_EXECUTION_RULE.md", "utf8");
const addendum = readFileSync("docs/governance/HCX_ACTIVE_BUILD_GOVERNING_ADDENDUM.md", "utf8");

test("every sprint carries task system and bounded application scope", () => {
  for (const scope of ["Task scope", "System scope", "Application scope"]) {
    assert.ok(rule.includes(scope), scope);
  }
  assert.match(rule, /Observed issue → root cause → ownership layer → blast radius → canonical repair → affected-surface verification/);
  assert.match(rule, /Whole-system awareness does not authorize unrelated redesign/);
});

test("whole-system execution uses canonical product authorities", () => {
  for (const authority of [
    "Experience Placement Authority",
    "Relationship Matrix",
    "Capability Registry",
    "route inventory",
    "Connected Core",
    "current exact-SHA implementation authority",
  ]) {
    assert.ok(rule.includes(authority), authority);
  }
  assert.match(rule, /Never create parallel state simply to make a screen work/);
});

test("presentation feedback remains separate from authoritative completion", () => {
  assert.match(rule, /A toast is not a workflow/);
  assert.match(rule, /A sound is not status/);
  assert.match(rule, /A trigger firing is not completion/);
  assert.match(rule, /A queue entry is not delivery/);
});

test("autonomy preserves owner and production boundaries", () => {
  assert.match(rule, /detect → investigate root cause → repair → retest → record → continue/);
  assert.match(rule, /Stop only for a genuine owner boundary/);
  assert.match(rule, /production promotion/);
  assert.match(addendum, /HCX_GLOBAL_WHOLE_SYSTEM_EXECUTION_RULE\.md/);
});
