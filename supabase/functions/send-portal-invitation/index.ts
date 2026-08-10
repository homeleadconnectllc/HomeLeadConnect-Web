import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const portalSiteUrl = Deno.env.get("PORTAL_SITE_URL");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceKey || !portalSiteUrl) {
    return response({ error: "Portal invitation delivery is not configured." }, 503);
  }
  if (!authorization) return response({ error: "Authentication is required." }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return response({ error: "Authentication is required." }, 401);

  let body: { role?: string; targetId?: string; intendedEmail?: string };
  try { body = await request.json(); }
  catch { return response({ error: "Invalid request." }, 400); }
  const role = body.role?.trim().toLowerCase();
  const targetId = body.targetId?.trim();
  const intendedEmail = body.intendedEmail?.trim().toLowerCase();
  if (!targetId || !intendedEmail || (role !== "homeowner" && role !== "contractor")) {
    return response({ error: "Invitation role, target, and email are required." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: invitationRows, error: invitationError } = await admin.rpc("create_portal_invitation", {
    p_issued_by: userData.user.id,
    p_portal_role: role,
    p_target_id: targetId,
    p_intended_email: intendedEmail,
    p_expires_in_minutes: 60,
  });
  if (invitationError) return response({ error: "You cannot create that portal invitation." }, 403);
  const invitation = invitationRows?.[0];
  if (!invitation) return response({ error: "Invitation could not be created." }, 500);

  const acceptUrl = new URL("/portal/accept", portalSiteUrl);
  acceptUrl.searchParams.set("token", invitation.invitation_token);
  const mailer = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { error: deliveryError } = await mailer.auth.signInWithOtp({
    email: intendedEmail,
    options: { emailRedirectTo: acceptUrl.toString(), shouldCreateUser: true },
  });
  if (deliveryError) {
    await admin.from("portal_invitations").update({ revoked_at: new Date().toISOString() }).eq("id", invitation.invitation_id);
    return response({ error: "Invitation email could not be delivered." }, 502);
  }
  return response({ invitationId: invitation.invitation_id }, 200);
});

function response(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
