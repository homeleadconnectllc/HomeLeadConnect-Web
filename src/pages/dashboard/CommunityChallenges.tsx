import { Link } from "react-router-dom";

const challengeFamilies = [
  { title: "Workflow Challenges", examples: ["Zero Overdue Follow-Ups", "Clean Documentation Week", "Profile Ready"], note: "Reward complete, accurate workflow behavior rather than raw volume." },
  { title: "Academy Challenges", examples: ["Customer Care Sprint", "Dispatch Mastery", "Complete Three Simulation Scenarios"], note: "Reward demonstrated learning and practice." },
  { title: "Community Challenges", examples: ["Helpful Contributor", "Trusted Introduction Week", "Community Mentor"], note: "Reward useful participation without referral spam or popularity contests." },
  { title: "Team Challenges", examples: ["Pipeline Cleanup Week", "Team Academy Completion", "Provider Network Readiness"], note: "Let managers coordinate healthy team goals without exposing sensitive business rankings." },
];

export default function CommunityChallenges() {
  return (
    <main className="hlc-community-workspace hlc-ui-community-academy-7e5606" >
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

      <section className="hlc-ui-community-challenges-ba0bf1">
        {challengeFamilies.map((family) => (
          <article className="hlc-premium-panel hlc-ui-padding-46e678" key={family.title} >
            <h2 className="hlc-ui-margin-top-a0925a">{family.title}</h2>
            <ul className="hlc-ui-line-height-16d0e8">
              {family.examples.map((example) => <li key={example}>{example}</li>)}
            </ul>
            <p className="hlc-ui-margin-bottom-fa769a">{family.note}</p>
          </article>
        ))}
      </section>

      <section className="hlc-premium-callout hlc-ui-connect-roleplay-session-c8e8bf" >
        <h2 className="hlc-ui-margin-top-a0925a">Challenge engine status</h2>
        <p className="hlc-ui-margin-bottom-fa769a">This page establishes the approved challenge families and anti-gaming boundaries. Enrollment, progress persistence, XP rewards, team scoring, and premium entitlement remain E2 Academy + Arcade work and are not fabricated here.</p>
      </section>
    </main>
  );
}
