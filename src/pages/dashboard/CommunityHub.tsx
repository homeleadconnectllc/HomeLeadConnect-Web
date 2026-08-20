import { Link } from "react-router-dom";
import CommunityStore from "../../components/community/CommunityStore";

const hubSections = [
  {
    group: "Find & connect",
    description: "Provider discovery and factual network evidence stay separate from assignment, pricing, and dispatch.",
    items: [
      { title: "Provider Directory", body: "Browse canonical provider records and service capabilities.", to: "/providers", action: "Browse providers", meta: "Directory" },
      { title: "Provider Map", body: "Explore stored provider locations without implying distance, routing, ETA, or live tracking.", to: "/map", action: "Open map", meta: "Location evidence" },
      { title: "Community Matching", body: "Swipe through provider profiles, save people to revisit, and open full profiles for detail.", to: "/matching", action: "Start matching", meta: "Discovery" },
      { title: "Eligibility & Fit", body: "Review service-area, availability, and eligibility evidence used for operational fit decisions.", to: "/network/eligibility", action: "Review fit evidence", meta: "Operational evidence" },
      { title: "Service Areas", body: "See recorded coverage areas for providers in the HLC Network.", to: "/network/service-areas", action: "View service areas", meta: "Coverage" },
      { title: "Availability", body: "Review provider availability records that have actually been stored in HLC.", to: "/network/availability", action: "View availability", meta: "Availability" },
      { title: "Saved Providers", body: "Keep providers you want to revisit in one connected list.", to: "/network/saved", action: "Open saved providers", meta: "Saved" },
    ],
  },
  {
    group: "Participate",
    description: "Community activity is organized around durable conversations, groups, and dated updates.",
    items: [
      { title: "Discussions", body: "Ask questions, share updates, and participate in Community conversations.", to: "/community/discussions", action: "Open discussions", meta: "Conversation" },
      { title: "Groups", body: "Organize Community participation around useful shared topics and interests.", to: "/community/groups", action: "Open groups", meta: "Shared interests" },
      { title: "Events & Updates", body: "See dated Community events and updates recorded inside HLC.", to: "/community/events", action: "View events", meta: "Activity" },
    ],
  },
  {
    group: "Trust & growth",
    description: "Trust signals are tied to recorded HLC activity, with explicit safety and moderation boundaries.",
    items: [
      { title: "Completion-linked Reviews", body: "Reviews require eligible completed HLC work instead of free-floating rating claims.", to: "/community/reviews", action: "Open reviews", meta: "Verified workflow" },
      { title: "Referrals", body: "Record referral attribution without automatically enrolling or contacting another person.", to: "/community/referrals", action: "Open referrals", meta: "Attribution" },
      { title: "Rules & Safety", body: "Review Community conduct, privacy, safety, and operating expectations.", to: "/rules", action: "Read rules", meta: "Policy" },
      { title: "Moderation", body: "Report Community content and route review through the authorized moderation path.", to: "/community/moderation", action: "Open moderation", meta: "Safety review" },
    ],
  },
] as const;

const quickLinks = [
  ["Directory", "/providers"],
  ["Map", "/map"],
  ["Matching", "/matching"],
  ["Discussions", "/community/discussions"],
  ["Reviews", "/community/reviews"],
  ["Events", "/community/events"],
] as const;

export default function CommunityHub() {
  const destinationCount = hubSections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <main className="hlc-community-workspace">
      <header className="hlc-community-header">
        <div>
          <p className="hlc-community-kicker">COMMUNITY OPERATIONS</p>
          <h1>Community</h1>
          <p>Find providers, participate in HLC conversations, follow community activity, and use completion-linked trust signals without blurring discovery into assignment or endorsement.</p>
        </div>
        <div className="hlc-community-summary" aria-label="Community workspace summary">
          <span><strong>{destinationCount}</strong><small>Connected destinations</small></span>
          <span><strong>3</strong><small>Operating lanes</small></span>
          <span><strong>Recorded</strong><small>Trust evidence</small></span>
        </div>
      </header>

      <nav className="hlc-community-commandbar" aria-label="Community quick navigation">
        {quickLinks.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
        <a href="#hlc-store-heading">HLC Store</a>
      </nav>

      <div className="hlc-community-console">
        <div className="hlc-community-directory">
          {hubSections.map((section) => (
            <section className="hlc-community-lane" key={section.group}>
              <header className="hlc-community-lane-head">
                <div>
                  <span>WORKSPACE LANE</span>
                  <h2>{section.group}</h2>
                  <p>{section.description}</p>
                </div>
                <strong>{section.items.length}</strong>
              </header>
              <div className="hlc-community-row-list">
                {section.items.map((item) => (
                  <article className="hlc-community-row" key={item.title}>
                    <div className="hlc-community-row-copy">
                      <span>{item.meta}</span>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                    <Link to={item.to}>{item.action}<span aria-hidden="true"> →</span></Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="hlc-community-context" aria-label="Community operating boundaries">
          <section>
            <span>DIAMOND · CX CONTEXT</span>
            <h2>Community should stay useful, safe, and human.</h2>
            <p>Customer-experience guidance belongs alongside the work, while provider facts, moderation decisions, reviews, and referrals remain grounded in their canonical HLC records.</p>
          </section>
          <section>
            <span>OPERATING BOUNDARY</span>
            <h3>Discovery is not dispatch.</h3>
            <p>Community and Network help people explore. Provider assignment, pricing, scheduling, and completion remain separate recorded workflow steps.</p>
            <div className="hlc-community-context-actions">
              <Link to="/request-service">Request service</Link>
              <Link to="/workflow">Open workflow</Link>
            </div>
          </section>
        </aside>
      </div>

      <section className="hlc-community-store-workspace" aria-labelledby="hlc-store-heading">
        <CommunityStore />
      </section>
    </main>
  );
}
