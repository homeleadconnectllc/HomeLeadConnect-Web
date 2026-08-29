import { supabase } from "./client";

export type PartnerSource = { id:string; display_name:string; organization_name:string|null; contact_email:string|null; status:string };
export type PartnerReferral = { id:string; target_kind:"resident"|"professional"; referred_name:string|null; referred_email:string|null; referred_phone:string|null; note:string|null; status:string; created_at:string; updated_at:string };
export type PartnerPortalData = { source:PartnerSource; referrals:PartnerReferral[] };

export async function getPartnerPortalData():Promise<PartnerPortalData>{
  const{data,error}=await supabase.rpc("get_partner_portal_data");
  if(error)throw error;
  return data as PartnerPortalData;
}

export async function createPartnerReferral(input:{targetKind:"resident"|"professional";referredName:string;referredEmail:string;referredPhone:string;note:string}){
  const{data,error}=await supabase.rpc("partner_create_referral",{
    p_target_kind:input.targetKind,
    p_referred_name:input.referredName,
    p_referred_email:input.referredEmail,
    p_referred_phone:input.referredPhone,
    p_note:input.note,
  });
  if(error)throw error;
  return data as string;
}
