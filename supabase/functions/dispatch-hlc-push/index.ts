import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type DispatchRequest = { notification_id?: string; dispatch_token?: string };

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return new Response("Server configuration unavailable", { status: 500 });

  let body: DispatchRequest;
  try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
  if (!body.notification_id || !body.dispatch_token) return new Response("Missing dispatch data", { status: 400 });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: config, error: configError } = await admin.from("web_push_config").select("public_key,private_key,dispatch_token,contact").eq("id", true).maybeSingle();
  if (configError || !config) return new Response("Push configuration unavailable", { status: 503 });
  if (config.dispatch_token !== body.dispatch_token) return new Response("Unauthorized", { status: 401 });

  const { data: notification, error: notificationError } = await admin.from("notifications")
    .select("id,recipient_user_id,title,body,deep_link,notification_type").eq("id", body.notification_id).maybeSingle();
  if (notificationError || !notification?.recipient_user_id) return new Response("Notification not found", { status: 404 });

  const { data: subscriptions, error: subscriptionsError } = await admin.from("web_push_subscriptions")
    .select("id,endpoint,p256dh,auth").eq("user_id", notification.recipient_user_id).eq("enabled", true);
  if (subscriptionsError) return new Response("Subscription lookup failed", { status: 500 });

  webpush.setVapidDetails(config.contact || "mailto:info@homeleadconnect.org", config.public_key, config.private_key);
  const payload = JSON.stringify({ title: notification.title, body: notification.body, deep_link: notification.deep_link || "/notifications", tag: notification.id, notification_type: notification.notification_type });

  let sent = 0;
  let failed = 0;
  for (const subscription of subscriptions ?? []) {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, payload, { TTL: 300, urgency: "high" });
      sent += 1;
      await admin.from("web_push_subscriptions").update({ last_success_at: new Date().toISOString(), failure_count: 0 }).eq("id", subscription.id);
    } catch (reason) {
      failed += 1;
      const statusCode = typeof reason === "object" && reason && "statusCode" in reason ? Number((reason as { statusCode?: number }).statusCode) : 0;
      if (statusCode === 404 || statusCode === 410) {
        await admin.from("web_push_subscriptions").update({ enabled: false, last_failure_at: new Date().toISOString() }).eq("id", subscription.id);
      } else {
        const { data: current } = await admin.from("web_push_subscriptions").select("failure_count").eq("id", subscription.id).maybeSingle();
        await admin.from("web_push_subscriptions").update({ failure_count: Number(current?.failure_count ?? 0) + 1, last_failure_at: new Date().toISOString() }).eq("id", subscription.id);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, failed }), { headers: { "Content-Type": "application/json" } });
});
