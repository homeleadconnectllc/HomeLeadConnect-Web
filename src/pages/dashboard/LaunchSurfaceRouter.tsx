import LaunchSurface, { type LaunchSurfaceKey } from "./LaunchSurface";
import CommunityParticipation from "./CommunityParticipation";

export default function LaunchSurfaceRouter({ page }: { page: LaunchSurfaceKey }) {
  if (page === "discussions") return <CommunityParticipation page="discussions" />;
  if (page === "groups") return <CommunityParticipation page="groups" />;
  if (page === "events") return <CommunityParticipation page="events" />;
  return <LaunchSurface page={page} />;
}
