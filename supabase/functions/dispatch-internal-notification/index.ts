import { createClient } from "npm:@supabase/supabase-js@2.110.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});

const clean = (value: unknown) => String(value ?? "").trim();
const line = (label: string, value: unknown) => `${label}: ${clean(value) || "—"}`;

type EventType =
  | "resident_request.created"
  | "professional_application.created"
  | "partner_referral.created"
  | "message.incoming"
  | "appointment.scheduled"
  | "appointment.rescheduled"
  | "appointment.cancelled"
  | "appointment.no_show"
  | "follow_up.created"
  | "job.status_changed";

type Route = "intake" | "operations" | "support";

type PreparedAlert = {
  route: Route;
  workspaceId: string | null;
  subject: string;
  text: string;
};

const routeFor = (eventType: EventType): Route => {
  if (eventType === "resident_request.created" || eventType === "professional_application.created") return "intake";
  if (eventType === "message.incoming") return "support";
  return "operations";
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json(405, { error: "Method not allowed." });

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const resendFrom = Deno.env.get("RESEND_FROM_EMAIL");
  if (!url || !anon || !service) return json(503, { error: "Internal notification service is not configured." });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json(400, { error: "A valid JSON body is required." }); }

  const eventType = clean(body.eventType) as EventType;
  const eventKey = clean(body.eventKey);
  const verificationToken = clean(body.verificationToken);
  const allowed: EventType[] = [
    "resident_request.created",
    "professional_application.created",
    "partner_referral.created",
    "message.incoming",
    "appointment.scheduled",
    "appointment.rescheduled",
    "appointment.cancelled",
    "appointment.no_show",
    "follow_up.created",
    "job.status_changed",
  ];
  if (!allowed.includes(eventType) || !eventKey) return json(400, { error: "Unsupported internal notification event." });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const authorization = request.headers.get("Authorization");
  const userClient = authorization
    ? createClient(url, anon, { global: { headers: { Authorization: authorization } } })
    : null;
  const auth = userClient ? await userClient.auth.getUser() : { data: { user: null }, error: null };
  const user = auth.data.user;
  const appUrl = (Deno.env.get("APP_URL") || "https://app.homeleadconnect.org").replace(/\/$/, "");

  let prepared: PreparedAlert;

  if (eventType === "resident_request.created") {
    if (!verificationToken) return json(401, { error: "Request verification is required." });
    const { data: lead, error } = await admin.from("leads")
      .select("id,workspace_id,request_id,full_name,phone,email,notes,source,created_at")
      .eq("id", eventKey).maybeSingle();
    if (error || !lead) return json(404, { error: "Resident request was not found." });
    if (clean(lead.request_id) !== verificationToken || clean(lead.source) !== "public_website") {
      return json(403, { error: "Resident request verification failed." });
    }
    prepared = {
      route: routeFor(eventType),
      workspaceId: lead.workspace_id,
      subject: "HomeLead Connect — New Resident service request",
      text: [
        "A new Resident service request was accepted.", "",
        line("Resident", lead.full_name), line("Phone", lead.phone), line("Email", lead.email),
        line("Request", lead.notes), line("Received", lead.created_at), "",
        `Open Lead: ${appUrl}/leads/${lead.id}`,
      ].join("\n"),
    };
  } else if (eventType === "professional_application.created") {
    if (!verificationToken) return json(401, { error: "Application verification is required." });
    const { data: application, error } = await admin.from("professional_applications")
      .select("id,workspace_id,request_id,organization_name,contact_name,email,phone,trade_categories,service_territory,status,created_at")
      .eq("id", eventKey).maybeSingle();
    if (error || !application) return json(404, { error: "Professional application was not found." });
    if (clean(application.request_id) !== verificationToken || clean(application.status) !== "submitted") {
      return json(403, { error: "Professional application verification failed." });
    }
    prepared = {
      route: routeFor(eventType),
      workspaceId: application.workspace_id,
      subject: "HomeLead Connect — New Professional application",
      text: [
        "A new Professional application was accepted for review.", "",
        line("Organization", application.organization_name), line("Contact", application.contact_name),
        line("Email", application.email), line("Phone", application.phone),
        line("Trades / services", application.trade_categories), line("Service territory", application.service_territory),
        line("Received", application.created_at), "",
        `Open HomeLead Connect Work: ${appUrl}/work`,
      ].join("\n"),
    };
  } else {
    if (auth.error || !user || !userClient) return json(401, { error: "Authentication is required." });

    if (eventType === "partner_referral.created") {
      const { data: portal, error: portalError } = await userClient.rpc("get_partner_portal_data");
      if (portalError) return json(403, { error: "Partner access is required." });
      const referrals = Array.isArray((portal as { referrals?: unknown[] } | null)?.referrals)
        ? ((portal as { referrals: Array<Record<string, unknown>> }).referrals)
        : [];
      if (!referrals.some((item) => clean(item.id) === eventKey)) return json(403, { error: "Partner referral is outside this portal." });
      const { data: referral, error } = await admin.from("partner_referrals").select("*").eq("id", eventKey).maybeSingle();
      if (error || !referral) return json(404, { error: "Partner referral was not found." });
      const sourceId = clean((referral as Record<string, unknown>).partner_source_id || (referral as Record<string, unknown>).source_id);
      let source: Record<string, unknown> | null = null;
      if (sourceId) {
        const sourceResult = await admin.from("partner_sources").select("*").eq("id", sourceId).maybeSingle();
        source = sourceResult.data as Record<string, unknown> | null;
      }
      prepared = {
        route: routeFor(eventType),
        workspaceId: clean((referral as Record<string, unknown>).workspace_id) || clean(source?.workspace_id) || null,
        subject: "HomeLead Connect — New Partner referral",
        text: [
          "A Partner submitted a new referral.", "",
          line("Partner", source?.display_name || source?.organization_name),
          line("Referral type", (referral as Record<string, unknown>).target_kind),
          line("Referred name", (referral as Record<string, unknown>).referred_name),
          line("Email", (referral as Record<string, unknown>).referred_email),
          line("Phone", (referral as Record<string, unknown>).referred_phone),
          line("Note", (referral as Record<string, unknown>).note),
          line("Received", (referral as Record<string, unknown>).created_at), "",
          `Open Partner Management: ${appUrl}/partners/manage`,
        ].join("\n"),
      };
    } else if (eventType === "message.incoming") {
      const { data: visible, error: visibleError } = await userClient.from("messages")
        .select("id,conversation_id,sender_user_id,body,created_at")
        .eq("id", eventKey).maybeSingle();
      if (visibleError || !visible || clean(visible.sender_user_id) !== user.id) return json(403, { error: "Message ownership could not be verified." });
      const { data: conversation, error: conversationError } = await admin.from("conversations")
        .select("id,workspace_id,subject")
        .eq("id", visible.conversation_id).maybeSingle();
      if (conversationError || !conversation) return json(404, { error: "Conversation was not found." });
      const { data: membership } = await admin.from("workspace_members")
        .select("user_id").eq("workspace_id", conversation.workspace_id).eq("user_id", user.id).maybeSingle();
      if (membership) return json(200, { skipped: true, reason: "internal_sender" });
      prepared = {
        route: routeFor(eventType),
        workspaceId: conversation.workspace_id,
        subject: `HomeLead Connect — New message: ${clean(conversation.subject) || "Conversation"}`,
        text: [
          "A Resident, Professional, or Partner sent a message that needs attention.", "",
          line("Conversation", conversation.subject), line("Message", visible.body), line("Received", visible.created_at), "",
          `Open Messages: ${appUrl}/messages`,
        ].join("\n"),
      };
    } else if (eventType.startsWith("appointment.")) {
      const { data: appointment, error } = await userClient.from("appointments")
        .select("id,workspace_id,job_id,lead_id,contractor_id,appointment_date,appointment_end_at,status,notes,created_at,updated_at")
        .eq("id", eventKey).maybeSingle();
      if (error || !appointment) return json(403, { error: "Appointment access is required." });
      const expected = eventType === "appointment.cancelled" ? "cancelled" : eventType === "appointment.no_show" ? "no_show" : null;
      if (expected && appointment.status !== expected) return json(409, { error: "Appointment state no longer matches the requested alert." });
      prepared = {
        route: routeFor(eventType),
        workspaceId: appointment.workspace_id,
        subject: `HomeLead Connect — Appointment ${eventType.split(".")[1].replaceAll("_", " ")}`,
        text: [
          `An appointment was ${eventType.split(".")[1].replaceAll("_", " ")}.`, "",
          line("Appointment", appointment.id), line("Job", appointment.job_id),
          line("Starts", appointment.appointment_date), line("Ends", appointment.appointment_end_at),
          line("Status", appointment.status), line("Notes", appointment.notes), "",
          `Open Calendar: ${appUrl}/calendar`,
        ].join("\n"),
      };
    } else if (eventType === "follow_up.created") {
      const { data: followUp, error } = await userClient.from("follow_ups")
        .select("id,lead_id,assigned_user_id,status,scheduled_for,notes,follow_up_type,created_at")
        .eq("id", eventKey).maybeSingle();
      if (error || !followUp) return json(403, { error: "Follow-up access is required." });
      if (followUp.status !== "pending") return json(409, { error: "Follow-up is no longer actionable." });
      prepared = {
        route: routeFor(eventType),
        workspaceId: null,
        subject: "HomeLead Connect — Follow-up requires action",
        text: [
          "A new actionable follow-up was created.", "",
          line("Lead", followUp.lead_id), line("Type", followUp.follow_up_type),
          line("Scheduled for", followUp.scheduled_for), line("Notes", followUp.notes), "",
          `Open Follow-ups: ${appUrl}/follow-ups`,
        ].join("\n"),
      };
    } else {
      const { data: job, error } = await userClient.from("crm_jobs")
        .select("id,workspace_id,lead_id,status,name,contract_value,updated_at")
        .eq("id", eventKey).maybeSingle();
      if (error || !job) return json(403, { error: "Job access is required." });
      prepared = {
        route: routeFor(eventType),
        workspaceId: job.workspace_id,
        subject: `HomeLead Connect — Job status changed to ${job.status}`,
        text: [
          "A Job reached a meaningful lifecycle state.", "",
          line("Job", job.name), line("Status", job.status), line("Lead", job.lead_id),
          line("Contract value", job.contract_value), line("Updated", job.updated_at), "",
          `Open Job: ${appUrl}/jobs/${job.id}`,
        ].join("\n"),
      };
    }
  }

  const destinationByRoute: Record<Route, string> = {
    intake: Deno.env.get("INTERNAL_ALERT_INTAKE_EMAIL") || "HomeLeadConnect@gmail.com",
    operations: Deno.env.get("INTERNAL_ALERT_OPERATIONS_EMAIL") || "Admin.HomeLeadConnect@gmail.com",
    support: Deno.env.get("INTERNAL_ALERT_SUPPORT_EMAIL") || "XbGraphicDesigns@gmail.com",
  };
  const destination = destinationByRoute[prepared.route];

  const { data: existing, error: existingError } = await admin.from("internal_notification_deliveries")
    .select("id,status,attempt_count")
    .eq("event_type", eventType).eq("event_key", eventKey).maybeSingle();
  if (existingError) return json(500, { error: "Internal notification ledger could not be read." });
  if (existing?.status === "sent" || existing?.status === "sending") {
    return json(200, { id: existing.id, status: existing.status, duplicate: true });
  }

  let deliveryId = existing?.id as string | undefined;
  if (deliveryId) {
    const { error } = await admin.from("internal_notification_deliveries").update({
      status: "sending",
      attempt_count: Number(existing.attempt_count || 0) + 1,
      destination_email: destination,
      route: prepared.route,
      workspace_id: prepared.workspaceId,
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", deliveryId).eq("status", "failed");
    if (error) return json(409, { id: deliveryId, status: existing.status, duplicate: true });
  } else {
    const { data: inserted, error } = await admin.from("internal_notification_deliveries").insert({
      event_type: eventType,
      event_key: eventKey,
      workspace_id: prepared.workspaceId,
      route: prepared.route,
      destination_email: destination,
      status: "sending",
      attempt_count: 1,
    }).select("id").single();
    if (error?.code === "23505") return json(200, { status: "duplicate" });
    if (error || !inserted) return json(500, { error: "Internal notification could not be reserved." });
    deliveryId = inserted.id;
  }

  if (!resendKey || !resendFrom) {
    await admin.from("internal_notification_deliveries").update({
      status: "failed", last_error: "RESEND_NOT_CONNECTED", updated_at: new Date().toISOString(),
    }).eq("id", deliveryId);
    return json(503, { id: deliveryId, status: "failed", error: "Email provider is not configured." });
  }

  const providerResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `internal:${eventType}:${eventKey}`.slice(0, 240),
    },
    body: JSON.stringify({ from: resendFrom, to: [destination], subject: prepared.subject.slice(0, 160), text: prepared.text }),
  });
  const providerBody = await providerResponse.json().catch(() => ({}));
  if (!providerResponse.ok || typeof providerBody.id !== "string") {
    const failure = typeof providerBody.message === "string" ? providerBody.message.slice(0, 500) : `Resend ${providerResponse.status}`;
    await admin.from("internal_notification_deliveries").update({
      status: "failed", last_error: failure, updated_at: new Date().toISOString(),
    }).eq("id", deliveryId);
    return json(502, { id: deliveryId, status: "failed", error: "Internal notification provider failed." });
  }

  await admin.from("internal_notification_deliveries").update({
    status: "sent",
    provider_reference: providerBody.id,
    sent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_error: null,
  }).eq("id", deliveryId);

  return json(200, { id: deliveryId, status: "sent", route: prepared.route });
});
