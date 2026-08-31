import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");

test("public home exposes explicit sign-in and account-creation actions", () => {
  assert.match(home, /href="\/login"[^>]*>Sign In<\/a>/);
  assert.match(home, /href="\/register"[^>]*>Create Account<\/a>/);
  assert.match(home, /href="\/register"[^>]*>Create My HLC Account<\/a>/);
});

test("canonical public account routes remain declared", () => {
  assert.match(router, /path="\/login" element={<Login\/>}/);
  assert.match(router, /path="\/register" element={<Register\/>}/);
});
