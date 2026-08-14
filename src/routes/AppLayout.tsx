import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

export default function AppLayout() {
  const { session } = useAuth();

  return (
    <div className={`hlc-app-shell ${session ? "hlc-signed-in-shell" : "hlc-public-shell"}`}>
      <Navbar />
      <div className="hlc-route-content">
        <Outlet />
      </div>
    </div>
  );
}
