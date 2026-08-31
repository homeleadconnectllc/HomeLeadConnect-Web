import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");

test("manual communications remains separate from the dashboard regression batch", () => {
  assert.match(page, /Manual calls and texts|Manual Calls and Texts/i);
});
