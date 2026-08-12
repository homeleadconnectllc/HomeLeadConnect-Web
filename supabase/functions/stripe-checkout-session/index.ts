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
  const priceId = Deno.env.get("STRIPE_PRICE_HLC_MONTHLY");
  const appUrl = Deno.env.get("APP_URL");
  const authorization = request.headers.get("Authorization");
  if (!url || !anon || !service || !stripeKey || !priceId || !appUrl) return json({ error: "Billing setup is incomplete." }, 503);
  if (!authorization) return json({ error: "Authentication is required." }, 401);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Authentication is required." }, 401);
  const { data: profile, error: profileError } = await userClient.from("profiles").select("workspace_id").eq("user_id", userData.user.id).single();
  if (profileError || !profile?.workspace_id) return json({ error: "Current workspace is unavailable." }, 403);
  const { data: membership } = await userClient.from("workspace_members").select("workspace_id").eq("workspace_id", profile.workspace_id).eq("user_id", userData.user.id).maybeSingle();
  if (!membership) return json({ error: "Workspace membership is required." }, 403);

  let enrollment: { acceptedTerms?: boolean; disclosureVersion?: string; clientRequestId?: string };
  try { enrollment = await request.json(); } catch { return json({ error: "Enrollment confirmation is required." }, 400); }
  if (enrollment.acceptedTerms !== true || enrollment.disclosureVersion !== "pa-v1-2026-08-10") {
    return json({ error: "You must affirm the displayed trial and recurring billing terms." }, 400);
  }
  if (!enrollment.clientRequestId || !/^[0-9a-f-]{36}$/i.test(enrollment.clientRequestId)) {
    return json({ error: "A valid enrollment request ID is required." }, 400);
  }

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: existing } = await admin.from("subscriptions").select("stripe_customer_id,status").eq("workspace_id", profile.workspace_id).maybeSingle();
  if (existing?.status === "active" || existing?.status === "trialing") return json({ error: "This workspace already has an active subscription." }, 409);

  const stripe = new Stripe(stripeKey);
  const price = await stripe.prices.retrieve(priceId);
  if (!price.active || price.type !== "recurring" || price.currency !== "usd" || !price.unit_amount) {
    return json({ error: "Configured subscription price is invalid." }, 503);
  }

  const { error: consentError } = await admin.from("billing_enrollment_consents").upsert({
    workspace_id: profile.workspace_id, user_id: userData.user.id, disclosure_version: enrollment.disclosureVersion,
    trial_days: 14, recurring_amount_cents: price.unit_amount, currency: price.currency, billing_interval: price.recurring?.interval ?? "month",
    cancellation_method: "stripe_billing_portal", client_request_id: enrollment.clientRequestId,
  }, { onConflict: "workspace_id,client_request_id", ignoreDuplicates: true });
  if (consentError) return json({ error: "Unable to preserve enrollment consent." }, 500);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripe_customer_id || undefined,
    customer_email: existing?.stripe_customer_id ? undefined : userData.user.email,
    payment_method_collection: "always",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { workspace_id: profile.workspace_id, plan_key: "hlc_v1" },
    },
    metadata: { workspace_id: profile.workspace_id, plan_key: "hlc_v1" },
    success_url: `${appUrl.replace(/\/$/, "")}/settings?billing=checkout-returned`,
    cancel_url: `${appUrl.replace(/\/$/, "")}/settings?billing=cancelled`,
  }, { idempotencyKey: `checkout:${profile.workspace_id}:${enrollment.clientRequestId}` });
  return json({ url: session.url });
});
