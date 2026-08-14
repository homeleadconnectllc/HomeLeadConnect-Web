import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../api/client";
import type { NotificationRecord } from "../../api/notifications";
import { trackAnalyticsEvent } from "../../api/analytics";
import { useAuth } from "../../hooks/useAuth";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

async function registerBackgroundPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("Background push is not supported by this browser.");
  const { data: publicKey, error: keyError } = await supabase.rpc("get_hlc_web_push_public_key");
  if (keyError || !publicKey) throw keyError ?? new Error("HLC push key is unavailable.");

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(String(publicKey)) });
  }
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!p256dh || !auth) throw new Error("The browser did not return usable push keys.");
  const { error } = await supabase.rpc("register_hlc_web_push_subscription", { p_endpoint: subscription.endpoint, p_p256dh: p256dh, p_auth: auth });
  if (error) throw error;
  return subscription;
}

export default function RealtimeNotificationCenter() {
  const { session } = useAuth();
  const [latest, setLatest] = useState<NotificationRecord | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );
  const [pushStatus, setPushStatus] = useState("");

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
            const notice = new Notification(item.title, { body: item.body, icon: "/hlc-logo-final.png", tag: item.id });
            notice.onclick = () => { window.focus(); window.location.href = item.deep_link || "/notifications"; };
          }
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [session?.user.id]);

  useEffect(() => {
    if (!session || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    void registerBackgroundPush().then(() => setPushStatus("Device alerts connected.")).catch(() => {
      // A browser may allow foreground notifications but not background PushManager subscriptions.
    });
  }, [session]);

  async function enableDeviceAlerts() {
    if (typeof Notification === "undefined") return;
    setPushStatus("");
    const next = await Notification.requestPermission();
    setPermission(next);
    if (next !== "granted") {
      setPushStatus("Device alerts were not enabled.");
      return;
    }
    try {
      await registerBackgroundPush();
      setPushStatus("HLC alerts are connected to this device.");
      trackAnalyticsEvent("device_alerts_enabled");
    } catch (reason) {
      setPushStatus(reason instanceof Error ? reason.message : "Background alerts could not be connected.");
    }
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
        <button type="button" onClick={() => void enableDeviceAlerts()} style={permissionStyle}>Enable device alerts</button>
      )}
      {pushStatus && <span style={statusStyle}>{pushStatus}</span>}
    </div>
  );
}

const hostStyle = { position: "fixed" as const, zIndex: 1500, top: "max(14px, env(safe-area-inset-top))", right: "max(14px, env(safe-area-inset-right))", display: "grid", justifyItems: "end", gap: 8, maxWidth: "min(380px, calc(100vw - 28px))", pointerEvents: "none" as const };
const toastStyle = { position: "relative" as const, display: "grid", gap: 7, width: "min(360px, calc(100vw - 28px))", boxSizing: "border-box" as const, padding: "16px 44px 16px 16px", border: "1px solid #334155", borderRadius: 16, background: "#0f172a", color: "#f8fafc", boxShadow: "0 22px 60px rgba(15,23,42,.38)", textAlign: "left" as const, pointerEvents: "auto" as const };
const closeStyle = { position: "absolute" as const, top: 8, right: 8, minWidth: 36, minHeight: 36, border: 0, borderRadius: 10, background: "transparent", color: "#cbd5e1", fontSize: 24, cursor: "pointer" };
const linkStyle = { color: "#93c5fd", fontWeight: 800 };
const permissionStyle = { minHeight: 44, padding: "10px 14px", border: "1px solid #334155", borderRadius: 999, background: "#0f172a", color: "#fff", fontWeight: 800, cursor: "pointer", pointerEvents: "auto" as const };
const statusStyle = { maxWidth: 320, padding: "8px 10px", borderRadius: 10, background: "rgba(15,23,42,.92)", color: "#e2e8f0", fontSize: 12, pointerEvents: "auto" as const };
