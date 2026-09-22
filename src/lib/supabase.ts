import { createClient } from "@supabase/supabase-js";

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const envSupabaseTarget = (import.meta.env.VITE_SUPABASE_TARGET || "").trim().toLowerCase();

// The production custom hostname is pinned to the canonical project. E3 Cloudflare
// preview deployments remain pinned to the isolated reconciliation project unless an
// explicit non-production consolidation target is selected. The consolidation target
// is ignored on the production hostname, so a build-time environment variable cannot
// redirect app.homeleadconnect.org away from the canonical production project.
// Publishable keys are browser-safe; privileged access still depends on RLS,
// authenticated JWTs, and server-side keys.
const hostedProductionUrl = "https://cguhtshclyybivvdnpig.supabase.co";
const hostedProductionPublishableKey = "sb_publishable_MQioEyUGv8MNlowJgVyXYQ_kf5cyafA";
const e3IsolatedPreviewUrl = "https://agfwqnirspmptjiqrrtk.supabase.co";
const e3IsolatedPreviewPublishableKey = "sb_publishable_oe-fZIb14XWNWgk5-0pPfw_Xqb0dqYv";
const consolidationUrl = "https://lvpouzxqojgmmmzbnnwv.supabase.co";
const consolidationPublishableKey = "sb_publishable_vkEYuHYM7y1GJaf2ZRpMzg_tBJUBo7p";

function isHostedHlcRuntime() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "app.homeleadconnect.org";
}

function isCloudflarePreviewRuntime() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "homeleadconnect-web.pages.dev" || host.endsWith(".homeleadconnect-web.pages.dev");
}

function isConsolidationRuntime() {
  return !isHostedHlcRuntime() && envSupabaseTarget === "consolidation";
}

const supabaseUrl = isHostedHlcRuntime()
  ? hostedProductionUrl
  : isConsolidationRuntime()
    ? consolidationUrl
    : isCloudflarePreviewRuntime()
      ? e3IsolatedPreviewUrl
      : envSupabaseUrl;
const supabaseAnonKey = isHostedHlcRuntime()
  ? hostedProductionPublishableKey
  : isConsolidationRuntime()
    ? consolidationPublishableKey
    : isCloudflarePreviewRuntime()
      ? e3IsolatedPreviewPublishableKey
      : envSupabaseAnonKey;

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  target: isHostedHlcRuntime()
    ? "production"
    : isConsolidationRuntime()
      ? "consolidation"
      : isCloudflarePreviewRuntime()
        ? "reconciliation"
        : "environment",
  missing: [
    !supabaseUrl && "VITE_SUPABASE_URL",
    !supabaseAnonKey && "VITE_SUPABASE_ANON_KEY",
  ].filter(Boolean) as string[],
};

export const supabaseConfigMessage =
  "HLC auth is not connected for this deploy. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for the Cloudflare Pages environment, then redeploy.";

export function isSupabaseConfigured() {
  if (supabaseConfig.missing.length > 0) return false;
  try {
    const url = new URL(supabaseUrl);
    return url.protocol.startsWith("http") && supabaseAnonKey.length > 10;
  } catch {
    return false;
  }
}

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured()) throw new Error(supabaseConfigMessage);
}

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://missing-config.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "missing-public-anon-key",
);
