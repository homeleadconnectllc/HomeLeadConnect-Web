import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ContextualAgentDock from "../components/agents/ContextualAgentDock";
import AnalyticsKpis from "../components/analytics/AnalyticsKpis";
import AnalyticsTracker from "../components/analytics/AnalyticsTracker";
import AudioDeviceCenter from "../components/audio/AudioDeviceCenter";
import FieldDeviceCenter from "../components/device/FieldDeviceCenter";
import MobileWorkDock from "../components/mobile/MobileWorkDock";
import { useAuth } from "../hooks/useAuth";

const DESKTOP_SIDEBAR_KEY = "hlc.desktopSidebarCollapsed.v1";
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
    return window.localStorage.getItem(DESKTOP_SIDEBAR_KEY) === "true";
  });
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

  function toggleDesktopSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(DESKTOP_SIDEBAR_KEY, String(next));
      return next;
    });
  }

  return (
    <div className={`hlc-app-shell ${session ? "hlc-signed-in-shell" : "hlc-public-shell"}${session && sidebarCollapsed ? " hlc-sidebar-collapsed" : ""}`}>
      <AnalyticsTracker />
      <Navbar />
      {session && (
        <button
          type="button"
          className="hlc-desktop-sidebar-toggle"
          onClick={toggleDesktopSidebar}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? "Show workspace sidebar" : "Hide workspace sidebar"}
          title={sidebarCollapsed ? "Show workspace sidebar" : "Hide workspace sidebar"}
        >
          <span aria-hidden="true">{sidebarCollapsed ? "›" : "‹"}</span>
          <span className="hlc-desktop-sidebar-toggle-label">{sidebarCollapsed ? "Show" : "Hide"}</span>
        </button>
      )}
      <div className="hlc-route-content">
        <Outlet />
        {showAnalytics && <AnalyticsKpis />}
        {showAudioDevices && <AudioDeviceCenter />}
        {showFieldDevices && <FieldDeviceCenter />}
      </div>
      {session && <MobileWorkDock />}
      {showContextualAgent && <ContextualAgentDock />}
    </div>
  );
}
