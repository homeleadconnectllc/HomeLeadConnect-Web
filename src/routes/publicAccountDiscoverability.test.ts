import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");

test("canonical public root exposes Family/Ecosystem account-access entry points", () => {
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/login"[^>]*>Sign In<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/register"[^>]*>Get Started(?: →)?<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Request Service<\/a>/);
});

test("parser-seeded public shell preserves the Family/Ecosystem first-paint contract", () => {
  assert.match(index, /class="hlc-v2-home hlc-v2-parser-seed"/);
  assert.match(index, /rel="icon" type="image\/png" href="\/hlc-logo-transparent\.png"/);
  assert.match(index, /<img[^>]+src="\/hlc-logo-ui\.png"/);
  assert.doesNotMatch(index, /\/hlc-icon\.jpeg/);
  assert.match(index, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Request Service<\/a>/);
  assert.match(index, /hlc-frontdoor-resident-hero-v2\.webp/);
  assert.match(index, /Homes\. People\. Opportunity\./);
  assert.match(index, /A stronger community <span style="color:#42b7ff">starts at home\.<\/span>/);
  assert.match(index, /Four Pathways/);
});

test("canonical account routes remain declared for the public access flow", () => {
  assert.match(router, /path="\/login" element={<Login\/>}/);
  assert.match(router, /path="\/register" element={<Register\/>}/);
});
