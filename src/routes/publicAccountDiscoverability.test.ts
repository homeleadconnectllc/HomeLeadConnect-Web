import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");

test("canonical public root exposes approved account-access entry points", () => {
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/login"[^>]*>Sign In<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/register"[^>]*>Get Started(?: →)?<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Request home service<\/a>/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Request service<\/a>/);
});

test("parser-seeded public shell preserves the Connected Experience first-paint contract", () => {
  assert.match(index, /class="hlc-v2-home hlc-v2-parser-seed"/);
  assert.match(index, /src="\/hlc-logo-real\.webp"/);
  assert.doesNotMatch(index, /src="\/hlc-logo-public\.webp"/);
  assert.doesNotMatch(index, /<img[^>]+src="\/hlc-logo-ui\.png"/);
  assert.match(index, /href="https:\/\/app\.homeleadconnect\.org\/request-service"[^>]*>Request home service<\/a>/);
  assert.match(index, /The Connected Experience/);
  assert.match(index, /One place for the next right move\./);
  assert.match(index, /Request service, find the right people, and keep the work connected from first conversation to follow-through\./);
  assert.match(index, /Meet the mission →/);
  assert.match(index, /Four Pathways/);
  assert.doesNotMatch(index, /Homes\. People\. Opportunity\./);
  assert.doesNotMatch(index, /A stronger community <span style="color:#42b7ff">starts at home\.<\/span>/);
});

test("canonical account routes remain declared for the public access flow", () => {
  assert.match(router, /path="\/login" element={<Login\/>}/);
  assert.match(router, /path="\/register" element={<Register\/>}/);
});
