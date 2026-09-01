import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const dashboard = readFileSync("src/pages/dashboard/Dashboard.tsx", "utf8");
const leads = readFileSync("src/pages/dashboard/Leads.tsx", "utf8");
const leadCard = readFileSync("src/components/leads/LeadCard.tsx", "utf8");
const messages = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const calendar = readFileSync("src/pages/dashboard/HlcNativeCalendar.tsx", "utf8");
const jobs = readFileSync("src/pages/dashboard/Jobs.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");

test("critical signed-in journey destinations stay declared and reachable", () => {
  for (const route of ["/dashboard", "/leads", "/messages", "/calendar", "/jobs"]) {
    assert.match(router, new RegExp(`path=\\"${route.replaceAll("/", "\\/")}\\"`));
  }
  assert.match(router, /path="\/work"/);
  assert.match(router, /path="\/work\/matching"/);
  assert.match(router, /path="\/jobs\/:jobId"/);
  assert.match(dashboard, /to: "\/leads"/);
  assert.match(dashboard, /to: "\/messages"/);
  assert.match(dashboard, /to: "\/calendar"/);
  assert.match(dashboard, /to: "\/jobs"/);
});

test("mobile primary navigation preserves the canonical five-parent return paths", () => {
  assert.match(navbar, /label:\s*"Home",[\s\S]*?route:\s*"\/dashboard"/);
  assert.match(navbar, /label:\s*"Work",[\s\S]*?route:\s*"\/work"/);
  assert.match(navbar, /label:\s*"Network",[\s\S]*?route:\s*"\/network"/);
  assert.match(navbar, /label:\s*"Community",[\s\S]*?route:\s*"\/community-hub"/);
  assert.match(navbar, /aria-label=\{mobileOpen \? "Close all HLC areas" : "Open all HLC areas"\}/);
  assert.match(navbar, /<span>More<\/span>/);
  assert.match(navbar, /aria-current=\{active \? "page" : undefined\}/);
});

test("lead work keeps explicit next-action handoffs", () => {
  assert.match(leads, /<LeadCard key=\{lead\.id\} lead=\{lead\} \/>/);
  assert.match(leadCard, /to=\{`\/estimator\?lead=\$\{lead\.id\}`\}/);
  assert.match(leadCard, /to=\{`\/follow-ups\?lead=\$\{lead\.id_uuid\}`\}/);
  assert.match(leadCard, /to=\{`\/manual-communications\?contact=lead:\$\{lead\.id\}&channel=call`\}/);
  assert.match(leadCard, /PortalInviteButton/);
});

test("lead, message, job and schedule surfaces expose launch-critical states", () => {
  assert.match(leads, /Loading leads…/);
  assert.match(leads, /role="alert"/);
  assert.match(leads, /No leads found\./);
  assert.match(leads, /No matching leads/);
  assert.match(leads, /disabled=\{savingLead\}/);
  assert.match(leads, /Adding…/);

  assert.match(messages, /Loading conversations…/);
  assert.match(messages, /role="alert"/);
  assert.match(messages, /role="status"/);
  assert.match(messages, /No conversations yet\. Start a new message when you are ready\./);
  assert.match(messages, /No messages have been recorded in this conversation yet\./);
  assert.match(messages, /disabled=\{busy/);

  assert.match(jobs, /Loading jobs…/);
  assert.match(jobs, /role="alert"/);
  assert.match(jobs, /role="status"/);
  assert.match(jobs, /No jobs yet\./);
  assert.match(jobs, /busyJobId/);

  assert.match(calendar, /Loading HLC Calendar…/);
  assert.match(calendar, /role="alert"/);
  assert.match(calendar, /role="status"/);
  assert.match(calendar, /No calendar items here/);
  assert.match(calendar, /disabled=\{busy/);
  assert.match(calendar, /createHlcCalendarEvent/);
});

test("schedule-to-job handoff remains contextual and reversible", () => {
  assert.match(calendar, /to="\/jobs"/);
  assert.match(calendar, /to=\{`\/jobs\/\$\{selectedAppointment\.job_id\}`\}/);
  assert.match(calendar, /Reschedule/);
  assert.match(calendar, /Complete appointment/);
  assert.match(calendar, /Cancel appointment/);
  assert.match(calendar, /Mark no-show/);
  assert.match(calendar, /HLC native schedule/);
});
