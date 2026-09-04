import { Navigate, Outlet } from "react-router-dom";
import { useAccountAccess } from "../hooks/useAccountAccess";

type PortalAudience = "resident" | "professional" | "partner";

function fallbackDestination(access: ReturnType<typeof useAccountAccess>) {
  if (access.business && access.role) return "/dashboard";
  if (access.homeowner) return "/homeowner-portal";
  if (access.contractor) return "/contractor-portal";
  if (access.partner) return "/partner-portal";
  return "/portal/accept";
}

export default function PortalAccessBoundary({ audience }: { audience: PortalAudience }) {
  const access = useAccountAccess();

  if (access.loading) return <main style={{ padding: 32 }}><p role="status">Checking portal access…</p></main>;

  const allowed = audience === "resident"
    ? access.homeowner
    : audience === "professional"
      ? access.contractor
      : access.partner;

  if (!allowed) return <Navigate to={fallbackDestination(access)} replace />;
  return <Outlet />;
}
