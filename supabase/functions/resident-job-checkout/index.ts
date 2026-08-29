import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info"};
const json=(body:Record<string,unknown>,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

Deno.serve(async(request)=>{
  if(request.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(request.method!=="POST")return json({error:"Method not allowed."},405);
  const url=Deno.env.get("SUPABASE_URL");const anon=Deno.env.get("SUPABASE_ANON_KEY");const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");const stripeKey=Deno.env.get("STRIPE_SECRET_KEY");const appUrl=Deno.env.get("APP_URL");const authorization=request.headers.get("Authorization");
  if(!url||!anon||!service||!stripeKey||!appUrl)return json({error:"Resident payment setup is incomplete."},503);
  if(!authorization)return json({error:"Authentication is required."},401);
  let payload:{paymentId?:string};try{payload=await request.json();}catch{return json({error:"Payment request is required."},400);}
  if(!payload.paymentId||!/^[0-9a-f-]{36}$/i.test(payload.paymentId))return json({error:"A valid payment request ID is required."},400);

  const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
  const{data:userData,error:userError}=await userClient.auth.getUser();if(userError||!userData.user)return json({error:"Authentication is required."},401);
  const{data:visible,error:visibleError}=await userClient.rpc("get_homeowner_portal_payments");if(visibleError)return json({error:"Resident payment access is unavailable."},403);
  const payment=(Array.isArray(visible)?visible:[]).find((row)=>row?.id===payload.paymentId) as {id:string;amount:number;currency:string;status:string}|undefined;
  if(!payment)return json({error:"Payment request is not authorized for this resident account."},403);
  if(["paid","refunded","cancelled"].includes(payment.status))return json({error:`Payment is already ${payment.status}.`},409);
  const cents=Math.round(Number(payment.amount)*100);if(!Number.isFinite(cents)||cents<50)return json({error:"Payment amount is invalid."},409);

  const stripe=new Stripe(stripeKey);const retryKey=payment.status==="failed"?crypto.randomUUID():payment.id;const session=await stripe.checkout.sessions.create({
    mode:"payment",
    customer_email:userData.user.email||undefined,
    line_items:[{quantity:1,price_data:{currency:payment.currency||"usd",unit_amount:cents,product_data:{name:"HomeLead Connect service payment",description:"Payment for a service job linked to your resident portal."}}}],
    metadata:{hlc_payment_kind:"resident_job",resident_payment_id:payment.id,resident_user_id:userData.user.id},
    payment_intent_data:{metadata:{hlc_payment_kind:"resident_job",resident_payment_id:payment.id,resident_user_id:userData.user.id}},
    success_url:`${appUrl.replace(/\/$/,"")}/homeowner-portal?payment=returned`,
    cancel_url:`${appUrl.replace(/\/$/,"")}/homeowner-portal?payment=cancelled`,
  },{idempotencyKey:`resident-job-checkout:${retryKey}`});
  if(!session.url)return json({error:"Stripe did not return a checkout URL."},502);
  const admin=createClient(url,service,{auth:{persistSession:false}});const{error:attachError}=await admin.rpc("attach_resident_job_checkout",{p_payment_id:payment.id,p_resident_user_id:userData.user.id,p_checkout_session_id:session.id,p_checkout_url:session.url});
  if(attachError)return json({error:"Unable to attach the secure checkout session."},500);
  return json({url:session.url});
});
