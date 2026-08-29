import LaunchSurface, { type LaunchSurfaceKey } from "./LaunchSurface";
import CommunityParticipation from "./CommunityParticipation";
import SystemHealth from "./SystemHealth";
import ProviderProfessionalProfile from "./ProviderProfessionalProfile";

export default function LaunchSurfaceRouter({ page }: { page: LaunchSurfaceKey }) {
  if (page === "discussions") return <CommunityParticipation page="discussions" />;
  if (page === "groups") return <CommunityParticipation page="groups" />;
  if (page === "events") return <CommunityParticipation page="events" />;
  if (page === "systemHealth") return <SystemHealth />;
  if (page === "providerDetail") return <ProviderProfessionalProfile />;
  return <LaunchSurface page={page} />;
}
