import { Navigate, Outlet, useLocation } from "react-router-dom";
import RealtimeNotificationCenter from "../components/notifications/RealtimeNotificationCenter";
import SystemState from "../components/SystemState";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedLayout() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SystemState busy title="Opening your account" message="Checking your secure session and access." />;

  if (!session) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;

  return <>
    <Outlet />
    <RealtimeNotificationCenter />
  </>;
}
