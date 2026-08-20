import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authProvider = readFileSync("src/context/AuthContext.tsx", "utf8");
const accountAccessProvider = readFileSync("src/context/AccountAccessProvider.tsx", "utf8");

test("auth bootstrap cannot leave the application stuck loading after a session lookup failure", () => {
  assert.match(authProvider, /void supabase\.auth\.getSession\(\)\.then\(/);
  assert.match(authProvider, /setSession\(error \? null : data\.session\)/);
  assert.match(authProvider, /\(\) => \{[\s\S]*setSession\(null\);[\s\S]*setLoading\(false\);/);
});

test("auth state updates stop after provider teardown", () => {
  assert.match(authProvider, /let active = true/);
  assert.match(authProvider, /if \(!active\) return/);
  assert.match(authProvider, /active = false;[\s\S]*subscription\.unsubscribe\(\)/);
});

test("account access remains fail-closed when workspace or portal resolution errors", () => {
  assert.match(accountAccessProvider, /const failed = Boolean\(business\.error \|\| homeowner\.error \|\| contractor\.error \|\| profile\.error\)/);
  assert.match(accountAccessProvider, /business: !failed && Boolean\(business\.data\?\.length\)/);
  assert.match(accountAccessProvider, /role: failed \? null : normalizeInternalRole/);
  assert.match(accountAccessProvider, /error: failed/);
});
