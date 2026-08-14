import { Navigate } from "react-router-dom";

export type EcosystemAreaKey =
  | "network" | "map" | "profiles" | "providers" | "matching"
  | "community" | "discussions" | "reviews" | "referrals" | "events"
  | "moderation" | "help" | "tutorials" | "rules" | "profile" | "billing";

/**
 * Legacy ecosystem-readiness cards are no longer a production product surface.
 * Every live area now routes to its real working destination instead of exposing
 * internal MISSING / UNPROVEN engineering labels to customers.
 */
export default function EcosystemAreaPage({ page }: { page: EcosystemAreaKey }) {
  if (page === "billing") return <Navigate to="/settings" replace />;
  if (page === "network") return <Navigate to="/network" replace />;
  if (page === "map") return <Navigate to="/map" replace />;
  if (page === "profiles") return <Navigate to="/profiles" replace />;
  if (page === "providers") return <Navigate to="/providers" replace />;
  if (page === "matching") return <Navigate to="/matching" replace />;
  if (page === "community") return <Navigate to="/community-hub" replace />;
  if (page === "discussions") return <Navigate to="/community/discussions" replace />;
  if (page === "reviews") return <Navigate to="/community/reviews" replace />;
  if (page === "referrals") return <Navigate to="/community/referrals" replace />;
  if (page === "events") return <Navigate to="/community/events" replace />;
  if (page === "moderation") return <Navigate to="/community/moderation" replace />;
  if (page === "help") return <Navigate to="/help" replace />;
  if (page === "tutorials") return <Navigate to="/tutorials" replace />;
  if (page === "rules") return <Navigate to="/rules" replace />;
  if (page === "profile") return <Navigate to="/profile" replace />;
  return <Navigate to="/dashboard" replace />;
}
