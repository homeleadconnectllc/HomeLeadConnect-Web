import { supabase } from "./client";

export async function createResidentJobPaymentRequest(jobId:string,amount:number){
  const{data,error}=await supabase.rpc("create_resident_job_payment_request",{p_job_id:jobId,p_amount:amount});
  if(error)throw error;
  return data as string;
}

export async function createResidentJobCheckout(paymentId:string){
  const{data,error}=await supabase.functions.invoke("resident-job-checkout",{body:{paymentId}});
  if(error)throw error;
  const result=data as{url?:string;error?:string};
  if(!result?.url)throw new Error(result?.error||"Secure checkout URL was not returned.");
  return result.url;
}
