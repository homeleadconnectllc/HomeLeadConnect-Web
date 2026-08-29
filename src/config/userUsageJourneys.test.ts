import assert from "node:assert/strict";
import test from "node:test";
import { usageCertificationDimensions, userUsageJourneys } from "./userUsageJourneys.ts";

test("all six canonical user personas have mapped usage journeys", () => {
  assert.deepEqual(userUsageJourneys.map((journey) => journey.persona), [
    "resident",
    "professional",
    "owner",
    "operations",
    "customerExperience",
    "partner",
  ]);
});

test("every usage step has the five certification dimensions and a mobile home", () => {
  for (const journey of userUsageJourneys) {
    assert.ok(journey.steps.length > 0, `${journey.persona} needs at least one usage step`);
    for (const step of journey.steps) {
      for (const dimension of usageCertificationDimensions) {
        const value = step[dimension];
        if (Array.isArray(value)) assert.ok(value.length > 0, `${journey.persona}/${step.stage}/${dimension}`);
        else assert.ok(String(value).trim().length > 0, `${journey.persona}/${step.stage}/${dimension}`);
      }
      assert.ok(["Home", "Work", "Network", "Community", "More"].includes(step.mobileHome));
    }
  }
});

test("resident journey follows the canonical service lifecycle end to end", () => {
  const resident = userUsageJourneys.find((journey) => journey.persona === "resident");
  assert.ok(resident);
  assert.deepEqual(resident.steps.map((step) => step.stage), [
    "Request",
    "Qualify",
    "Estimate",
    "Match",
    "Schedule",
    "Job",
    "Complete",
    "Payment",
    "Review",
    "Referral / Repeat",
  ]);
});

test("outside personas do not depend on internal administration as their primary journey", () => {
  for (const persona of ["resident", "professional", "partner"] as const) {
    const journey = userUsageJourneys.find((item) => item.persona === persona);
    assert.ok(journey);
    assert.ok(journey.steps.every((step) => !/internal admin/i.test(step.entryPoint)));
  }
});
