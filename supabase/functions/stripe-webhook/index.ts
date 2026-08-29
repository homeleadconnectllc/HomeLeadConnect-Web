import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const json=(body:Record<string,unknown>,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});
const iso=(seconds:number|null|undefined)=>seconds?new Date(seconds*1000).toISOString():null;
const safeDbError=(error:{code?:string;message?:string}|null|undefined)=>error?`${error.code||"DB_ERROR"}: ${String(error.message||"unknown").slice(0,300)}`:"unknown";

Deno.serve(async(request)=>{
  if(request.method!=="POST")return json({error:"Method not allowed."},405);
  const stripeKey=Deno.env.get("STRIPE_SECRET_KEY");const signingSecret=Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");const priceId=Deno.env.get("STRIPE_PRICE_HLC")||Deno.env.get("STRIPE_PRICE_HLC_MONTHLY");const url=Deno.env.get("SUPABASE_URL");const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!stripeKey||!signingSecret||!priceId||!url||!service)return json({error:"Webhook setup is incomplete."},503);
  const signature=request.headers.get("Stripe-Signature");if(!signature)return json({error:"Missing Stripe signature."},400);
  const rawBody=await request.text();const stripe=new Stripe(stripeKey);let event:Stripe.Event;
  try{event=await stripe.webhooks.constructEventAsync(rawBody,signature,signingSecret);}catch{return json({error:"Invalid Stripe signature."},400);}
  const digest=[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(rawBody)))].map(value=>value.toString(16).padStart(2,"0")).join("");
  const admin=createClient(url,service,{auth:{persistSession:false}});
  const{data:existing,error:existingError}=await admin.from("stripe_webhook_events").select("status").eq("event_id",event.id).maybeSingle();
  if(existingError){console.error("Stripe webhook event lookup failed",event.id,event.type,safeDbError(existingError));return json({error:"Webhook event lookup failed."},500);}
  if(existing?.status==="processed")return json({received:true,duplicate:true});if(existing?.status==="processing")return json({received:true,duplicate:true,processing:true});
  const eventRow={event_id:event.id,event_type:event.type,api_version:event.api_version,payload_sha256:digest,status:"processing",last_received_at:new Date().toISOString(),error_message:null};
  if(existing){const{error:updateError}=await admin.from("stripe_webhook_events").update(eventRow).eq("event_id",event.id);if(updateError)return json({error:"Unable to reserve webhook event."},500);const{error:attemptError}=await admin.rpc("increment_stripe_webhook_attempt",{p_event_id:event.id});if(attemptError)console.error("Stripe webhook attempt increment failed",event.id,safeDbError(attemptError));}
  else{const{error}=await admin.from("stripe_webhook_events").insert(eventRow);if(error?.code==="23505")return json({received:true,duplicate:true,processing:true});if(error)return json({error:"Unable to reserve webhook event."},500);}

  async function syncSubscription(subscription:Stripe.Subscription){
    const workspaceId=subscription.metadata.workspace_id;if(!workspaceId||subscription.metadata.plan_key!=="hlc_v1")throw new Error("Subscription metadata is incomplete.");if(subscription.items.data[0]?.price.id!==priceId)throw new Error("Subscription price does not match HLC V1.");
    const periodStart=iso(subscription.current_period_start),periodEnd=iso(subscription.current_period_end),trialStart=iso(subscription.trial_start),trialEnd=iso(subscription.trial_end),endedAt=iso(subscription.ended_at);const customerId=typeof subscription.customer==="string"?subscription.customer:subscription.customer.id;
    const previous=await admin.from("subscriptions").select("grace_period_end").eq("stripe_subscription_id",subscription.id).maybeSingle();const graceEnd=subscription.status==="past_due"?previous.data?.grace_period_end||new Date(Date.now()+7*86400_000).toISOString():null;const active=subscription.status==="trialing"||subscription.status==="active"||(subscription.status==="past_due"&&Boolean(graceEnd)&&new Date(graceEnd).getTime()>Date.now());
    const values={workspace_id:workspaceId,stripe_customer_id:customerId,stripe_subscription_id:subscription.id,stripe_price_id:priceId,plan_key:"hlc_v1",status:subscription.status,current_period_start:periodStart,current_period_end:periodEnd,cancel_at_period_end:subscription.cancel_at_period_end,trial_start:trialStart,trial_end:trialEnd,grace_period_end:graceEnd,ended_at:endedAt,last_stripe_event_id:event.id,updated_at:new Date().toISOString()};
    const priorCustomer=await admin.from("subscriptions").select("id").eq("stripe_customer_id",customerId).maybeSingle();const subscriptionWrite=priorCustomer.data?.id?admin.from("subscriptions").update(values).eq("id",priorCustomer.data.id):admin.from("subscriptions").insert(values);const{error:subscriptionError}=await subscriptionWrite;if(subscriptionError)throw subscriptionError;
    const{error:entitlementError}=await admin.from("workspace_plan_status").upsert({workspace_id:workspaceId,plan_key:"hlc_v1",stripe_customer_id:customerId,stripe_subscription_id:subscription.id,status:subscription.status,is_active:active,current_period_end:periodEnd,trial_end:trialEnd,grace_period_end:graceEnd,cancel_at_period_end:subscription.cancel_at_period_end,last_stripe_event_id:event.id,updated_at:new Date().toISOString()},{onConflict:"workspace_id"});if(entitlementError)throw entitlementError;
  }

  async function syncResidentCheckout(session:Stripe.Checkout.Session,status:"processing"|"paid"|"failed"|"cancelled"|"refunded"){
    if(session.metadata?.hlc_payment_kind!=="resident_job"||!session.metadata?.resident_payment_id)return false;
    const paymentIntentId=typeof session.payment_intent==="string"?session.payment_intent:session.payment_intent?.id||"";let receiptUrl:string|null=null;
    if(paymentIntentId&&status==="paid"){try{const intent=await stripe.paymentIntents.retrieve(paymentIntentId,{expand:["latest_charge"]});const charge=intent.latest_charge&&typeof intent.latest_charge!=="string"?intent.latest_charge:null;receiptUrl=charge?.receipt_url||null;}catch(reason){console.error("Resident payment receipt lookup failed",session.id,reason);}}
    const{error}=await admin.rpc("set_resident_job_payment_provider_state",{p_checkout_session_id:session.id,p_payment_intent_id:paymentIntentId,p_status:status,p_receipt_url:receiptUrl,p_failure_code:null,p_failure_message:null});if(error)throw error;return true;
  }

  try{
    if(event.type==="checkout.session.completed"){
      const session=event.data.object as Stripe.Checkout.Session;
      if(session.metadata?.hlc_payment_kind==="resident_job")await syncResidentCheckout(session,session.payment_status==="paid"?"paid":"processing");
      else if(typeof session.subscription==="string")await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
    }else if(event.type==="checkout.session.async_payment_succeeded"){
      await syncResidentCheckout(event.data.object as Stripe.Checkout.Session,"paid");
    }else if(event.type==="checkout.session.async_payment_failed"){
      const session=event.data.object as Stripe.Checkout.Session;if(session.metadata?.hlc_payment_kind==="resident_job"){const paymentIntentId=typeof session.payment_intent==="string"?session.payment_intent:session.payment_intent?.id||"";const{error}=await admin.rpc("set_resident_job_payment_provider_state",{p_checkout_session_id:session.id,p_payment_intent_id:paymentIntentId,p_status:"failed",p_receipt_url:null,p_failure_code:"stripe_async_payment_failed",p_failure_message:"Stripe reported that the payment did not complete."});if(error)throw error;}
    }else if(event.type==="customer.subscription.created"||event.type==="customer.subscription.updated"||event.type==="customer.subscription.deleted"||event.type==="customer.subscription.trial_will_end"){
      const subscription=event.data.object as Stripe.Subscription;await syncSubscription(subscription);if(event.type==="customer.subscription.trial_will_end"){const{error:noticeError}=await admin.from("billing_notice_events").upsert({workspace_id:subscription.metadata.workspace_id,stripe_subscription_id:subscription.id,source_stripe_event_id:event.id,notice_type:"trial_ending",delivery_status:"email_not_connected"},{onConflict:"source_stripe_event_id,notice_type",ignoreDuplicates:true});if(noticeError)throw noticeError;}
    }else if(event.type==="invoice.payment_failed"){
      const invoice=event.data.object as Stripe.Invoice;const invoiceSubscription=(invoice as unknown as{subscription?:string|{id:string}}).subscription;const subscriptionId=typeof invoiceSubscription==="string"?invoiceSubscription:invoiceSubscription?.id;if(subscriptionId){const subscription=await stripe.subscriptions.retrieve(subscriptionId);await syncSubscription(subscription);const{error:noticeError}=await admin.from("billing_notice_events").upsert({workspace_id:subscription.metadata.workspace_id,stripe_subscription_id:subscription.id,source_stripe_event_id:event.id,notice_type:"payment_failed",delivery_status:"email_not_connected"},{onConflict:"source_stripe_event_id,notice_type",ignoreDuplicates:true});if(noticeError)throw noticeError;}
    }
    const{error:processedError}=await admin.from("stripe_webhook_events").update({status:"processed",processed_at:new Date().toISOString(),error_message:null}).eq("event_id",event.id);if(processedError)throw processedError;return json({received:true});
  }catch(reason){const error=reason instanceof Error?reason.message.slice(0,500):"Webhook processing failed.";console.error("Stripe webhook processing failed",event.id,event.type,error);const{error:failureWriteError}=await admin.from("stripe_webhook_events").update({status:"failed",error_message:error}).eq("event_id",event.id);if(failureWriteError)console.error("Stripe webhook failure state write failed",event.id,safeDbError(failureWriteError));return json({error:"Webhook processing failed."},500);}
});
