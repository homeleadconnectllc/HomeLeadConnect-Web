import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync("src/main.tsx", "utf8");
const pattern = main.match(/const isPublicSiteRoute = !isAppHost && (\/.+\/)\.test\(pathname\);/)?.[1];
assert.ok(pattern, "public stylesheet entry classifier must be inspectable");
const publicRoute = new RegExp(pattern.slice(1, -1));

test("public stylesheet classification does not swallow protected route descendants", () => {
  for (const route of ["/community/discover", "/community/reviews", "/community/swipe", "/partners/manage", "/dashboard"]) {
    assert.equal(publicRoute.test(route), false, route);
  }
  for (const route of ["/community", "/community/", "/partners", "/homeowners", "/residents", "/professional-application", "/privacy"]) {
    assert.equal(publicRoute.test(route), true, route);
  }
});
