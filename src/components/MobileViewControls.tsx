import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

type ViewMode = "mobile" | "desktop";

const VIEW_MODE_KEY = "hlc-view-mode";
const MOBILE_VIEWPORT = "width=device-width, initial-scale=1.0, viewport-fit=cover";
const DESKTOP_VIEWPORT = "width=1180, viewport-fit=cover";

function applyViewMode(mode: ViewMode) {
  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (viewport) viewport.content = mode === "desktop" ? DESKTOP_VIEWPORT : MOBILE_VIEWPORT;
  document.documentElement.dataset.hlcViewMode = mode;
}

function readStoredViewMode(): ViewMode {
  try {
    return window.localStorage.getItem(VIEW_MODE_KEY) === "desktop" ? "desktop" : "mobile";
  } catch {
    return "mobile";
  }
}

function isCompactDevice() {
  if (typeof window === "undefined") return false;
  return Math.min(window.screen.width, window.screen.height) <= 900;
}

function readInitialViewMode(): ViewMode {
  return isCompactDevice() ? "mobile" : readStoredViewMode();
}

export default function MobileViewControls() {
  const { session, loading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(() => readInitialViewMode());
  const [compactDevice, setCompactDevice] = useState(() => isCompactDevice());
  const [menuHost, setMenuHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const updateCompactDevice = () => setCompactDevice(isCompactDevice());
    window.addEventListener("orientationchange", updateCompactDevice);
    window.addEventListener("resize", updateCompactDevice);
    return () => {
      window.removeEventListener("orientationchange", updateCompactDevice);
      window.removeEventListener("resize", updateCompactDevice);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("hlc-compact-device", compactDevice);
    return () => document.documentElement.classList.remove("hlc-compact-device");
  }, [compactDevice]);

  useEffect(() => {
    applyViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!session || !compactDevice) return;
    let ownedHost: HTMLDivElement | null = null;

    const findMenuHost = () => {
      const menu = document.querySelector<HTMLElement>(".hlc-drawer-v2-scroll");
      if (!menu) {
        setMenuHost(null);
        return;
      }

      const search = menu.querySelector<HTMLElement>(".hlc-mobile-command-search-trigger");
      const ownerHome = menu.querySelector<HTMLElement>(".hlc-owner-home-link");
      if (ownerHome && search && ownerHome.nextElementSibling !== search) {
        menu.insertBefore(ownerHome, search);
      }

      let host = menu.querySelector<HTMLDivElement>(".hlc-mobile-view-controls-host");
      if (!host) {
        host = document.createElement("div");
        host.className = "hlc-mobile-view-controls-host";
        const quickActions = menu.querySelector<HTMLElement>(".hlc-mobile-more-quick");
        if (quickActions) menu.insertBefore(host, quickActions);
        else menu.append(host);
        ownedHost = host;
      }
      setMenuHost((current) => current === host ? current : host);
    };

    const observer = new MutationObserver(findMenuHost);
    observer.observe(document.body, { childList: true, subtree: true });
    const frame = window.requestAnimationFrame(findMenuHost);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      ownedHost?.remove();
      setMenuHost(null);
    };
  }, [compactDevice, session]);

  function chooseView(mode: ViewMode) {
    setViewMode(mode);
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // Preference persistence is progressive enhancement.
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading || !session || !compactDevice || !menuHost) return null;

  return createPortal(
    <section className="hlc-mobile-menu-utilities" aria-label="Display and account options">
      <span className="hlc-mobile-menu-utilities-label">View</span>
      <div className="hlc-mobile-menu-view-actions">
        <button type="button" className={viewMode === "mobile" ? "is-active" : undefined} aria-pressed={viewMode === "mobile"} onClick={() => chooseView("mobile")}>Mobile</button>
        <button type="button" className={viewMode === "desktop" ? "is-active" : undefined} aria-pressed={viewMode === "desktop"} onClick={() => chooseView("desktop")}>Desktop</button>
      </div>
      <button type="button" className="hlc-mobile-early-signout" onClick={logout}>Sign out</button>
    </section>,
    menuHost,
  );
}
