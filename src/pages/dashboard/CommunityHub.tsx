import { Link } from "react-router-dom";
import CommunityStore from "../../components/community/CommunityStore";

const villageBranches = [
  {
    title: "Discussions",
    body: "Ask questions, share local knowledge, and join useful discussions.",
    to: "/community/discussions",
    action: "Open discussions",
  },
  {
    title: "People & Providers",
    body: "Discover community members and service professionals without turning discovery into an assignment.",
    to: "/community/discover",
    action: "Discover people",
  },
  {
    title: "Provider Map & Service Areas",
    body: "Explore providers and recorded service-area context as part of the Community village.",
    to: "/network/map",
    action: "Open community map",
  },
  {
    title: "Completion-linked Reviews & Referrals",
    body: "Use completion-linked trust signals and make consent-aware introductions.",
    to: "/community/reviews",
    action: "Open reviews",
  },
  {
    title: "Events & Updates",
    body: "See Community events, useful updates, and ways to participate locally.",
    to: "/community/events",
    action: "See events",
  },
] as const;

const moreVillageTools = [
  ["Provider Directory", "/providers"],
  ["Community Matching · Swipe Discovery", "/community/swipe"],
  ["Community Messenger", "/community/messages"],
  ["Availability · Provider status", "/network/availability"],
  ["Saved Providers", "/network/saved"],
  ["Groups", "/community/groups"],
  ["Referrals", "/community/referrals"],
  ["Challenges", "/community/challenges"],
  ["Community Academy", "/community/academy"],
  ["Rules & Safety", "/rules"],
  ["Eligibility & Fit · Work review", "/work/matching"],
  ["Moderation", "/community/moderation"],
] as const;

export default function CommunityHub() {
  return (
    <main className="hlc-community-workspace hlc-parent-index">
      <header className="hlc-community-header hlc-parent-index-header">
        <div>
          <span className="hlc-parent-eyebrow">COMMUNITY OPERATIONS</span>
          <h1>Community</h1>
          <p>HLC is a village. Start with the kind of connection you need, then move into the right branch instead of sorting through the whole platform at once.</p>
        </div>
        <Link className="hlc-parent-agent-link" to="/customer-experience">Ask Diamond <span aria-hidden="true">→</span></Link>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community quick navigation">
        <Link to="/community/discussions">Discuss</Link>
        <Link to="/community/discover">Discover</Link>
        <Link to="/network/map">Map</Link>
        <Link to="/community/reviews">Reviews</Link>
        <Link to="/community/referrals">Referrals</Link>
        <Link to="/community/events">Events</Link>
      </nav>

      <div className="hlc-community-console hlc-community-village-console">
        <section className="hlc-community-directory" aria-labelledby="village-branches-heading">
          <header className="hlc-community-lane-head hlc-community-village-heading">
            <div>
              <span>VILLAGE BRANCHES</span>
              <h2 id="village-branches-heading">Where do you want to go?</h2>
              <p>Each branch has its own purpose. Open only what you need.</p>
            </div>
          </header>
          <div className="hlc-community-row-list">
            {villageBranches.map((item) => (
              <article className="hlc-community-row" key={item.to}>
                <div className="hlc-community-row-copy">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <Link to={item.to}>{item.action}<span aria-hidden="true"> →</span></Link>
              </article>
            ))}
          </div>
        </section>

        <aside className="hlc-community-context" aria-label="Community context">
          <section>
            <span>DIAMOND · CX CONTEXT</span>
            <h2>People first. Useful connections second.</h2>
            <p>Community is for relationships, local knowledge, trust, discovery and participation. Service operations remain deliberate and record-backed.</p>
          </section>
          <section>
            <span>OPERATING BOUNDARY</span>
            <h3>Discovery is not dispatch.</h3>
            <p>Operational matching, assignment, scheduling, pricing and completion remain inside Work.</p>
            <div className="hlc-community-context-actions">
              <Link to="/request-service">Request service</Link>
              <Link to="/work">Open Work</Link>
              <Link to="/work/matching">Review operational fit</Link>
            </div>
          </section>
        </aside>
      </div>

      <details className="hlc-community-more-tools">
        <summary>More Community tools</summary>
        <nav aria-label="More Community tools">
          {moreVillageTools.map(([label, to]) => <Link key={to} to={to}>{label}<span aria-hidden="true"> →</span></Link>)}
        </nav>
      </details>

      <details className="hlc-community-store-workspace">
        <summary>HLC Store</summary>
        <CommunityStore />
      </details>
    </main>
  );
}
