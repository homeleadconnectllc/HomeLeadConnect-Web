import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { normalizeInternalRole } from "../lib/accessPolicy";
import { supabase } from "../lib/supabase";
import { AccountAccessContext, emptyAccountAccess, type AccountAccess } from "./account-access-context";

export function AccountAccessProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const [access, setAccess] = useState<AccountAccess>(emptyAccountAccess);

  useEffect(() => {
    if (authLoading || !session) return;

    let active = true;
    const userId = session.user.id;

    void Promise.all([
      supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1),
      supabase.from("homeowner_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
      supabase.from("contractor_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
      supabase.rpc("get_partner_portal_data"),
      supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle(),
    ]).then(
      ([business, homeowner, contractor, partner, profile]) => {
        if (!active) return;
        const partnerDenied = Boolean(partner.error && partner.error.code === "42501");
        const failed = Boolean(business.error || homeowner.error || contractor.error || profile.error || (partner.error && !partnerDenied));
        setAccess({
          business: !failed && Boolean(business.data?.length),
          homeowner: !failed && Boolean(homeowner.data?.length),
          contractor: !failed && Boolean(contractor.data?.length),
          partner: !failed && !partnerDenied && Boolean(partner.data),
          role: failed ? null : normalizeInternalRole(profile.data?.role),
          userId,
          loading: false,
          error: failed,
        });
      },
      () => {
        if (active) setAccess({ ...emptyAccountAccess, userId, loading: false, error: true });
      },
    );

    return () => { active = false; };
  }, [authLoading, session]);

  const value = authLoading
    ? emptyAccountAccess
    : !session
      ? { ...emptyAccountAccess, loading: false }
      : access.userId === session.user.id
        ? access
        : { ...emptyAccountAccess, userId: session.user.id };

  return <AccountAccessContext.Provider value={value}>{children}</AccountAccessContext.Provider>;
}
