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
const normalizedEmail = signedIn.user.email?.toLowerCase();
if (!normalizedEmail) throw new Error("Controlled test account has no email.");

const { data: invitationRows, error: invitationError } = await client.rpc("create_portal_invitation", {
  p_issued_by: userId,
  p_portal_role: "homeowner",
  p_target_id: String(leadId),
  p_intended_email: normalizedEmail,
  p_expires_in_minutes: 60,
});
if (invitationError) throw invitationError;
const invitation = Array.isArray(invitationRows) ? invitationRows[0] : null;
if (!invitation?.invitation_token || !invitation?.invitation_id) throw new Error(`Resident invitation was not created: ${JSON.stringify(invitationRows)}`);

const { data: acceptedRows, error: acceptError } = await client.rpc("accept_portal_invitation", {
  p_invitation_token: invitation.invitation_token,
});
if (acceptError) throw acceptError;
const accepted = Array.isArray(acceptedRows) ? acceptedRows[0] : null;
if (accepted?.portal_role !== "homeowner" || Number(accepted?.target_id) !== leadId) {
  throw new Error(`Resident invitation acceptance mismatch: ${JSON.stringify(acceptedRows)}`);
}

const { data: matchId, error: matchError } = await client.rpc("create_resident_provider_match", {
  p_lead_id: leadId,
  p_contractor_id: contractorId,
  p_rationale: "Resident production E2E controlled provider match",
});
if (matchError) throw matchError;
if (!matchId) throw new Error("Resident provider match was not created.");

const { data: proposedMatches, error: proposedError } = await client.rpc("get_homeowner_portal_matches");
if (proposedError) throw proposedError;
const proposed = (proposedMatches ?? []).find((row) => row.id === matchId);
if (!proposed || proposed.status !== "proposed" || Number(proposed.lead_id) !== leadId || Number(proposed.provider?.id) !== contractorId) {
  throw new Error(`Resident could not see proposed provider match: ${JSON.stringify(proposedMatches)}`);
}

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
  invitationId: invitation.invitation_id,
  leadId,
  contractorId,
  matchId,
  estimateCount: relationship.estimates.length,
  jobCount: relationship.jobs.length,
  reviewCount: (reviews ?? []).length,
}));
