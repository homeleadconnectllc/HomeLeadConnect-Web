import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordAnalyticsEvent } from "../../api/analytics";
import { useAuth } from "../../hooks/useAuth";

function viewportClass() {
  const width = window.innerWidth;
  if (width <= 600) return "phone";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function installMode() {
  return window.matchMedia?.("(display-mode: standalone)").matches ? "standalone" : "browser";
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const { session } = useAuth();

  useEffect(() => {
    void recordAnalyticsEvent("page_view", location.pathname, {
      authenticated: Boolean(session),
      viewport: viewportClass(),
      display_mode: installMode(),
    }).catch(() => {
      // Tracking is best-effort and cannot block navigation.
    });
  }, [location.pathname, session]);

  return null;
}
