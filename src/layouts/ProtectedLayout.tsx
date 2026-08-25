import { lazy, Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import RealtimeNotificationCenter from "../components/notifications/RealtimeNotificationCenter";
import { useAuth } from "../hooks/useAuth";

const ContextualAgentDock = lazy(() => import("../components/agents/ContextualAgentDock"));

export default function ProtectedLayout() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!session) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;

  return <>
    <Outlet />
    <RealtimeNotificationCenter />
    <Suspense fallback={null}>
      <ContextualAgentDock />
    </Suspense>
  </>;
}
