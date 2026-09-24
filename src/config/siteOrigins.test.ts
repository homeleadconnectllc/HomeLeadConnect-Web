import assert from "node:assert/strict";
import test from "node:test";
import { resolveSiteOrigins } from "./siteOrigins.ts";

test("temporary Cloudflare preview keeps public and app journeys on the isolated preview origin", () => {
  assert.deepEqual(resolveSiteOrigins("720f09a0.homeleadconnect-web.pages.dev", "https://720f09a0.homeleadconnect-web.pages.dev"), {
    publicOrigin: "https://720f09a0.homeleadconnect-web.pages.dev",
    appOrigin: "https://720f09a0.homeleadconnect-web.pages.dev",
  });
});

test("the two canonical production domains retain their distinct destinations", () => {
  for (const hostname of ["homeleadconnect.org", "app.homeleadconnect.org"]) {
    assert.deepEqual(resolveSiteOrigins(hostname, `https://${hostname}`), {
      publicOrigin: "https://homeleadconnect.org",
      appOrigin: "https://app.homeleadconnect.org",
    });
  }
});
