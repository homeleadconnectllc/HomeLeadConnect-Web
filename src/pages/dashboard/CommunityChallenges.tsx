import { Link } from "react-router-dom";

const challengeFamilies = [
  { title: "Workflow Challenges", examples: ["Zero Overdue Follow-Ups", "Clean Documentation Week", "Profile Ready"], note: "Reward complete, accurate workflow behavior rather than raw volume." },
  { title: "Academy Challenges", examples: ["Customer Care Sprint", "Dispatch Mastery", "Complete Three Simulation Scenarios"], note: "Reward demonstrated learning and practice." },
  { title: "Community Challenges", examples: ["Helpful Contributor", "Trusted Introduction Week", "Community Mentor"], note: "Reward useful participation without referral spam or popularity contests." },
  { title: "Team Challenges", examples: ["Pipeline Cleanup Week", "Team Academy Completion", "Provider Network Readiness"], note: "Let managers coordinate healthy team goals without exposing sensitive business rankings." },
];

export default function CommunityChallenges() {
  return (
    <main className="hlc-community-workspace" style={{ width: "min(1120px, calc(100% - 28px))", margin: "32px auto 80px" }}>
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY · CHALLENGES</p>
          <h1>Progress that rewards quality.</h1>
          <p>Events create moments. Challenges create momentum. HLC challenges are designed around useful work, mastery, and contribution—not pressure, spam, spending, or popularity.</p>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community challenge navigation">
        <Link to="/community-hub">Community Home</Link>
        <Link to="/community/events">Events</Link>
        <Link to="/community/academy">Community Academy</Link>
      </nav>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 16, marginTop: 20 }}>
        {challengeFamilies.map((family) => (
          <article className="hlc-premium-panel" key={family.title} style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>{family.title}</h2>
            <ul style={{ lineHeight: 1.65 }}>
              {family.examples.map((example) => <li key={example}>{example}</li>)}
            </ul>
            <p style={{ marginBottom: 0 }}>{family.note}</p>
          </article>
        ))}
      </section>

      <section className="hlc-premium-callout" style={{ padding: 22, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Challenge engine status</h2>
        <p style={{ marginBottom: 0 }}>This page establishes the approved challenge families and anti-gaming boundaries. Enrollment, progress persistence, XP rewards, team scoring, and premium entitlement remain E2 Academy + Arcade work and are not fabricated here.</p>
      </section>
    </main>
  );
}
