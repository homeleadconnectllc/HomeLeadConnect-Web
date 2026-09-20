import { Link } from "react-router-dom";

const teachers = [
  { name: "Diamond", focus: "Residents, communication, reviews, referrals, onboarding, Community conduct, and customer care.", route: "/customer-experience" },
  { name: "Dion", focus: "Operations, CRM, matching, scheduling, scripts, providers, analytics, and call training.", route: "/operations" },
  { name: "Kendrell", focus: "Leadership, compliance, risk, escalation, approvals, and governance.", route: "/hq" },
];

export default function CommunityAcademy() {
  return (
    <main className="hlc-community-workspace hlc-ui-community-academy-7e5606" >
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY · ACADEMY</p>
          <h1>Learn with the people and work around you.</h1>
          <p>Community Academy is the social doorway into the canonical HLC Academy. Community challenges remain here; learning paths, practice, certifications, and progress live under /academy so training content is never duplicated.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community Academy navigation">
        <Link to="/community-hub">Community Home</Link>
        <Link to="/academy">Open Academy</Link>
        <Link to="/community/challenges">Arcade challenges</Link>
        <Link to="/rules">Rules &amp; Safety</Link>
      </nav>

      <section className="hlc-ui-community-academy-7d158c">
        {teachers.map((teacher) => (
          <article className="hlc-premium-panel hlc-ui-padding-46e678" key={teacher.name} >
            <p className="hlc-ui-community-academy-1e9fca">HLC TEACHER</p>
            <h2 className="hlc-ui-margin-3e47b1">{teacher.name}</h2>
            <p>{teacher.focus}</p>
            <Link to={teacher.route} className="hlc-ui-font-weight-52ee95">Open {teacher.name} workspace →</Link>
          </article>
        ))}
      </section>

      <section className="hlc-premium-panel hlc-ui-connect-roleplay-session-c8e8bf" >
        <h2 className="hlc-ui-margin-top-a0925a">Learn → Practice → Simulate → Certify → Apply → Progress</h2>
        <p className="hlc-ui-margin-bottom-42a6ce">The E2 Academy now owns that progression. Community remains a compatible doorway rather than a second training system.</p>
        <div className="hlc-ui-community-academy-ed550d">
          <Link to="/academy" className="hlc-ui-font-weight-52ee95">Enter HLC Academy →</Link>
          <Link to="/academy/paths" className="hlc-ui-font-weight-52ee95">Browse learning paths →</Link>
        </div>
      </section>
    </main>
  );
}
