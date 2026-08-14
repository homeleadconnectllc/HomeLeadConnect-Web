import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import AudioDeviceCenter from "../components/audio/AudioDeviceCenter";
import MaterialShopLinks from "../components/estimator/MaterialShopLinks";
import { useAuth } from "../hooks/useAuth";

export default function AppLayout() {
  const { session } = useAuth();
  const location = useLocation();
  const showLeadScopeShopping = Boolean(session) && location.pathname === "/estimator";
  const showAudioDevices = Boolean(session) && (location.pathname === "/settings" || location.pathname === "/call-center");

  return (
    <div className={`hlc-app-shell ${session ? "hlc-signed-in-shell" : "hlc-public-shell"}`}>
      <Navbar />
      <div className="hlc-route-content">
        <Outlet />
        {showLeadScopeShopping && <MaterialShopLinks />}
        {showAudioDevices && <AudioDeviceCenter />}
      </div>
    </div>
  );
}
