import assert from "node:assert/strict";
import test from "node:test";

import { calculateEstimate } from "./calculations.ts";

test("LeadScope totals quantity, unit cost, and estimate-level markup deterministically", () => {
  assert.deepEqual(
    calculateEstimate([
      { id: "labor", description: "Labor", quantity: 8, unitCost: 75 },
      { id: "materials", description: "Materials", quantity: 3, unitCost: 120 },
    ], 10),
    { subtotal: 960, markupAmount: 96, total: 1056 },
  );
});

test("LeadScope prevents negative markup from reducing the estimate", () => {
  assert.deepEqual(calculateEstimate([{ id: "line", description: "Line", quantity: 2, unitCost: 50 }], -25), { subtotal: 100, markupAmount: 0, total: 100 });
});
