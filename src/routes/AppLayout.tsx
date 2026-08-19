import { lazy, Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalyticsTracker from "../components/analytics/AnalyticsTracker";
import { useAuth } from "../hooks/useAuth";

const ContextualAgentDock = lazy(() => import("../components/agents/ContextualAgentDock"));
const AnalyticsKpis = lazy(() => import("../components/analytics/AnalyticsKpis"));
const AudioDeviceCenter = lazy(() => import("../components/audio/AudioDeviceCenter"));
const FieldDeviceCenter = lazy(() => import("../components/device/FieldDeviceCenter"));

const AGENT_ROUTE_PREFIXES = [
  "/dashboard", "/start-here", "/ecosystem", "/workflow", "/automations", "/activity",
  "/network", "/map", "/profiles", "/providers", "/matching", "/community-hub",
  "/community/discussions", "/community/reviews", "/community/referrals", "/community/events",
  "/community/moderation", "/community/groups", "/help", "/tutorials", "/rules", "/profile",
  "/analytics", "/settings", "/leads", "/estimator", "/jobs", "/calendar", "/team",
  "/follow-ups", "/manual-communications", "/documents", "/call-center", "/messages",
  "/notifications", "/homeowner-portal", "/contractor-portal",
];

function isAgentRoute(pathname: string) {
  return AGENT_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function AppLayout() {
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const showAudioDevices = Boolean(session) && (location.pathname === "/settings" || location.pathname === "/call-center");
  const showFieldDevices = Boolean(session) && location.pathname === "/settings";
  const showAnalytics = Boolean(session) && location.pathname === "/dashboard";
  const showContextualAgent = Boolean(session) && isAgentRoute(location.pathname);

  useEffect(() => {
    const logo = document.querySelector<HTMLElement>(".hlc-navbar-logo");
    if (!logo) return;
    const destination = session ? "/dashboard" : "/login";
    const activate = () => navigate(destination);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    };
    logo.setAttribute("role", "link");
    logo.setAttribute("tabindex", "0");
    logo.setAttribute("aria-label", session ? "Return to HomeLead Connect dashboard" : "Go to HomeLead Connect sign in");
    logo.classList.add("hlc-navbar-logo-home");
    logo.addEventListener("click", activate);
    logo.addEventListener("keydown", onKeyDown);
    return () => {
      logo.removeEventListener("click", activate);
      logo.removeEventListener("keydown", onKeyDown);
      logo.removeAttribute("role");
      logo.removeAttribute("tabindex");
      logo.removeAttribute("aria-label");
      logo.classList.remove("hlc-navbar-logo-home");
    };
  }, [navigate, session]);

  return (
    <div className={`hlc-app-shell ${session ? "hlc-signed-in-shell" : "hlc-public-shell"}`}>
      <AnalyticsTracker />
      <Navbar />
      <div className="hlc-route-content">
        <Outlet />
        <Suspense fallback={null}>
          {showAnalytics && <AnalyticsKpis />}
          {showAudioDevices && <AudioDeviceCenter />}
          {showFieldDevices && <FieldDeviceCenter />}
        </Suspense>
      </div>
      <Suspense fallback={null}>
        {showContextualAgent && <ContextualAgentDock />}
      </Suspense>
    </div>
  );
}
