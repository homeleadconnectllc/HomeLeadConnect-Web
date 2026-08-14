import { Navigate } from "react-router-dom";

/**
 * The ecosystem readiness matrix is an internal engineering artifact and must
 * not be exposed as a normal production product surface.
 *
 * Keep /ecosystem safe for existing bookmarks/navigation by sending signed-in
 * workspace users back to the real product dashboard.
 */
export default function Ecosystem() {
  return <Navigate to="/dashboard" replace />;
}
