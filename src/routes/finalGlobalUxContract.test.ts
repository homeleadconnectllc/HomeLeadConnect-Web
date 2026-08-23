import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/styles/app-shell-entry.ts", "utf8");
const ux = readFileSync("src/styles/final-global-ux-contract.css", "utf8");
const flat = readFileSync("src/styles/final-flat-geometry-contract.css", "utf8");
const map = readFileSync("src/pages/dashboard/ProviderMap.tsx", "utf8");
const leads = readFileSync("src/pages/dashboard/Leads.tsx", "utf8");
const leadCard = readFileSync("src/components/leads/LeadCard.tsx", "utf8");
const requestService = readFileSync("src/pages/RequestService.tsx", "utf8");
const professionalApplication = readFileSync("src/pages/ProfessionalApplication.tsx", "utf8");

test("final UX contract mounts after flat geometry authority", () => {
  const flatIndex = shell.indexOf("./final-flat-geometry-contract.css");
  const uxIndex = shell.indexOf("./final-global-ux-contract.css");
  assert.ok(flatIndex >= 0);
  assert.ok(uxIndex > flatIndex);
});

test("large signed-in surfaces remain dark and individual records have boundaries", () => {
  assert.match(ux, /--hlc-ux-surface:\s*#0d1f3a/i);
  assert.match(ux, /article,[\s\S]*record-row[\s\S]*border-left:\s*3px solid #3b82f6/i);
  assert.match(ux, /button:not\([\s\S]*background:\s*#112744\s*!important[\s\S]*color:\s*#ffffff/i);
});

test("forms use labeled white controls with dark ink and clear focus", () => {
  assert.match(ux, /label[\s\S]*--hlc-ux-label/i);
  assert.match(ux, /background:\s*#ffffff\s*!important[\s\S]*--hlc-ux-control-ink/i);
  assert.match(ux, /outline:\s*3px solid rgba\(96,165,250,.28\)/i);
});

test("large cards are flat while compact semantic indicators may remain circular", () => {
  assert.match(flat, /--hlc-radius-surface:\s*2px/);
  assert.match(flat, /--hlc-radius-control:\s*4px/);
  assert.match(flat, /badge[\s\S]*999px/i);
});

test("provider map is address-first and hides coordinates behind an advanced control", () => {
  assert.match(map, /providerAddress\(selected\)/);
  assert.match(map, /Open recorded address in map/);
  assert.match(map, /Advanced: verify exact map point/);
  assert.match(map, /HVAC, mover, cleaner/);
});

test("renters and household type are first-class intake and lead context", () => {
  assert.match(requestService, /Resident \/ customer type/);
  assert.match(requestService, /<option>Renter<\/option>/);
  assert.match(leads, /Resident \/ customer type/);
  assert.match(leads, /\[Resident type: \$\{residentType\}\]/);
  assert.match(leadCard, /residentTypeFromNotes/);
});

test("professional intake names broad service trades including movers cleaners and HVAC", () => {
  assert.match(professionalApplication, /Moving \/ hauling/);
  assert.match(professionalApplication, /Cleaning \/ housekeeping/);
  assert.match(professionalApplication, /HVAC \/ heating \/ cooling/);
  assert.match(professionalApplication, /General contractor/);
  assert.match(professionalApplication, /Subcontractor/);
});
