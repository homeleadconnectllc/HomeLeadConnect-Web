import LaunchSurface, { type LaunchSurfaceKey } from "./LaunchSurface";
import CommunityParticipationWorkspace from "./CommunityParticipationWorkspace";

export default function LaunchSurfaceRouter({ page }: { page: LaunchSurfaceKey }) {
  if (page === "discussions") return <CommunityParticipationWorkspace mode="discussions" />;
  if (page === "groups") return <CommunityParticipationWorkspace mode="groups" />;
  if (page === "events") return <CommunityParticipationWorkspace mode="events" />;
  return <LaunchSurface page={page} />;
}
