import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const markers = readFileSync("src/components/scheduling/CalendarSignificanceMarkers.tsx", "utf8");
const mobileCss = readFileSync("src/styles/mobile-a-plus-final-device-round-3.css", "utf8");
const calendar = readFileSync("src/pages/dashboard/HlcNativeCalendar.tsx", "utf8");

test("calendar work markers only represent active scheduled records", () => {
  assert.match(markers, /appointment\.status === "scheduled"/);
  assert.match(markers, /event\.status === "scheduled"/);
  assert.doesNotMatch(markers, /status !== "cancelled"/);
  assert.match(markers, /new Map<string, number>\(\)/);
  assert.match(markers, /data-scheduled-count/);
});

test("calendar marked dates explain their real scheduled item count", () => {
  assert.match(markers, /aria-label/);
  assert.match(markers, /scheduled \$\{count === 1 \? "item" : "items"\}/);
  assert.match(markers, /button\.title/);
  assert.match(markers, /hlc-calendar-mini-legend/);
  assert.match(markers, /Scheduled work/);
});

test("calendar marked-date taps reveal the matching real records in day view", () => {
  assert.match(calendar, /const visibleItems = useMemo\(\(\) => allItems\.filter\(\(item\) => inSelectedPeriod\(item\.start, selectedDate, view\)\)/);
  assert.match(calendar, /className=\{`\$\{sameDay\(date, selectedDate\) \? "selected" : ""\}\$\{sameDay\(date, today\) \? " today" : ""\}`\}/);
  assert.match(calendar, /onClick=\{\(\) => \{ setSelectedDate\(startOfDay\(date\)\); setView\("day"\); setSelected\(null\); \}\}/);
  assert.match(calendar, /visibleItems\.map\(\(item\)/);
});

test("calendar today selected and scheduled-work states remain visually distinct", () => {
  assert.match(mobileCss, /button\.has-items::before/);
  assert.match(mobileCss, /button\.today/);
  assert.match(mobileCss, /button\.selected:not\(\.today\)/);
  assert.match(mobileCss, /hlc-calendar-mini-legend-dot/);
  assert.match(mobileCss, /Scheduled work|calendar state language/);
});
