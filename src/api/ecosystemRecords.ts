import { getCurrentWorkspaceId, supabase } from "./client";

async function context() {
  const workspaceId = await getCurrentWorkspaceId();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Authentication is required.");
  return { workspaceId, userId: user.id };
}

export type CommunityPost = { id:string; kind:"discussion"|"update"|"event"; title:string; body:string; event_at:string|null; status:string; created_at:string; author_user_id:string };
export async function listCommunityPosts(kind?: CommunityPost["kind"]) {
  const { workspaceId } = await context();
  let q = supabase.from("community_posts").select("id,kind,title,body,event_at,status,created_at,author_user_id").eq("workspace_id", workspaceId).eq("status","active").order("created_at",{ascending:false});
  if (kind) q = q.eq("kind",kind);
  const { data, error } = await q.limit(100); if (error) throw error; return (data ?? []) as CommunityPost[];
}
export async function createCommunityPost(input:{kind:CommunityPost["kind"];title:string;body:string;eventAt?:string}) {
  const { workspaceId, userId } = await context();
  const { data,error }=await supabase.from("community_posts").insert({workspace_id:workspaceId,author_user_id:userId,kind:input.kind,title:input.title.trim(),body:input.body.trim(),event_at:input.eventAt||null}).select("id,kind,title,body,event_at,status,created_at,author_user_id").single();
  if(error) throw error; return data as CommunityPost;
}

export type CommunityReview={id:string;job_id:string;rating:number;body:string;status:string;created_at:string};
export async function listCommunityReviews(){const {workspaceId}=await context();const {data,error}=await supabase.from("community_reviews").select("id,job_id,rating,body,status,created_at").eq("workspace_id",workspaceId).eq("status","published").order("created_at",{ascending:false}).limit(100);if(error)throw error;return(data??[])as CommunityReview[]}
export async function listCompletedJobs(){const{workspaceId}=await context();const{data,error}=await supabase.from("crm_jobs").select("id,name,status,created_at").eq("workspace_id",workspaceId).eq("status","completed").order("created_at",{ascending:false}).limit(50);if(error)throw error;return data??[]}
export async function createCommunityReview(input:{jobId:string;rating:number;body:string}){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("community_reviews").insert({workspace_id:workspaceId,job_id:input.jobId,author_user_id:userId,rating:input.rating,body:input.body.trim()}).select("id,job_id,rating,body,status,created_at").single();if(error)throw error;return data as CommunityReview}

export type CommunityReferral={id:string;referred_email:string;note:string|null;status:string;created_at:string};
export async function listReferrals(){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("community_referrals").select("id,referred_email,note,status,created_at").eq("workspace_id",workspaceId).eq("referrer_user_id",userId).order("created_at",{ascending:false});if(error)throw error;return(data??[])as CommunityReferral[]}
export async function createReferral(email:string,note:string){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("community_referrals").insert({workspace_id:workspaceId,referrer_user_id:userId,referred_email:email.trim(),note:note.trim()||null}).select("id,referred_email,note,status,created_at").single();if(error)throw error;return data as CommunityReferral}

export type CommunityReport={id:string;post_id:string|null;review_id:string|null;reason:string;status:string;created_at:string};
export async function listReports(){const{workspaceId}=await context();const{data,error}=await supabase.from("community_reports").select("id,post_id,review_id,reason,status,created_at").eq("workspace_id",workspaceId).order("created_at",{ascending:false}).limit(100);if(error)throw error;return(data??[])as CommunityReport[]}
export async function createReport(input:{postId?:string;reviewId?:string;reason:string}){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("community_reports").insert({workspace_id:workspaceId,reporter_user_id:userId,post_id:input.postId||null,review_id:input.reviewId||null,reason:input.reason.trim()}).select("id,post_id,review_id,reason,status,created_at").single();if(error)throw error;return data as CommunityReport}
export async function resolveReport(id:string,status:"resolved"|"dismissed"){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("community_reports").update({status,resolved_at:new Date().toISOString(),resolved_by:userId}).eq("workspace_id",workspaceId).eq("id",id).select("id,post_id,review_id,reason,status,created_at").single();if(error)throw error;return data as CommunityReport}

export type ServiceArea={id:string;contractor_id:number;city:string|null;state:string|null;zip:string|null;radius_miles:number|null};
export async function listServiceAreas(){const{workspaceId}=await context();const{data,error}=await supabase.from("provider_service_areas").select("id,contractor_id,city,state,zip,radius_miles").eq("workspace_id",workspaceId);if(error)throw error;return(data??[])as ServiceArea[]}
export async function saveServiceArea(input:{contractorId:number;city?:string;state?:string;zip?:string;radiusMiles?:number}){const{workspaceId}=await context();const{data,error}=await supabase.from("provider_service_areas").upsert({workspace_id:workspaceId,contractor_id:input.contractorId,city:input.city?.trim()||null,state:input.state?.trim()||null,zip:input.zip?.trim()||null,radius_miles:input.radiusMiles||null},{onConflict:"contractor_id,city,state,zip"}).select("id,contractor_id,city,state,zip,radius_miles").single();if(error)throw error;return data as ServiceArea}

export type ProviderAvailability={id:string;contractor_id:number;available:boolean;note:string|null;next_available_at:string|null};
export async function listProviderAvailability(){const{workspaceId}=await context();const{data,error}=await supabase.from("provider_availability").select("id,contractor_id,available,note,next_available_at").eq("workspace_id",workspaceId);if(error)throw error;return(data??[])as ProviderAvailability[]}
export async function saveProviderAvailability(input:{contractorId:number;available:boolean;note?:string;nextAvailableAt?:string}){const{workspaceId}=await context();const{data,error}=await supabase.from("provider_availability").upsert({workspace_id:workspaceId,contractor_id:input.contractorId,available:input.available,note:input.note?.trim()||null,next_available_at:input.nextAvailableAt||null,updated_at:new Date().toISOString()},{onConflict:"contractor_id"}).select("id,contractor_id,available,note,next_available_at").single();if(error)throw error;return data as ProviderAvailability}

export async function listSavedProviderIds(){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("saved_providers").select("contractor_id").eq("workspace_id",workspaceId).eq("user_id",userId);if(error)throw error;return new Set((data??[]).map((row)=>Number(row.contractor_id)))}
export async function setProviderSaved(contractorId:number,saved:boolean){const{workspaceId,userId}=await context();if(saved){const{error}=await supabase.from("saved_providers").upsert({workspace_id:workspaceId,user_id:userId,contractor_id:contractorId},{onConflict:"user_id,contractor_id"});if(error)throw error}else{const{error}=await supabase.from("saved_providers").delete().eq("workspace_id",workspaceId).eq("user_id",userId).eq("contractor_id",contractorId);if(error)throw error}}

export type ParticipantPreferences={phone:string|null;preferred_contact:string|null;accessibility_notes:string|null;language:string;network_visibility:string};
export async function getParticipantPreferences(){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("participant_preferences").select("phone,preferred_contact,accessibility_notes,language,network_visibility").eq("workspace_id",workspaceId).eq("user_id",userId).maybeSingle();if(error)throw error;return(data??{phone:null,preferred_contact:null,accessibility_notes:null,language:"en",network_visibility:"workspace"})as ParticipantPreferences}
export async function saveParticipantPreferences(input:ParticipantPreferences){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("participant_preferences").upsert({workspace_id:workspaceId,user_id:userId,...input,updated_at:new Date().toISOString()},{onConflict:"user_id"}).select("phone,preferred_contact,accessibility_notes,language,network_visibility").single();if(error)throw error;return data as ParticipantPreferences}
