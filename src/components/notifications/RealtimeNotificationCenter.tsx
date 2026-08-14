import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../api/client";
import type { NotificationRecord } from "../../api/notifications";
import { useAuth } from "../../hooks/useAuth";

export default function RealtimeNotificationCenter() {
  const { session } = useAuth();
  const [latest, setLatest] = useState<NotificationRecord | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;

    const channel = supabase
      .channel(`hlc-notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_user_id=eq.${userId}` },
        (payload) => {
          const item = payload.new as NotificationRecord;
          setLatest(item);
          if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") {
            const notice = new Notification(item.title, {
              body: item.body,
              icon: "/hlc-logo-final.png",
              tag: item.id,
            });
            notice.onclick = () => {
              window.focus();
              window.location.href = item.deep_link || "/notifications";
            };
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

  async function enableDeviceAlerts() {
    if (typeof Notification === "undefined") return;
    const next = await Notification.requestPermission();
    setPermission(next);
  }

  if (!session) return null;

  return (
    <div style={hostStyle} aria-live="polite">
      {latest && (
        <aside style={toastStyle} aria-label="New HomeLead Connect alert">
          <button type="button" aria-label="Dismiss alert" onClick={() => setLatest(null)} style={closeStyle}>×</button>
          <strong>{latest.title}</strong>
          <span>{latest.body}</span>
          <Link to={latest.deep_link || "/notifications"} onClick={() => setLatest(null)} style={linkStyle}>Open in HLC</Link>
        </aside>
      )}

      {permission === "default" && (
        <button type="button" onClick={() => void enableDeviceAlerts()} style={permissionStyle}>
          Enable device alerts
        </button>
      )}
    </div>
  );
}

const hostStyle = {
  position: "fixed" as const,
  zIndex: 1500,
  top: "max(14px, env(safe-area-inset-top))",
  right: "max(14px, env(safe-area-inset-right))",
  display: "grid",
  justifyItems: "end",
  gap: 8,
  maxWidth: "min(380px, calc(100vw - 28px))",
  pointerEvents: "none" as const,
};

const toastStyle = {
  position: "relative" as const,
  display: "grid",
  gap: 7,
  width: "min(360px, calc(100vw - 28px))",
  boxSizing: "border-box" as const,
  padding: "16px 44px 16px 16px",
  border: "1px solid #334155",
  borderRadius: 16,
  background: "#0f172a",
  color: "#f8fafc",
  boxShadow: "0 22px 60px rgba(15,23,42,.38)",
  textAlign: "left" as const,
  pointerEvents: "auto" as const,
};

const closeStyle = {
  position: "absolute" as const,
  top: 8,
  right: 8,
  minWidth: 36,
  minHeight: 36,
  border: 0,
  borderRadius: 10,
  background: "transparent",
  color: "#cbd5e1",
  fontSize: 24,
  cursor: "pointer",
};

const linkStyle = { color: "#93c5fd", fontWeight: 800 };

const permissionStyle = {
  minHeight: 44,
  padding: "10px 14px",
  border: "1px solid #334155",
  borderRadius: 999,
  background: "#0f172a",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  pointerEvents: "auto" as const,
};
