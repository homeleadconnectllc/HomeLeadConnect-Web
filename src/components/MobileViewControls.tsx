import { useEffect, useState } from "react";
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

export default function MobileViewControls() {
  const { session, loading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(() => readStoredViewMode());
  const [compactDevice, setCompactDevice] = useState(() => isCompactDevice());

  useEffect(() => {
    const updateCompactDevice = () => setCompactDevice(isCompactDevice());
    window.addEventListener("orientationchange", updateCompactDevice);
    return () => window.removeEventListener("orientationchange", updateCompactDevice);
  }, []);

  useEffect(() => {
    applyViewMode(viewMode);
  }, [viewMode]);

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

  if (loading || !session || !compactDevice) return null;

  return (
    <aside className="hlc-mobile-side-controls" aria-label="Mobile display and account controls">
      <span className="hlc-mobile-side-controls-label">View</span>
      <button
        type="button"
        className={viewMode === "mobile" ? "is-active" : undefined}
        aria-pressed={viewMode === "mobile"}
        onClick={() => chooseView("mobile")}
      >
        Mobile
      </button>
      <button
        type="button"
        className={viewMode === "desktop" ? "is-active" : undefined}
        aria-pressed={viewMode === "desktop"}
        onClick={() => chooseView("desktop")}
      >
        Desktop
      </button>
      <button type="button" className="is-signout" onClick={logout}>Sign out</button>
    </aside>
  );
}
