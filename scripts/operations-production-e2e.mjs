import { createClient } from "@supabase/supabase-js";

// TEST ONLY. Never merge this branch.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;

if (!supabaseUrl || !anonKey || !email || !password) throw new Error("Missing Operations E2E environment.");

const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
if (signInError || !signedIn.user) throw signInError ?? new Error("Controlled Operations E2E login failed.");

// Anchor this exact authenticated identity on a production read already proven for the same account.
const { data: partnerData, error: partnerError } = await client.rpc("get_partner_portal_data");
if (partnerError) throw partnerError;
if (!partnerData?.source?.id) throw new Error("Controlled Operations E2E identity anchor is missing.");

const marker = `operations-e2e-${Date.now()}`;
const { data: dispositionId, error: dispositionError } = await client.rpc("record_operations_exception_disposition", {
  p_source_type: "e2e_probe",
  p_source_id: marker,
  p_disposition: "resolved",
  p_note: "Controlled production operations E2E proof",
  p_affected_route: "/operations",
});
if (dispositionError) throw dispositionError;
if (!dispositionId) throw new Error("Operations disposition was not recorded.");

const { data: rows, error: listError } = await client.rpc("list_operations_exception_dispositions", { p_limit: 100 });
if (listError) throw listError;
const found = (rows ?? []).find((row) => row.id === dispositionId);
if (!found) throw new Error(`Recorded operations disposition missing from management read: ${JSON.stringify(rows)}`);
if (found.source_type !== "e2e_probe" || found.source_id !== marker || found.disposition !== "resolved" || found.affected_route !== "/operations") {
  throw new Error(`Operations disposition mismatch: ${JSON.stringify(found)}`);
}

console.log("OPERATIONS_LIFECYCLE_E2E_PASS", JSON.stringify({
  userId: signedIn.user.id,
  partnerSourceId: partnerData.source.id,
  dispositionId,
  sourceId: marker,
  disposition: found.disposition,
}));
