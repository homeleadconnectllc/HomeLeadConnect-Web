import { Navigate, Outlet, useLocation } from "react-router-dom";
import ContextualAgentDock from "../components/agents/ContextualAgentDock";
import RealtimeNotificationCenter from "../components/notifications/RealtimeNotificationCenter";
import LiveTutorialDock from "../components/tutorials/LiveTutorialDock";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedLayout() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!session) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;

  return <>
    <Outlet />
    <RealtimeNotificationCenter />
    <LiveTutorialDock />
    <ContextualAgentDock />
  </>;
}
