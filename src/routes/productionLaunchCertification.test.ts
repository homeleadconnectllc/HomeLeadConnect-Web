import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const wrangler = readFileSync("wrangler.jsonc", "utf8");
const redirects = readFileSync("public/_redirects", "utf8");
const workflow = readFileSync(".github/workflows/cloudflare-production-verification.yml", "utf8");

test("production host is Cloudflare Pages with SPA deep-link fallback", () => {
  assert.match(wrangler, /"name": "homeleadconnect-web"/);
  assert.match(wrangler, /"pages_build_output_dir": "\.\/dist"/);
  assert.equal(redirects.trim(), "/* /index.html 200");
  assert.match(workflow, /https:\/\/app\.homeleadconnect\.org/);
  assert.match(workflow, /https:\/\/homeleadconnect-web\.pages\.dev/);
  assert.doesNotMatch(workflow, /NETLIFY_AUTH_TOKEN|api\.netlify\.com|Netlify production/);
});

test("integrated production workflow exercises representative public and authenticated routes", () => {
  for (const path of ["/login", "/dashboard", "/messages", "/jobs", "/calendar", "/community-hub", "/documents", "/hq"]) {
    assert.match(workflow, new RegExp(`app\\.homeleadconnect\\.org${path.replace("/", "\\/")}`));
  }
});

test("launch-critical application routes remain lazy and protected by the workspace router", () => {
  assert.match(router, /BrowserRouter/);
  assert.match(router, /ProtectedLayout/);
  assert.match(router, /WorkspaceLayout/);
  for (const route of ["dashboard", "leads", "jobs", "calendar", "follow-ups", "documents", "call-center", "hq", "operations", "customer-experience"]) {
    assert.match(router, new RegExp(`path="\\/${route.replace("/", "\\/")}"`));
  }
});
