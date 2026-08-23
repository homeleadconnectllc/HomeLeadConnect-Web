import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../hooks/useAuth";

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
  // A stale desktop preference must never make a physical phone boot into a
  // compressed desktop canvas. Desktop remains available as an explicit choice
  // from the mobile menu, but every new compact-device load starts mobile-safe.
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

    const findMenuHost = () => {
      const host = document.querySelector<HTMLElement>(".hlc-mobile-portal-scroll");
      setMenuHost((current) => current === host ? current : host);
    };

    const observer = new MutationObserver(findMenuHost);
    observer.observe(document.body, { childList: true, subtree: true });
    const frame = window.requestAnimationFrame(findMenuHost);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
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

  if (loading || !session || !compactDevice || !menuHost) return null;

  return createPortal(
    <section className="hlc-mobile-menu-utilities" aria-label="Display options">
      <span className="hlc-mobile-menu-utilities-label">View</span>
      <div className="hlc-mobile-menu-view-actions">
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
      </div>
    </section>,
    menuHost,
  );
}