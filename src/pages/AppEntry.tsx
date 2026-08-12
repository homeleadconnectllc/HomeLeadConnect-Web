import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AppEntry() {
  const { session, loading } = useAuth();

  if (loading) {
    return <main style={{ width: "min(720px, calc(100% - 32px))", margin: "64px auto" }}>
      <p role="status">Opening HomeLead Connect…</p>
    </main>;
  }

  return <Navigate to={session ? "/dashboard" : "/login"} replace />;
}
