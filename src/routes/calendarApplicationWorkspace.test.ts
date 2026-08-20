import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calendarPage = readFileSync(new URL("../pages/dashboard/Calendar.tsx", import.meta.url), "utf8");
const calendarCss = readFileSync(new URL("../styles/calendar-application-workspace.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");

test("Calendar keeps a dedicated schedule workspace with job handoff and detail inspector", () => {
  assert.match(calendarPage, /className="hlc-calendar-workspace"/);
  assert.match(calendarPage, /className="hlc-calendar-timeline"/);
  assert.match(calendarPage, /className="hlc-calendar-detail-panel"/);
  assert.match(calendarPage, /to=\{`\/jobs\/\$\{selectedAppointment\.job_id\}`\}/);
});

test("Calendar specialization is mounted before final application workspace authority", () => {
  const calendarIndex = authenticatedEntry.indexOf('import "./calendar-application-workspace.css"');
  const finalIndex = authenticatedEntry.indexOf('import "./application-workspace-ui.css"');
  assert.ok(calendarIndex >= 0);
  assert.ok(finalIndex > calendarIndex);
});

test("Calendar removes page and KPI card treatment while preserving mobile schedule behavior", () => {
  assert.match(calendarCss, /\.hlc-calendar-page\{[^}]*border:0!important[^}]*border-radius:0!important[^}]*background:transparent!important/s);
  assert.match(calendarCss, /\.hlc-calendar-kpis article\{[^}]*border-radius:0!important[^}]*background:transparent!important/s);
  assert.match(calendarCss, /\.hlc-calendar-event\{[^}]*border-radius:0!important[^}]*background:transparent!important/s);
  assert.match(calendarCss, /\.hlc-calendar-upcoming-card\{[^}]*border-radius:0!important[^}]*background:transparent!important/s);
  assert.match(calendarCss, /@media\(max-width:760px\)/);
  assert.match(calendarCss, /\.hlc-calendar-workspace\{grid-template-columns:1fr\}/);
});
