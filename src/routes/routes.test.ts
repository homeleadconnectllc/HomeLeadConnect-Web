import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const publicCopy = ["src/pages/HomePage.tsx", "src/pages/PublicInfo.tsx", "src/pages/ContactPage.tsx", "src/pages/Legal.tsx"]
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

const definedRoutes = new Set([...router.matchAll(/path="([^"]+)"/g)].map((match) => match[1]));

test("every launch navigation link resolves to a declared route", () => {
  const navigation = `${navbar}\n${footer}`;
  const targets = [...navigation.matchAll(/to="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(targets.length > 0);
  for (const target of targets) assert.ok(definedRoutes.has(target), `Missing route for navigation target ${target}`);
});

test("canonical protected AI routes remain declared once", () => {
  for (const route of ["/hq", "/operations", "/customer-experience"]) {
    assert.equal([...router.matchAll(new RegExp(`path="${route}"`, "g"))].length, 1);
  }
});

test("canonical golden workflow route remains declared once", () => {
  assert.equal([...router.matchAll(/path="\/workflow"/g)].length, 1);
});

test("every canonical ecosystem destination has one declared route", () => {
  const routes = [
    "/network", "/map", "/profiles", "/providers", "/matching", "/community-hub",
    "/community/discussions", "/community/reviews", "/community/referrals",
    "/community/events", "/community/moderation", "/help", "/tutorials", "/rules",
    "/profile", "/settings/billing",
  ];
  for (const route of routes) {
    assert.equal([...router.matchAll(new RegExp(`path="${route}"`, "g"))].length, 1, `Expected one route for ${route}`);
  }
});

test("public production copy uses the locked company contact identity", () => {
  assert.match(publicCopy, /HomeLead Connect LLC/);
  assert.match(publicCopy, /Antoine Washington/);
  assert.match(publicCopy, /homeleadconnect@gmail\.com/);
  assert.match(publicCopy, /717-288-1785/);
  assert.doesNotMatch(publicCopy, /info@homeleadconnect\.(?:org|com)/i);
});

test("launch navigation contains no placeholder href targets", () => {
  assert.doesNotMatch(`${navbar}\n${footer}`, /href="#"/);
});
