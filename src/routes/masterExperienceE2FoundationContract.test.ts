import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const academy = readFileSync(new URL("../lib/academyExperience.ts", import.meta.url), "utf8");
const execution = readFileSync(new URL("../../docs/experience/HLC_E2_ACADEMY_ARCADE_EXECUTION.md", import.meta.url), "utf8");

test("E2 preserves canonical Academy routes and E3 route reservations", () => {
  for (const route of [
    "/academy",
    "/academy/paths",
    "/academy/certifications",
    "/academy/progress",
    "/academy/roleplay",
    "/academy/library",
    "/academy/practice/",
  ]) assert.match(academy, new RegExp(route.replaceAll("/", "\\/")));
  assert.match(execution, /E3-owned routes remain reserved/);
});

test("E2 locks Learn through Progress sequence and teacher ownership", () => {
  for (const stage of ["learn", "practice", "simulate", "certify", "apply", "progress"]) {
    assert.match(academy, new RegExp(`"${stage}"`));
  }
  assert.match(academy, /teacher: "diamond"/);
  assert.match(academy, /teacher: "dion"/);
  assert.match(academy, /teacher: "kendrell"/);
});

test("Arcade rewards cannot become trust or infinite farming", () => {
  assert.match(academy, /if \(input\.attemptNumber === 2\) return Math\.floor\(base \* 0\.25\)/);
  assert.match(academy, /return 0;/);
  assert.match(academy, /xpIsNotTrustScore: true/);
  assert.match(academy, /communityPopularityIsNotCompetency: true/);
  assert.match(academy, /application" && !input\.verifiedOutcome/);
});

test("internal certification requires evidence and remains distinct from external credentials", () => {
  assert.match(academy, /assessmentId/);
  assert.match(academy, /score >= evidence\.threshold/);
  assert.match(academy, /externalLicenseMustRemainDistinct: true/);
  assert.match(academy, /attendanceIsNotCertification: true/);
  assert.match(execution, /HLC certifications must remain distinct from external licenses\/credentials/);
});
