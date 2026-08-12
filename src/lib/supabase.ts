import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

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
