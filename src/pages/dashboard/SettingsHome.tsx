import { Link } from "react-router-dom";

const sections = [
  {
    label: "Workspace",
    note: "Business identity, team membership and role-backed workspace controls.",
    items: [
      ["Business & workspace profile", "/settings/workspace"],
      ["Team", "/team"],
      ["Roles & permissions", "/team"],
    ],
  },
  {
    label: "Connections",
    note: "Integrations and communication infrastructure used by HLC workflows.",
    items: [
      ["Integrations", "/settings/workspace#connections"],
      ["Phone & communications", "/call-center"],
      ["Communication logging", "/manual-communications"],
    ],
  },
  {
    label: "Billing",
    note: "Subscription, payment method, invoices and Stripe account management.",
    items: [
      ["Subscription & payment", "/settings/billing"],
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
          <p>Choose the area you want to manage. Settings stay grouped by purpose instead of living on one oversized page.</p>
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
