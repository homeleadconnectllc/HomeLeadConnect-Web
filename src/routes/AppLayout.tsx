import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalyticsKpis from "../components/analytics/AnalyticsKpis";
import AnalyticsTracker from "../components/analytics/AnalyticsTracker";
import AudioDeviceCenter from "../components/audio/AudioDeviceCenter";
import MaterialShopLinks from "../components/estimator/MaterialShopLinks";
import { useAuth } from "../hooks/useAuth";

export default function AppLayout() {
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const showLeadScopeShopping = Boolean(session) && location.pathname === "/estimator";
  const showAudioDevices = Boolean(session) && (location.pathname === "/settings" || location.pathname === "/call-center");
  const showAnalytics = Boolean(session) && location.pathname === "/dashboard";

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
        {showAnalytics && <AnalyticsKpis />}
        {showLeadScopeShopping && <MaterialShopLinks />}
        {showAudioDevices && <AudioDeviceCenter />}
      </div>
    </div>
  );
}
