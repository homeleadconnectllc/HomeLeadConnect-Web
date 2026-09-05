import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { ownerUsageAudit } from "../config/ownerUsageAudit.ts";

const dashboard = fs.readFileSync(new URL("../pages/dashboard/Dashboard.tsx", import.meta.url), "utf8");
const settings = fs.readFileSync(new URL("../pages/dashboard/Settings.tsx", import.meta.url), "utf8");

test("owner home turns attention into contextual actions", () => {
  assert.match(dashboard, /Let&apos;s keep things moving today\./);
  assert.match(dashboard, /Needs attention/);
  assert.match(dashboard, /<h2 id="hlc-home-today-title">Today<\/h2>/);
  assert.match(dashboard, /to=\{item\.to\}/);
  assert.match(dashboard, /You’re caught up\./);
  assert.match(dashboard, /to="\/notifications"/);
  assert.match(dashboard, /to="\/work"/);
  assert.match(dashboard, /<Link to="\/messages"/);
});

test("owner control surface reports authority and integration state truthfully", () => {
  assert.match(settings, /Membership-backed/);
  assert.match(settings, /Workspace role remains server-controlled/);
  assert.match(settings, /IntegrationsConnectionsPanel/);
  assert.match(settings, /Provider readiness determines which calling and messaging actions are available/);
  assert.match(settings, /No authoritative Stripe subscription is recorded/);
  assert.match(settings, /Setup required/);
});

test("owner journey has explicit command and control completion states", () => {
  assert.deepEqual(ownerUsageAudit.map((row) => [row.stage, row.status]), [
    ["Command", "connected"],
    ["Control", "connected"],
  ]);
  assert.ok(ownerUsageAudit.every((row) => row.evidence.length > 0 && row.correction.length > 0));
});
