import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnalyticsTracker from "../components/analytics/AnalyticsTracker";
import { useAuth } from "../hooks/useAuth";

const ContextualAgentDock = lazy(() => import("../components/agents/ContextualAgentDock"));
const AnalyticsKpis = lazy(() => import("../components/analytics/AnalyticsKpis"));
const AudioDeviceCenter = lazy(() => import("../components/audio/AudioDeviceCenter"));
const FieldDeviceCenter = lazy(() => import("../components/device/FieldDeviceCenter"));

const SIDEBAR_COLLAPSED_KEY = "hlc-desktop-sidebar-collapsed";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });
  const showAudioDevices = Boolean(session) && (location.pathname === "/settings" || location.pathname === "/call-center");
  const showFieldDevices = Boolean(session) && location.pathname === "/settings";
  const showAnalytics = Boolean(session) && location.pathname === "/dashboard";
  const showContextualAgent = Boolean(session) && isAgentRoute(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    const logo = document.querySelector<HTMLElement>(".hlc-navbar-logo");
    if (!logo) return;
    const destination = session ? "/dashboard" : "/";
    const activate = () => navigate(destination);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    };
    logo.setAttribute("role", "link");
    logo.setAttribute("tabindex", "0");
    logo.setAttribute("aria-label", session ? "Return to HomeLead Connect dashboard" : "Go to HomeLead Connect home");
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
    <div className={`hlc-app-shell ${session ? "hlc-signed-in-shell" : "hlc-public-shell"}${session && sidebarCollapsed ? " hlc-sidebar-is-collapsed" : ""}`}>
      <AnalyticsTracker />
      <Navbar />
      {session && (
        <button
          className="hlc-desktop-sidebar-toggle"
          type="button"
          aria-label={sidebarCollapsed ? "Expand workspace sidebar" : "Collapse workspace sidebar"}
          aria-expanded={!sidebarCollapsed}
          onClick={() => setSidebarCollapsed((current) => !current)}
        >
          <span aria-hidden="true">{sidebarCollapsed ? "›" : "‹"}</span>
          <span className="hlc-sidebar-toggle-label">{sidebarCollapsed ? "Open sidebar" : "Close sidebar"}</span>
        </button>
      )}
      <div className="hlc-route-content">
        <Outlet />
        <Suspense fallback={null}>
          {showAnalytics && <AnalyticsKpis />}
          {showAudioDevices && <AudioDeviceCenter />}
          {showFieldDevices && <FieldDeviceCenter />}
        </Suspense>
      </div>
      {!session && <Footer />}
      <Suspense fallback={null}>
        {showContextualAgent && <ContextualAgentDock />}
      </Suspense>
    </div>
  );
}
