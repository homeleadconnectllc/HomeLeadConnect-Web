import { createClient } from "npm:@supabase/supabase-js@2.110.0";

const normalizePhone = (value: string) => value.replace(/[() .-]/g, "");
const hex = (bytes: Uint8Array) => Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");

async function validTwilioSignature(url: string, params: URLSearchParams, signature: string, token: string) {
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const data = url + sorted.map(([key, value]) => `${key}${value}`).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(token), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const signed = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  const expected = btoa(String.fromCharCode(...signed));
  if (expected.length !== signature.length) return false;
  let mismatch = 0; for (let index=0; index<expected.length; index++) mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return mismatch === 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const publicBase = Deno.env.get("TWILIO_WEBHOOK_BASE_URL");
  if (!url || !service || !token || !publicBase) return new Response("Not configured", { status: 503 });
  const params = new URLSearchParams(await request.text());
  const signedUrl = `${publicBase.replace(/\/$/, "")}/twilio-webhook`;
  if (!await validTwilioSignature(signedUrl, params, request.headers.get("X-Twilio-Signature") || "", token)) return new Response("Invalid signature", { status: 403 });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const sid = params.get("MessageSid") || params.get("CallSid") || "";
  const status = (params.get("MessageStatus") || params.get("CallStatus") || (params.get("Body") ? "received" : "unknown")).toLowerCase();
  const eventKey = `${sid}:${status}`;
  const digest = hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(params.toString()))));
  const { error: eventError } = await admin.from("communication_provider_events").insert({
    provider_name: "twilio", provider_event_key: eventKey, event_type: status,
    payload_sha256: digest, processing_status: "received",
  });
  if (eventError?.code === "23505") return new Response("ok", { status: 200 });
  if (eventError) return new Response("Persistence failed", { status: 500 });

  const to = normalizePhone(params.get("To") || "");
  const from = normalizePhone(params.get("From") || "");
  const { data: connection } = await admin.from("communication_provider_connections")
    .select("workspace_id").in("channel", [params.get("Body") ? "sms" : "call"])
    .eq("provider_name", "twilio").eq("sender_identity", to).eq("status", "connected").maybeSingle();

  let transmissionId: string | null = null;
  let eventWorkspaceId: string | null = connection?.workspace_id || null;
  if (params.get("Body") && connection?.workspace_id) {
    const { data: subject } = await admin.rpc("resolve_communication_subject", {
      p_workspace_id: connection.workspace_id, p_channel: "sms", p_destination: from,
    });
    const subjectType = subject?.subject_type;
    const subjectId = subject?.subject_id;
    if (subjectType && subjectId) {
      const { data: inbound } = await admin.from("communication_transmissions").insert({
        workspace_id: connection.workspace_id, subject_type: subjectType, subject_id: String(subjectId), channel: "sms",
        direction: "inbound", purpose: "service", destination: from, content: params.get("Body"), provider_name: "twilio",
        provider_reference: sid, client_request_id: crypto.randomUUID(), status: "received",
      }).select("id").single();
      transmissionId = inbound?.id || null;
      if (/^\s*(stop|stopall|unsubscribe|cancel|end|quit)\s*$/i.test(params.get("Body") || "")) {
        const { data: existing } = await admin.from("communication_suppressions").select("id")
          .eq("workspace_id", connection.workspace_id).eq("channel", "sms").eq("destination", from).is("released_at", null).maybeSingle();
        if (!existing) await admin.from("communication_suppressions").insert({ workspace_id: connection.workspace_id, channel: "sms", destination: from, reason: "Recipient opt-out keyword", source: "twilio_inbound" });
      }
    }
  } else if (sid) {
    const update: Record<string, unknown> = { status: ["delivered","completed"].includes(status) ? "delivered" : ["failed","undelivered","canceled","busy","no-answer"].includes(status) ? "failed" : "sent" };
    if (update.status === "delivered") update.delivered_at = new Date().toISOString();
    if (update.status === "failed") { update.failure_code = params.get("ErrorCode") || status; update.failure_message = "Twilio reported delivery failure."; }
    const { data: transmission } = await admin.from("communication_transmissions").update(update).eq("provider_name", "twilio").eq("provider_reference", sid).select("id,workspace_id").maybeSingle();
    transmissionId = transmission?.id || null;
    eventWorkspaceId = transmission?.workspace_id || null;
  }

  await admin.from("communication_provider_events").update({ workspace_id: eventWorkspaceId, transmission_id: transmissionId, processing_status: transmissionId ? "processed" : "ignored", processed_at: new Date().toISOString() })
    .eq("provider_name", "twilio").eq("provider_event_key", eventKey);
  return new Response("ok", { status: 200 });
});
