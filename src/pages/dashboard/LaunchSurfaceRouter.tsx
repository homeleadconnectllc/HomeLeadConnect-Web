import LaunchSurface, { type LaunchSurfaceKey } from "./LaunchSurface";
import CommunityParticipation from "./CommunityParticipation";
import SystemHealth from "./SystemHealth";

export default function LaunchSurfaceRouter({ page }: { page: LaunchSurfaceKey }) {
  if (page === "discussions") return <CommunityParticipation page="discussions" />;
  if (page === "groups") return <CommunityParticipation page="groups" />;
  if (page === "events") return <CommunityParticipation page="events" />;
  if (page === "systemHealth") return <SystemHealth />;
  return <LaunchSurface page={page} />;
}
