import { Link } from "react-router-dom";

export default function CommunityMessages() {
  return (
    <main className="hlc-community-workspace" style={{ width: "min(1040px, calc(100% - 28px))", margin: "32px auto 80px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY · PRIVATE MESSENGER</p>
          <h1>Relationships first. Messages second.</h1>
          <p>Community Private Messenger is reserved for accepted Community relationships and networking. Operational customer, lead, appointment, and job communication stays in core HLC Messages.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community Messenger navigation">
        <Link to="/community-hub">Community Home</Link>
        <Link to="/community/discover">Discover</Link>
        <Link to="/community/swipe">Swipe Match</Link>
        <Link to="/messages">Operational Messages</Link>
      </nav>

      <section className="hlc-premium-panel" style={{ padding: 24, marginTop: 20 }}>
        <p style={{ margin: "0 0 6px", fontWeight: 900, color: "#2563eb", letterSpacing: ".08em", textTransform: "uppercase" }}>Relationship gate</p>
        <h2 style={{ margin: "0 0 10px" }}>No open Community conversation yet.</h2>
        <p style={{ margin: "0 0 18px", lineHeight: 1.6 }}>HLC will not create a private conversation just because somebody viewed, liked, or saved a profile. The production message composer remains intentionally unavailable here until the accepted-connection/referral permission model is wired.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link to="/community/discover" style={{ fontWeight: 900 }}>Discover members →</Link>
          <Link to="/community/swipe" style={{ fontWeight: 900 }}>Open Swipe Match →</Link>
        </div>
      </section>

      <section className="hlc-premium-callout" style={{ marginTop: 20, padding: 22 }}>
        <h2 style={{ marginTop: 0 }}>What will unlock a conversation?</h2>
        <ul style={{ marginBottom: 0, lineHeight: 1.7 }}>
          <li>An accepted Community connection.</li>
          <li>An accepted referral or another explicitly permitted Community relationship.</li>
          <li>A role and entitlement allowed to use Community Private Messenger.</li>
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>When real work begins</h2>
        <p>A Community relationship can later hand off to <strong>Start Service Request</strong>. From there, the request, assignment, appointment, job, and operational communication live in core HLC rather than inside social chat.</p>
        <Link to="/request-service" style={{ fontWeight: 900 }}>Start a service request →</Link>
      </section>
    </main>
  );
}
