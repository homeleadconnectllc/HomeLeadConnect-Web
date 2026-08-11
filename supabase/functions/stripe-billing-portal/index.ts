import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info" };
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL");
  const authorization = request.headers.get("Authorization");
  if (!url || !anon || !service || !stripeKey || !appUrl) return json({ error: "Billing setup is incomplete." }, 503);
  if (!authorization) return json({ error: "Authentication is required." }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return json({ error: "Authentication is required." }, 401);
  const { data: profile } = await userClient.from("profiles").select("workspace_id").eq("user_id", userData.user.id).single();
  if (!profile?.workspace_id) return json({ error: "Current workspace is unavailable." }, 403);
  const { data: membership } = await userClient.from("workspace_members").select("workspace_id")
    .eq("workspace_id", profile.workspace_id).eq("user_id", userData.user.id).maybeSingle();
  if (!membership) return json({ error: "Workspace membership is required." }, 403);
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: subscription } = await admin.from("subscriptions").select("stripe_customer_id").eq("workspace_id", profile.workspace_id).maybeSingle();
  if (!subscription?.stripe_customer_id) return json({ error: "No Stripe customer exists for this workspace." }, 404);
  const stripe = new Stripe(stripeKey);
  const session = await stripe.billingPortal.sessions.create({ customer: subscription.stripe_customer_id, return_url: `${appUrl.replace(/\/$/, "")}/settings` });
  return json({ url: session.url });
});
