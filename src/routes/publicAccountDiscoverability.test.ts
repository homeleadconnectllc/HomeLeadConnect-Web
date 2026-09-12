import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");

test("canonical public root exposes the V2 account-access entry points", () => {
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/login"[^>]*>Sign In<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/register"[^>]*>Create My HomeLead Connect Account<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Get Help Now<\/a>/);
});

test("parser-seeded public shell preserves the canonical V2 first-paint contract", () => {
  assert.match(index, /class="hlc-v2-home hlc-v2-parser-seed"/);
  assert.match(index, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Get Help Now<\/a>/);
  assert.match(index, /hlc-frontdoor-resident-hero-final\.jpg/);
  assert.match(index, /Real People\.<br \/>.*Real Opportunity\./);
});

test("canonical account routes remain declared for the public access flow", () => {
  assert.match(router, /path="\/login" element={<Login\/>}/);
  assert.match(router, /path="\/register" element={<Register\/>}/);
});
