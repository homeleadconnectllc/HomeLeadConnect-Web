import { useEffect, useState } from "react";

const VIEW_MODE_KEY = "hlc-view-mode";
const MOBILE_VIEWPORT = "width=device-width, initial-scale=1.0, viewport-fit=cover";

function isCompactDevice() {
  if (typeof window === "undefined") return false;
  return Math.min(window.screen.width, window.screen.height) <= 900;
}

function enforceMobileViewport() {
  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (viewport) viewport.content = MOBILE_VIEWPORT;
  document.documentElement.dataset.hlcViewMode = "mobile";

  try {
    window.localStorage.removeItem(VIEW_MODE_KEY);
  } catch {
    // Storage cleanup is progressive enhancement. The viewport remains mobile-safe.
  }
}

export default function MobileViewControls() {
  const [compactDevice, setCompactDevice] = useState(() => isCompactDevice());

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
    if (compactDevice) enforceMobileViewport();

    return () => document.documentElement.classList.remove("hlc-compact-device");
  }, [compactDevice]);

  return null;
}
