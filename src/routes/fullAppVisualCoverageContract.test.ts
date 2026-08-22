import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");
const authority = readFileSync(new URL("../styles/full-app-visual-reference-authority.css", import.meta.url), "utf8");

const expectedReachableRoutes = [
  "/", "/app", "/portal", "/contact", "/request-service", "/about", "/homeowners", "/contractors",
  "/how-it-works", "/leadscope", "/community", "/services", "/pricing", "/trust", "/professionals", "/demo",
  "/professional-application", "/accessibility", "/privacy", "/terms", "/platform-disclosure", "/login", "/register",
  "/forgot-password", "/reset-password", "/portal/accept", "/team/accept", "/homeowner-portal", "/contractor-portal",
  "/homeowner-portal/requests", "/homeowner-portal/appointments", "/homeowner-portal/jobs", "/homeowner-portal/documents",
  "/homeowner-portal/profile", "/homeowner-portal/settings", "/contractor-portal/profile", "/contractor-portal/services",
  "/contractor-portal/documents", "/messages", "/notifications", "/dashboard", "/start-here", "/ecosystem", "/workflow",
  "/automations", "/activity", "/network", "/map", "/network/map", "/profiles", "/providers", "/providers/:providerId",
  "/matching", "/network/service-areas", "/network/availability", "/network/eligibility", "/network/saved", "/community-hub",
  "/community/discussions", "/community/reviews", "/community/referrals", "/community/events", "/community/moderation",
  "/community/groups", "/help", "/tutorials", "/rules", "/profile", "/homeowner-portal/properties", "/homeowner-portal/matches",
  "/contractor-portal/team", "/analytics", "/hq/approvals", "/hq/system-health", "/settings/billing", "/leads", "/leads/:leadId",
  "/estimator", "/jobs", "/jobs/:jobId", "/calendar", "/settings", "/team", "/follow-ups", "/manual-communications",
  "/documents", "/call-center", "/hq/dedication", "/hq", "/operations", "/customer-experience"
];

test("every supported clickable route remains explicitly inventoried", () => {
  for (const route of expectedReachableRoutes) {
    assert.ok(router.includes('path="' + route + '"'), `Missing route contract for ${route}`);
  }
});

test("whole-app visual reference authority is loaded in authenticated style order", () => {
  assert.match(authenticatedEntry, /full-app-visual-reference-authority\.css/);
  assert.match(authority, /Whole-app HLC visual reference authority/);
  assert.match(authority, /no supported signed-in page should fall back to a white card wall/i);
  assert.match(authority, /section:has\(> article\)/);
  assert.match(authority, /input, select, textarea/);
  assert.match(authority, /Mobile is a reorganized workspace/);
});

test("visual authority preserves the canonical HLC and department accent contract", () => {
  assert.match(authority, /#2f80ff/i);
  assert.match(authority, /#f59e0b/i);
  assert.match(authority, /#6366f1/i);
  assert.match(authority, /#10b981/i);
});
