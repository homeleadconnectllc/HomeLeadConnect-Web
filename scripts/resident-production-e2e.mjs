import { createClient } from "@supabase/supabase-js";

// TEST ONLY. Never merge this branch.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;
const leadId = 36;
const contractorId = 5;

if (!supabaseUrl || !anonKey || !email || !password) throw new Error("Missing Resident E2E environment.");

const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
if (signInError || !signedIn.user) throw signInError ?? new Error("Controlled Resident E2E login failed.");

const userId = signedIn.user.id;

// Verify the controlled identity is genuinely linked to the Resident fixture.
const { data: portalBefore, error: portalBeforeError } = await client.rpc("get_homeowner_portal_data");
if (portalBeforeError) throw portalBeforeError;
const relationshipBefore = (portalBefore ?? []).find((row) => Number(row.lead_id) === leadId);
if (!relationshipBefore) throw new Error(`Controlled identity is not linked to Resident lead ${leadId}: ${JSON.stringify(portalBefore)}`);

// Owner/manager-side action: create one controlled provider match through the governed RPC.
const { data: matchId, error: matchError } = await client.rpc("create_resident_provider_match", {
  p_lead_id: leadId,
  p_contractor_id: contractorId,
  p_rationale: "Resident production E2E controlled provider match",
});
if (matchError) throw matchError;
if (!matchId) throw new Error("Resident provider match was not created.");

// Resident-side read: the same authenticated identity must see only its linked match.
const { data: proposedMatches, error: proposedError } = await client.rpc("get_homeowner_portal_matches");
if (proposedError) throw proposedError;
const proposed = (proposedMatches ?? []).find((row) => row.id === matchId);
if (!proposed || proposed.status !== "proposed" || Number(proposed.lead_id) !== leadId || Number(proposed.provider?.id) !== contractorId) {
  throw new Error(`Resident could not see proposed provider match: ${JSON.stringify(proposedMatches)}`);
}

// Resident-side decision through the portal-authorized RPC.
const { data: decision, error: decisionError } = await client.rpc("homeowner_decide_provider_match", {
  p_match_id: matchId,
  p_decision: "accepted",
});
if (decisionError) throw decisionError;
if (decision !== "accepted") throw new Error(`Resident provider decision failed: ${JSON.stringify(decision)}`);

const { data: finalMatches, error: finalMatchError } = await client.rpc("get_homeowner_portal_matches");
if (finalMatchError) throw finalMatchError;
const finalMatch = (finalMatches ?? []).find((row) => row.id === matchId);
if (!finalMatch || finalMatch.status !== "accepted") {
  throw new Error(`Accepted resident provider match missing from portal: ${JSON.stringify(finalMatches)}`);
}

// Relationship data must still expose the core Resident lifecycle surfaces.
const { data: portalData, error: portalError } = await client.rpc("get_homeowner_portal_data");
if (portalError) throw portalError;
const relationship = (portalData ?? []).find((row) => Number(row.lead_id) === leadId);
if (!relationship) throw new Error(`Resident portal relationship missing for lead ${leadId}: ${JSON.stringify(portalData)}`);
if (!Array.isArray(relationship.estimates) || relationship.estimates.length < 1) throw new Error("Resident portal estimates are missing.");
if (!Array.isArray(relationship.jobs) || relationship.jobs.length < 1) throw new Error("Resident portal jobs are missing.");
if (!relationship.jobs.some((job) => Array.isArray(job.appointments) && job.appointments.length > 0)) throw new Error("Resident portal appointments are missing.");

const { data: reviews, error: reviewError } = await client.rpc("list_homeowner_reviews");
if (reviewError) throw reviewError;
if (!(reviews ?? []).some((review) => Number(review.rating) === 5)) throw new Error(`Resident review history missing: ${JSON.stringify(reviews)}`);

console.log("RESIDENT_LIFECYCLE_E2E_PASS", JSON.stringify({
  userId,
  leadId,
  contractorId,
  matchId,
  estimateCount: relationship.estimates.length,
  jobCount: relationship.jobs.length,
  reviewCount: (reviews ?? []).length,
}));
