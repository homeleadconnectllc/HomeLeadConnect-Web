import { createClient } from "@supabase/supabase-js";

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Netlify branch/deploy-preview contexts have historically drifted to the HLC
// reconciliation project. Hosted HLC runtimes must always use the canonical
// production Supabase project. The publishable key is intentionally browser-safe;
// privileged access still depends on RLS, authenticated JWTs, and server-side keys.
const hostedProductionUrl = "https://cguhtshclyybivvdnpig.supabase.co";
const hostedProductionPublishableKey = "sb_publishable_MQioEyUGv8MNlowJgVyXYQ_kf5cyafA";

function isHostedHlcRuntime() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "app.homeleadconnect.org" || host.endsWith(".netlify.app");
}

const supabaseUrl = isHostedHlcRuntime() ? hostedProductionUrl : envSupabaseUrl;
const supabaseAnonKey = isHostedHlcRuntime() ? hostedProductionPublishableKey : envSupabaseAnonKey;

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  missing: [
    !supabaseUrl && "VITE_SUPABASE_URL",
    !supabaseAnonKey && "VITE_SUPABASE_ANON_KEY",
  ].filter(Boolean) as string[],
};

export const supabaseConfigMessage =
  "HLC auth is not connected yet for this deploy. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify for this branch deploy, then redeploy.";

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
