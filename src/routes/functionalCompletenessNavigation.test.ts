import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const ecosystem = readFileSync("src/config/ecosystem.ts", "utf8");

test("canonical Ecosystem workspace is routed and discoverable from signed-in navigation", () => {
  assert.match(router, /path="\/ecosystem"/);
  assert.match(ecosystem, /label: "Ecosystem", route: "\/ecosystem"/);
  assert.match(navbar, /"\/dashboard", "\/ecosystem", "\/workflow"/);
});

test("navigation only exposes canonical signed-in routes through the declared route boundary", () => {
  assert.match(navbar, /declaredWorkspaceRoutes\.has\(page\.route\)/);
  assert.match(navbar, /canAccessWorkspacePath\(access\.role, page\.route\)/);
});
