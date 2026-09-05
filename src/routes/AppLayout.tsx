import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RouteVisualBanner from "../components/RouteVisualBanner";
import AnalyticsTracker from "../components/analytics/AnalyticsTracker";
import { useAuth } from "../hooks/useAuth";

const UniversalAITeamLauncher = lazy(() => import("../components/agents/UniversalAITeamLauncher"));
const AudioDeviceCenter = lazy(() => import("../components/audio/AudioDeviceCenter"));
const FieldDeviceCenter = lazy(() => import("../components/device/FieldDeviceCenter"));
const WorkspaceGuidance = lazy(() => import("../components/WorkspaceGuidance"));
const GlobalCommandSearch = lazy(() => import("../components/search/GlobalCommandSearch"));

const SIDEBAR_COLLAPSED_KEY = "hlc-desktop-sidebar-collapsed";
const DESKTOP_SHELL_QUERY = "(min-width: 1025px)";

function personaRouteClass(pathname: string) {
  if (pathname === "/hq" || pathname.startsWith("/hq/")) return "hlc-route-hq";
  if (pathname === "/operations" || pathname.startsWith("/operations/")) return "hlc-route-operations";
  if (pathname === "/customer-experience" || pathname.startsWith("/customer-experience/")) return "hlc-route-customer-experience";
  return "";
}

function stableRouteClass(pathname: string) {
  const slug = pathname
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .filter(Boolean)
    .slice(0, 2)
    .join("-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase();
  return slug ? `hlc-page-${slug}` : "hlc-page-home";
}

function resetRouteScroll() {
  const scrollingElement = document.scrollingElement as HTMLElement | null;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  if (scrollingElement) scrollingElement.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  document
    .querySelectorAll<HTMLElement>(
      ".hlc-route-content, .hlc-mobile-portal-scroll, .hlc-command-search-panel, .hlc-agent-dock-panel, main",
    )
    .forEach((element) => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    });
}

export default function AppLayout() {
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });
  const [desktopShell, setDesktopShell] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(DESKTOP_SHELL_QUERY).matches;
  });
  const focusedPublicIntake = location.pathname === "/request-service";
  const signedInWorkspaceShell = Boolean(session) && !focusedPublicIntake;
  const showAudioDevices = signedInWorkspaceShell && (location.pathname === "/settings" || location.pathname === "/call-center");
  const showFieldDevices = signedInWorkspaceShell && location.pathname === "/settings";
  const routePersonaClass = signedInWorkspaceShell ? personaRouteClass(location.pathname) : "";
  const routeClass = stableRouteClass(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(DESKTOP_SHELL_QUERY);
    const sync = () => setDesktopShell(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }

    resetRouteScroll();
    const frame = window.requestAnimationFrame(resetRouteScroll);
    const timer = window.setTimeout(resetRouteScroll, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [location.key, location.pathname, location.hash]);

  useEffect(() => {
    if (focusedPublicIntake) return;
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
  }, [focusedPublicIntake, navigate, session]);

  return (
    <div className={`hlc-app-shell ${signedInWorkspaceShell ? "hlc-signed-in-shell" : "hlc-public-shell"} ${routeClass}${signedInWorkspaceShell && sidebarCollapsed ? " hlc-sidebar-is-collapsed" : ""}${routePersonaClass ? ` ${routePersonaClass}` : ""}${focusedPublicIntake ? " hlc-focused-public-intake" : ""}`}>
      <AnalyticsTracker />
      {!focusedPublicIntake && <Navbar />}
      {signedInWorkspaceShell && desktopShell && (
        <Link className="hlc-desktop-page-brand" to="/dashboard" aria-label="HomeLead Connect dashboard">
          <img src="/hlc-logo-transparent.png" alt="HomeLead Connect LLC" />
        </Link>
      )}
      {signedInWorkspaceShell && desktopShell && (
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
        {!session && location.pathname !== "/" && <RouteVisualBanner />}
        <Outlet />
        <Suspense fallback={null}>
          {showAudioDevices && <AudioDeviceCenter />}
          {showFieldDevices && <FieldDeviceCenter />}
        </Suspense>
      </div>
      {(!session || focusedPublicIntake) && <Footer />}
      <Suspense fallback={null}>
        {signedInWorkspaceShell && <WorkspaceGuidance />}
        {signedInWorkspaceShell && <UniversalAITeamLauncher />}
        {signedInWorkspaceShell && <GlobalCommandSearch />}
      </Suspense>
    </div>
  );
}
