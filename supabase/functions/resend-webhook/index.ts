import { createClient } from "npm:@supabase/supabase-js@2.110.0";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

const hex = (bytes: Uint8Array) => Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
const safeDbError = (error: { code?: string; message?: string } | null | undefined) => error
  ? `${error.code || "DB_ERROR"}: ${String(error.message || "unknown").slice(0, 300)}`
  : "unknown";

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
  if (!url || !service || !secret) {
    console.error("Resend webhook configuration is incomplete", {
      hasUrl: Boolean(url),
      hasServiceRole: Boolean(service),
      hasSigningSecret: Boolean(secret),
    });
    return json(503, { error: "Resend webhook is not configured." });
  }

  const payload = await request.text();
  const eventId = request.headers.get("svix-id") || "";
  const timestamp = request.headers.get("svix-timestamp") || "";
  const signatures = request.headers.get("svix-signature") || "";
  if (!eventId || !await verifySignature(payload, eventId, timestamp, signatures, secret)) {
    console.error("Resend webhook signature rejected", { hasEventId: Boolean(eventId), hasTimestamp: Boolean(timestamp), hasSignature: Boolean(signatures) });
    return json(400, { error: "Invalid webhook signature." });
  }

  let event: { type?: string; data?: { email_id?: string; to?: string[] } };
  try { event = JSON.parse(payload); }
  catch {
    console.error("Resend webhook payload parse failed", eventId);
    return json(400, { error: "Invalid webhook payload." });
  }
  const providerReference = event.data?.email_id;
  if (!event.type || !providerReference) {
    console.error("Resend webhook unsupported payload", eventId, event.type || "missing_type", Boolean(providerReference));
    return json(400, { error: "Unsupported webhook payload." });
  }

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
  if (eventError) {
    console.error("Resend webhook event persistence failed", eventId, event.type, safeDbError(eventError));
    return json(500, { error: "Webhook persistence failed." });
  }

  const { data: transmission, error: transmissionError } = await admin.from("communication_transmissions")
    .select("id,workspace_id,destination,status")
    .eq("provider_name", "resend").eq("provider_reference", providerReference).maybeSingle();
  if (transmissionError) {
    const message = safeDbError(transmissionError);
    console.error("Resend webhook transmission lookup failed", eventId, providerReference, message);
    await admin.from("communication_provider_events").update({ processing_status: "failed", error_message: message })
      .eq("provider_name", "resend").eq("provider_event_key", eventId);
    return json(500, { error: "Webhook transmission lookup failed." });
  }
  if (!transmission) {
    const { error: ignoredError } = await admin.from("communication_provider_events")
      .update({ processing_status: "ignored", processed_at: new Date().toISOString() })
      .eq("provider_name", "resend").eq("provider_event_key", eventId);
    if (ignoredError) {
      console.error("Resend webhook ignored-event persistence failed", eventId, safeDbError(ignoredError));
      return json(500, { error: "Webhook state update failed." });
    }
    return json(200, { status: "ignored" });
  }

  const delivered = event.type === "email.delivered";
  const failed = ["email.bounced", "email.failed", "email.complained"].includes(event.type);
  const delayed = event.type === "email.delivery_delayed";
  const outcome = delivered ? "delivered" : failed ? "failed" : delayed ? "delayed" : "ignored";
  const { data: result, error: outcomeError } = await admin.rpc("record_communication_provider_outcome", {
    p_provider_name: "resend",
    p_provider_event_key: eventId,
    p_provider_reference: providerReference,
    p_event_type: event.type,
    p_outcome: outcome,
    p_failure_code: failed ? event.type : null,
    p_failure_message: failed ? "Resend reported that the email was not deliverable." : null,
  });
  if (outcomeError) {
    const message = safeDbError(outcomeError);
    console.error("Resend webhook outcome persistence failed", eventId, transmission.id, event.type, message);
    await admin.from("communication_provider_events").update({
      workspace_id: transmission.workspace_id,
      transmission_id: transmission.id,
      processing_status: "failed",
      error_message: message,
    }).eq("provider_name", "resend").eq("provider_event_key", eventId);
    return json(500, { error: "Webhook outcome persistence failed." });
  }
  console.log("Resend webhook processed", eventId, event.type, providerReference, outcome);
  return json(200, result);
});
