import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");

test("canonical public root exposes the public account-access entry point", () => {
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/login"[^>]*>Login<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Request Service<\/a>/);
});

test("parser-seeded public shell preserves the canonical public-home first-paint contract", () => {
  assert.match(index, /class="hlc-frontdoor-nav"/);
  assert.match(index, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Request Home Service/);
  assert.match(index, /href="https:\/\/professionals\.homeleadconnect\.org\/"[^>]*>For Professionals<\/a>/);
  assert.match(index, /hlc-frontdoor-resident-hero-final\.jpg/);
});

test("canonical account routes remain declared for the public access flow", () => {
  assert.match(router, /path="\/login" element={<Login\/>}/);
  assert.match(router, /path="\/register" element={<Register\/>}/);
});
