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
  for (const required of [
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
  ]) {
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
