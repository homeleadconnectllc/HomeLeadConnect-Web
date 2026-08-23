import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const allowedOrigins = [
  /^https:\/\/(?:www\.)?homeleadconnect\.org$/i,
  /^https:\/\/[a-z0-9-]+\.carrd\.co$/i,
];

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  const cors = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    if (!originAllowed(origin)) return response({ error: "Origin not allowed." }, 403, cors);
    return new Response("ok", { headers: cors });
  }

  if (request.method !== "POST") return response({ error: "Method not allowed." }, 405, cors);
  if (!originAllowed(origin)) return response({ error: "Origin not allowed." }, 403, cors);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return response({ error: "Lead intake is temporarily unavailable." }, 503, cors);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return response({ error: "Invalid request." }, 400, cors);
  }

  // Honeypot: legitimate clients leave this blank.
  if (text(body.company_website)) return response({ accepted: true }, 202, cors);

  const requestId = text(body.request_id);
  const fullName = limitedText(body.full_name, 160);
  const phone = limitedText(body.phone, 64);
  const email = limitedText(body.email, 254);
  const consentContact = body.consent_contact === true;
  const consentTimestamp = text(body.consent_timestamp);

  if (!isUuid(requestId)) return response({ error: "Please refresh the form and try again." }, 400, cors);
  if (fullName.length < 2) return response({ error: "Enter your name." }, 400, cors);
  if (phone.replace(/\D/g, "").length < 10) return response({ error: "Enter a valid phone number." }, 400, cors);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return response({ error: "Enter a valid email address." }, 400, cors);
  }
  if (!consentContact || !consentTimestamp || Number.isNaN(Date.parse(consentTimestamp))) {
    return response({ error: "Please confirm permission to contact you." }, 400, cors);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const sourcePlatform = normalizeSource(text(body.source_platform), text(body.referrer), text(body.utm_source));

  const { error } = await admin.rpc("submit_public_lead_vacuum", {
    p_request_id: requestId,
    p_full_name: fullName,
    p_phone: phone,
    p_email: email || null,
    p_intent: limitedText(body.intent, 120) || null,
    p_service_area: limitedText(body.service_area, 240) || null,
    p_timeline: limitedText(body.timeline, 120) || null,
    p_preferred_contact_method: limitedText(body.preferred_contact_method, 32) || null,
    p_notes: limitedText(body.notes, 4000) || null,
    p_consent_contact: consentContact,
    p_consent_timestamp: consentTimestamp,
    p_source_platform: sourcePlatform,
    p_utm_source: limitedText(body.utm_source, 180) || null,
    p_utm_medium: limitedText(body.utm_medium, 180) || null,
    p_utm_campaign: limitedText(body.utm_campaign, 240) || null,
    p_utm_content: limitedText(body.utm_content, 240) || null,
    p_utm_term: limitedText(body.utm_term, 240) || null,
    p_landing_url: limitedText(body.landing_url, 2048) || null,
    p_referrer: limitedText(body.referrer, 2048) || null,
  });

  if (error) {
    console.error("lead-vacuum-intake rpc failed", error.code, error.message);
    return response({ error: "We could not submit your request. Please try again." }, 502, cors);
  }

  return response({ accepted: true, request_id: requestId }, 200, cors);
});

function originAllowed(origin: string) {
  return Boolean(origin) && allowedOrigins.some((pattern) => pattern.test(origin));
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": originAllowed(origin) ? origin : "https://homeleadconnect.org",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function response(body: Record<string, unknown>, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function limitedText(value: unknown, max: number) {
  return text(value).slice(0, max);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeSource(explicit: string, referrer: string, utmSource: string) {
  const haystack = `${explicit} ${referrer} ${utmSource}`.toLowerCase();
  if (haystack.includes("facebook") || haystack.includes("fb.com") || haystack.includes("fbclid")) return "facebook";
  if (haystack.includes("instagram")) return "instagram";
  if (haystack.includes("tiktok")) return "tiktok";
  if (explicit.toLowerCase() === "other") return "other";
  return "direct";
}
