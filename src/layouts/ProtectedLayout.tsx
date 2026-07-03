import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedLayout() {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
