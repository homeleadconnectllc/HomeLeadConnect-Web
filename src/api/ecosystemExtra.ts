import { getCurrentWorkspaceId, supabase } from "./client";

async function context(){const workspaceId=await getCurrentWorkspaceId();const{data:{user},error}=await supabase.auth.getUser();if(error)throw error;if(!user)throw new Error("Authentication is required.");return{workspaceId,userId:user.id}}

export type ResidentProperty={id:string;label:string;address:string|null;city:string|null;state:string|null;zip:string|null};
export async function listResidentProperties(){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("resident_properties").select("id,label,address,city,state,zip").eq("workspace_id",workspaceId).eq("user_id",userId).order("created_at",{ascending:false});if(error)throw error;return(data??[])as ResidentProperty[]}
export async function createResidentProperty(input:Omit<ResidentProperty,"id">){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("resident_properties").insert({workspace_id:workspaceId,user_id:userId,label:input.label.trim(),address:input.address?.trim()||null,city:input.city?.trim()||null,state:input.state?.trim()||null,zip:input.zip?.trim()||null}).select("id,label,address,city,state,zip").single();if(error)throw error;return data as ResidentProperty}

export type ProviderService={id:string;contractor_id:number;service_name:string;active:boolean};
export async function listProviderServices(){const{workspaceId}=await context();const{data,error}=await supabase.from("provider_services").select("id,contractor_id,service_name,active").eq("workspace_id",workspaceId).eq("active",true).order("service_name");if(error)throw error;return(data??[])as ProviderService[]}
export async function createProviderService(contractorId:number,serviceName:string){const{workspaceId}=await context();const{data,error}=await supabase.from("provider_services").upsert({workspace_id:workspaceId,contractor_id:contractorId,service_name:serviceName.trim(),active:true},{onConflict:"contractor_id,service_name"}).select("id,contractor_id,service_name,active").single();if(error)throw error;return data as ProviderService}

export type CommunityGroup={id:string;name:string;description:string|null;created_at:string};
export async function listCommunityGroups(){const{workspaceId}=await context();const{data,error}=await supabase.from("community_groups").select("id,name,description,created_at").eq("workspace_id",workspaceId).order("name");if(error)throw error;return(data??[])as CommunityGroup[]}
export async function createCommunityGroup(name:string,description:string){const{workspaceId,userId}=await context();const{data,error}=await supabase.from("community_groups").insert({workspace_id:workspaceId,created_by:userId,name:name.trim(),description:description.trim()||null}).select("id,name,description,created_at").single();if(error)throw error;return data as CommunityGroup}

export async function listWorkspaceTeam(){const{workspaceId}=await context();const{data,error}=await supabase.from("profiles").select("user_id,full_name,avatar_url,role,onboarding_completed").eq("workspace_id",workspaceId).order("full_name");if(error)throw error;return data??[]}
export async function getWorkspaceAnalytics(){const{workspaceId}=await context();const [leads,jobs,appointments,contractors]=await Promise.all([
  supabase.from("leads").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
  supabase.from("crm_jobs").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
  supabase.from("appointments").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
  supabase.from("contractors").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId)
]);
  for(const r of [leads,jobs,appointments,contractors]) if(r.error) throw r.error;
  return{leads:leads.count??0,jobs:jobs.count??0,appointments:appointments.count??0,contractors:contractors.count??0};
}
export async function listOwnerAttention(){const{workspaceId}=await context();const{data,error}=await supabase.from("ai_owner_attention_items").select("id,related_entity_type,related_entity_id,reason,status,created_at").eq("workspace_id",workspaceId).order("created_at",{ascending:false}).limit(100);if(error)throw error;return data??[]}
export async function getSystemHealth(){const{workspaceId}=await context();const [providers,subscription,notifications,runs]=await Promise.all([
  supabase.from("communication_provider_connections").select("provider_name,channel,status").eq("workspace_id",workspaceId),
  supabase.from("subscriptions").select("status,updated_at").eq("workspace_id",workspaceId).order("updated_at",{ascending:false}).limit(1),
  supabase.from("notifications").select("id",{count:"exact",head:true}).eq("workspace_id",workspaceId),
  supabase.from("ai_agent_runs").select("status,created_at").eq("workspace_id",workspaceId).order("created_at",{ascending:false}).limit(25)
]);
  for(const r of [providers,subscription,notifications,runs]) if(r.error) throw r.error;
  return{providers:providers.data??[],subscription:subscription.data?.[0]??null,notificationCount:notifications.count??0,recentAgentRuns:runs.data??[]};
}
