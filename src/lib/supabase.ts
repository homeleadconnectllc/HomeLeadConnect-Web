import { createClient } from "@supabase/supabase-js";

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// The production custom hostname is pinned to the canonical project. E3 Cloudflare
// preview deployments are pinned to the isolated reconciliation project so runtime
// certification cannot drift into production even if preview environment variables do.
// Publishable keys are browser-safe; privileged access still depends on RLS,
// authenticated JWTs, and server-side keys.
const hostedProductionUrl = "https://cguhtshclyybivvdnpig.supabase.co";
const hostedProductionPublishableKey = "sb_publishable_MQioEyUGv8MNlowJgVyXYQ_kf5cyafA";
const e3IsolatedPreviewUrl = "https://agfwqnirspmptjiqrrtk.supabase.co";
const e3IsolatedPreviewPublishableKey = "sb_publishable_oe-fZIb14XWNWgk5-0pPfw_Xqb0dqYv";

function currentHostname() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

function isHostedHlcRuntime() {
  return currentHostname() === "app.homeleadconnect.org";
}

function isCloudflarePreviewRuntime() {
  const host = currentHostname();
  return host === "homeleadconnect-web.pages.dev" || host.endsWith(".homeleadconnect-web.pages.dev");
}

const supabaseUrl = isHostedHlcRuntime()
  ? hostedProductionUrl
  : isCloudflarePreviewRuntime()
    ? e3IsolatedPreviewUrl
    : envSupabaseUrl;
const supabaseAnonKey = isHostedHlcRuntime()
  ? hostedProductionPublishableKey
  : isCloudflarePreviewRuntime()
    ? e3IsolatedPreviewPublishableKey
    : envSupabaseAnonKey;

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
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
