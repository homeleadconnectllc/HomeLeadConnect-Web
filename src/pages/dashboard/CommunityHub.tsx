import { Link } from "react-router-dom";
import CommunityStore from "../../components/community/CommunityStore";

const hubSections = [
  {
    group: "Discover & connect",
    description: "Community discovery stays social and consent-based. Real assignment, pricing, scheduling, and dispatch remain in Work.",
    items: [
      { title: "Discover", body: "Browse recorded HLC provider profiles with visual service and location context.", to: "/community/discover", action: "Start discovering", meta: "For you" },
      { title: "Community Matching · Swipe Match", body: "Like, pass, and save profiles in the Community discovery deck without assigning real work.", to: "/community/swipe", action: "Open Swipe Match", meta: "Premium discovery" },
      { title: "Private Messenger", body: "Community private conversations unlock only through an accepted relationship or other explicit permission.", to: "/community/messages", action: "Open Messenger", meta: "Relationships" },
      { title: "Provider Directory", body: "Browse canonical provider records and service capabilities.", to: "/providers", action: "Browse providers", meta: "Network" },
      { title: "Provider Map", body: "Explore stored provider locations without implying distance, routing, ETA, or live tracking.", to: "/network/map", action: "Open map", meta: "Spatial context" },
      { title: "Service Areas", body: "Review provider-declared service coverage recorded in HLC without treating coverage as an assignment or guarantee.", to: "/network/service-areas", action: "Review service areas", meta: "Coverage" },
      { title: "Availability", body: "Review recorded provider availability as planning evidence; availability does not by itself create an offer, assignment, or appointment.", to: "/network/availability", action: "Review availability", meta: "Capacity" },
      { title: "Eligibility & Fit", body: "Review service-area, availability, and eligibility evidence used for operational fit decisions.", to: "/work/matching", action: "Review operational fit", meta: "Work boundary" },
      { title: "Saved Providers", body: "Keep providers you want to revisit in one connected list.", to: "/network/saved", action: "Open saved providers", meta: "Saved" },
    ],
  },
  {
    group: "Participate",
    description: "Community activity is organized around useful conversations, local events, learning, challenges, and shared interests.",
    items: [
      { title: "Discussions", body: "Ask questions, share updates, and participate in Community conversations.", to: "/community/discussions", action: "Open discussions", meta: "Conversation" },
      { title: "Groups", body: "Organize Community participation around useful shared topics and interests.", to: "/community/groups", action: "Open groups", meta: "Shared interests" },
      { title: "Events & Updates", body: "See dated Community events and updates recorded inside HLC.", to: "/community/events", action: "View events", meta: "Activity" },
      { title: "Challenges", body: "Build momentum through quality-based workflow, Academy, Community, and team challenges.", to: "/community/challenges", action: "View challenges", meta: "Progress" },
      { title: "Community Academy", body: "Enter HLC learning through Diamond, Dion, and Kendrell without duplicating the canonical knowledge source.", to: "/community/academy", action: "Open Academy", meta: "Learning" },
    ],
  },
  {
    group: "Trust & growth",
    description: "Trust signals stay evidence-based, with reviews, referrals, privacy, and moderation clearly separated.",
    items: [
      { title: "Completion-linked Reviews", body: "Reviews require eligible completed HLC work instead of free-floating rating claims.", to: "/community/reviews", action: "Open reviews", meta: "Verified workflow" },
      { title: "Referrals", body: "Record referral attribution without automatically enrolling or contacting another person.", to: "/community/referrals", action: "Open referrals", meta: "Introductions" },
      { title: "Rules & Safety", body: "Review Community conduct, privacy, safety, and operating expectations.", to: "/rules", action: "Read rules", meta: "Policy" },
      { title: "Moderation", body: "Report Community content and route review through the authorized moderation path.", to: "/community/moderation", action: "Open moderation", meta: "Safety review" },
    ],
  },
] as const;

const quickLinks = [
  ["Discover", "/community/discover"],
  ["Swipe", "/community/swipe"],
  ["Messages", "/community/messages"],
  ["Challenges", "/community/challenges"],
  ["Academy", "/community/academy"],
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
          <p>What’s happening, who should you connect with, and what should you do next? Community brings discovery, relationships, learning, events, referrals, and progress together without blurring social activity into operational assignment.</p>
        </div>
        <div className="hlc-community-summary" aria-label="Community workspace summary">
          <span><strong>{destinationCount}</strong><small>Connected destinations</small></span>
          <span><strong>3</strong><small>Operating lanes</small></span>
          <span><strong>Evidence</strong><small>Before trust claims</small></span>
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
                  <span>COMMUNITY LANE</span>
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
            <h2>Community should stay useful, safe, visual, and human.</h2>
            <p>Diamond guides Community and customer experience while provider facts, moderation, reviews, referrals, and service work remain grounded in canonical HLC records.</p>
          </section>
          <section>
            <span>OPERATING BOUNDARY</span>
            <h3>Discovery is not dispatch.</h3>
            <p>Community helps people explore and connect. Operational matching, assignment, scheduling, pricing, and completion remain separate deliberate Work steps.</p>
            <div className="hlc-community-context-actions">
              <Link to="/request-service">Request service</Link>
              <Link to="/work">Open Work</Link>
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
