import assert from "node:assert/strict";
import test from "node:test";
import { canonicalizeContactEndpoint, requireUnambiguousContactIdentity, resolveContactIdentity } from "../lib/contactIdentity.ts";

test("canonical phone identity collapses common US formatting", () => {
  const a = canonicalizeContactEndpoint("phone", "(717) 555-0123");
  const b = canonicalizeContactEndpoint("phone", "+1 717-555-0123");
  assert.equal(a?.canonicalKey, "phone:+17175550123");
  assert.equal(a?.canonicalKey, b?.canonicalKey);
});

test("canonical email identity trims and compares case-insensitively", () => {
  const endpoint = canonicalizeContactEndpoint("email", " Resident@Example.COM ");
  assert.equal(endpoint?.canonicalKey, "email:resident@example.com");
  assert.equal(canonicalizeContactEndpoint("email", "bad@example.com\r\nBcc:x"), null);
});

test("identity resolution returns one canonical person across endpoint formatting", () => {
  const result = resolveContactIdentity("phone", "7175550123", [
    { personId: "person-1", phones: ["+1 (717) 555-0123"], emails: ["resident@example.com"] },
    { personId: "person-2", phones: ["+1 717 555 9999"], emails: ["other@example.com"] },
  ]);
  assert.equal(result?.status, "matched");
  assert.deepEqual(result?.personIds, ["person-1"]);
});

test("shared endpoint is ambiguous and cannot silently attach to a person", () => {
  const result = resolveContactIdentity("email", "shared@example.com", [
    { personId: "person-1", emails: ["shared@example.com"] },
    { personId: "person-2", emails: ["SHARED@example.com"] },
  ]);
  assert.equal(result?.status, "ambiguous");
  assert.throws(() => requireUnambiguousContactIdentity(result), /more than one person/);
});
