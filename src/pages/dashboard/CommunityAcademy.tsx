import { Link } from "react-router-dom";

const teachers = [
  { name: "Diamond", focus: "Residents, communication, reviews, referrals, onboarding, Community conduct, and customer care.", route: "/customer-experience" },
  { name: "Dion", focus: "Operations, CRM, matching, scheduling, scripts, providers, analytics, and call training.", route: "/operations" },
  { name: "Kendrell", focus: "Leadership, compliance, risk, escalation, approvals, and governance.", route: "/hq" },
];

export default function CommunityAcademy() {
  return (
    <main className="hlc-community-workspace" style={{ width: "min(1120px, calc(100% - 28px))", margin: "32px auto 80px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY · ACADEMY</p>
          <h1>Learn with the people and work around you.</h1>
          <p>Community Academy is the social doorway into HLC learning paths, challenges, certifications, roleplay, and simulations. It reuses one canonical knowledge source rather than duplicating training content inside Community.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community Academy navigation">
        <Link to="/community-hub">Community Home</Link>
        <Link to="/tutorials">Current Tutorials</Link>
        <Link to="/rules">Rules &amp; Safety</Link>
        <Link to="/community/challenges">Challenges</Link>
      </nav>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, marginTop: 20 }}>
        {teachers.map((teacher) => (
          <article className="hlc-premium-panel" key={teacher.name} style={{ padding: 20 }}>
            <p style={{ margin: "0 0 5px", color: "#2563eb", fontWeight: 900 }}>HLC TEACHER</p>
            <h2 style={{ margin: "0 0 8px" }}>{teacher.name}</h2>
            <p>{teacher.focus}</p>
            <Link to={teacher.route} style={{ fontWeight: 900 }}>Open {teacher.name} workspace →</Link>
          </article>
        ))}
      </section>

      <section className="hlc-premium-panel" style={{ padding: 22, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Learn → Practice → Simulate → Certify → Apply → Progress</h2>
        <p style={{ marginBottom: 14 }}>That progression is locked, but the full Academy route hierarchy is E2 work. Until those routes are wired, Community Academy points only to existing real tutorials, policy guidance, and agent workspaces.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link to="/tutorials" style={{ fontWeight: 900 }}>Learn from current tutorials →</Link>
          <Link to="/help" style={{ fontWeight: 900 }}>Open Help →</Link>
        </div>
      </section>
    </main>
  );
}
