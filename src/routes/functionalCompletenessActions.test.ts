import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const launchSurface = fs.readFileSync(new URL("../pages/dashboard/LaunchSurface.tsx", import.meta.url), "utf8");
const ecosystemRecords = fs.readFileSync(new URL("../api/ecosystemRecords.ts", import.meta.url), "utf8");

test("provider service-area UI requires explicit territory input instead of a hardcoded state mutation", () => {
  assert.doesNotMatch(launchSurface, /Add PA service area/);
  assert.doesNotMatch(launchSurface, /saveServiceArea\(\{contractorId:id,state:"PA"\}\)/);
  assert.match(launchSurface, /Add service territory/);
  assert.match(launchSurface, /Save service area/);
  assert.match(launchSurface, /Enter a city, state, or ZIP before saving a service area\./);
  assert.match(launchSurface, /radiusMiles/);
});

test("service-area persistence accepts actual city, state, ZIP, and radius fields", () => {
  assert.match(ecosystemRecords, /saveServiceArea\(input:\{contractorId:number;city\?:string;state\?:string;zip\?:string;radiusMiles\?:number\}\)/);
  assert.match(ecosystemRecords, /city:input\.city\?\.trim\(\)\|\|null/);
  assert.match(ecosystemRecords, /state:input\.state\?\.trim\(\)\|\|null/);
  assert.match(ecosystemRecords, /zip:input\.zip\?\.trim\(\)\|\|null/);
});

test("availability action can represent both available and unavailable states", () => {
  assert.match(launchSurface, /Mark unavailable/);
  assert.match(launchSurface, /Mark available/);
  assert.match(launchSurface, /setAvail\(p\.id,!av\?\.available\)/);
});
