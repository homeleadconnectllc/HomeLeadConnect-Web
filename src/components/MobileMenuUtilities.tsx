import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

type ViewMode = "mobile" | "desktop";

const STORAGE_KEY = "hlc-view-mode";
const MOBILE_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover";
const DESKTOP_VIEWPORT = "width=1280, initial-scale=0.3";

function applyViewMode(mode: ViewMode) {
  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (viewport) viewport.content = mode === "desktop" ? DESKTOP_VIEWPORT : MOBILE_VIEWPORT;
  document.documentElement.dataset.hlcViewMode = mode;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export default function MobileMenuUtilities() {
  const { session } = useAuth();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "mobile";
    return window.localStorage.getItem(STORAGE_KEY) === "desktop" ? "desktop" : "mobile";
  });

  useEffect(() => {
    applyViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!session) {
      setTarget(null);
      return;
    }

    let host: HTMLDivElement | null = null;
    const attach = () => {
      const menu = document.querySelector<HTMLElement>(".hlc-mobile-portal-scroll");
      if (!menu) {
        setTarget(null);
        return;
      }
      host = menu.querySelector<HTMLDivElement>(".hlc-mobile-menu-utilities-host");
      if (!host) {
        host = document.createElement("div");
        host.className = "hlc-mobile-menu-utilities-host";
        menu.prepend(host);
      }
      setTarget(host);
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      host?.remove();
      setTarget(null);
    };
  }, [session]);

  if (!session || !target) return null;

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return createPortal(
    <div className="hlc-mobile-menu-utilities" aria-label="Mobile display and account actions">
      <button
        type="button"
        className="hlc-mobile-view-toggle"
        onClick={() => setViewMode((current) => current === "desktop" ? "mobile" : "desktop")}
      >
        <strong>{viewMode === "desktop" ? "Use mobile view" : "Use desktop view"}</strong>
        <small>{viewMode === "desktop" ? "Fit HLC back to this screen" : "Show the full desktop workspace"}</small>
      </button>
      <button type="button" className="hlc-mobile-direct-logout" onClick={logout}>
        <strong>Sign out</strong>
        <small>End this HomeLead Connect session</small>
      </button>
    </div>,
    target,
  );
}
