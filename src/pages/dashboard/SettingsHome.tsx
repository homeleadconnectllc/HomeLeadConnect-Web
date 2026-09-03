import { Link } from "react-router-dom";

const sections = [
  {
    label: "Workspace",
    note: "Business identity, team membership, roles and workspace-backed access controls.",
    items: [
      ["Business & workspace profile", "/settings/workspace"],
      ["Team & workspace access", "/team"],
      ["Roles & permissions", "/team"],
    ],
  },
  {
    label: "Connections",
    note: "Integrations and communication infrastructure used by HomeLead Connect workflows.",
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
      ["Manage billing with Stripe", "/settings/billing"],
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
  return (
    <main className="hlc-settings-home hlc-parent-index">
      <header className="hlc-parent-index-header">
        <div>
          <span className="hlc-parent-eyebrow">SETTINGS</span>
          <h1>Account & workspace settings</h1>
          <p>Manage the HomeLead Connect account layer by purpose: workspace identity, team access, connected services, subscription, security and alerts.</p>
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
    </main>
  );
}
