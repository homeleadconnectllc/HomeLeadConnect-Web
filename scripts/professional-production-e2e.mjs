import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// TEST ONLY. This file stays on the do-not-merge E2E branch.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.HLC_VISUAL_TEST_EMAIL;
const password = process.env.HLC_VISUAL_TEST_PASSWORD;
const workspaceId = "a4511fee-cab8-4049-b313-3ca13438cc6a";
const testJobId = "060d02f0-6f55-4a88-b026-83ad45ec9420";
const stamp = Date.now();
const marker = `Professional Lifecycle E2E ${stamp}`;
const testPhone = `717${String(stamp).slice(-7)}`;
if (!supabaseUrl || !anonKey || !email || !password) throw new Error("Missing E2E environment.");
const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
if (signInError || !signedIn.user) throw signInError ?? new Error("Controlled test login failed.");
const { data: submitted, error: submitError } = await client.rpc("submit_professional_application", {
  p_form_slug:"professional-application", p_request_id:randomUUID(), p_organization_name:marker,
  p_contact_name:"HomeLead Connect E2E", p_email:email, p_phone:testPhone,
  p_trade_categories:"E2E Test Painting", p_service_territory:"Harrisburg, PA",
  p_experience_summary:"Controlled production verification fixture only.", p_communication_consent:true, p_honeypot:""
});
if (submitError) throw submitError;
const applicationId=submitted?.[0]?.application_id; if(!applicationId) throw new Error("Professional application was not created.");
const {data:approved,error:approveError}=await client.rpc("approve_professional_application",{p_application_id:applicationId}); if(approveError) throw approveError;
const approval=approved?.[0]; if(!approval?.contractor_id||!approval?.invitation_token) throw new Error(`Approval incomplete: ${JSON.stringify(approval)}`); const contractorId=Number(approval.contractor_id);
const {data:accepted,error:acceptError}=await client.rpc("accept_portal_invitation",{p_invitation_token:approval.invitation_token}); if(acceptError) throw acceptError;
const acceptance=accepted?.[0]; if(acceptance?.portal_role!=="contractor") throw new Error(`Wrong portal role: ${JSON.stringify(acceptance)}`);
const {error:serviceError}=await client.rpc("add_linked_provider_service",{p_contractor_id:contractorId,p_service_name:"E2E Test Painting 20260909"}); if(serviceError) throw serviceError;
const {error:availabilityError}=await client.rpc("set_linked_provider_availability",{p_contractor_id:contractorId,p_available:true,p_note:"E2E production verification only",p_next_available_at:new Date(Date.now()+86400000).toISOString()}); if(availabilityError) throw availabilityError;
const {data:assignment,error:assignmentError}=await client.from("job_assignments").insert({workspace_id:workspaceId,job_id:testJobId,contractor_id:contractorId,status:"offered"}).select("id,status").single(); if(assignmentError) throw assignmentError;
if(assignment.status!=="offered") throw new Error(`Assignment not offered: ${JSON.stringify(assignment)}`);
const {data:decision,error:decisionError}=await client.rpc("contractor_decide_assignment",{p_assignment_id:assignment.id,p_decision:"accepted"}); if(decisionError) throw decisionError; if(decision!=="accepted") throw new Error(`Decision ${JSON.stringify(decision)}`);
const {data:progressId,error:progressError}=await client.rpc("contractor_record_job_progress",{p_assignment_id:assignment.id,p_status:"completed",p_note:"E2E production lifecycle verification completed."}); if(progressError) throw progressError; if(!progressId) throw new Error("No progress record.");
const {data:performance,error:performanceError}=await client.rpc("get_linked_provider_performance",{p_contractor_id:contractorId}); if(performanceError) throw performanceError;
if(Number(performance?.accepted_assignments??0)<1||Number(performance?.provider_completed_reports??0)<1) throw new Error(`Performance incomplete: ${JSON.stringify(performance)}`);
const {data:portal,error:portalError}=await client.rpc("get_contractor_portal_data"); if(portalError) throw portalError;
const hasLink=Array.isArray(portal?.links)&&portal.links.some(x=>Number(x.contractor_id)===contractorId); const hasAssignment=Array.isArray(portal?.assignments)&&portal.assignments.some(x=>x.id===assignment.id&&x.status==="accepted"); if(!hasLink||!hasAssignment) throw new Error(`Portal state missing: ${JSON.stringify(portal)}`);
console.log("PROFESSIONAL_LIFECYCLE_E2E_PASS",JSON.stringify({applicationId,contractorId,invitationId:approval.invitation_id,assignmentId:assignment.id,progressId,performance,portalRole:acceptance.portal_role,testPhone}));
