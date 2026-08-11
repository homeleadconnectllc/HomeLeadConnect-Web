import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div className="hlc-app-shell">
      <Navbar />
      <div className="hlc-route-content">
        <Outlet />
      </div>
    </div>
  );
}
