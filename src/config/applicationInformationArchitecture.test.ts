import assert from "node:assert/strict";
import test from "node:test";
import {
  applicationNavigation,
  automationTemplateLibrary,
  carrdPublicSites,
  goldenWorkflowStages,
  mobilePrimaryNavigation,
  settingsArchitecture,
} from "./applicationInformationArchitecture.ts";
import { ecosystemNavigation } from "./navigationPlacement.ts";

test("mobile navigation stays limited to five top-level destinations", () => {
  assert.deepEqual(
    mobilePrimaryNavigation.map((item) => item.label),
    ["Home", "Work", "Network", "Community", "More"],
  );
  assert.equal(mobilePrimaryNavigation.length, 5);
});

test("application navigation uses exactly the locked five parent groups", () => {
  assert.deepEqual(
    applicationNavigation.map((group) => group.id),
    ["home", "work", "network", "community", "more"],
  );
});

test("all routed application pages are unique inside the IA registry", () => {
  const routedItems = applicationNavigation.flatMap((group) => group.items.map((item) => item.route));
  const duplicates = routedItems.filter((route, index) => routedItems.indexOf(route) !== index);
  assert.deepEqual(duplicates, []);
});

test("production navigation exposes major E1-E7 destinations under their intended parents", () => {
  const routeToGroup = new Map(
    ecosystemNavigation.flatMap((group) => group.pages.map((item) => [item.route, group.id] as const)),
  );
  const requiredRoutes = [
    "/work",
    "/analytics",
    "/matching",
    "/community/discover",
    "/community/messages",
    "/community/challenges",
    "/community/academy",
    "/community/groups",
    "/resources",
    "/resources/materials",
    "/resources/suppliers",
    "/resources/forms",
    "/academy",
    "/academy/roleplay",
    "/academy/library",
  ];
  for (const route of requiredRoutes) {
    assert.ok(routeToGroup.has(route), `production navigation is missing ${route}`);
  }
  assert.equal(routeToGroup.get("/matching"), "community");
  assert.equal(routeToGroup.get("/analytics"), "analytics");
  assert.equal(routeToGroup.get("/academy"), "academy");
  assert.equal(routeToGroup.get("/academy/roleplay"), "academy");
  assert.equal(routeToGroup.get("/resources"), "resources");
  assert.equal(routeToGroup.get("/community/discover"), "community");
  assert.equal(routeToGroup.get("/messages"), "messages");

  const routes = ecosystemNavigation.flatMap((group) => group.pages.map((item) => item.route));
  const duplicates = routes.filter((route, index) => routes.indexOf(route) !== index);
  assert.deepEqual(duplicates, []);
});

test("golden workflow preserves the canonical HLC service lifecycle", () => {
  assert.deepEqual(goldenWorkflowStages, [
    "Request",
    "Qualify",
    "Estimate",
    "Match",
    "Schedule",
    "Job",
    "Complete",
    "Payment",
    "Review",
    "Referral / Repeat",
  ]);
});

test("settings are centralized into the locked administration categories", () => {
  const labels = settingsArchitecture.map((section) => section.label);
  const requiredLabels: Array<(typeof labels)[number]> = [
    "Account",
    "Workspace",
    "Work",
    "Matching",
    "Communications",
    "Notifications",
    "Automation",
    "Integrations",
    "Payments & Billing",
    "AI",
    "Community",
    "Privacy & Security",
    "Appearance",
    "Help",
  ];
  for (const required of requiredLabels) {
    assert.ok(labels.includes(required), `missing settings category: ${required}`);
  }
});

test("automation template library covers every locked operating domain", () => {
  assert.deepEqual(Object.keys(automationTemplateLibrary), [
    "leads",
    "estimates",
    "matching",
    "scheduling",
    "jobs",
    "customerExperience",
    "billing",
    "operations",
  ]);
});

test("Carrd public surface stays consolidated to exactly ten sites", () => {
  assert.equal(carrdPublicSites.length, 10);
  assert.equal(new Set(carrdPublicSites.map((site) => site.id)).size, 10);
  assert.equal(new Set(carrdPublicSites.map((site) => site.url)).size, 10);
});