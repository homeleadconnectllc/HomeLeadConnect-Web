import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { normalizePhoneTarget, phoneHref } from "../lib/contactTargets.ts";

const manual = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const api = readFileSync("src/api/manualCommunications.ts", "utf8");
const callCenter = readFileSync("src/pages/dashboard/CallCenter.tsx", "utf8");

test("the selected Resident Test phone stays the native device destination", () => {
  assert.equal(normalizePhoneTarget("7175519897"), "7175519897");
  assert.equal(phoneHref("7175519897"), "tel:7175519897");
  assert.match(api, /normalizeNativePhoneTarget = normalizePhoneTarget/);
  assert.match(manual, /nativeTarget = selected \? normalizeNativePhoneTarget\(selected\.phone\) : ""/);
  assert.match(manual, /canHandoff = direction === "outbound" && check\?\.decision === "ALLOW" && Boolean\(nativeTarget\)/);
  assert.match(manual, /href=\{`\$\{channel === "call" \? "tel" : "sms"\}:\$\{nativeTarget\}`\}/);
});

test("the operator sees the selected number for Google Voice entry, with no company-number bridge", () => {
  assert.match(manual, /navigator\.clipboard\.writeText\(nativeTarget\)/);
  assert.match(manual, /value=\{nativeTarget\}/);
  assert.match(manual, /\{canHandoff && transport === "google_voice" &&/);
  assert.match(manual, /does not pass it automatically or call through the company number/);
  assert.match(manual, /href="https:\/\/voice\.google\.com\/"/);
  assert.doesNotMatch(callCenter, /href=\{`tel:\$\{phone\.phone_number\}`\}/);
  assert.match(callCenter, /dialing the company line will not connect you to the selected contact/);
});
