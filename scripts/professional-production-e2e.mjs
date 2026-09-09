import { createClient } from "@supabase/supabase-js";

// TEST ONLY. Never merge this branch.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;
const workspaceId = "a4511fee-cab8-4049-b313-3ca13438cc6a";
const contractorId = 8; // verified E2E contractor fixture created by the prior authenticated run
const testLeadId = 36; // existing Test Homeowner 2 fixture
if (!supabaseUrl || !anonKey || !email || !password) throw new Error("Missing E2E environment.");

const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
if (signInError || !signedIn.user) throw signInError ?? new Error("Controlled test login failed.");

// Verify this authenticated identity actually owns the contractor fixture.
const { data: portalBefore, error: portalBeforeError } = await client.rpc("get_contractor_portal_data");
if (portalBeforeError) throw portalBeforeError;
if (!Array.isArray(portalBefore?.links) || !portalBefore.links.some((x) => Number(x.contractor_id) === contractorId)) {
  throw new Error(`Controlled identity is not linked to contractor ${contractorId}: ${JSON.stringify(portalBefore)}`);
}

// Create a fresh test job only through the canonical estimate -> conversion path.
const { data: estimate, error: estimateError } = await client.rpc("save_estimate_with_lines", {
  p_estimate_id: null,
  p_lead_id: testLeadId,
  p_status: "accepted",
  p_markup_percent: 0,
  p_subtotal: 1,
  p_markup_amount: 0,
  p_total: 1,
  p_lines: [{ description: "Professional lifecycle E2E verification", quantity: 1, unitCost: 1 }],
});
if (estimateError) throw estimateError;
if (!estimate?.id) throw new Error(`Test estimate was not created: ${JSON.stringify(estimate)}`);

const { data: job, error: convertError } = await client.rpc("convert_estimate_to_job", { p_estimate_id: estimate.id });
if (convertError) throw convertError;
if (!job?.id || job.workspace_id !== workspaceId) throw new Error(`Test job conversion failed: ${JSON.stringify(job)}`);

// Opportunity: normal workspace-member RLS + assignment trigger requires offered state.
const { data: assignment, error: assignmentError } = await client
  .from("job_assignments")
  .insert({ workspace_id: workspaceId, job_id: job.id, contractor_id: contractorId, status: "offered" })
  .select("id,status,job_id,contractor_id")
  .single();
if (assignmentError) throw assignmentError;
if (assignment.status !== "offered") throw new Error(`Assignment did not start offered: ${JSON.stringify(assignment)}`);

// Professional accepts the offer through the contractor-scoped RPC.
const { data: decision, error: decisionError } = await client.rpc("contractor_decide_assignment", {
  p_assignment_id: assignment.id,
  p_decision: "accepted",
});
if (decisionError) throw decisionError;
if (decision !== "accepted") throw new Error(`Assignment decision failed: ${JSON.stringify(decision)}`);

// Service: record portal-authorized progress.
const { data: progressId, error: progressError } = await client.rpc("contractor_record_job_progress", {
  p_assignment_id: assignment.id,
  p_status: "completed",
  p_note: "E2E production lifecycle verification completed.",
});
if (progressError) throw progressError;
if (!progressId) throw new Error("Provider progress record was not created.");

// Performance: authenticated aggregate must now include the accepted offer + completion report.
const { data: performance, error: performanceError } = await client.rpc("get_linked_provider_performance", {
  p_contractor_id: contractorId,
});
if (performanceError) throw performanceError;
if (Number(performance?.accepted_assignments ?? 0) < 1) throw new Error(`Accepted assignment missing from performance: ${JSON.stringify(performance)}`);
if (Number(performance?.provider_completed_reports ?? 0) < 1) throw new Error(`Completed report missing from performance: ${JSON.stringify(performance)}`);

const { data: portalAfter, error: portalAfterError } = await client.rpc("get_contractor_portal_data");
if (portalAfterError) throw portalAfterError;
const hasAssignment = Array.isArray(portalAfter?.assignments) && portalAfter.assignments.some((x) => x.id === assignment.id && x.status === "accepted");
if (!hasAssignment) throw new Error(`Accepted assignment missing from Contractor Portal dataset: ${JSON.stringify(portalAfter)}`);

console.log("PROFESSIONAL_LIFECYCLE_E2E_PASS", JSON.stringify({
  contractorId,
  estimateId: estimate.id,
  jobId: job.id,
  assignmentId: assignment.id,
  progressId,
  performance,
}));
