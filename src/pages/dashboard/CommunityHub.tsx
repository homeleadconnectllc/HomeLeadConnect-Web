import { Link } from "react-router-dom";
import CommunityStore from "../../components/community/CommunityStore";

const hubSections = [
  {
    group: "Find & connect",
    items: [
      { title: "Provider Directory", body: "Browse canonical provider records and service capabilities.", to: "/providers", action: "Browse providers" },
      { title: "Provider Map", body: "Explore stored provider locations without implying distance, routing, ETA, or live tracking.", to: "/map", action: "Open map" },
      { title: "Matching", body: "Review HLC matching and eligibility evidence before assignment or scheduling.", to: "/matching", action: "Open matching" },
      { title: "Service Areas", body: "See recorded coverage areas for providers in the HLC Network.", to: "/network/service-areas", action: "View service areas" },
      { title: "Availability", body: "Review provider availability records that have actually been stored in HLC.", to: "/network/availability", action: "View availability" },
      { title: "Saved Providers", body: "Keep providers you want to revisit in one connected list.", to: "/network/saved", action: "Open saved providers" },
    ],
  },
  {
    group: "Participate",
    items: [
      { title: "Discussions", body: "Ask questions, share updates, and participate in Community conversations.", to: "/community/discussions", action: "Open discussions" },
      { title: "Groups", body: "Organize Community participation around useful shared topics and interests.", to: "/community/groups", action: "Open groups" },
      { title: "Events & Updates", body: "See dated Community events and updates recorded inside HLC.", to: "/community/events", action: "View events" },
    ],
  },
  {
    group: "Trust & growth",
    items: [
      { title: "Completion-linked Reviews", body: "Reviews require eligible completed HLC work instead of free-floating rating claims.", to: "/community/reviews", action: "Open reviews" },
      { title: "Referrals", body: "Record referral attribution without automatically enrolling or contacting another person.", to: "/community/referrals", action: "Open referrals" },
      { title: "Rules & Safety", body: "Review Community conduct, privacy, safety, and operating expectations.", to: "/rules", action: "Read rules" },
      { title: "Moderation", body: "Report Community content and route review through the authorized moderation path.", to: "/community/moderation", action: "Open moderation" },
    ],
  },
] as const;

export default function CommunityHub() {
  return (
    <main style={{ width: "min(1380px, calc(100% - 32px))", margin: "40px auto 72px", lineHeight: 1.55 }}>
      <header style={{ textAlign: "center", maxWidth: 900, margin: "0 auto 34px" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>HomeLead Connect · Community + Network</p>
        <h1 style={{ margin: "0 0 14px", fontSize: "clamp(2.3rem, 6vw, 4.8rem)", lineHeight: .98 }}>Find. Connect. Participate.</h1>
        <p style={{ margin: "0 auto", maxWidth: 780 }}>Community is the people-and-provider layer of HLC: discover provider records, explore locations and service coverage, participate in discussions and events, shop approved HLC merchandise, and use completion-linked trust signals without fabricated rankings or claims.</p>
      </header>

      <nav aria-label="Community quick navigation" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 30 }}>
        <Link to="/providers">Directory</Link>
        <Link to="/map">Map</Link>
        <Link to="/matching">Matching</Link>
        <Link to="/community/discussions">Discussions</Link>
        <Link to="/community/reviews">Reviews</Link>
        <Link to="/community/events">Events</Link>
        <a href="#hlc-store-heading">HLC Store</a>
      </nav>

      {hubSections.map((section) => (
        <section key={section.group} style={{ marginTop: 30 }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            <h2 style={{ margin: 0 }}>{section.group}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 16 }}>
            {section.items.map((item) => (
              <article key={item.title} style={{ border: "1px solid #dbe3ef", borderRadius: 18, padding: 20, background: "#fff", boxShadow: "0 10px 26px rgba(15,23,42,.05)", display: "flex", flexDirection: "column", minHeight: 190 }}>
                <h3 style={{ margin: "0 0 8px" }}>{item.title}</h3>
                <p style={{ margin: "0 0 18px", flex: 1 }}>{item.body}</p>
                <Link to={item.to} style={{ fontWeight: 800 }}>{item.action}</Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      <CommunityStore />

      <section style={{ marginTop: 32, padding: 24, borderRadius: 20, background: "#0f172a", color: "#e2e8f0", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginTop: 0 }}>Ready to move from discovery to service?</h2>
        <p style={{ maxWidth: 760, margin: "0 auto 16px" }}>Community and Network help you explore. A service request begins the actual HLC workflow; provider assignment, pricing, scheduling, and completion remain separate recorded steps.</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          <Link to="/request-service" style={{ color: "#fff", fontWeight: 800 }}>Request service</Link>
          <Link to="/workflow" style={{ color: "#fff", fontWeight: 800 }}>Open workflow</Link>
        </div>
      </section>
    </main>
  );
}
