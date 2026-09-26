import assert from "node:assert/strict";
import test from "node:test";
import { emailHref, normalizePhoneTarget, phoneHref, smsHref } from "../lib/contactTargets.ts";

test("phone and SMS targets normalize display punctuation without losing international prefix", () => {
  assert.equal(normalizePhoneTarget("(717) 555-1212"), "7175551212");
  assert.equal(normalizePhoneTarget("+1 (717) 555-1212"), "+17175551212");
  assert.equal(phoneHref("717-555-1212"), "tel:7175551212");
  assert.equal(smsHref("(717) 555-1212"), "sms:7175551212");
});

test("blank communication targets never produce actionable links", () => {
  assert.equal(phoneHref("   "), "");
  assert.equal(smsHref(null), "");
  assert.equal(emailHref(""), "");
});

test("email targets are trimmed and safely encoded", () => {
  assert.equal(emailHref(" resident+home@example.com "), "mailto:resident%2Bhome%40example.com");
});

test("provider email sends remain server-resolved instead of trusting a client destination", async () => {
  const { readFile } = await import("node:fs/promises");
  const messages = await readFile("src/api/messages.ts", "utf8");
  assert.doesNotMatch(messages, /normalizeEmailTarget\(input\.recipient\.email\)/);
  assert.doesNotMatch(messages, /recipientEmail,/);
  assert.match(messages, /functions\.invoke\("send-communication"/);
});
