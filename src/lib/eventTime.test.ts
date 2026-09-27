import assert from "node:assert/strict";
import test from "node:test";
import { suggestedEventStart } from "./eventTime.ts";

test("new events start at the next half hour even when browsing an older date", () => {
  const now = new Date(2026, 8, 27, 12, 26);
  assert.equal(suggestedEventStart(new Date(2026, 8, 16), now), "2026-09-27T12:30");
  assert.equal(suggestedEventStart(undefined, new Date(2026, 8, 27, 12, 30)), "2026-09-27T13:00");
});

test("selecting a future day proposes 9 AM on that day", () => {
  assert.equal(suggestedEventStart(new Date(2026, 8, 29), new Date(2026, 8, 27, 12, 26)), "2026-09-29T09:00");
});
