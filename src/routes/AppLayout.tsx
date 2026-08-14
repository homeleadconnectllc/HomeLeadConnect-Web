import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MaterialShopLinks from "../components/estimator/MaterialShopLinks";
import { useAuth } from "../hooks/useAuth";

export default function AppLayout() {
  const { session } = useAuth();
  const location = useLocation();
  const showLeadScopeShopping = Boolean(session) && location.pathname === "/estimator";

  return (
    <div className={`hlc-app-shell ${session ? "hlc-signed-in-shell" : "hlc-public-shell"}`}>
      <Navbar />
      <div className="hlc-route-content">
        <Outlet />
        {showLeadScopeShopping && <MaterialShopLinks />}
      </div>
    </div>
  );
}
