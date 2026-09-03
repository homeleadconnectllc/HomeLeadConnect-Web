import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const resident = readFileSync("src/pages/portal/HomeownerPortal.tsx", "utf8");
const professional = readFileSync("src/pages/portal/ContractorPortal.tsx", "utf8");
const partner = readFileSync("src/pages/portal/PartnerPortal.tsx", "utf8");
const portalResources = readFileSync("src/pages/portal/PortalResources.tsx", "utf8");
const catalog = readFileSync("src/data/roleResourceCatalog.ts", "utf8");
const portalCollections = readFileSync("src/data/portalResourceCollections.ts", "utf8");
const sourcing = readFileSync("src/pages/dashboard/ResourcesWorkspace.tsx", "utf8");

test("Resources exposes distinct resident professional partner and internal surfaces", () => {
  assert.match(router, /homeowner-portal\/resources[^\n]*PortalResources audience="resident"/);
  assert.match(router, /contractor-portal\/resources[^\n]*PortalResources audience="professional"/);
  assert.match(router, /partner-portal\/resources[^\n]*PortalResources audience="partner"/);
  assert.match(router, /resources\/playbook[^\n]*PortalResources audience="internal"/);
  assert.match(resident, /homeowner-portal\/resources/);
  assert.match(professional, /contractor-portal\/resources/);
  assert.match(partner, /partner-portal\/resources/);
});

test("Resources keeps portal content separated by audience instead of one generic catalog", () => {
  assert.match(catalog, /"resident" \| "professional" \| "partner" \| "internal" \| "shared"/);
  assert.match(portalResources, /RESIDENT_DIRECTORY_RESOURCES/);
  assert.match(portalResources, /PROFESSIONAL_PORTAL_RESOURCES/);
  assert.match(portalResources, /PARTNER_PORTAL_RESOURCES/);
  assert.match(portalResources, /HOMELEAD_SCRIPT_LIBRARY/);
});

test("resident resources are geography-aware and do not treat Pennsylvania as global", () => {
  assert.match(catalog, /geography\?: ResourceGeography/);
  assert.match(catalog, /countries: \["US"\], regions: \["PA"\]/);
  assert.match(catalog, /Pennsylvania-only resource/);
  assert.match(catalog, /country, region, or locality instead of treating Pennsylvania as the default/);
});

test("Resources data is ready for shared language and speech infrastructure without claiming it exists", () => {
  assert.match(catalog, /sourceLanguage: string/);
  assert.match(catalog, /translatedLanguages\?: readonly string\[\]/);
  assert.match(catalog, /textToSpeechReady\?: boolean/);
  assert.match(catalog, /structured for translation and language selection/);
  assert.match(catalog, /compatible with text-to-speech/);
});

test("professional sourcing remains available as a child of Resources", () => {
  assert.match(sourcing, /loadResourceWorkspace\(\)/);
  assert.match(sourcing, /setResourceSaved\(id, !saved\)/);
  assert.match(sourcing, /saveMaterialPlanItem/);
  assert.match(sourcing, /resources\/suppliers/);
  assert.match(sourcing, /resources\/materials/);
  assert.match(sourcing, /resources\/playbook/);
  assert.match(portalCollections, /Supplier and material workspace/);
});

test("user-facing Resources branding uses HomeLead Connect rather than the acronym", () => {
  assert.doesNotMatch(sourcing, />HLC</);
  assert.doesNotMatch(portalResources, />HLC</);
  assert.match(sourcing, /HomeLead Connect/);
  assert.match(portalResources, /HomeLead Connect/);
});
