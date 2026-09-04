import assert from "node:assert/strict";
import test from "node:test";
import { calculateResidentEstimateRange, measurementUnitLabel } from "./estimate.ts";

test("LeadScope calculates an informational range only from explicit resident assumptions", () => {
  assert.deepEqual(calculateResidentEstimateRange({ quantity: 120, rateLow: 4.5, rateHigh: 6.25 }), {
    low: 540,
    high: 750,
    method: "resident_rate_assumption",
  });
});

test("LeadScope rejects impossible range assumptions", () => {
  assert.throws(() => calculateResidentEstimateRange({ quantity: 0, rateLow: 1, rateHigh: 2 }), /greater than zero/);
  assert.throws(() => calculateResidentEstimateRange({ quantity: 10, rateLow: 3, rateHigh: 2 }), /at least the low rate/);
  assert.throws(() => calculateResidentEstimateRange({ quantity: 10, rateLow: -1, rateHigh: 2 }), /non-negative/);
});

test("LeadScope keeps measurement labels resident-readable", () => {
  assert.equal(measurementUnitLabel("sq_ft"), "square feet");
  assert.equal(measurementUnitLabel("linear_ft"), "linear feet");
  assert.equal(measurementUnitLabel("each"), "items");
  assert.equal(measurementUnitLabel("custom"), "units");
});
