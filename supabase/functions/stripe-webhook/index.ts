import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const iso = (seconds: number | null | undefined) => seconds ? new Date(seconds * 1000).toISOString() : null;

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const signingSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
  const priceId = Deno.env.get("STRIPE_PRICE_HLC") || Deno.env.get("STRIPE_PRICE_HLC_MONTHLY");
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeKey || !signingSecret || !priceId || !url || !service) return json({ error: "Webhook setup is incomplete." }, 503);
  const signature = request.headers.get("Stripe-Signature");
  if (!signature) return json({ error: "Missing Stripe signature." }, 400);
  const rawBody = await request.text();
  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try { event = await stripe.webhooks.constructEventAsync(rawBody, signature, signingSecret); }
  catch { return json({ error: "Invalid Stripe signature." }, 400); }

  const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawBody)))]
    .map((value) => value.toString(16).padStart(2, "0")).join("");
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: existing } = await admin.from("stripe_webhook_events").select("status").eq("event_id", event.id).maybeSingle();
  if (existing?.status === "processed") return json({ received: true, duplicate: true });
  if (existing?.status === "processing") return json({ error: "Event is already processing." }, 409);
  const eventRow = { event_id: event.id, event_type: event.type, api_version: event.api_version, payload_sha256: digest,
    status: "processing", last_received_at: new Date().toISOString(), error_message: null };
  if (existing) {
    await admin.from("stripe_webhook_events").update(eventRow).eq("event_id", event.id);
    await admin.rpc("increment_stripe_webhook_attempt", { p_event_id: event.id });
  } else {
    const { error } = await admin.from("stripe_webhook_events").insert(eventRow);
    if (error) return json({ error: "Unable to reserve webhook event." }, 500);
  }

  async function syncSubscription(subscription: Stripe.Subscription) {
    const workspaceId = subscription.metadata.workspace_id;
    if (!workspaceId || subscription.metadata.plan_key !== "hlc_v1") throw new Error("Subscription metadata is incomplete.");
    if (subscription.items.data[0]?.price.id !== priceId) throw new Error("Subscription price does not match HLC V1.");
    const periodStart = iso(subscription.current_period_start);
    const periodEnd = iso(subscription.current_period_end);
    const trialStart = iso(subscription.trial_start);
    const trialEnd = iso(subscription.trial_end);
    const endedAt = iso(subscription.ended_at);
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const previous = await admin.from("subscriptions").select("grace_period_end").eq("stripe_subscription_id", subscription.id).maybeSingle();
    const graceEnd = subscription.status === "past_due"
      ? previous.data?.grace_period_end || new Date(Date.now() + 7 * 86400_000).toISOString()
      : null;
    const active = subscription.status === "trialing" || subscription.status === "active"
      || (subscription.status === "past_due" && Boolean(graceEnd) && new Date(graceEnd).getTime() > Date.now());
    const values = { workspace_id: workspaceId, stripe_customer_id: customerId, stripe_subscription_id: subscription.id,
      stripe_price_id: priceId, plan_key: "hlc_v1", status: subscription.status, current_period_start: periodStart,
      current_period_end: periodEnd, cancel_at_period_end: subscription.cancel_at_period_end, trial_start: trialStart,
      trial_end: trialEnd, grace_period_end: graceEnd, ended_at: endedAt, last_stripe_event_id: event.id, updated_at: new Date().toISOString() };
    const priorCustomer = await admin.from("subscriptions").select("id").eq("stripe_customer_id", customerId).maybeSingle();
    const subscriptionWrite = priorCustomer.data?.id
      ? admin.from("subscriptions").update(values).eq("id", priorCustomer.data.id)
      : admin.from("subscriptions").insert(values);
    const { error: subscriptionError } = await subscriptionWrite;
    if (subscriptionError) throw subscriptionError;
    const { error: entitlementError } = await admin.from("workspace_plan_status").upsert({ workspace_id: workspaceId,
      plan_key: "hlc_v1", stripe_customer_id: customerId, stripe_subscription_id: subscription.id,
      status: subscription.status, is_active: active, current_period_end: periodEnd, trial_end: trialEnd,
      grace_period_end: graceEnd, cancel_at_period_end: subscription.cancel_at_period_end,
      last_stripe_event_id: event.id, updated_at: new Date().toISOString() }, { onConflict: "workspace_id" });
    if (entitlementError) throw entitlementError;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (typeof session.subscription === "string") await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
    } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated"
      || event.type === "customer.subscription.deleted" || event.type === "customer.subscription.trial_will_end") {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      if (event.type === "customer.subscription.trial_will_end") {
        const { error: noticeError } = await admin.from("billing_notice_events").upsert({ workspace_id: subscription.metadata.workspace_id,
          stripe_subscription_id: subscription.id, source_stripe_event_id: event.id, notice_type: "trial_ending",
          delivery_status: "email_not_connected" }, { onConflict: "source_stripe_event_id,notice_type", ignoreDuplicates: true });
        if (noticeError) throw noticeError;
      }
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubscription = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
      const subscriptionId = typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription);
        const { error: noticeError } = await admin.from("billing_notice_events").upsert({ workspace_id: subscription.metadata.workspace_id,
          stripe_subscription_id: subscription.id, source_stripe_event_id: event.id, notice_type: "payment_failed",
          delivery_status: "email_not_connected" }, { onConflict: "source_stripe_event_id,notice_type", ignoreDuplicates: true });
        if (noticeError) throw noticeError;
      }
    }
    await admin.from("stripe_webhook_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("event_id", event.id);
    return json({ received: true });
  } catch (reason) {
    const error = reason instanceof Error ? reason.message.slice(0, 500) : "Webhook processing failed.";
    await admin.from("stripe_webhook_events").update({ status: "failed", error_message: error }).eq("event_id", event.id);
    return json({ error: "Webhook processing failed." }, 500);
  }
});
