import {
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";

function isInvalidRefreshTokenError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : String(error ?? "");

  return /invalid refresh token|refresh token not found/i.test(message);
}

async function clearCorruptLocalSession(error: unknown) {
  if (!isInvalidRefreshTokenError(error)) return;

  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Recovery must remain fail-closed even if the stale local token cannot be revoked remotely.
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;

    void supabase.auth.getSession().then(
      async ({ data, error }) => {
        if (!active) return;

        if (error) {
          await clearCorruptLocalSession(error);
          if (!active) return;
        }

        setSession(error ? null : data.session);
        setLoading(false);
      },
      async (error) => {
        if (!active) return;

        await clearCorruptLocalSession(error);
        if (!active) return;

        setSession(null);
        setLoading(false);
      },
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
