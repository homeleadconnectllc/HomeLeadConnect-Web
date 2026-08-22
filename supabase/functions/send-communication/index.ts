import { createClient } from "npm:@supabase/supabase-js@2.110.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return json(503, { error: "Communication service is not configured." });

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json(401, { error: "Authentication is required." });
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: auth, error: authError } = await userClient.auth.getUser();
  if (authError || !auth.user) return json(401, { error: "Authentication is required." });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json(400, { error: "A valid JSON body is required." }); }
  const channel = String(body.channel || "").toLowerCase();
  if (!["sms", "email", "call"].includes(channel)) return json(400, { error: "Unsupported communication channel." });

  const requestId = typeof body.clientRequestId === "string" ? body.clientRequestId : crypto.randomUUID();
  const { data: queued, error: queueError } = await userClient.rpc("queue_communication_transmission", {
    p_subject_type: body.subjectType,
    p_subject_id: body.subjectId,
    p_channel: channel,
    p_purpose: body.purpose,
    p_content: body.content || null,
    p_client_request_id: requestId,
    p_conversation_id: body.conversationId || null,
    p_message_id: body.messageId || null,
  });
  if (queueError) return json(400, { error: queueError.message });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: transmission, error: loadError } = await admin.from("communication_transmissions")
    .select("id,workspace_id,channel,destination,content,status,provider_name")
    .eq("id", queued.id).single();
  if (loadError || !transmission) return json(500, { error: "Queued communication could not be loaded." });

  const providerName = String(transmission.provider_name || queued.provider_name || "unconfigured").toLowerCase();
  const { data: providerConnection } = await admin.from("communication_provider_connections")
    .select("status,sender_identity")
    .eq("workspace_id", transmission.workspace_id)
    .eq("channel", channel)
    .eq("provider_name", providerName)
    .maybeSingle();

  if (queued.status === "blocked") return json(409, queued);

  if (queued.status === "review") {
    if (providerConnection?.status === "manual_available") {
      return json(202, {
        id: transmission.id,
        status: "review",
        provider_name: providerName,
        delivery_mode: "manual_handoff",
        destination: transmission.destination,
      });
    }
    return json(409, queued);
  }

  if (queued.status !== "queued") return json(409, queued);

  if (providerName === "resend" && channel === "email") {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM_EMAIL");
    if (!resendKey || !resendFrom) {
      await admin.from("communication_transmissions").update({ status: "failed", failure_code: "RESEND_NOT_CONNECTED", failure_message: "Resend email adapter is not configured.", attempt_count: 1 }).eq("id", transmission.id);
      return json(503, { id: transmission.id, status: "failed", provider_name: providerName, error: "Email provider is not configured." });
    }
    if (!transmission.content) return json(400, { error: "Email content is required." });
    const requestedSubject = typeof body.subject === "string" ? body.subject.trim() : "";
    const emailSubject = requestedSubject.slice(0, 160) || `HomeLead Connect — ${String(body.purpose || "service").replaceAll("_", " ")}`;
    await admin.from("communication_transmissions").update({ status: "sending", attempt_count: 1 }).eq("id", transmission.id).eq("status", "queued");
    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": requestId },
      body: JSON.stringify({ from: resendFrom, to: [transmission.destination], subject: emailSubject, text: transmission.content }),
    });
    const providerBody = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok || typeof providerBody.id !== "string") {
      const failure = typeof providerBody.message === "string" ? providerBody.message : "Email provider request failed.";
      await admin.from("communication_transmissions").update({ status: "failed", failure_code: String(providerResponse.status), failure_message: failure }).eq("id", transmission.id);
      return json(502, { id: transmission.id, status: "failed", provider_name: providerName, error: failure });
    }
    await admin.from("communication_transmissions").update({ status: "sent", provider_reference: providerBody.id, sent_at: new Date().toISOString(), failure_code: null, failure_message: null }).eq("id", transmission.id);
    return json(200, { id: transmission.id, status: "sent", provider_name: providerName });
  }

  if (providerName === "twilio" && (channel === "sms" || channel === "call")) {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const from = Deno.env.get("TWILIO_PHONE_NUMBER");
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
    const callbackBase = Deno.env.get("TWILIO_WEBHOOK_BASE_URL");
    if (!accountSid || !authToken || !from || !callbackBase) {
      await admin.from("communication_transmissions").update({ status: "failed", failure_code: "TWILIO_NOT_CONNECTED", failure_message: "Twilio adapter is not configured.", attempt_count: 1 }).eq("id", transmission.id);
      return json(503, { id: transmission.id, status: "failed", provider_name: providerName, error: "Phone provider adapter is not configured." });
    }

    const endpoint = channel === "sms" ? "Messages.json" : "Calls.json";
    const form = new URLSearchParams({ To: transmission.destination });
    if (channel === "sms") {
      if (!transmission.content) return json(400, { error: "SMS content is required." });
      form.set("Body", transmission.content);
      if (messagingServiceSid) form.set("MessagingServiceSid", messagingServiceSid); else form.set("From", from);
      form.set("StatusCallback", `${callbackBase.replace(/\/$/, "")}/twilio-webhook`);
    } else {
      const voiceUrl = Deno.env.get("TWILIO_VOICE_URL");
      if (!voiceUrl) return json(503, { error: "Twilio voice adapter instructions are not configured." });
      form.set("From", from);
      form.set("Url", voiceUrl);
      form.set("StatusCallback", `${callbackBase.replace(/\/$/, "")}/twilio-webhook`);
      form.set("StatusCallbackEvent", "initiated ringing answered completed");
    }

    await admin.from("communication_transmissions").update({ status: "sending", attempt_count: 1 }).eq("id", transmission.id).eq("status", "queued");
    const providerResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const providerBody = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) {
      const failure = typeof providerBody.message === "string" ? providerBody.message : "Provider request failed.";
      await admin.from("communication_transmissions").update({ status: "failed", failure_code: String(providerBody.code || providerResponse.status), failure_message: failure }).eq("id", transmission.id);
      return json(502, { id: transmission.id, status: "failed", provider_name: providerName, error: failure });
    }
    await admin.from("communication_transmissions").update({ status: "sent", provider_reference: providerBody.sid, sent_at: new Date().toISOString(), failure_code: null, failure_message: null }).eq("id", transmission.id);
    return json(200, { id: transmission.id, status: "sent", provider_name: providerName });
  }

  await admin.from("communication_transmissions").update({
    status: "review",
    failure_code: "PROVIDER_ADAPTER_NOT_INSTALLED",
    failure_message: `No automatic HLC adapter is installed for ${providerName}.`,
  }).eq("id", transmission.id);

  return json(202, {
    id: transmission.id,
    status: "review",
    provider_name: providerName,
    delivery_mode: providerConnection?.status === "manual_available" ? "manual_handoff" : "adapter_required",
    destination: transmission.destination,
  });
});
