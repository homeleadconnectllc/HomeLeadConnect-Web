import { Link } from "react-router-dom";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../../lib/accessPolicy";

const sections = [
  {
    label: "Workspace",
    note: "Business identity, team membership, roles and workspace-backed access controls.",
    items: [
      ["Business & workspace profile", "/settings/workspace"],
      ["Team, roles & permissions", "/team"],
    ],
  },
  {
    label: "Connections",
    note: "Integrations and communication infrastructure used by your workflows.",
    items: [
      ["Integrations", "/settings/workspace#connections"],
      ["Phone & communications", "/call-center"],
      ["Communication logging", "/manual-communications"],
    ],
  },
  {
    label: "Subscription & billing",
    note: "Workspace plan, provider-backed subscription state and Stripe billing management.",
    items: [
      ["Subscription & billing", "/settings/billing"],
    ],
  },
  {
    label: "Security & alerts",
    note: "Personal security, workspace access and notification preferences.",
    items: [
      ["Personal profile", "/profile"],
      ["Notifications", "/notifications"],
      ["Workspace security", "/settings/workspace#security"],
    ],
  },
] as const;

export default function SettingsHome() {
  const account = useAccountAccess();
  const canOpenBuildTracker = Boolean(account.role && canAccessWorkspacePath(account.role, "/hq/build-tracker"));

  return (
    <main className="hlc-settings-home hlc-parent-index">
      <header className="hlc-parent-index-header">
        <div>
          <span className="hlc-parent-eyebrow">SETTINGS</span>
          <h1>Account & workspace settings</h1>
          <p>Manage workspace identity, team access, connected services, subscription, security and alerts.</p>
        </div>
      </header>

      <nav className="hlc-settings-index" aria-label="Settings areas">
        {sections.map((section) => (
          <section className="hlc-settings-index-group" key={section.label}>
            <div className="hlc-settings-index-copy">
              <span>{section.label.toUpperCase()}</span>
              <h2>{section.label}</h2>
              <p>{section.note}</p>
            </div>
            <div className="hlc-settings-index-links">
              {section.items.map(([label, to]) => (
                <Link key={`${section.label}-${label}`} to={to}>
                  <span>{label}</span>
                  <b aria-hidden="true">→</b>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </nav>

      {canOpenBuildTracker && (
        <section className="hlc-settings-index-group" aria-labelledby="hlc-owner-system-build-title">
          <div className="hlc-settings-index-copy">
            <span>OWNER</span>
            <h2 id="hlc-owner-system-build-title">System build & release</h2>
            <p>Track HCX implementation, readiness, evidence, owner decisions and production-release boundaries.</p>
          </div>
          <div className="hlc-settings-index-links">
            <Link to="/hq/build-tracker">
              <span>System Build Tracker</span>
              <b aria-hidden="true">→</b>
            </Link>
            <Link to="/hq/system-health">
              <span>System health</span>
              <b aria-hidden="true">→</b>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
