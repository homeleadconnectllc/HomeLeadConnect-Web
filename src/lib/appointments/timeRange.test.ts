import assert from "node:assert/strict";
import test from "node:test";

import { AppointmentTimeRangeError, requireAppointmentTimeRange } from "./timeRange.ts";

test("appointment range preserves exact valid start and end", () => {
  assert.deepEqual(
    requireAppointmentTimeRange("2026-08-11T14:00:00.000Z", "2026-08-11T15:30:00.000Z"),
    { start: "2026-08-11T14:00:00.000Z", end: "2026-08-11T15:30:00.000Z" },
  );
});

for (const [name, start, end] of [
  ["missing start", "", "2026-08-11T15:30:00.000Z"],
  ["missing end", "2026-08-11T14:00:00.000Z", ""],
  ["invalid start", "not-a-date", "2026-08-11T15:30:00.000Z"],
  ["equal timestamps", "2026-08-11T14:00:00.000Z", "2026-08-11T14:00:00.000Z"],
  ["end before start", "2026-08-11T15:30:00.000Z", "2026-08-11T14:00:00.000Z"],
] as const) {
  test(`appointment range rejects ${name}`, () => {
    assert.throws(() => requireAppointmentTimeRange(start, end), AppointmentTimeRangeError);
  });
}
