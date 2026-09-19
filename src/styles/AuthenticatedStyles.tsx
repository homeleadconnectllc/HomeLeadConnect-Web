import MobileNavigationDialogAccessibility from "../components/accessibility/MobileNavigationDialogAccessibility";
import "./authenticated-entry";
import "./calendar-mobile-action-order.css";
import "./launch-messaging-simplification.css";
import "./five-star-mobile-more.css";
import "./mobile-a-plus-sprint-2-shell-closure.css";
import "./mobile-a-plus-sprint-4-community-messages.css";
import "./mobile-a-plus-sprint-5-community-participation.css";
import "./mobile-a-plus-sprint-6-account-portals-resources.css";
import "./mobile-a-plus-sprint-7-integrated-accessibility.css";
import "./mobile-a-plus-final-device-corrections.css";
import "./provider-professional-profile.css";
import "./e5-intelligence-sandbox.css";
import "./e6-trial-entitlements.css";
import "./hlc-unified-settings-index.css";
import "./hlc-dashboard-structural-correction.css";
import "./hlc-structural-correction.css";
import "./hlc-purpose-built-workspaces.css";
import "./hlc-desktop-mobile-nav-guard.css";
import "./universal-ai-team-launcher.css";
import "./jobs-dashboard-a.css";
import "./calendar-dashboard-a.css";
import "./follow-ups-dashboard-a.css";
import "./workflow-dashboard-a.css";
import "./automations-dashboard-a.css";
import "./mobile-command-menu-rebuild-20260905.css";
import "./dashboard-context-hero.css";

// Current signed-in visual authority must load last so retired workspace/route paint
// cannot override the owner-approved redesign. Structural and feature behavior stay intact.
import "./signed-in-professional-system.css";

export default function AuthenticatedStyles() {
  return <MobileNavigationDialogAccessibility />;
}
