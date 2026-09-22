import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const register = readFileSync("docs/sprints/route-state-register-current.md", "utf8");

test("route inventory preserves composed route elements and separate route rows", () => {
  assert.match(register, /`\/contact`[^\n]+`<MainSiteOnly><ContactPage\/><\/MainSiteOnly>`/);
  assert.match(register, /`\/request-service`[^\n]+`<RequestService\/>`/);
  assert.doesNotMatch(register, /<Route path=/);
});
