import { createClient } from "npm:@supabase/supabase-js@2.110.0";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

const hex = (bytes: Uint8Array) => Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");

function decodeSigningSecret(secret: string) {
  const encoded = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  return Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
}

function constantTimeEqual(actual: Uint8Array, expected: Uint8Array) {
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < actual.length; index += 1) mismatch |= actual[index] ^ expected[index];
  return mismatch === 0;
}

async function verifySignature(payload: string, id: string, timestamp: string, signatures: string, secret: string) {
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;
  const key = await crypto.subtle.importKey("raw", decodeSigningSecret(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${payload}`)));
  return signatures.split(" ").some((candidate) => {
    const [version, encoded] = candidate.split(",", 2);
    if (version !== "v1" || !encoded) return false;
    try { return constantTimeEqual(Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0)), expected); }
    catch { return false; }
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!url || !service || !secret) return json(503, { error: "Resend webhook is not configured." });

  const payload = await request.text();
  const eventId = request.headers.get("svix-id") || "";
  const timestamp = request.headers.get("svix-timestamp") || "";
  const signatures = request.headers.get("svix-signature") || "";
  if (!eventId || !await verifySignature(payload, eventId, timestamp, signatures, secret)) return json(400, { error: "Invalid webhook signature." });

  let event: { type?: string; data?: { email_id?: string; to?: string[] } };
  try { event = JSON.parse(payload); } catch { return json(400, { error: "Invalid webhook payload." }); }
  const providerReference = event.data?.email_id;
  if (!event.type || !providerReference) return json(400, { error: "Unsupported webhook payload." });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const digest = hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload))));
  const { error: eventError } = await admin.from("communication_provider_events").insert({
    provider_name: "resend",
    provider_event_key: eventId,
    event_type: event.type,
    payload_sha256: digest,
    processing_status: "received",
  });
  if (eventError?.code === "23505") return json(200, { status: "duplicate" });
  if (eventError) return json(500, { error: "Webhook persistence failed." });

  const { data: transmission } = await admin.from("communication_transmissions")
    .select("id,workspace_id,destination,status")
    .eq("provider_name", "resend").eq("provider_reference", providerReference).maybeSingle();
  if (!transmission) {
    await admin.from("communication_provider_events").update({ processing_status: "ignored", processed_at: new Date().toISOString() })
      .eq("provider_name", "resend").eq("provider_event_key", eventId);
    return json(200, { status: "ignored" });
  }

  const delivered = event.type === "email.delivered";
  const failed = ["email.bounced", "email.failed", "email.complained"].includes(event.type);
  const delayed = event.type === "email.delivery_delayed";
  const update = delivered
    ? { status: "delivered", delivered_at: new Date().toISOString(), failure_code: null, failure_message: null }
    : failed
      ? { status: "failed", failure_code: event.type, failure_message: "Resend reported that the email was not deliverable." }
      : delayed
        ? { status: "sent", failure_code: "delivery_delayed", failure_message: "Email delivery is delayed." }
        : null;
  if (update) await admin.from("communication_transmissions").update(update).eq("id", transmission.id);

  if (["email.bounced", "email.complained"].includes(event.type)) {
    const { data: existing } = await admin.from("communication_suppressions").select("id")
      .eq("workspace_id", transmission.workspace_id).eq("channel", "email").eq("destination", transmission.destination).is("released_at", null).maybeSingle();
    if (!existing) await admin.from("communication_suppressions").insert({
      workspace_id: transmission.workspace_id,
      channel: "email",
      destination: transmission.destination,
      reason: event.type === "email.complained" ? "Recipient reported spam" : "Permanent email bounce",
      source: "resend_webhook",
    });
  }

  await admin.from("communication_provider_events").update({
    workspace_id: transmission.workspace_id,
    transmission_id: transmission.id,
    processing_status: update ? "processed" : "ignored",
    processed_at: new Date().toISOString(),
  }).eq("provider_name", "resend").eq("provider_event_key", eventId);
  return json(200, { status: update ? "processed" : "ignored" });
});
