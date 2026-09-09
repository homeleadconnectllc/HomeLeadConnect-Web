import { createClient } from "@supabase/supabase-js";

// TEST ONLY. Never merge this branch.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;

if (!supabaseUrl || !anonKey || !email || !password) throw new Error("Missing Partner E2E environment.");

const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
if (signInError || !signedIn.user) throw signInError ?? new Error("Controlled Partner E2E login failed.");

const userId = signedIn.user.id;
const marker = `Partner E2E ${Date.now()}`;
const referredEmail = `homeleadconnect+partner-e2e-${Date.now()}@gmail.com`;

const { data: sourceId, error: sourceError } = await client.rpc("create_partner_source_by_email", {
  p_display_name: "HomeLead Connect Partner E2E",
  p_organization_name: "HomeLead Connect Test Partner",
  p_account_email: email,
});
if (sourceError) throw sourceError;
if (!sourceId) throw new Error("Partner source was not created.");

const { data: before, error: beforeError } = await client.rpc("get_partner_portal_data");
if (beforeError) throw beforeError;
if (!before?.source || before.source.id !== sourceId || before.source.status !== "active") throw new Error(`Partner portal source missing: ${JSON.stringify(before)}`);

const { data: referralId, error: referralError } = await client.rpc("partner_create_referral", {
  p_target_kind: "resident",
  p_referred_name: marker,
  p_referred_email: referredEmail,
  p_referred_phone: null,
  p_note: "Controlled Partner production E2E referral",
});
if (referralError) throw referralError;
if (!referralId) throw new Error("Partner referral was not created.");

const { data: portalData, error: portalError } = await client.rpc("get_partner_portal_data");
if (portalError) throw portalError;
const referral = (portalData?.referrals ?? []).find((row) => row.id === referralId);
if (!referral || referral.status !== "recorded" || referral.target_kind !== "resident") throw new Error(`Partner referral missing from portal: ${JSON.stringify(portalData)}`);

const { error: statusError } = await client.rpc("set_partner_referral_status", { p_referral_id: referralId, p_status: "qualified" });
if (statusError) throw statusError;

const { data: finalData, error: finalError } = await client.rpc("get_partner_portal_data");
if (finalError) throw finalError;
const finalReferral = (finalData?.referrals ?? []).find((row) => row.id === referralId);
if (!finalReferral || finalReferral.status !== "qualified") throw new Error(`Partner referral status did not persist: ${JSON.stringify(finalData)}`);

console.log("PARTNER_LIFECYCLE_E2E_PASS", JSON.stringify({ userId, sourceId, referralId, status: finalReferral.status }));
