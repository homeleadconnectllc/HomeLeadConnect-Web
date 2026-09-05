import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const providerNeutralRouting = readFileSync("supabase/migrations/20260829084500_provider_neutral_communication_routing.sql", "utf8");
const sendCommunication = readFileSync("supabase/functions/send-communication/index.ts", "utf8");
const communityHub = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const communityStore = readFileSync("src/components/community/CommunityStore.tsx", "utf8");

// Existing communications contracts above remain unchanged in behavior; this file
// intentionally preserves the assertions used by launch verification.

test("manual providers remain honest handoffs and unknown adapters never fall back to Twilio", () => {
  assert.match(providerNeutralRouting, /v_provider_status='manual_available'[\s\S]*then 'review'/);
  assert.match(sendCommunication, /providerConnection\?\.status === "manual_available"/);
  assert.match(sendCommunication, /delivery_mode: "manual_handoff"/);
  assert.match(sendCommunication, /providerName === "resend" && channel === "email"/);
  assert.match(sendCommunication, /providerName === "twilio" && \(channel === "sms" \|\| channel === "call"\)/);
  assert.match(sendCommunication, /PROVIDER_ADAPTER_NOT_INSTALLED/);
  assert.match(sendCommunication, /delivery_mode: providerConnection\?\.status === "manual_available" \? "manual_handoff" : "adapter_required"/);
  assert.doesNotMatch(sendCommunication, /const providerName = channel ===/);
});

test("Community Store is fulfillment-gated and never claims HomeLead Connect inventory or delivery", () => {
  assert.match(communityHub, /<CommunityStore \/>/);
  assert.match(communityHub, />HomeLead Connect Store</);
  assert.match(communityStore, /VITE_HLC_MERCH_STORE_URL/);
  assert.match(communityStore, /third-party fulfillment provider/i);
  assert.match(communityStore, /does not represent an item as stocked, printed, shipped or delivered/i);
  assert.match(communityStore, /Checkout unavailable · storefront connection pending/);
  assert.match(communityStore, /role="status"/);
  assert.doesNotMatch(communityStore, /<button[^>]*disabled[\s\S]*Checkout/);
});
