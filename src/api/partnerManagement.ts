import { supabase } from "./client";

export type PartnerManagementSource={id:string;display_name:string;organization_name:string|null;contact_email:string|null;status:string;created_at:string};
export type PartnerManagementReferral={id:string;partner_source_id:string;partner_name:string;target_kind:string;referred_name:string|null;referred_email:string|null;referred_phone:string|null;note:string|null;status:string;created_at:string;updated_at:string};
export type PartnerManagementQueue={sources:PartnerManagementSource[];referrals:PartnerManagementReferral[]};

export async function createPartnerSourceByEmail(input:{displayName:string;organizationName:string;accountEmail:string}){
  const{data,error}=await supabase.rpc("create_partner_source_by_email",{p_display_name:input.displayName,p_organization_name:input.organizationName,p_account_email:input.accountEmail});
  if(error)throw error;return data as string;
}
export async function listPartnerManagementQueue():Promise<PartnerManagementQueue>{const{data,error}=await supabase.rpc("list_partner_management_queue");if(error)throw error;return(data??{sources:[],referrals:[]}) as PartnerManagementQueue;}
export async function setPartnerReferralStatus(referralId:string,status:"recorded"|"reviewing"|"qualified"|"converted"|"closed"|"declined"){const{error}=await supabase.rpc("set_partner_referral_status",{p_referral_id:referralId,p_status:status});if(error)throw error;}
